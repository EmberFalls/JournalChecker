import csv
import json
from app.db.base import Base
from app.db.models import Evidence, Journal, JournalIdentifier
from app.db.session import SessionLocal, engine
from app.ingestion.importers import _upsert_journal, import_doaj_csv, import_doaj_json, import_scimago_csv, import_scopus_csv, import_scopus_xlsx


def test_doaj_import_is_idempotent(tmp_path) -> None:
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    dataset = tmp_path / "doaj.json"
    dataset.write_text(json.dumps([{"id": "https://doaj.org/toc/example", "bibjson": {"title": "Open Journal", "pissn": "2434-561X", "publisher": "Example"}}]), encoding="utf-8")
    db = SessionLocal()
    try:
        assert import_doaj_json(db, str(dataset)) == 1
        assert import_doaj_json(db, str(dataset)) == 1
        assert db.query(Evidence).filter_by(provider="doaj").count() == 1
    finally:
        db.close()


def test_scopus_import_preserves_inactive_coverage(tmp_path) -> None:
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    dataset = tmp_path / "scopus.csv"
    with dataset.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["Source Title", "Print-ISSN", "Active or Inactive", "Source ID"])
        writer.writeheader(); writer.writerow({"Source Title": "Archived Journal", "Print-ISSN": "2434-561X", "Active or Inactive": "Inactive", "Source ID": "12"})
    db = SessionLocal()
    try:
        assert import_scopus_csv(db, str(dataset)) == 1
        evidence = db.query(Evidence).filter_by(provider="scopus").one()
        assert evidence.value["active"] is False
    finally:
        db.close()


def test_official_format_importers(tmp_path) -> None:
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    doaj = tmp_path / "doaj.csv"
    with doaj.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["Journal title", "Journal URL", "URL in DOAJ", "Journal ISSN (print version)", "Journal EISSN (online version)", "Publisher", "Review process", "Journal license", "Last updated Date"])
        writer.writeheader(); writer.writerow({"Journal title": "Open Journal", "Journal URL": "https://journal.example.org", "URL in DOAJ": "https://doaj.org/toc/example", "Journal ISSN (print version)": "2434-561X", "Publisher": "Example", "Review process": "Double anonymous peer review"})
    db = SessionLocal()
    try:
        assert import_doaj_csv(db, str(doaj)) == 1
        evidence = db.query(Evidence).filter_by(provider="doaj").one()
        assert evidence.value["review_process"] == "Double anonymous peer review"
    finally:
        db.close()


def test_scopus_xlsx_import_preserves_active_status(tmp_path) -> None:
    import openpyxl
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    source = tmp_path / "scopus.xlsx"
    workbook = openpyxl.Workbook(); sheet = workbook.active
    sheet.append(["Sourcerecord ID", "Source Title", "ISSN", "EISSN", "Active or Inactive", "Coverage", "Publisher"])
    sheet.append(["12", "Current Journal", "2434-561X", "", "Active", "2020-2026", "Example"])
    workbook.save(source)
    db = SessionLocal()
    try:
        assert import_scopus_xlsx(db, str(source)) == 1
        assert db.query(Evidence).filter_by(provider="scopus").one().value["active"] is True
    finally:
        db.close()


def test_existing_journal_gets_a_new_verified_issn_alias() -> None:
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        journal = Journal(current_title="Alias Journal")
        db.add(journal); db.flush()
        db.add(JournalIdentifier(journal_id=journal.id, scheme="ISSN", value="2434-561X"))
        db.flush()
        result = _upsert_journal(db, "Alias Journal", ["2434-561X", "1234-5679"], "Example Press")
        db.flush()
        assert result.id == journal.id
        assert {item.value for item in db.query(JournalIdentifier).filter_by(journal_id=journal.id).all()} == {"2434-561X", "1234-5679"}
    finally:
        db.close()


def test_scimago_csv_import_preserves_year_and_source_provenance(tmp_path) -> None:
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
    dataset = tmp_path / "scimago.csv"
    dataset.write_text(
        "Rank;Sourceid;Title;Type;Issn;SJR (2024);SJR Best Quartile;H index;Publisher\n"
        "1;42;Example Journal;journal;2434-561X, 1234-5679;1.234;Q1;55;Example Press\n",
        encoding="utf-8",
    )
    db = SessionLocal()
    try:
        assert import_scimago_csv(db, str(dataset)) == 1
        evidence = db.query(Evidence).filter_by(provider="scimago", evidence_type="scimago_metrics").one()
        assert evidence.value["year"] == "2024"
        assert evidence.value["SJR"] == "1.234"
        assert evidence.source_url == "https://www.scimagojr.com/journalrank.php"
    finally:
        db.close()
