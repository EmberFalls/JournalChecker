# Journal Integrity Verification Platform (MVP)

An evidence-first local MVP for assessing scholarly journals. It does not label a journal as definitively "predatory" or "legitimate". Instead, it reports a conservative risk label, confidence, coverage, traceable evidence, and uncertainty.

## What it does

- Normalizes and validates ISSN, DOI, title, and URL inputs.
- Resolves journal identity before analysis; fuzzy title matching produces candidates only.
- Looks up Crossref metadata, imports the official public DOAJ CSV, and imports an official Scopus source-title XLSX/CSV obtained under the applicable terms.
- Optionally checks journal ISSNs against the official Scopus Serial Title API and Web of Science Starter API when credentials are configured.
- Imports a user-downloaded SCImago journal-rank CSV for source-attributed metrics; SCImago rank data are based on Scopus data and are not an independent indexing confirmation.
- Preserves historic evidence; does not turn absent Scopus/DOAJ rows into negative findings.
- Safely crawls a limited set of relevant public web pages and extracts supported claims.
- Separates `VERIFIED`, `CONTRADICTED`, `NOT_VERIFIED`, `NOT_OBSERVED`, `NOT_APPLICABLE`, `UNKNOWN`, and `STALE`.
- Separates risk label from confidence and evidence coverage.

## Run locally

1. Copy `.env.example` to the project-root `.env`, then set `DATABASE_URL=sqlite:///./journal_integrity.db` for a no-Docker local run. The backend loads that root `.env` and anchors relative SQLite paths to `backend`, regardless of the command's working directory.
2. From `backend`, create a Python 3.12+ virtual environment and run `pip install -e '.[dev]'`.
3. Start the API with `uvicorn app.main:app --reload --port 8100` and, from `frontend`, run `npm install` then `npm run dev -- -p 3100`.
4. Open `http://localhost:3100`; API docs are at `http://localhost:8100/docs`. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8100` in the frontend environment if needed.

For a direct backend setup: `cd backend`, create a virtual environment, install `pip install -e '.[dev]'`, then run `alembic upgrade head` and `uvicorn app.main:app --reload`. Docker uses a supported Linux Python image and is the recommended local route.

## Imports

The source-list import functions intentionally accept local, traceable source files only. The public datasets downloaded to `data/` are ignored by Git:

- `python -m app.ingestion.cli doaj-csv ../data/doaj-journals.csv`
- `python -m app.ingestion.cli scopus-xlsx ../data/scopus-source-list.xlsx`
- Legacy JSON/CSV import functions remain available for prior exports.

For a guided walkthrough of a negative indexing claim, run `python -m app.ingestion.cli seed-demo` from `backend`, then search for ISSN `9999-0008` in the frontend. The record is clearly labelled synthetic in both its title and report; it does not represent a real journal or a real Scopus lookup.

No Scopus scraping is implemented. Scopus’ API requires an entitlement/API key; this MVP’s local source-list import does not. Do not import or display data beyond your organization’s licence/entitlement.

## Optional live indexing lookups

Copy `.env.example` to `.env` and set `SCOPUS_API_KEY` and/or `WOS_API_KEY` to credentials you obtained for this application. Scopus uses Elsevier's Serial Title API. Web of Science uses the Starter API journal-by-ISSN route; Clarivate currently offers a limited trial plan as well as institution plans. These integrations are optional: missing credentials or an API outage do not count as a negative finding. Do not commit `.env` or share API keys.

Scopus' Serial Title API can also return SJR metrics. SCImago Journal & Country Rank provides its own downloadable table; download the CSV using the site's own interface and import it locally with `python -m app.ingestion.cli scimago-csv ../data/scimago-journals.csv`. The importer does not fetch or scrape SCImago. Its metrics are dated and source-attributed, and its Scopus-based ranking is not a separate indexing authority.

The external API integrations are not live-credential tested in the default automated test run. Their request/response handling is tested with official-format mocked payloads; configure valid credentials and confirm the enabled source is shown before relying on external live results.

## Dataset freshness and evaluation

DOAJ’s public CSV can be downloaded again from `https://doaj.org/csv`. Scopus publishes a source-title list periodically; download the current file from its official content page and rerun the local import. Imports update matching source evidence and preserve the source URL and observation time. Missing records never become negative evidence.

The test suite uses small synthetic records for adverse/ambiguous cases so it does not falsely label real journals. Run it with `pytest -q -p no:cacheprovider backend/tests`.

## ISSN walkthrough suite

Run `python -m app.ingestion.cli seed-issn-suite` from `backend` to prepare the synthetic contradicted-claim case and a source-attributed DGRSDT 2025 list case in the local database. Search `1009-6744` for the DGRSDT case, `9999-0008` for the synthetic case, or `1580-0261`, `1932-6203`, and `1314-6947` for positive DOAJ/Scopus records. Check digits `1234-5678`, `2434-5611`, and `1111-1111` should be rejected. `8888-0001` is checksum-valid but absent from this fixture and should remain unknown rather than being treated as adverse.

The DGRSDT entry means that the Algerian Directorate General for Scientific Research and Technological Development included that title and its listed URLs in its 2025 predatory-journal list. It is reported as a source-specific dated flag, not an all-purpose adjudication. Source: https://www.dgrsdt.dz/en/revues_predateur.

## Security controls

The crawler permits only public HTTP(S) destinations, rejects localhost/private/link-local/reserved IPs, revalidates every redirect, applies crawl/depth/response-size/time limits, and only processes HTML. Crawler failure is not recorded as evidence of a missing policy.

## Scaling path

The local deployment uses a single API container, PostgreSQL, and Redis. The API is stateless and provider/crawler boundaries are isolated, so external work can later be moved to workers/queues and API replicas without rewriting identity, evidence, or assessment rules.

## Deliberate MVP limits

- There is no legal conclusion or automated final legitimacy judgment.
- Website policy text only demonstrates that a policy is published—not that it is followed.
- An LLM is not used in scoring; if added, it must be limited to structured, source-cited extraction.
- The schema is migration-ready; production should use Alembic migrations rather than startup `create_all`.
