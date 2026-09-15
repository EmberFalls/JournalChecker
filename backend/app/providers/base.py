from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Protocol
from app.core.enums import EvidenceState


@dataclass(frozen=True)
class NormalizedEvidence:
    provider: str
    evidence_type: str
    value: dict
    status: EvidenceState
    confidence: float
    source_url: str | None = None
    source_record: str | None = None
    observed_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    effective_from: datetime | None = None
    effective_to: datetime | None = None


class EvidenceProvider(Protocol):
    name: str

    async def lookup_doi(self, doi: str) -> list[NormalizedEvidence]: ...
    async def lookup_issn(self, issn: str) -> list[NormalizedEvidence]: ...
