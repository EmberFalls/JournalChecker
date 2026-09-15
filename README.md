# Journal Integrity Verification Platform (MVP)

An evidence-first local MVP for assessing scholarly journals. It does not label a journal as definitively "predatory" or "legitimate". Instead, it reports a conservative risk label, confidence, coverage, traceable evidence, and uncertainty.

## What it does

- Normalizes and validates ISSN, DOI, title, and URL inputs.
- Resolves journal identity before analysis; fuzzy title matching produces candidates only.
- Looks up Crossref metadata, imports local DOAJ JSON and authorized Scopus CSV source lists.
- Preserves historic evidence; does not turn absent Scopus/DOAJ rows into negative findings.
- Safely crawls a limited set of relevant public web pages and extracts supported claims.
- Separates `VERIFIED`, `CONTRADICTED`, `NOT_VERIFIED`, `NOT_OBSERVED`, `NOT_APPLICABLE`, `UNKNOWN`, and `STALE`.
- Separates risk label from confidence and evidence coverage.

## Run locally

1. Copy `.env.example` to `.env` and set values appropriate to the target environment.
2. Run `docker compose up --build`.
3. Open `http://localhost:3000`; API docs are at `http://localhost:8000/docs`.

For a direct backend setup: `cd backend`, create a virtual environment, install `pip install -e '.[dev]'`, then run `alembic upgrade head` and `uvicorn app.main:app --reload`. Docker uses a supported Linux Python image and is the recommended local route.

## Imports

The source-list import functions intentionally accept organization-supplied files only:

- `import_doaj_json(db, path)` accepts an official DOAJ JSON export.
- `import_scopus_csv(db, path)` accepts an authorized Scopus source-title CSV.

No Scopus scraping is implemented. Do not import or display data beyond your organization’s licence/entitlement.

## Security controls

The crawler permits only public HTTP(S) destinations, rejects localhost/private/link-local/reserved IPs, revalidates every redirect, applies crawl/depth/response-size/time limits, and only processes HTML. Crawler failure is not recorded as evidence of a missing policy.

## Scaling path

The local deployment uses a single API container, PostgreSQL, and Redis. The API is stateless and provider/crawler boundaries are isolated, so external work can later be moved to workers/queues and API replicas without rewriting identity, evidence, or assessment rules.

## Deliberate MVP limits

- There is no legal conclusion or automated final legitimacy judgment.
- Website policy text only demonstrates that a policy is published—not that it is followed.
- An LLM is not used in scoring; if added, it must be limited to structured, source-cited extraction.
- The schema is migration-ready; production should use Alembic migrations rather than startup `create_all`.
