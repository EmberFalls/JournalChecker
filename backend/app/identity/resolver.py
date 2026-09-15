from dataclasses import dataclass
from sqlalchemy import or_
from sqlalchemy.orm import Session
from rapidfuzz import fuzz
from app.core.normalization import input_kind, normalize_doi, normalize_issn, normalize_title, normalize_url
from app.db.models import Journal, JournalIdentifier
from app.providers.crossref import CrossrefProvider


@dataclass
class Candidate:
    journal: Journal
    score: float
    reasons: list[str]


@dataclass
class Resolution:
    input_type: str
    normalized_input: str
    candidates: list[Candidate]
    is_ambiguous: bool


class IdentityResolver:
    def __init__(self, db: Session, crossref: CrossrefProvider | None = None) -> None:
        self.db, self.crossref = db, crossref or CrossrefProvider()

    def _candidate(self, journal: Journal, score: float, reason: str) -> Candidate:
        return Candidate(journal, score, [reason])

    async def resolve(self, raw: str) -> Resolution:
        kind = input_kind(raw)
        if kind == "issn":
            value = normalize_issn(raw) or raw
            rows = self.db.query(JournalIdentifier).filter_by(scheme="ISSN", value=value).all()
            candidates = [self._candidate(self.db.get(Journal, row.journal_id), 1.0, "Exact ISSN match") for row in rows]
            return Resolution(kind, value, candidates, False)
        if kind == "doi":
            value = normalize_doi(raw) or raw
            rows = self.db.query(JournalIdentifier).filter_by(scheme="DOI", value=value).all()
            return Resolution(kind, value, [self._candidate(self.db.get(Journal, row.journal_id), 1.0, "Cached DOI match") for row in rows], False)
        if kind == "url":
            value = normalize_url(raw) or raw
            host = value.split("/")[2]
            journals = self.db.query(Journal).filter(or_(Journal.official_domain == host, Journal.official_domain == host.removeprefix("www."))).all()
            return Resolution(kind, value, [self._candidate(j, 0.9, "Known official domain") for j in journals], False)
        value = normalize_title(raw)
        candidates = []
        for journal in self.db.query(Journal).limit(500).all():
            score = fuzz.token_set_ratio(value, normalize_title(journal.current_title)) / 100
            if score >= 0.72:
                candidates.append(self._candidate(journal, score, "Fuzzy title candidate; requires corroboration"))
        candidates.sort(key=lambda item: item.score, reverse=True)
        ambiguous = len(candidates) > 1 and candidates[0].score - candidates[1].score < 0.12
        return Resolution(kind, value, candidates[:10], ambiguous)
