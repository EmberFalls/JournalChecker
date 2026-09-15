from fastapi.testclient import TestClient
from app.db.base import Base
from app.api.routes import _verify_indexing_claim
from app.core.enums import EvidenceState
from app.db.models import ClaimVerification, Evidence, Journal, JournalClaim, JournalIdentifier, RiskAssessment
from app.db.session import SessionLocal, engine
from app.main import app


def seed_journal() -> str:
    db = SessionLocal()
    journal = Journal(current_title="Integration Journal", canonical_publisher="Example Press", official_domain="example.org")
    db.add(journal)
    db.flush()
    db.add(JournalIdentifier(journal_id=journal.id, scheme="ISSN", value="2434-561X", is_primary=True))
    db.commit()
    identifier = journal.id
    db.close()
    return identifier


def test_search_detail_and_report_are_integrated() -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    journal_id = seed_journal()
    with TestClient(app) as client:
        health = client.get("/health")
        search = client.post("/api/search", json={"query": "2434561X"})
        detail = client.get(f"/api/journals/{journal_id}")
        report = client.get(f"/api/journals/{journal_id}/report")
    assert health.json() == {"status": "ok"}
    assert search.status_code == 200
    assert search.json()["candidates"][0]["id"] == journal_id
    assert detail.json()["current_title"] == "Integration Journal"
    assert report.json()["assessment"] == "INSUFFICIENT_EVIDENCE"
    assert report.json()["confidence"] < 1


def test_report_get_does_not_create_assessments() -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    journal_id = seed_journal()
    with TestClient(app) as client:
        assert client.get(f"/api/journals/{journal_id}/report").status_code == 200
    db = SessionLocal()
    try:
        assert db.query(RiskAssessment).count() == 0
    finally:
        db.close()


def test_scopus_claim_uses_stored_authorized_evidence() -> None:
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    journal_id = seed_journal()
    db = SessionLocal()
    try:
        inactive = Evidence(journal_id=journal_id, provider="scopus", evidence_type="scopus_coverage", value={"active": False}, status=EvidenceState.VERIFIED, confidence=0.95)
        db.add(inactive); db.commit()
        status, _, evidence_ids = _verify_indexing_claim(db, journal_id, "scopus_indexing")
        assert status == EvidenceState.CONTRADICTED
        assert evidence_ids == [inactive.id]
    finally:
        db.close()


def test_report_includes_claim_verification() -> None:
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    journal_id = seed_journal(); db = SessionLocal()
    claim = JournalClaim(journal_id=journal_id, claim_type="doaj_listing", value={"claimed": True}, source_url="https://example.org", supporting_text="Listed in DOAJ", extraction_confidence=.8)
    db.add(claim); db.flush(); db.add(ClaimVerification(claim_id=claim.id, status=EvidenceState.NOT_VERIFIED, rationale="No independent record.", evidence_ids=[])); db.commit(); db.close()
    with TestClient(app) as client:
        report = client.get(f"/api/journals/{journal_id}/report").json()
    assert report["claims"][0]["verification_status"] == "NOT_VERIFIED"
