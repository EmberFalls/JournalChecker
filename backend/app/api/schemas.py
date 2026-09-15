from datetime import datetime
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2048)


class CandidateOut(BaseModel):
    id: str
    title: str
    score: float
    reasons: list[str]


class SearchResponse(BaseModel):
    input_type: str
    normalized_input: str
    candidates: list[CandidateOut]
    ambiguous: bool


class EvidenceOut(BaseModel):
    id: str | None = None
    provider: str
    evidence_type: str
    value: dict
    status: str
    confidence: float
    source_url: str | None = None
    observed_at: datetime | None = None


class JournalOut(BaseModel):
    id: str
    current_title: str
    canonical_publisher: str | None
    official_domain: str | None
    identifiers: list[str]


class ClaimOut(BaseModel):
    claim_type: str
    source_url: str
    supporting_text: str
    extraction_confidence: float
    verification_status: str | None = None
    verification_rationale: str | None = None


class ReportOut(BaseModel):
    journal: JournalOut
    assessment: str
    confidence: float
    coverage: float
    dimensions: dict[str, str]
    rationale: list[str]
    evidence: list[EvidenceOut]
    claims: list[ClaimOut]
    last_checked: datetime
