"""Seed source-attributed authority-list flags used by the ISSN test suite."""
import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.enums import EvidenceState
from app.db.models import Evidence, Journal, JournalIdentifier

CASE_FILE = Path(__file__).with_name("issn_test_cases.json")


def seed_authority_flags(db: Session) -> int:
    cases = json.loads(CASE_FILE.read_text(encoding="utf-8"))["authority_listed"]
    inserted = 0
    for case in cases:
        identifier = db.query(JournalIdentifier).filter_by(scheme="ISSN", value=case["issn"]).one_or_none()
        if identifier:
            journal = db.get(Journal, identifier.journal_id)
        else:
            journal = Journal(current_title=case["title"])
            db.add(journal)
            db.flush()
            db.add(JournalIdentifier(journal_id=journal.id, scheme="ISSN", value=case["issn"], is_primary=True))
        source_record = f"{case['authority']} {case['list_year']} entry {case['list_entry']}"
        existing = db.query(Evidence).filter_by(journal_id=journal.id, provider="dgrsdt", evidence_type="predatory_list", source_record=source_record).one_or_none()
        if existing:
            continue
        db.add(Evidence(
            journal_id=journal.id,
            provider="dgrsdt",
            evidence_type="predatory_list",
            value={"authority": case["authority"], "classification": "listed as predatory by this source", "effective_year": case["list_year"], "listed_title": case["title"], "listed_urls": case["listed_urls"], "notice": "This records a source-specific list entry, not a universal judgment."},
            status=EvidenceState.VERIFIED,
            confidence=1.0,
            source_url=case["source_url"],
            source_record=source_record,
        ))
        inserted += 1
    db.commit()
    return inserted


def seed_issn_test_suite(db: Session) -> str:
    from app.ingestion.demo import seed_demo_journal
    demo_message = seed_demo_journal(db)
    count = seed_authority_flags(db)
    return f"{demo_message} Added {count} source-attributed authority-list flag(s). Search ISSN 1009-6744 for the DGRSDT case."
