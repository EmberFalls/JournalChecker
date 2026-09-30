import asyncio

import httpx
from fastapi.testclient import TestClient

from app.core.enums import EvidenceState
from app.db.base import Base
from app.db.models import Journal, JournalIdentifier
from app.db.session import SessionLocal, engine
from app.providers.crossref import CrossrefProvider
from app.providers.scopus import ScopusProvider
from app.providers.wos import WebOfScienceProvider
from app.main import app


def test_scopus_serial_title_api_payload_is_exact_issn_matched() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["X-ELS-APIKey"] == "test-key"
        assert request.url.path.endswith("/2434-561X")
        return httpx.Response(200, json={"serial-metadata-response": {"entry": {
            "dc:title": "Provider Journal",
            "dc:publisher": "Example Press",
            "prism:issn": "2434-561X",
            "prism:eIssn": "1234-5679",
            "source-id": "source-1",
            "prism:aggregationType": "journal",
            "SJRList": {"SJR": [{"@year": "2025", "$": "1.25"}]},
        }}})

    result = asyncio.run(ScopusProvider("test-key", httpx.MockTransport(handler)).lookup_issn("2434561X"))
    assert any(item.evidence_type == "scopus_source_record" for item in result)
    metric = next(item for item in result if item.evidence_type == "scopus_metric")
    assert metric.value == {"name": "SJR", "year": "2025", "value": "1.25", "source_id": "source-1"}


def test_scopus_api_is_optional_without_a_key() -> None:
    assert asyncio.run(ScopusProvider(api_key="").lookup_issn("2434-561X")) == []


def test_wos_starter_journal_api_requires_exact_issn_match() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["X-Apikey"] == "test-key"
        assert request.url.params["issn"] == "2434-561X"
        return httpx.Response(200, json={"hits": [
            {"id": "j-1", "name": "Provider Journal", "issn": "2434-561X", "e_issn": "1234-5679"},
            {"id": "j-2", "name": "Wrong Journal", "issn": "1932-6203"},
        ]})

    provider = WebOfScienceProvider("test-key", transport=httpx.MockTransport(handler))
    result = asyncio.run(provider.lookup_issn("2434-561X"))
    assert len(result) == 1
    assert result[0].evidence_type == "wos_journal_record"
    assert result[0].value["title"] == "Provider Journal"


def test_crossref_article_title_is_not_misidentified_as_journal_title() -> None:
    provider = CrossrefProvider(transport=httpx.MockTransport(
        lambda _: httpx.Response(200, json={"message": {
            "DOI": "10.1234/article",
            "title": ["An Article Title"],
            "ISSN": ["2434-561X"],
        }})
    ))
    result = asyncio.run(provider.lookup_doi("10.1234/article"))
    assert any(item.evidence_type == "work_title" for item in result)
    assert not any(item.evidence_type == "journal_title" for item in result)


def test_doi_lookup_attaches_crossref_issn_for_later_exact_search(monkeypatch) -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    async def doi_lookup(self, doi):
        from app.providers.base import NormalizedEvidence
        return [
            NormalizedEvidence("crossref", "journal_title", {"title": "Linked Journal"}, EvidenceState.VERIFIED, .9),
            NormalizedEvidence("crossref", "issn", {"issn": "2434-561X"}, EvidenceState.VERIFIED, .9),
        ]

    async def empty_lookup(self, issn):
        return []

    monkeypatch.setattr(CrossrefProvider, "lookup_doi", doi_lookup)
    monkeypatch.setattr(CrossrefProvider, "lookup_issn", empty_lookup)
    monkeypatch.setattr(ScopusProvider, "lookup_issn", empty_lookup)
    monkeypatch.setattr(WebOfScienceProvider, "lookup_issn", empty_lookup)
    with TestClient(app) as client:
        doi_response = client.post("/api/search", json={"query": "10.1234/example"})
        issn_response = client.post("/api/search", json={"query": "2434561X"})
    assert doi_response.status_code == 200
    assert issn_response.status_code == 200
    assert doi_response.json()["candidates"][0]["id"] == issn_response.json()["candidates"][0]["id"]


def test_article_only_doi_does_not_create_a_fake_journal(monkeypatch) -> None:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    async def doi_lookup(self, doi):
        from app.providers.base import NormalizedEvidence
        return [NormalizedEvidence("crossref", "work_title", {"title": "Article title"}, EvidenceState.VERIFIED, .8)]

    async def empty_lookup(self, issn):
        return []

    monkeypatch.setattr(CrossrefProvider, "lookup_doi", doi_lookup)
    monkeypatch.setattr(ScopusProvider, "lookup_issn", empty_lookup)
    monkeypatch.setattr(WebOfScienceProvider, "lookup_issn", empty_lookup)
    with TestClient(app) as client:
        response = client.post("/api/search", json={"query": "10.1234/article-only"})
    assert response.status_code == 200
    assert response.json()["candidates"] == []

