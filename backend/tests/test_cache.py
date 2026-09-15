import pytest
from app.cache.store import Cache
from app.providers.crossref import CrossrefProvider
import httpx


@pytest.mark.asyncio
async def test_in_memory_cache_retains_value_without_redis() -> None:
    cache = Cache(None)
    await cache.set("key", {"value": 1}, 60)
    assert await cache.get("key") == {"value": 1}


@pytest.mark.asyncio
async def test_crossref_reuses_cached_response() -> None:
    calls = 0
    def handler(_: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(200, json={"message": {"DOI": "10.1000/demo"}})
    provider = CrossrefProvider(transport=httpx.MockTransport(handler), cache=Cache(None))
    await provider.lookup_doi("10.1000/demo")
    await provider.lookup_doi("10.1000/demo")
    assert calls == 1
