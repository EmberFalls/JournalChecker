"""Seed a conspicuously synthetic journal record for a live walkthrough."""
from sqlalchemy.orm import Session
from app.core.enums import EvidenceState
from app.db.models import ClaimVerification, Evidence, Journal, JournalClaim, JournalIdentifier, Provider

DEMO_ISSN = "9999-0008"
DEMO_TITLE = "[SYNTHETIC DEMO] Journal of Rapid Discovery"


def seed_demo_journal(db: Session) -> str:
    existing = db.query(JournalIdentifier).filter_by(scheme="ISSN", value=DEMO_ISSN).one_or_none()
    if existing:
        journal = db.get(Journal, existing.journal_id)
        if journal.current_title != DEMO_TITLE:
            raise ValueError(f"Demo ISSN {DEMO_ISSN} is already assigned to another journal")
        return f"Demo record already exists. Search ISSN {DEMO_ISSN}."

    journal = Journal(current_title=DEMO_TITLE, canonical_publisher="Example Demo Press", official_domain="example.invalid")
    db.add(journal)
    db.flush()
    db.add(JournalIdentifier(journal_id=journal.id, scheme="ISSN", value=DEMO_ISSN, is_primary=True))
    if not db.query(Provider).filter_by(name="demo_fixture").one_or_none():
        db.add(Provider(name="demo_fixture"))
    evidence = Evidence(
        journal_id=journal.id,
        provider="demo_fixture",
        evidence_type="scopus_indexing",
        value={"claimed": True, "fixture_result": "inactive", "notice": "Synthetic demonstration only; not a real Scopus lookup."},
        status=EvidenceState.CONTRADICTED,
        confidence=1.0,
        source_record="Synthetic demonstration fixture; no real journal or Scopus record is represented.",
    )
    db.add(evidence)
    db.flush()
    claim = JournalClaim(
        journal_id=journal.id,
        claim_type="scopus_indexing",
        value={"claimed": True, "demo_fixture": True},
        source_url="https://example.invalid/demo/indexing",
        supporting_text="Synthetic demo site: ‘Our journal is indexed in Scopus.’",
        extraction_confidence=1.0,
    )
    db.add(claim)
    db.flush()
    db.add(ClaimVerification(
        claim_id=claim.id,
        status=EvidenceState.CONTRADICTED,
        rationale="Synthetic walkthrough result: the demo fixture marks this indexing claim as inactive. This is not a real journal assessment.",
        evidence_ids=[evidence.id],
    ))
    db.commit()
    return f"Created a synthetic walkthrough journal. Search ISSN {DEMO_ISSN}. It is clearly labelled in the result."
