import asyncio
import json
from pathlib import Path
from app.core.enums import EvidenceState
from app.core.normalization import valid_issn
from app.db.base import Base
from app.db.models import Evidence, Journal, JournalIdentifier
from app.db.session import SessionLocal, engine
from app.identity.resolver import IdentityResolver
from app.ingestion.authority_flags import seed_authority_flags, seed_issn_test_suite
from app.api.routes import _build_report

CASES = json.loads((Path(__file__).parents[1] / "app" / "ingestion" / "issn_test_cases.json").read_text(encoding="utf-8"))


def test_real_journal_issns_resolve_to_the_documented_titles() -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        for case in CASES["real_listed"]:
            assert valid_issn(case["issn"])
            journal = Journal(current_title=case["title"])
            db.add(journal)
            db.flush()
            db.add(JournalIdentifier(journal_id=journal.id, scheme="ISSN", value=case["issn"], is_primary=True))
            for provider in case["expected_sources"]:
                db.add(Evidence(journal_id=journal.id, provider=provider, evidence_type="doaj_listing" if provider == "doaj" else "scopus_coverage", value={"title": case["title"], "active": True}, status=EvidenceState.VERIFIED, confidence=.95))
        db.commit()
        for case in CASES["real_listed"]:
            result = asyncio.run(IdentityResolver(db).resolve(case["issn"]))
            assert result.input_type == "issn"
            assert len(result.candidates) == 1
            assert result.candidates[0].journal.current_title == case["title"]
            providers = {row.provider for row in db.query(Evidence).filter_by(journal_id=result.candidates[0].journal.id).all()}
            assert set(case["expected_sources"]).issubset(providers)
    finally:
        db.close()


def test_bad_checksum_issns_are_rejected_before_lookup() -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        for value in CASES["faulty_checksum"]:
            result = asyncio.run(IdentityResolver(db).resolve(value))
            assert result.input_type == "invalid_issn"
            assert result.candidates == []
    finally:
        db.close()


def test_valid_issn_absent_from_reference_fixture_is_not_a_negative_finding() -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    value = CASES["valid_but_unlisted_in_fixture"][0]
    assert valid_issn(value)
    db = SessionLocal()
    try:
        result = asyncio.run(IdentityResolver(db).resolve(value))
        assert result.input_type == "issn"
        assert result.candidates == []
    finally:
        db.close()


def test_synthetic_and_authority_list_cases_seed_repeatably() -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        seed_issn_test_suite(db)
        seed_issn_test_suite(db)
        journal = db.query(Journal).filter_by(current_title=CASES["synthetic_negative"]["title"]).one()
        report = _build_report(db, journal)
        assert report.assessment == CASES["synthetic_negative"]["expected_assessment"]
        assert report.claims[0].verification_status == CASES["synthetic_negative"]["expected_claim_status"]
        assert "Synthetic walkthrough" in report.claims[0].verification_rationale
        authority_case = CASES["authority_listed"][0]
        flagged_journal_id = db.query(JournalIdentifier).filter_by(scheme="ISSN", value=authority_case["issn"]).one().journal_id
        flagged_report = _build_report(db, db.get(Journal, flagged_journal_id))
        assert flagged_report.assessment == authority_case["expected_assessment"]
        assert any(item.provider == "dgrsdt" and item.evidence_type == "predatory_list" for item in flagged_report.evidence)
        assert any("DGRSDT" in reason for reason in flagged_report.rationale)
        assert seed_authority_flags(db) == 0
    finally:
        db.close()
