from datetime import UTC, datetime
from uuid import uuid4
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


def uuid_str() -> str:
    return str(uuid4())


def utcnow() -> datetime:
    return datetime.now(UTC)


class Journal(Base):
    __tablename__ = "journals"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    current_title: Mapped[str] = mapped_column(String(500), index=True)
    canonical_publisher: Mapped[str | None] = mapped_column(String(500))
    official_domain: Mapped[str | None] = mapped_column(String(255), index=True)
    doi_prefix: Mapped[str | None] = mapped_column(String(64))
    lifecycle_stage: Mapped[str] = mapped_column(String(32), default="UNKNOWN")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    identifiers: Mapped[list["JournalIdentifier"]] = relationship(back_populates="journal", cascade="all, delete-orphan")


class JournalIdentifier(Base):
    __tablename__ = "journal_identifiers"
    __table_args__ = (UniqueConstraint("scheme", "value", name="uq_identifier_scheme_value"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    journal_id: Mapped[str] = mapped_column(ForeignKey("journals.id"), index=True)
    scheme: Mapped[str] = mapped_column(String(32))
    value: Mapped[str] = mapped_column(String(255), index=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    journal: Mapped[Journal] = relationship(back_populates="identifiers")


class JournalTitle(Base):
    __tablename__ = "journal_titles"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    journal_id: Mapped[str] = mapped_column(ForeignKey("journals.id"), index=True)
    value: Mapped[str] = mapped_column(String(500))
    effective_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    effective_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source: Mapped[str] = mapped_column(String(64))


class JournalPublisher(Base):
    __tablename__ = "journal_publishers"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    journal_id: Mapped[str] = mapped_column(ForeignKey("journals.id"), index=True)
    value: Mapped[str] = mapped_column(String(500))
    effective_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    effective_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source: Mapped[str] = mapped_column(String(64))


class JournalDomain(Base):
    __tablename__ = "journal_domains"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    journal_id: Mapped[str] = mapped_column(ForeignKey("journals.id"), index=True)
    value: Mapped[str] = mapped_column(String(255), index=True)
    effective_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    effective_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source: Mapped[str] = mapped_column(String(64))


class Provider(Base):
    __tablename__ = "providers"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    name: Mapped[str] = mapped_column(String(64), unique=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    last_imported_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Evidence(Base):
    __tablename__ = "evidence"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    journal_id: Mapped[str | None] = mapped_column(ForeignKey("journals.id"), index=True)
    provider: Mapped[str] = mapped_column(String(64), index=True)
    evidence_type: Mapped[str] = mapped_column(String(64), index=True)
    value: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(32), index=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    source_url: Mapped[str | None] = mapped_column(Text)
    source_record: Mapped[str | None] = mapped_column(Text)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    effective_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    effective_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class WebsitePage(Base):
    __tablename__ = "website_pages"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    journal_id: Mapped[str] = mapped_column(ForeignKey("journals.id"), index=True)
    url: Mapped[str] = mapped_column(Text)
    title: Mapped[str | None] = mapped_column(String(500))
    text: Mapped[str] = mapped_column(Text)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    content_hash: Mapped[str] = mapped_column(String(64))


class JournalClaim(Base):
    __tablename__ = "journal_claims"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    journal_id: Mapped[str] = mapped_column(ForeignKey("journals.id"), index=True)
    claim_type: Mapped[str] = mapped_column(String(64), index=True)
    value: Mapped[dict] = mapped_column(JSON)
    source_url: Mapped[str] = mapped_column(Text)
    supporting_text: Mapped[str] = mapped_column(Text)
    extraction_confidence: Mapped[float] = mapped_column(Float)
    extracted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ClaimVerification(Base):
    __tablename__ = "claim_verifications"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    claim_id: Mapped[str] = mapped_column(ForeignKey("journal_claims.id"), index=True)
    status: Mapped[str] = mapped_column(String(32))
    rationale: Mapped[str] = mapped_column(Text)
    evidence_ids: Mapped[list] = mapped_column(JSON, default=list)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    journal_id: Mapped[str] = mapped_column(ForeignKey("journals.id"), index=True)
    label: Mapped[str] = mapped_column(String(64))
    confidence: Mapped[float] = mapped_column(Float)
    coverage: Mapped[float] = mapped_column(Float)
    dimensions: Mapped[dict] = mapped_column(JSON)
    rationale: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
