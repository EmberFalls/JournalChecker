import asyncio
from datetime import UTC, datetime
from fastapi import APIRouter, Depends, HTTPException
from rapidfuzz import fuzz
from sqlalchemy.orm import Session
from app.analysis.assessment import assess
from app.analysis.claims import extract_claims
from app.api.schemas import CandidateOut, ClaimOut, EvidenceOut, JournalOut, ReportOut, SearchRequest, SearchResponse
from app.core.enums import EvidenceState
from app.core.normalization import input_kind, normalize_doi, normalize_issn, normalize_title, normalize_url
from app.crawler.safe_crawler import SafeCrawler
from app.db.models import ClaimVerification, Evidence, Journal, JournalClaim, JournalIdentifier, RiskAssessment, WebsitePage
from app.db.session import get_db
from app.identity.resolver import Candidate, IdentityResolver
from app.identity.conflicts import identity_conflicts
from app.providers.base import NormalizedEvidence
from app.providers.crossref import CrossrefProvider
from app.providers.local import LocalProvider
from app.providers.scopus import ScopusProvider
from app.providers.wos import WebOfScienceProvider

router = APIRouter(prefix="/api")


def journal_out(journal: Journal) -> JournalOut:
    return JournalOut(id=journal.id, current_title=journal.current_title, canonical_publisher=journal.canonical_publisher, official_domain=journal.official_domain, identifiers=[i.value for i in journal.identifiers])


def evidence_out(item: Evidence) -> EvidenceOut:
    return EvidenceOut(id=item.id, provider=item.provider, evidence_type=item.evidence_type, value=item.value, status=item.status, confidence=item.confidence, source_url=item.source_url, observed_at=item.observed_at)


@router.post("/search", response_model=SearchResponse)
async def search(body: SearchRequest, db: Session = Depends(get_db)) -> SearchResponse:
    resolution = await IdentityResolver(db).resolve(body.query)
    if not resolution.candidates and resolution.input_type == "title":
        fresh = await _lookup_external_title(body.query)
        groups: dict[str, list[NormalizedEvidence]] = {}
        for item in fresh:
            groups.setdefault(item.source_url or f"{item.provider}:{len(groups)}", []).append(item)
        ranked_groups = []
        journals_by_title: dict[str, Journal] = {}
        candidates_by_id: dict[str, Candidate] = {}
        for key, items in groups.items():
            title = next((item.value.get("title") for item in items if item.value.get("title")), None)
            if not title:
                continue
            score = fuzz.token_set_ratio(resolution.normalized_input, str(title).lower()) / 100
            if score >= 0.78:
                ranked_groups.append((score, key, str(title), items))
        ranked_groups.sort(key=lambda item: item[0], reverse=True)
        if ranked_groups:
            for score, _, title, items in ranked_groups[:10]:
                issns = set()
                for item in items:
                    if item.evidence_type == "issn":
                        normalized = normalize_issn(str(item.value.get("issn") or ""))
                        if normalized:
                            issns.add(normalized)
                    for raw_issn in item.value.get("issns", []) if isinstance(item.value.get("issns"), list) else []:
                        normalized = normalize_issn(str(raw_issn))
                        if normalized:
                            issns.add(normalized)
                matches = {
                    row.journal_id for value in issns
                    if (row := db.query(JournalIdentifier).filter_by(scheme="ISSN", value=value).one_or_none())
                }
                journal = db.get(Journal, next(iter(matches))) if len(matches) == 1 else None
                title_key = normalize_title(title)
                if journal is None:
                    journal = journals_by_title.get(title_key)
                if journal is None:
                    journal = Journal(current_title=title)
                    db.add(journal); db.flush()
                journals_by_title[title_key] = journal
                for value in issns:
                    _add_identifier_if_unclaimed(db, journal, "ISSN", value, primary=not journal.identifiers)
                _persist_external(db, journal, items)
                prior = candidates_by_id.get(journal.id)
                if prior:
                    prior.score = max(prior.score, score)
                    prior.reasons.append("Corroborated by another source")
                else:
                    candidates_by_id[journal.id] = Candidate(journal, score, ["External title candidate; confirm ISSN or publisher before analysis"])
            resolution.candidates = list(candidates_by_id.values())
            resolution.candidates.sort(key=lambda item: item.score, reverse=True)
            resolution.is_ambiguous = len(resolution.candidates) > 1 and resolution.candidates[0].score - resolution.candidates[1].score < 0.12
            db.commit()
    elif not resolution.candidates and resolution.input_type in {"issn", "doi", "url"}:
        fresh: list[NormalizedEvidence] = []
        if resolution.input_type == "issn":
            fresh.extend(await _lookup_external_issn(resolution.normalized_input))
        elif resolution.input_type == "doi":
            crossref_items = await CrossrefProvider().lookup_doi(resolution.normalized_input)
            fresh.extend(crossref_items)
            issns = sorted({
                value for item in crossref_items if item.evidence_type == "issn"
                if (value := normalize_issn(str(item.value.get("issn") or "")))
            })
            if issns:
                provider_results = await asyncio.gather(*(_lookup_external_issn(value) for value in issns))
                for result in provider_results:
                    fresh.extend(result)
        title = next((
            e.value.get("title") for e in fresh
            if e.evidence_type in {"journal_title", "scopus_source_record", "wos_journal_record"}
            and e.value.get("title")
        ), None)
        if resolution.input_type == "url":
            title = resolution.normalized_input.split("/")[2]
        if title:
            matched_ids = set()
            for item in fresh:
                for issn in item.value.get("issns", []) if isinstance(item.value.get("issns"), list) else []:
                    value = normalize_issn(str(issn))
                    identifier = db.query(JournalIdentifier).filter_by(scheme="ISSN", value=value).one_or_none() if value else None
                    if identifier:
                        matched_ids.add(identifier.journal_id)
            journal = db.get(Journal, next(iter(matched_ids))) if len(matched_ids) == 1 else None
            if journal is None:
                journal = Journal(current_title=title, official_domain=(resolution.normalized_input.split("/")[2] if resolution.input_type == "url" else None))
                db.add(journal); db.flush()
            if resolution.input_type in {"issn", "doi"}:
                _add_identifier_if_unclaimed(db, journal, resolution.input_type.upper(), resolution.normalized_input, primary=True)
            for item in fresh:
                value = normalize_issn(str(item.value.get("issn") or ""))
                for candidate in item.value.get("issns", []) if isinstance(item.value.get("issns"), list) else []:
                    normalized_candidate = normalize_issn(str(candidate))
                    if normalized_candidate:
                        _add_identifier_if_unclaimed(db, journal, "ISSN", normalized_candidate)
                if value:
                    _add_identifier_if_unclaimed(db, journal, "ISSN", value)
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


def _add_identifier_if_unclaimed(db: Session, journal: Journal, scheme: str, value: str, primary: bool = False) -> None:
    existing = db.query(JournalIdentifier).filter_by(scheme=scheme, value=value).one_or_none()
    if existing:
        return
    db.add(JournalIdentifier(journal_id=journal.id, scheme=scheme, value=value, is_primary=primary))


async def _lookup_external_issn(issn: str) -> list[NormalizedEvidence]:
    """Query configured live providers together; missing credentials disable only that source."""
    providers = (CrossrefProvider(), ScopusProvider(), WebOfScienceProvider())
    results = await asyncio.gather(*(provider.lookup_issn(issn) for provider in providers), return_exceptions=True)
    return [item for result in results if not isinstance(result, Exception) for item in result]


async def _lookup_external_title(title: str) -> list[NormalizedEvidence]:
    crossref, scopus = await asyncio.gather(
        CrossrefProvider().lookup_title(title), ScopusProvider().lookup_title(title), return_exceptions=True
    )
    items = [item for result in (crossref, scopus) if not isinstance(result, Exception) for item in result]
    issns = sorted({
        value for item in items if item.evidence_type == "issn"
        if (value := normalize_issn(str(item.value.get("issn") or "")))
    })
    if issns:
        wos_results = await asyncio.gather(*(WebOfScienceProvider().lookup_issn(value) for value in issns), return_exceptions=True)
        items.extend(item for result in wos_results if not isinstance(result, Exception) for item in result)
    return items


def _persist_identity_conflicts(db: Session, journal: Journal) -> None:
    rows = db.query(Evidence).filter_by(journal_id=journal.id).all()
    normalized = [NormalizedEvidence(e.provider, e.evidence_type, e.value, EvidenceState(e.status), e.confidence, e.source_url, e.source_record, e.observed_at, e.effective_from, e.effective_to) for e in rows if e.provider != "identity_audit"]
    existing = {(e.evidence_type, str(e.value)) for e in rows if e.provider == "identity_audit"}
    for item in identity_conflicts(journal.current_title, journal.canonical_publisher, journal.official_domain, normalized):
        if (item.evidence_type, str(item.value)) not in existing:
            _persist_external(db, journal, [item])


def _verify_indexing_claim(db: Session, journal_id: str, claim_type: str) -> tuple[EvidenceState, str, list[str]]:
    provider = (
        "scopus" if claim_type == "scopus_indexing"
        else "doaj" if claim_type == "doaj_listing"
        else "web_of_science" if claim_type == "wos_indexing"
        else None
    )
    if not provider:
        wording = {
            "peer_review_policy": "A website statement describes peer review but this MVP has no independent peer-review registry check.",
            "ethics_policy": "A website statement describes an ethics policy but this MVP has no independent policy certification check.",
            "apc": "A fee statement was observed; it requires a human review of the current terms.",
            "editorial_board": "An editorial-board statement was observed; identities require human review.",
            "publisher_identity": "A publisher statement was observed; it is compared separately with source metadata.",
            "publication_timeline": "A publication-timeline statement was observed; no independent timeline source was available.",
            "metrics_claim": "A metric statement was observed; metric ownership and date require human review.",
            "membership_claim": "A membership statement was observed; no independent membership registry was configured.",
        }
        return EvidenceState.NOT_VERIFIED, wording.get(claim_type, "No appropriate independent verification is configured for this claim."), []
    records = db.query(Evidence).filter_by(journal_id=journal_id, provider=provider).all()
    if provider == "scopus":
        active = next((item for item in records if item.evidence_type == "scopus_coverage" and item.value.get("active") is True), None)
        source_record = next((item for item in records if item.evidence_type == "scopus_source_record" and item.value.get("listed") is True), None)
        inactive = next((item for item in records if item.evidence_type == "scopus_coverage" and item.value.get("active") is False), None)
        if active:
            return EvidenceState.VERIFIED, "Authorized Scopus source evidence shows active coverage.", [active.id]
        if source_record:
            return EvidenceState.VERIFIED, "Scopus Serial Title API returned an exact ISSN-matched source record; historical coverage dates may require review.", [source_record.id]
        if inactive:
            return EvidenceState.CONTRADICTED, "Authorized Scopus source evidence shows discontinued or inactive coverage.", [inactive.id]
    if provider == "web_of_science":
        listed = next((item for item in records if item.evidence_type == "wos_journal_record" and item.value.get("listed") is True), None)
        if listed:
            return EvidenceState.VERIFIED, "Web of Science Starter API returned an exact ISSN-matched journal record.", [listed.id]
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
    lookups = []
    for identifier in journal.identifiers:
        if identifier.scheme == "ISSN":
            lookups.append(_lookup_external_issn(identifier.value))
        elif identifier.scheme == "DOI":
            lookups.append(provider.lookup_doi(identifier.value))
    results = await asyncio.gather(*lookups, return_exceptions=True)
    for result in results:
        if not isinstance(result, Exception):
            fresh.extend(result)
    # Imported sources are authoritative positive evidence, but a missing row is not adverse evidence.
    local = LocalProvider(db)
    for identifier in journal.identifiers:
        if identifier.scheme == "ISSN":
            fresh.extend(await local.lookup_issn(identifier.value))
        elif identifier.scheme == "DOI":
            fresh.extend(await local.lookup_doi(identifier.value))
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
    _persist_identity_conflicts(db, journal)
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
