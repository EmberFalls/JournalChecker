import httpx
import pytest
from app.providers.crossref import CrossrefProvider


@pytest.mark.asyncio
async def test_crossref_doi_response_is_normalized() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        # HTTPX decodes .path for display; raw_path verifies the wire-safe DOI.
        assert request.url.raw_path == b"/works/10.1000%2Fdemo"
        return httpx.Response(200, json={"message": {"DOI": "10.1000/demo", "container-title": ["Example Journal"], "ISSN": ["1234-5679"], "publisher": "Example Press"}})
    provider = CrossrefProvider(transport=httpx.MockTransport(handler))
    result = await provider.lookup_doi("10.1000/demo")
    assert {item.evidence_type for item in result} == {"doi_metadata", "journal_title", "issn", "publisher"}
