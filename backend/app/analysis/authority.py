AUTHORITY_BY_CLAIM = {
    "issn": {"issn_registry", "crossref", "doaj", "scopus"},
    "scopus_indexing": {"scopus"},
    "doaj_listing": {"doaj"},
    "doi_metadata": {"crossref"},
    "apc": {"website"},
    "peer_review_policy": {"website"},
}


def authorized_providers(claim_type: str) -> set[str]:
    return AUTHORITY_BY_CLAIM.get(claim_type, set())

