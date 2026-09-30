"""Optional official Clarivate Web of Science Starter journals adapter."""
from urllib.parse import quote

import httpx

from app.core.config import get_settings
from app.core.enums import EvidenceState
from app.core.normalization import normalize_issn
from app.providers.base import NormalizedEvidence


class WebOfScienceProvider:
    name = "web_of_science"

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        settings = get_settings()
        self.api_key = api_key if api_key is not None else settings.wos_api_key
        self.base_url = (base_url or settings.wos_starter_api_url).rstrip("/")
        self.transport = transport

    async def lookup_issn(self, issn: str) -> list[NormalizedEvidence]:
        if not self.api_key:
            return []
        normalized = normalize_issn(issn)
        if not normalized:
            return []
        url = f"{self.base_url}/journals"
        try:
            async with httpx.AsyncClient(
                timeout=8,
                headers={"X-ApiKey": self.api_key, "Accept": "application/json"},
                transport=self.transport,
            ) as client:
                response = await client.get(url, params={"issn": normalized})
            if response.status_code == 404:
                return []
            response.raise_for_status()
            payload = response.json()
        except (httpx.HTTPError, ValueError):
            return []

        hits = payload.get("hits", []) if isinstance(payload, dict) else []
        if isinstance(hits, dict):
            hits = [hits]
        output: list[NormalizedEvidence] = []
        for hit in hits if isinstance(hits, list) else []:
            if not isinstance(hit, dict):
                continue
            name = hit.get("name") or hit.get("title")
            listed = {
                value for value in (
                    normalize_issn(str(hit.get("issn") or "")),
                    normalize_issn(str(hit.get("e_issn") or hit.get("eIssn") or "")),
                ) if value
            }
            if not name or normalized not in listed:
                continue
            output.append(NormalizedEvidence(
                self.name,
                "wos_journal_record",
                {"title": name, "issns": sorted(listed), "journal_id": hit.get("id"), "listed": True},
                EvidenceState.VERIFIED,
                0.98,
                f"{url}?issn={quote(normalized, safe='')}",
            ))
        return output
