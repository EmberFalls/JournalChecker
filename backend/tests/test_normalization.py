from app.core.normalization import input_kind, normalize_doi, normalize_issn, normalize_url, valid_issn


def test_issn_normalization_and_checksum() -> None:
    assert normalize_issn(" 2434 561X ") == "2434-561X"
    assert valid_issn("2434-561X")
    assert not valid_issn("2434-5611")


def test_doi_normalization() -> None:
    assert normalize_doi("https://doi.org/10.1000/ABC.Def ") == "10.1000/abc.def"
    assert normalize_doi("not a doi") is None


def test_url_normalization_removes_trackers() -> None:
    assert normalize_url("HTTPS://www.Example.org/a/?utm_source=x&keep=y") == "https://example.org/a?keep=y"


def test_title_is_not_mistaken_for_network_url() -> None:
    assert input_kind("Journal of Medical Studies") == "title"
    assert normalize_url("Journal of Medical Studies") is None


def test_non_standard_ports_are_rejected() -> None:
    assert normalize_url("https://example.org:8080") is None
