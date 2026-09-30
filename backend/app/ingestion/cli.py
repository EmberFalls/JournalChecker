"""Operator-only local dataset imports. Dataset paths are never exposed as public API input."""
import argparse
from pathlib import Path
from app.db.session import SessionLocal
from app.ingestion.authority_flags import seed_issn_test_suite
from app.ingestion.demo import seed_demo_journal
from app.ingestion.importers import import_doaj_csv, import_doaj_json, import_scimago_csv, import_scopus_csv, import_scopus_xlsx


def main() -> None:
    parser = argparse.ArgumentParser(description="Import authorised local journal metadata datasets")
    parser.add_argument("kind", choices=("doaj-csv", "doaj-json", "scopus-csv", "scopus-xlsx", "scimago-csv", "seed-demo", "seed-issn-suite"))
    parser.add_argument("path", type=Path, nargs="?")
    args = parser.parse_args()
    if args.kind == "seed-demo":
        with SessionLocal() as db:
            print(seed_demo_journal(db))
        return
    if args.kind == "seed-issn-suite":
        with SessionLocal() as db:
            print(seed_issn_test_suite(db))
        return
    if not args.path or not args.path.is_file():
        parser.error(f"File not found: {args.path}")
    importer = {"doaj-csv": import_doaj_csv, "doaj-json": import_doaj_json, "scopus-csv": import_scopus_csv, "scopus-xlsx": import_scopus_xlsx, "scimago-csv": import_scimago_csv}[args.kind]
    with SessionLocal() as db:
        print(f"Imported {importer(db, str(args.path))} records from {args.path.name}")


if __name__ == "__main__":
    main()
