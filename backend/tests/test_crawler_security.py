import httpx
import pytest
from app.crawler.safe_crawler import SafeCrawler, UnsafeUrl, validate_public_url


@pytest.mark.parametrize("url", ["file:///etc/passwd", "http://localhost:8000", "http://127.0.0.1", "http://169.254.169.254/latest/meta-data", "ftp://example.com"])
def test_non_public_or_invalid_destinations_are_rejected(url: str) -> None:
    with pytest.raises(UnsafeUrl):
        validate_public_url(url)


@pytest.mark.asyncio
async def test_oversized_declared_response_is_rejected_before_body_read(monkeypatch: pytest.MonkeyPatch) -> None:
    crawler = SafeCrawler()
    monkeypatch.setattr(crawler.settings, "crawl_max_response_bytes", 10)
    monkeypatch.setattr("app.crawler.safe_crawler._is_public_host", lambda host: host == "example.org")
    transport = httpx.MockTransport(lambda request: httpx.Response(200, headers={"content-type": "text/html", "content-length": "99"}, content=b"x" * 99))
    async with httpx.AsyncClient(transport=transport) as client:
        with pytest.raises(UnsafeUrl, match="exceeds"):
            await crawler._fetch(client, "https://example.org")


@pytest.mark.asyncio
async def test_redirect_to_private_address_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    crawler = SafeCrawler()
    monkeypatch.setattr("app.crawler.safe_crawler._is_public_host", lambda host: host == "example.org")
    transport = httpx.MockTransport(lambda request: httpx.Response(302, headers={"location": "http://127.0.0.1/admin"}))
    async with httpx.AsyncClient(transport=transport) as client:
        with pytest.raises(UnsafeUrl, match="public internet"):
            await crawler._fetch(client, "https://example.org")
