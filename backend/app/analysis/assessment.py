from dataclasses import dataclass
from app.core.enums import AssessmentLabel, EvidenceState
from app.providers.base import NormalizedEvidence


@dataclass(frozen=True)
class Assessment:
    label: AssessmentLabel
    confidence: float
    coverage: float
    dimensions: dict[str, str]
    rationale: list[str]


def assess(evidence: list[NormalizedEvidence], identity_confident: bool, applicable_checks: int = 5) -> Assessment:
    contradicted = [e for e in evidence if e.status == EvidenceState.CONTRADICTED]
    verified = [e for e in evidence if e.status == EvidenceState.VERIFIED]
    # Repeated fetches of the same fact are corroboration, not additional
    # completed checks. Counting rows here would let repeated analyses inflate
    # coverage to 100%.
    completed_check_types = {
        e.evidence_type for e in evidence
        if e.status not in {EvidenceState.UNKNOWN, EvidenceState.NOT_APPLICABLE}
    }
    coverage = min(1.0, len(completed_check_types) / max(applicable_checks, 1))
    authority_confidence = sum(e.confidence for e in verified) / len(verified) if verified else 0.0
    confidence = round(min(1.0, (0.45 if identity_confident else 0.1) + authority_confidence * 0.45 + coverage * 0.1), 2)
    identity_conflicts = [e for e in contradicted if e.evidence_type in {"identity", "domain", "publisher"}]
    rationale = []
    if identity_conflicts:
        label = AssessmentLabel.IDENTITY_CONFLICT
        rationale.append("Independent identity evidence conflicts; manual verification is recommended.")
    elif len(contradicted) >= 2:
        label = AssessmentLabel.HIGH_RISK
        rationale.append("Multiple independently contradicted claims were found.")
    elif contradicted:
        label = AssessmentLabel.SOME_CONCERNS
        rationale.append("At least one claim is contradicted by an appropriate independent source.")
    elif coverage < 0.4 or not identity_confident:
        label = AssessmentLabel.INSUFFICIENT_EVIDENCE
        rationale.append("Available evidence is insufficient for a reliable risk assessment.")
    else:
        label = AssessmentLabel.LOW_RISK
        rationale.append("No material contradictions found in the completed checks. This is not a legitimacy guarantee.")
    dimensions = {
        "identity_integrity": "supported" if identity_confident else "unresolved",
        "indexing_authenticity": "contradicted" if any(e.evidence_type in {"scopus_indexing", "doaj_listing"} and e.status == EvidenceState.CONTRADICTED for e in evidence) else "not_adverse",
        "claim_consistency": "concerns" if contradicted else "no_contradiction_observed",
        "publishing_transparency": "unknown",
        "editorial_transparency": "unknown",
        "website_domain_identity": "conflict" if identity_conflicts else "not_adverse",
    }
    return Assessment(label, confidence, round(coverage, 2), dimensions, rationale)
