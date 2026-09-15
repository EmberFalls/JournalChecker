import re
from dataclasses import dataclass

@dataclass(frozen=True)
class ExtractedClaim:
    claim_type: str
    value: dict
    supporting_text: str
    confidence: float


PATTERNS = {
    "scopus_indexing": re.compile(r".{0,120}(?:indexed|indexing).{0,80}scopus.{0,120}", re.I),
    "doaj_listing": re.compile(r".{0,120}(?:listed|index(?:ed|ing)).{0,80}doaj.{0,120}", re.I),
    "peer_review_policy": re.compile(r".{0,120}peer[- ]review.{0,160}", re.I),
    "ethics_policy": re.compile(r".{0,120}(?:publication ethics|retraction policy|cope).{0,160}", re.I),
    "apc": re.compile(r".{0,80}(?:APC|article processing charge|publication fee).{0,160}", re.I),
}


def extract_claims(page_text: str) -> list[ExtractedClaim]:
    claims = []
    for claim_type, pattern in PATTERNS.items():
        for match in pattern.finditer(page_text):
            claims.append(ExtractedClaim(claim_type, {"claimed": True}, match.group(0).strip(), 0.8))
            break
    return claims

