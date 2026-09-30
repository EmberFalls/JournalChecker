import re
import unicodedata
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ISSN_RE = re.compile(r"^(\d{4})-?(\d{3}[\dX])$", re.I)
DOI_RE = re.compile(r"^10\.\d{4,9}/\S+$", re.I)


def normalize_whitespace(value: str) -> str:
    return " ".join(unicodedata.normalize("NFKC", value).split())


def normalize_issn(value: str) -> str | None:
    candidate = normalize_whitespace(value).strip()
    candidate = re.sub(r"^(?:e?issn)\s*[:#]?\s*", "", candidate, flags=re.I)
    candidate = candidate.replace("–", "-").replace("—", "-").replace("−", "-")
    match = ISSN_RE.match(candidate.replace(" ", ""))
    if not match:
        return None
    return f"{match.group(1)}-{match.group(2).upper()}"


def valid_issn(value: str) -> bool:
    normalized = normalize_issn(value)
    if not normalized:
        return False
    digits = normalized.replace("-", "")
    total = sum(int(char) * weight for char, weight in zip(digits[:7], range(8, 1, -1)))
    expected = (11 - total % 11) % 11
    check = "X" if expected == 10 else str(expected)
    return digits[-1] == check


def normalize_doi(value: str) -> str | None:
    value = normalize_whitespace(value).strip().rstrip(".,;)")
    value = re.sub(r"^https?://(dx\.)?doi\.org/", "", value, flags=re.I)
    value = re.sub(r"^doi:\s*", "", value, flags=re.I)
    value = value.lower()
    return value if DOI_RE.match(value) else None


def normalize_title(value: str) -> str:
    value = normalize_whitespace(value).lower()
    return re.sub(r"[^\w\s]", "", value)


def normalize_url(value: str) -> str | None:
    value = normalize_whitespace(value)
    # A human-entered title (for example, "Journal of Medical Studies") must
    # not accidentally become a network destination.
    has_scheme = bool(re.match(r"^https?://", value, flags=re.I))
    is_bare_host = bool(re.match(r"^(?:www\.)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:[/:?#]|$)", value, flags=re.I))
    if not has_scheme and not is_bare_host:
        return None
    if not has_scheme:
        value = "https://" + value
    try:
        parsed = urlsplit(value)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            return None
        host = parsed.hostname.lower().removeprefix("www.")
        if any(char.isspace() for char in host) or not re.fullmatch(r"[a-z0-9.-]+", host):
            return None
        if parsed.port not in {None, 80, 443}:
            return None
        query = urlencode([(k, v) for k, v in parse_qsl(parsed.query) if not k.startswith("utm_")])
        return urlunsplit((parsed.scheme.lower(), host, parsed.path.rstrip("/"), query, ""))
    except ValueError:
        return None


def input_kind(value: str) -> str:
    if normalize_issn(value):
        return "issn"
    if normalize_doi(value):
        return "doi"
    if normalize_url(value):
        return "url"
    return "title"
