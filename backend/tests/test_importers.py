import csv
import json
from app.db.base import Base
from app.db.models import Evidence
from app.db.session import SessionLocal, engine
from app.ingestion.importers import import_doaj_json, import_scopus_csv


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
