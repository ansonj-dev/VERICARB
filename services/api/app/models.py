from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = (UniqueConstraint("email", name="uq_profiles_email"),)
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(160), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="developer")
    email: Mapped[str | None] = mapped_column(String(320))
    location: Mapped[str | None] = mapped_column(String(160))
    organization: Mapped[str | None] = mapped_column(String(200))
    password_salt: Mapped[str | None] = mapped_column(String(64))
    password_hash: Mapped[str | None] = mapped_column(String(128))
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    project_type: Mapped[str] = mapped_column(String(80), nullable=False)
    country: Mapped[str] = mapped_column(String(120), nullable=False)
    region: Mapped[str] = mapped_column(String(160), nullable=False, default="Not specified")
    boundary_geojson: Mapped[str | None] = mapped_column(Text)
    methodology_id: Mapped[str | None] = mapped_column(String(160))
    vintage_start: Mapped[str | None] = mapped_column(String(10))
    vintage_end: Mapped[str | None] = mapped_column(String(10))
    registry_name: Mapped[str | None] = mapped_column(String(160))
    registry_project_ref: Mapped[str | None] = mapped_column(String(160))
    baseline_summary: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="Draft")
    chain_project_id: Mapped[str | None] = mapped_column(String(80))
    chain_id: Mapped[int | None] = mapped_column(Integer)
    contract_address: Mapped[str | None] = mapped_column(String(80))
    tx_hash: Mapped[str | None] = mapped_column(String(80))
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class EvidenceFile(Base):
    __tablename__ = "evidence_files"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    credit_batch_id: Mapped[str | None] = mapped_column(ForeignKey("credit_batches.id"))
    filename: Mapped[str] = mapped_column(String(240), nullable=False)
    content_type: Mapped[str] = mapped_column(String(120), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    storage_key: Mapped[str] = mapped_column(String(240), nullable=False, unique=True)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(40), nullable=False)
    source_name: Mapped[str | None] = mapped_column(String(160))
    observed_at: Mapped[str | None] = mapped_column(String(40))
    uploaded_by: Mapped[str] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    review_state: Mapped[str] = mapped_column(String(40), nullable=False, default="Not reviewed")
    anchor_chain_id: Mapped[int | None] = mapped_column(Integer)
    anchor_contract_address: Mapped[str | None] = mapped_column(String(80))
    anchor_tx_hash: Mapped[str | None] = mapped_column(String(80))
    anchor_block_number: Mapped[int | None] = mapped_column(Integer)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class CreditBatch(Base):
    __tablename__ = "credit_batches"
    __table_args__ = (
        UniqueConstraint("serial_start", name="uq_credit_serial_start"),
        CheckConstraint("quantity_kg_co2e > 0", name="ck_batch_quantity_positive"),
        CheckConstraint("available_balance_kg >= 0", name="ck_batch_balance_nonnegative"),
        CheckConstraint("retired_balance_kg >= 0", name="ck_batch_retired_nonnegative"),
    )
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    batch_code: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    registry_name: Mapped[str | None] = mapped_column(String(160))
    registry_batch_ref: Mapped[str | None] = mapped_column(String(160))
    serial_start: Mapped[str] = mapped_column(String(160), nullable=False)
    serial_end: Mapped[str | None] = mapped_column(String(160))
    quantity_kg_co2e: Mapped[int] = mapped_column(Integer, nullable=False)
    available_balance_kg: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    retired_balance_kg: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    vintage_start: Mapped[str | None] = mapped_column(String(10))
    vintage_end: Mapped[str | None] = mapped_column(String(10))
    methodology_id: Mapped[str | None] = mapped_column(String(160))
    evidence_hash: Mapped[str | None] = mapped_column(String(64))
    state: Mapped[str] = mapped_column(String(40), nullable=False, default="Draft")
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    score_components: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    score_missing_flags: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    score_calculated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    chain_id: Mapped[int | None] = mapped_column(Integer)
    contract_address: Mapped[str | None] = mapped_column(String(80))
    tx_hash: Mapped[str | None] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class CreditEvent(Base):
    __tablename__ = "credit_events"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    credit_batch_id: Mapped[str | None] = mapped_column(ForeignKey("credit_batches.id"), index=True)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    from_state: Mapped[str | None] = mapped_column(String(40))
    to_state: Mapped[str | None] = mapped_column(String(40))
    actor_id: Mapped[str] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    quantity_kg_co2e: Mapped[int | None] = mapped_column(Integer)
    evidence_hash: Mapped[str | None] = mapped_column(String(64))
    reason: Mapped[str | None] = mapped_column(Text)
    chain_id: Mapped[int | None] = mapped_column(Integer)
    tx_hash: Mapped[str | None] = mapped_column(String(80))
    block_number: Mapped[int | None] = mapped_column(Integer)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class RegistryRecord(Base):
    __tablename__ = "registry_records"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    source_name: Mapped[str] = mapped_column(String(160), nullable=False)
    external_project_id: Mapped[str] = mapped_column(String(160), nullable=False)
    external_project_name: Mapped[str] = mapped_column(String(200), nullable=False)
    external_serial: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    vintage_start: Mapped[str | None] = mapped_column(String(10))
    vintage_end: Mapped[str | None] = mapped_column(String(10))
    methodology_id: Mapped[str | None] = mapped_column(String(160))
    country: Mapped[str | None] = mapped_column(String(120))
    region: Mapped[str | None] = mapped_column(String(160))
    quantity_kg_co2e: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="unknown")
    source_timestamp: Mapped[str | None] = mapped_column(String(40))
    raw_record_hash: Mapped[str | None] = mapped_column(String(64))
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    imported_by: Mapped[str] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class MonitoringObservation(Base):
    __tablename__ = "monitoring_observations"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    source_name: Mapped[str] = mapped_column(String(160), nullable=False)
    signal_type: Mapped[str] = mapped_column(String(80), nullable=False)
    severity: Mapped[str] = mapped_column(String(24), nullable=False)
    affected_area_percent: Mapped[int | None] = mapped_column(Integer)
    observed_at: Mapped[str] = mapped_column(String(40), nullable=False)
    evidence_file_id: Mapped[str | None] = mapped_column(ForeignKey("evidence_files.id"))
    evidence_hash: Mapped[str | None] = mapped_column(String(64))
    is_synthetic: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    raw_payload_json: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    review_state: Mapped[str] = mapped_column(String(40), nullable=False, default="Needs human review")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    observation_id: Mapped[str | None] = mapped_column(ForeignKey("monitoring_observations.id"))
    alert_type: Mapped[str] = mapped_column(String(80), nullable=False)
    severity: Mapped[str] = mapped_column(String(24), nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    state: Mapped[str] = mapped_column(String(40), nullable=False, default="Open")
    assigned_reviewer: Mapped[str | None] = mapped_column(ForeignKey("profiles.id"))
    decision: Mapped[str | None] = mapped_column(String(80))
    decision_reason: Mapped[str | None] = mapped_column(Text)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Assessment(Base):
    __tablename__ = "assessments"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    credit_batch_id: Mapped[str | None] = mapped_column(ForeignKey("credit_batches.id"))
    evidence_file_id: Mapped[str | None] = mapped_column(ForeignKey("evidence_files.id"))
    assessment_type: Mapped[str] = mapped_column(String(40), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False)
    result_json: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str | None] = mapped_column(String(120))
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    assessment_id: Mapped[str | None] = mapped_column(ForeignKey("assessments.id"))
    alert_id: Mapped[str | None] = mapped_column(ForeignKey("alerts.id"))
    credit_batch_id: Mapped[str | None] = mapped_column(ForeignKey("credit_batches.id"))
    finding: Mapped[str | None] = mapped_column(Text)
    reviewer_id: Mapped[str] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    decision: Mapped[str] = mapped_column(String(40), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Claim(Base):
    __tablename__ = "claims"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    credit_batch_id: Mapped[str] = mapped_column(ForeignKey("credit_batches.id"), nullable=False, index=True)
    claimant_entity: Mapped[str] = mapped_column(String(200), nullable=False)
    claim_purpose: Mapped[str] = mapped_column(String(240), nullable=False)
    target_framework: Mapped[str | None] = mapped_column(String(120))
    claim_status: Mapped[str] = mapped_column(String(40), nullable=False, default="draft")
    external_claim_ref: Mapped[str | None] = mapped_column(String(160))
    authorization_status: Mapped[str] = mapped_column(String(40), nullable=False, default="unknown")
    corresponding_adjustment_status: Mapped[str] = mapped_column(String(40), nullable=False, default="unknown")
    evidence_hash: Mapped[str | None] = mapped_column(String(64))
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class IntegrityScore(Base):
    __tablename__ = "integrity_scores"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    credit_batch_id: Mapped[str] = mapped_column(ForeignKey("credit_batches.id"), nullable=False, index=True)
    score_total: Mapped[int] = mapped_column(Integer, nullable=False)
    evidence_quality_score: Mapped[int] = mapped_column(Integer, nullable=False)
    verification_score: Mapped[int] = mapped_column(Integer, nullable=False)
    registry_consistency_score: Mapped[int] = mapped_column(Integer, nullable=False)
    reversal_resilience_score: Mapped[int] = mapped_column(Integer, nullable=False)
    authorization_score: Mapped[int] = mapped_column(Integer, nullable=False)
    missing_data_flags: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    explanation_json: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

