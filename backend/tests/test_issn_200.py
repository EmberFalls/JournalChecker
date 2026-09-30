"""200 distinct ISSN-format identifiers exercise exact lookup repeatedly."""
import asyncio

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.models import Journal, JournalIdentifier
from app.identity.resolver import IdentityResolver


def _issn_from_serial(serial: int) -> str:
    core = f"{serial:07d}"
    total = sum(int(char) * weight for char, weight in zip(core, range(8, 1, -1)))
    check = (11 - total % 11) % 11
    suffix = "X" if check == 10 else str(check)
    return f"{core[:4]}-{core[4:]}{suffix}"


ISSNS = [_issn_from_serial(number) for number in range(200)]


@pytest.fixture(scope="module")
def benchmark_db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        for number, issn in enumerate(ISSNS):
            journal = Journal(current_title=f"Benchmark Journal {number:03d}")
            db.add(journal)
            db.flush()
            db.add(JournalIdentifier(journal_id=journal.id, scheme="ISSN", value=issn, is_primary=True))
        db.commit()
        yield db
    engine.dispose()


@pytest.mark.parametrize("issn", ISSNS, ids=ISSNS)
def test_200_distinct_valid_issns_resolve_to_their_exact_journals(benchmark_db: Session, issn: str) -> None:
    result = asyncio.run(IdentityResolver(benchmark_db).resolve(issn))
    assert result.input_type == "issn"
    assert len(result.candidates) == 1
    assert result.candidates[0].journal.current_title.startswith("Benchmark Journal ")
