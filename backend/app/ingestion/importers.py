import csv
import json
from datetime import UTC, datetime
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.enums import EvidenceState
from app.core.normalization import normalize_issn
from app.db.models import Evidence, Journal, JournalIdentifier, Provider


def _provider(db: Session, name: str) -> Provider:
    item = db.query(Provider).filter_by(name=name).one_or_none()
    if not item:
        item = Provider(name=name)
        db.add(item)
    item.last_imported_at = datetime.now(UTC)
    return item


def _upsert_journal(db: Session, title: str, issns: list[str], publisher: str | None) -> Journal:
    for issn in issns:
        found = db.query(JournalIdentifier).filter_by(scheme="ISSN", value=issn).one_or_none()
        if found:
            return db.get(Journal, found.journal_id)
    journal = Journal(current_title=title, canonical_publisher=publisher)
    db.add(journal)
    db.flush()
    for issn in issns:
        db.add(JournalIdentifier(journal_id=journal.id, scheme="ISSN", value=issn))
    return journal


def _add_evidence_once(db: Session, *, journal_id: str, provider: str, evidence_type: str, value: dict, source_url: str | None, confidence: float = 0.95) -> None:
    """Keep repeated imports of the same source record idempotent."""
    existing = db.query(Evidence).filter_by(
        journal_id=journal_id,
        provider=provider,
        evidence_type=evidence_type,
        source_url=source_url,
    ).one_or_none()
    if not existing:
        db.add(Evidence(journal_id=journal_id, provider=provider, evidence_type=evidence_type, value=value, status=EvidenceState.VERIFIED, confidence=confidence, source_url=source_url))


def import_doaj_json(db: Session, path: str) -> int:
    records = json.loads(Path(path).read_text(encoding="utf-8"))
    _provider(db, "doaj")
    imported = 0
    for item in records:
        bib = item.get("bibjson", item)
        issns = [normalize_issn(x) for x in bib.get("pissn", "").split(",") + bib.get("eissn", "").split(",")]
        issns = [x for x in issns if x]
        if not issns or not bib.get("title"):
            continue
        journal = _upsert_journal(db, bib["title"], issns, bib.get("publisher"))
        _add_evidence_once(db, journal_id=journal.id, provider="doaj", evidence_type="doaj_listing", value={"title": bib["title"]}, source_url=item.get("id"))
        imported += 1
    db.commit()
    return imported


def import_scopus_csv(db: Session, path: str) -> int:
    _provider(db, "scopus")
    imported = 0
    with Path(path).open(encoding="utf-8-sig", newline="") as file:
        for row in csv.DictReader(file):
            title = row.get("Source Title") or row.get("Title")
            issns = [normalize_issn(row.get(key, "")) for key in ("Print-ISSN", "E-ISSN", "ISSN")]
            issns = [x for x in issns if x]
            if not title or not issns:
                continue
            journal = _upsert_journal(db, title, issns, row.get("Publisher's Name") or row.get("Publisher"))
            active = (row.get("Active or Inactive") or row.get("Status") or "").lower() != "inactive"
            _add_evidence_once(db, journal_id=journal.id, provider="scopus", evidence_type="scopus_coverage", value={"coverage": row.get("Coverage"), "active": active, "source_id": row.get("Source ID")}, source_url=f"scopus-source:{row.get('Source ID', title)}")
            imported += 1
    db.commit()
    return imported
