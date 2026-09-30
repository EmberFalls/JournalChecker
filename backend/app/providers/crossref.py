import asyncio
from urllib.parse import quote
import httpx
from app.core.config import get_settings
from app.cache.store import Cache, get_cache
from app.core.enums import EvidenceState
from app.providers.base import NormalizedEvidence


class CrossrefProvider:
    name = "crossref"
    base_url = "https://api.crossref.org"

    def __init__(self, transport: httpx.AsyncBaseTransport | None = None, cache: Cache | None = None) -> None:
        settings = get_settings()
        user_agent = settings.crossref_user_agent
        if settings.crossref_mailto and "mailto:" not in user_agent:
            user_agent += f" (mailto:{settings.crossref_mailto})"
        self.headers = {"User-Agent": user_agent, "Accept": "application/json"}
        self.transport = transport
        self.cache = cache or get_cache()

    async def _get(self, endpoint: str) -> dict | None:
        cache_key = f"crossref:{endpoint}"
        cached = await self.cache.get(cache_key)
        if cached is not None:
            return cached.get("message")
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=10, headers=self.headers, transport=self.transport) as client:
                    response = await client.get(f"{self.base_url}{endpoint}")
                if response.status_code == 404:
                    await self.cache.set(cache_key, {"message": None}, 900)
                    return None
                if response.status_code == 429:
                    await asyncio.sleep(min(2**attempt, 4))
                    continue
                response.raise_for_status()
                payload = response.json()
                message = payload.get("message") if isinstance(payload, dict) else None
                if message is not None:
                    await self.cache.set(cache_key, {"message": message}, 86_400)
                return message
            except (httpx.HTTPError, ValueError):
                if attempt == 2:
                    return None
                await asyncio.sleep(0.25 * (2**attempt))
        return None

    @staticmethod
    def _from_message(message: dict, url: str, journal_record: bool = False) -> list[NormalizedEvidence]:
        issns = message.get("ISSN", [])
        if isinstance(issns, str):
            issns = [issns]
        titles = message.get("container-title", [])
        if journal_record and not titles:
            titles = message.get("title", [])
        if isinstance(titles, str):
            titles = [titles]
        publisher = message.get("publisher")
        result: list[NormalizedEvidence] = []
        if titles:
            result.append(NormalizedEvidence("crossref", "journal_title", {"title": titles[0]}, EvidenceState.VERIFIED, 0.78, url))
        elif message.get("title"):
            work_title = message["title"]
            result.append(NormalizedEvidence("crossref", "work_title", {"title": work_title[0] if isinstance(work_title, list) else work_title}, EvidenceState.VERIFIED, 0.8, url))
        for issn in issns:
            result.append(NormalizedEvidence("crossref", "issn", {"issn": issn}, EvidenceState.VERIFIED, 0.9, url))
        if publisher:
            result.append(NormalizedEvidence("crossref", "publisher", {"publisher": publisher}, EvidenceState.VERIFIED, 0.72, url))
        if message.get("DOI"):
            result.append(NormalizedEvidence("crossref", "doi_metadata", {"doi": message["DOI"].lower()}, EvidenceState.VERIFIED, 0.9, url))
        return result

    async def lookup_doi(self, doi: str) -> list[NormalizedEvidence]:
        url = f"{self.base_url}/works/{quote(doi, safe='')}"
        message = await self._get(f"/works/{quote(doi, safe='')}")
        return self._from_message(message, url) if message else [
            NormalizedEvidence(self.name, "doi_metadata", {"doi": doi}, EvidenceState.NOT_OBSERVED, 0.8, url)
        ]

    async def lookup_issn(self, issn: str) -> list[NormalizedEvidence]:
        url = f"{self.base_url}/journals/{issn}"
        message = await self._get(f"/journals/{issn}")
        return self._from_message(message, url, journal_record=True) if message else [
            NormalizedEvidence(self.name, "journal_metadata", {"issn": issn}, EvidenceState.NOT_OBSERVED, 0.7, url)
        ]

    async def lookup_title(self, title: str) -> list[NormalizedEvidence]:
        query = quote(title.strip(), safe="")
        endpoint = f"/journals?query={query}&rows=20"
        url = f"{self.base_url}{endpoint}"
        message = await self._get(endpoint)
        items = message.get("items", []) if isinstance(message, dict) else []
        result: list[NormalizedEvidence] = []
        for item in items if isinstance(items, list) else []:
            if not isinstance(item, dict):
                continue
            titles = item.get("title", [])
            title_value = titles[0] if isinstance(titles, list) and titles else title
            item_url = item.get("resource", {}).get("primary", {}).get("URL") or url
            result.append(NormalizedEvidence(
                self.name, "journal_title", {"title": title_value}, EvidenceState.VERIFIED, 0.72, item_url
            ))
            for issn in item.get("ISSN", []) if isinstance(item.get("ISSN"), list) else []:
                normalized = issn.strip()
                result.append(NormalizedEvidence(
                    self.name, "issn", {"issn": normalized}, EvidenceState.VERIFIED, 0.85, item_url
                ))
        return result
