import hashlib
import ipaddress
import socket
from collections import deque
from dataclasses import dataclass
from html.parser import HTMLParser as StdlibHTMLParser
from urllib.parse import urljoin, urlsplit
import httpx
from app.core.config import get_settings
from app.core.normalization import normalize_url


class UnsafeUrl(ValueError):
    pass


def _is_public_host(host: str) -> bool:
    if host.lower() in {"localhost", "localhost.localdomain"}:
        return False
    try:
        addresses = socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)
    except socket.gaierror:
        return False
    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if not ip.is_global:
            return False
    return bool(addresses)


def validate_public_url(url: str) -> str:
    normalized = normalize_url(url)
    if not normalized:
        raise UnsafeUrl("Only valid HTTP/HTTPS URLs are permitted.")
    parsed = urlsplit(normalized)
    if parsed.username or parsed.password or not parsed.hostname or not _is_public_host(parsed.hostname):
        raise UnsafeUrl("The crawler only permits public internet destinations.")
    return normalized


@dataclass(frozen=True)
class CrawledPage:
    url: str
    title: str | None
    text: str
    content_hash: str


@dataclass(frozen=True)
class _Anchor:
    attributes: dict[str, str | None]


class _PageParser(StdlibHTMLParser):
    """Small built-in HTML extractor, avoiding native parser DLL requirements."""

    def __init__(self, content: bytes) -> None:
        super().__init__(convert_charrefs=True)
        self.body_parts: list[str] = []
        self.title_parts: list[str] = []
        self.anchors: list[_Anchor] = []
        self._in_body = False
        self._in_title = False
        self.feed(content.decode("utf-8", errors="replace"))

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag == "body":
            self._in_body = True
        elif tag == "title":
            self._in_title = True
        elif tag == "a":
            self.anchors.append(_Anchor(dict(attrs)))

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "body":
            self._in_body = False
        elif tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_body:
            self.body_parts.append(data)
        if self._in_title:
            self.title_parts.append(data)

    @property
    def body_text(self) -> str:
        return " ".join(" ".join(self.body_parts).split())

    @property
    def title_text(self) -> str | None:
        title = " ".join(" ".join(self.title_parts).split())
        return title or None


class SafeCrawler:
    relevant_keywords = ("about", "editorial", "peer-review", "peer_review", "ethic", "apc", "fee", "contact", "index", "guideline", "policy")

    def __init__(self) -> None:
        self.settings = get_settings()

    async def _fetch(self, client: httpx.AsyncClient, url: str) -> tuple[str, bytes, str]:
        current = validate_public_url(url)
        for _ in range(5):
            async with client.stream("GET", current, follow_redirects=False) as response:
                if response.is_redirect:
                    location = response.headers.get("location")
                    if not location:
                        raise UnsafeUrl("Redirect response has no destination.")
                    current = validate_public_url(urljoin(current, location))
                    continue
                content_type = response.headers.get("content-type", "").lower()
                declared_length = response.headers.get("content-length")
                if declared_length:
                    try:
                        exceeds_limit = int(declared_length) > self.settings.crawl_max_response_bytes
                    except ValueError as exc:
                        raise UnsafeUrl("Response has an invalid Content-Length header.") from exc
                    if exceeds_limit:
                        raise UnsafeUrl("Response exceeds the configured size limit.")
                if response.status_code >= 400:
                    raise httpx.HTTPStatusError("Website returned an error", request=response.request, response=response)
                if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
                    raise UnsafeUrl("Only HTML pages are crawled.")
                chunks: list[bytes] = []
                size = 0
                async for chunk in response.aiter_bytes():
                    size += len(chunk)
                    if size > self.settings.crawl_max_response_bytes:
                        raise UnsafeUrl("Response exceeds the configured size limit.")
                    chunks.append(chunk)
                return current, b"".join(chunks), content_type
        raise UnsafeUrl("Redirect limit exceeded.")

    async def crawl(self, start_url: str) -> list[CrawledPage]:
        start_url = validate_public_url(start_url)
        origin = urlsplit(start_url).hostname
        queue = deque([(start_url, 0)])
        visited: set[str] = set()
        pages: list[CrawledPage] = []
        timeout = httpx.Timeout(self.settings.crawl_timeout_seconds)
        async with httpx.AsyncClient(timeout=timeout, headers={"User-Agent": "JournalIntegrityCrawler/0.1"}) as client:
            while queue and len(pages) < self.settings.crawl_max_pages:
                requested, depth = queue.popleft()
                if requested in visited:
                    continue
                visited.add(requested)
                try:
                    final_url, content, _ = await self._fetch(client, requested)
                except (httpx.HTTPError, UnsafeUrl):
                    continue  # Failure is deliberately not treated as missing policy evidence.
                document = _PageParser(content)
                pages.append(CrawledPage(final_url, document.title_text, document.body_text, hashlib.sha256(content).hexdigest()))
                if depth >= self.settings.crawl_max_depth:
                    continue
                for anchor in document.anchors:
                    href = anchor.attributes.get("href")
                    if not href:
                        continue
                    target = urljoin(final_url, href)
                    parsed = urlsplit(target)
                    if parsed.hostname != origin or not any(word in target.lower() for word in self.relevant_keywords):
                        continue
                    try:
                        queue.append((validate_public_url(target), depth + 1))
                    except UnsafeUrl:
                        continue
        return pages
