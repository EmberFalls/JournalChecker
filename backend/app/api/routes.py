from datetime import UTC, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.analysis.assessment import assess
from app.analysis.claims import extract_claims
from app.api.schemas import CandidateOut, ClaimOut, EvidenceOut, JournalOut, ReportOut, SearchRequest, SearchResponse
from app.core.enums import EvidenceState
from app.core.normalization import input_kind, normalize_doi, normalize_issn, normalize_url
from app.crawler.safe_crawler import SafeCrawler
from app.db.models import ClaimVerification, Evidence, Journal, JournalClaim, JournalIdentifier, RiskAssessment, WebsitePage
from app.db.session import get_db
from app.identity.resolver import Candidate, IdentityResolver
from app.providers.base import NormalizedEvidence
from app.providers.crossref import CrossrefProvider

router = APIRouter(prefix="/api")


def journal_out(journal: Journal) -> JournalOut:
    return JournalOut(id=journal.id, current_title=journal.current_title, canonical_publisher=journal.canonical_publisher, official_domain=journal.official_domain, identifiers=[i.value for i in journal.identifiers])


def evidence_out(item: Evidence) -> EvidenceOut:
    return EvidenceOut(id=item.id, provider=item.provider, evidence_type=item.evidence_type, value=item.value, status=item.status, confidence=item.confidence, source_url=item.source_url, observed_at=item.observed_at)


@router.post("/search", response_model=SearchResponse)
async def search(body: SearchRequest, db: Session = Depends(get_db)) -> SearchResponse:
    resolution = await IdentityResolver(db).resolve(body.query)
    if not resolution.candidates and resolution.input_type in {"issn", "doi", "url"}:
        fresh: list[NormalizedEvidence] = []
        if resolution.input_type == "issn":
            fresh = await CrossrefProvider().lookup_issn(resolution.normalized_input)
        elif resolution.input_type == "doi":
            fresh = await CrossrefProvider().lookup_doi(resolution.normalized_input)
        title = next((e.value.get("title") for e in fresh if e.evidence_type == "journal_title"), None)
        if resolution.input_type == "url":
            title = resolution.normalized_input.split("/")[2]
        if title:
            journal = Journal(current_title=title, official_domain=(resolution.normalized_input.split("/")[2] if resolution.input_type == "url" else None))
            db.add(journal); db.flush()
            if resolution.input_type in {"issn", "doi"}:
                db.add(JournalIdentifier(journal_id=journal.id, scheme=resolution.input_type.upper(), value=resolution.normalized_input, is_primary=True))
            _persist_external(db, journal, fresh)
            db.commit()
            resolution.candidates = [Candidate(journal, 0.9 if fresh else 0.4, ["External metadata match" if fresh else "Website provided; identity not yet independently confirmed"])]
    return SearchResponse(input_type=resolution.input_type, normalized_input=resolution.normalized_input, ambiguous=resolution.is_ambiguous, candidates=[CandidateOut(id=c.journal.id, title=c.journal.current_title, score=round(c.score, 2), reasons=c.reasons) for c in resolution.candidates])


@router.get("/journals/{journal_id}", response_model=JournalOut)
def get_journal(journal_id: str, db: Session = Depends(get_db)) -> JournalOut:
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(404, "Journal not found")
    return journal_out(journal)


def _persist_external(db: Session, journal: Journal, items: list[NormalizedEvidence]) -> list[Evidence]:
    saved = []
    for item in items:
        row = Evidence(journal_id=journal.id, provider=item.provider, evidence_type=item.evidence_type, value=item.value, status=item.status, confidence=item.confidence, source_url=item.source_url, source_record=item.source_record, observed_at=item.observed_at, effective_from=item.effective_from, effective_to=item.effective_to)
        db.add(row)
        saved.append(row)
    db.flush()
    return saved


def _verify_indexing_claim(db: Session, journal_id: str, claim_type: str) -> tuple[EvidenceState, str, list[str]]:
    provider = "scopus" if claim_type == "scopus_indexing" else "doaj" if claim_type == "doaj_listing" else None
    if not provider:
        return EvidenceState.NOT_VERIFIED, "A published policy or fee statement is not independently verifiable by this check.", []
    records = db.query(Evidence).filter_by(journal_id=journal_id, provider=provider).all()
    if provider == "scopus":
        active = next((item for item in records if item.evidence_type == "scopus_coverage" and item.value.get("active") is True), None)
        inactive = next((item for item in records if item.evidence_type == "scopus_coverage" and item.value.get("active") is False), None)
        if active:
            return EvidenceState.VERIFIED, "Authorized Scopus source evidence shows active coverage.", [active.id]
        if inactive:
            return EvidenceState.CONTRADICTED, "Authorized Scopus source evidence shows discontinued or inactive coverage.", [inactive.id]
    listed = next((item for item in records if item.evidence_type == "doaj_listing" and item.status == EvidenceState.VERIFIED), None)
    if listed:
        return EvidenceState.VERIFIED, "Official DOAJ dataset evidence corroborates the listing claim.", [listed.id]
    return EvidenceState.NOT_VERIFIED, "No appropriate independent source corroboration was available; this is not a contradiction.", []


@router.post("/journals/{journal_id}/analyze", response_model=ReportOut)
async def analyze(journal_id: str, db: Session = Depends(get_db)) -> ReportOut:
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(404, "Journal not found")
    provider = CrossrefProvider()
    fresh: list[NormalizedEvidence] = []
    for identifier in journal.identifiers:
        if identifier.scheme == "ISSN":
            fresh.extend(await provider.lookup_issn(identifier.value))
        if identifier.scheme == "DOI":
            fresh.extend(await provider.lookup_doi(identifier.value))
    _persist_external(db, journal, fresh)
    if journal.official_domain:
        pages = await SafeCrawler().crawl(f"https://{journal.official_domain}")
        for page in pages:
            db.add(WebsitePage(journal_id=journal.id, url=page.url, title=page.title, text=page.text, content_hash=page.content_hash))
            for claim in extract_claims(page.text):
                stored_claim = JournalClaim(journal_id=journal.id, claim_type=claim.claim_type, value=claim.value, source_url=page.url, supporting_text=claim.supporting_text, extraction_confidence=claim.confidence)
                db.add(stored_claim); db.flush()
                status, rationale, evidence_ids = _verify_indexing_claim(db, journal.id, claim.claim_type)
                db.add(ClaimVerification(claim_id=stored_claim.id, status=status, rationale=rationale, evidence_ids=evidence_ids))
    db.commit()
    return _build_report(db, journal, persist_assessment=True)


def _build_report(db: Session, journal: Journal, persist_assessment: bool = False) -> ReportOut:
    records = db.query(Evidence).filter_by(journal_id=journal.id).order_by(Evidence.observed_at.desc()).all()
    normalized = [NormalizedEvidence(e.provider, e.evidence_type, e.value, EvidenceState(e.status), e.confidence, e.source_url, e.source_record, e.observed_at, e.effective_from, e.effective_to) for e in records]
    identity_confident = bool(journal.identifiers)
    result = assess(normalized, identity_confident)
    if persist_assessment:
        risk = RiskAssessment(journal_id=journal.id, label=result.label, confidence=result.confidence, coverage=result.coverage, dimensions=result.dimensions, rationale=result.rationale)
        db.add(risk)
        db.commit()
    claims = []
    for claim in db.query(JournalClaim).filter_by(journal_id=journal.id).all():
        verification = db.query(ClaimVerification).filter_by(claim_id=claim.id).order_by(ClaimVerification.verified_at.desc()).first()
        claims.append(ClaimOut(claim_type=claim.claim_type, source_url=claim.source_url, supporting_text=claim.supporting_text, extraction_confidence=claim.extraction_confidence, verification_status=verification.status if verification else None, verification_rationale=verification.rationale if verification else None))
    return ReportOut(journal=journal_out(journal), assessment=result.label, confidence=result.confidence, coverage=result.coverage, dimensions=result.dimensions, rationale=result.rationale, evidence=[evidence_out(e) for e in records], claims=claims, last_checked=datetime.now(UTC))


@router.get("/journals/{journal_id}/report", response_model=ReportOut)
def report(journal_id: str, db: Session = Depends(get_db)) -> ReportOut:
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(404, "Journal not found")
    return _build_report(db, journal)
