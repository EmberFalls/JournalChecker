from app.analysis.assessment import assess
from app.core.enums import AssessmentLabel, EvidenceState
from app.providers.base import NormalizedEvidence


def evidence(status: EvidenceState, kind: str = "doaj_listing") -> NormalizedEvidence:
    return NormalizedEvidence("doaj", kind, {}, status, 0.95)


def test_missing_indexes_are_not_adverse() -> None:
    result = assess([evidence(EvidenceState.NOT_OBSERVED)], identity_confident=True)
    assert result.label == AssessmentLabel.INSUFFICIENT_EVIDENCE


def test_contradictions_are_concerns() -> None:
    result = assess([evidence(EvidenceState.CONTRADICTED)], identity_confident=True)
    assert result.label == AssessmentLabel.SOME_CONCERNS


def test_identity_conflict_wins_over_heuristics() -> None:
    result = assess([evidence(EvidenceState.CONTRADICTED, "domain")], identity_confident=True)
    assert result.label == AssessmentLabel.IDENTITY_CONFLICT


def test_non_applicable_does_not_reduce_coverage() -> None:
    result = assess([evidence(EvidenceState.NOT_APPLICABLE), evidence(EvidenceState.VERIFIED)], identity_confident=True, applicable_checks=1)
    assert result.coverage == 1.0


def test_repeated_provider_rows_do_not_inflate_coverage() -> None:
    result = assess([evidence(EvidenceState.VERIFIED), evidence(EvidenceState.VERIFIED)], identity_confident=True, applicable_checks=2)
    assert result.coverage == 0.5


def test_source_attributed_predatory_list_flag_is_a_review_concern() -> None:
    item = NormalizedEvidence(
        "dgrsdt", "predatory_list", {"authority": "DGRSDT", "effective_year": 2025},
        EvidenceState.VERIFIED, 1.0, "https://www.dgrsdt.dz/en/revues_predateur",
    )
    result = assess([item], identity_confident=True)
    assert result.label == AssessmentLabel.SOME_CONCERNS
    assert result.dimensions["source_list_flags"] == "listed"
    assert "DGRSDT" in result.rationale[0]
