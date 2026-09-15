from app.core.enums import EvidenceState
from app.providers.base import NormalizedEvidence


class LocalProvider:
    """Adapter for imported DOAJ/Scopus evidence held in PostgreSQL.

    Importers persist the supplied dataset as evidence. The repository deliberately
    does not scrape Scopus or infer absence from a missing source-list row.
    """
    name = "local"

    async def lookup_doi(self, doi: str) -> list[NormalizedEvidence]:
        return []

    async def lookup_issn(self, issn: str) -> list[NormalizedEvidence]:
        return []

