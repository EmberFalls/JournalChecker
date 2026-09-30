from sqlalchemy.orm import Session
from app.core.enums import EvidenceState
from app.db.models import Evidence, JournalIdentifier
from app.providers.base import NormalizedEvidence


class LocalProvider:
    """Adapter for imported DOAJ/Scopus evidence held in PostgreSQL.

    Importers persist the supplied dataset as evidence. The repository deliberately
    does not scrape Scopus or infer absence from a missing source-list row.
    """
    name = "local"

    def __init__(self, db: Session) -> None:
        self.db = db

    def _evidence_for_identifiers(self, scheme: str, value: str) -> list[NormalizedEvidence]:
        identifiers = self.db.query(JournalIdentifier).filter_by(scheme=scheme, value=value).all()
        journal_ids = [item.journal_id for item in identifiers]
        if not journal_ids:
            return []
        records = self.db.query(Evidence).filter(Evidence.journal_id.in_(journal_ids)).all()
        return [NormalizedEvidence(item.provider, item.evidence_type, item.value, EvidenceState(item.status), item.confidence, item.source_url, item.source_record, item.observed_at, item.effective_from, item.effective_to) for item in records]

    async def lookup_doi(self, doi: str) -> list[NormalizedEvidence]:
        return self._evidence_for_identifiers("DOI", doi)

    async def lookup_issn(self, issn: str) -> list[NormalizedEvidence]:
        return self._evidence_for_identifiers("ISSN", issn)
