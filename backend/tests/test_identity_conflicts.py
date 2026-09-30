from app.core.enums import EvidenceState
from app.identity.conflicts import identity_conflicts
from app.providers.base import NormalizedEvidence


def test_conflicting_authoritative_title_creates_identity_conflict() -> None:
    findings = identity_conflicts("Journal of Evidence", "Known Publisher", "journal.example", [
        NormalizedEvidence("doaj", "doaj_listing", {"title": "Other Journal", "publisher": "Known Publisher", "journal_url": "https://journal.example"}, EvidenceState.VERIFIED, 0.95)
    ])
    assert len(findings) == 1
    assert findings[0].status == EvidenceState.CONTRADICTED
    assert findings[0].evidence_type == "identity"


def test_missing_optional_source_fields_are_not_conflicts() -> None:
    assert identity_conflicts("Journal of Evidence", None, None, [
        NormalizedEvidence("doaj", "doaj_listing", {"title": "Journal of Evidence"}, EvidenceState.VERIFIED, 0.95)
    ]) == []
