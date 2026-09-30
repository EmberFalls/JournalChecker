"""Optional official Elsevier Scopus Serial Title API adapter."""
from urllib.parse import quote

import httpx

from app.core.config import get_settings
from app.core.enums import EvidenceState
from app.core.normalization import normalize_issn
from app.providers.base import NormalizedEvidence


class ScopusProvider:
    name = "scopus"
    base_url = "https://api.elsevier.com/content/serial/title/issn"

    def __init__(self, api_key: str | None = None, transport: httpx.AsyncBaseTransport | None = None) -> None:
        self.api_key = api_key if api_key is not None else get_settings().scopus_api_key
        self.transport = transport

    async def _get_payload(self, url: str, params: dict | None = None) -> dict | None:
        if not self.api_key:
            return None
        try:
            async with httpx.AsyncClient(
                timeout=8,
                headers={"X-ELS-APIKey": self.api_key, "Accept": "application/json"},
                transport=self.transport,
            ) as client:
                response = await client.get(url, params=params)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            value = response.json()
            return value if isinstance(value, dict) else None
        except (httpx.HTTPError, ValueError):
            return None

    @staticmethod
    def _entries(payload: dict | None) -> list[dict]:
        root = payload.get("serial-metadata-response", {}) if payload else {}
        entries = root.get("entry", []) if isinstance(root, dict) else []
        if isinstance(entries, dict):
            entries = [entries]
        return [entry for entry in entries if isinstance(entry, dict)] if isinstance(entries, list) else []

    @staticmethod
    def _issns(entry: dict) -> set[str]:
        return {
            value for value in (
                normalize_issn(str(entry.get("prism:issn") or "")),
                normalize_issn(str(entry.get("prism:eIssn") or "")),
            ) if value
        }

    @staticmethod
    def _evidence(entry: dict, source_url: str) -> list[NormalizedEvidence]:
        title = entry.get("dc:title")
        source_id = entry.get("source-id")
        issns = ScopusProvider._issns(entry)
        if not title or not issns:
            return []
        value = {
            "title": title,
            "publisher": entry.get("dc:publisher"),
            "issns": sorted(issns),
            "source_id": source_id,
            "source_type": entry.get("prism:aggregationType"),
            "listed": True,
        }
        output = [NormalizedEvidence(
            "scopus", "scopus_source_record", value, EvidenceState.VERIFIED, 0.98, source_url
        )]
        for key, metric_name in (("SJRList", "SJR"), ("SNIPList", "SNIP")):
            metric_container = entry.get(key) or {}
            metrics = metric_container.get(metric_name, []) if isinstance(metric_container, dict) else []
            if isinstance(metrics, dict):
                metrics = [metrics]
            for metric in metrics if isinstance(metrics, list) else []:
                if isinstance(metric, dict) and metric.get("@year") and metric.get("$") is not None:
                    output.append(NormalizedEvidence(
                        "scopus", "scopus_metric",
                        {"name": metric_name, "year": metric["@year"], "value": metric["$"], "source_id": source_id},
                        EvidenceState.VERIFIED, 0.95, source_url,
                    ))
        return output

    async def lookup_issn(self, issn: str) -> list[NormalizedEvidence]:
        if not self.api_key:
            return []
        normalized = normalize_issn(issn)
        if not normalized:
            return []
        url = f"{self.base_url}/{quote(normalized, safe='')}"
        payload = await self._get_payload(url)
        output: list[NormalizedEvidence] = []
        for entry in self._entries(payload):
            listed_issns = self._issns(entry)
            # The endpoint is keyed by ISSN; still require it to be echoed in the record
            # before associating that record with the requested journal.
            if normalized not in listed_issns:
                continue
            source_url = entry.get("prism:url") or url
            output.extend(self._evidence(entry, source_url))
        return output

    async def lookup_title(self, title: str) -> list[NormalizedEvidence]:
        normalized_title = " ".join(title.split())
        if not self.api_key or len(normalized_title) < 3:
            return []
        url = "https://api.elsevier.com/content/serial/title"
        payload = await self._get_payload(url, {"title": normalized_title, "content": "journal", "count": 25})
        output: list[NormalizedEvidence] = []
        for entry in self._entries(payload):
            output.extend(self._evidence(entry, entry.get("prism:url") or url))
        return output
