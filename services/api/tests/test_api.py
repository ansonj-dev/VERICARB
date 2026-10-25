from __future__ import annotations

import hashlib
import uuid

import pytest
from sqlalchemy import create_engine, event
from fastapi.testclient import TestClient

from services.api.app import config as app_config
from services.api.app import db as app_db
from services.api.app import main as app_main
from services.api.app.main import app


@pytest.fixture
def isolated_backend(tmp_path, monkeypatch):
    """Keep workflow tests away from the developer's real SQLite workspace."""
    original_engine = app_db.engine
    original_upload_dir = app_main.UPLOAD_DIR
    test_db = tmp_path / "vericarb-test.sqlite3"
    database_url = f"sqlite:///{test_db.as_posix()}"
    upload_dir = tmp_path / "evidence"
    upload_dir.mkdir()
    test_engine = create_engine(database_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)

    @event.listens_for(test_engine, "connect")
    def enable_test_foreign_keys(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    app_db.engine = test_engine
    app_db.SessionLocal.configure(bind=test_engine)
    monkeypatch.setattr(app_config, "DATABASE_URL", database_url)
    monkeypatch.setattr(app_main, "UPLOAD_DIR", upload_dir)
    monkeypatch.setenv("X1_REGISTRY_CONTRACT_ADDRESS", "")
    try:
        yield
    finally:
        app_db.SessionLocal.configure(bind=original_engine)
        app_db.engine = original_engine
        monkeypatch.setattr(app_main, "UPLOAD_DIR", original_upload_dir)
        test_engine.dispose()


def test_api_workflows(isolated_backend):
    """Exercise local auth, persisted project/evidence, reviewer, and lifecycle rules."""
    # The application reads its DB URL at import time; this test suite uses the
    # same local prototype database as startup so the migration path is covered.
    with TestClient(app) as client:
        assert client.get("/health").json()["status"] == "ok"
        assert client.get("/api/dashboard").status_code == 401
        public_network = client.get("/api/blockchain/network")
        assert public_network.status_code == 200
        assert public_network.json()["expected_chain_id"] == 10778
        assert "error" in public_network.json()

        auth = client.post("/api/auth/demo").json()
        headers = {"Authorization": f"Bearer {auth['access_token']}"}
        chain_status = client.get("/api/blockchain/status", headers=headers)
        assert chain_status.status_code == 200
        assert all("private_key" not in wallet for wallet in chain_status.json()["wallets"])
        assert client.get("/api/blockchain/contracts", headers=headers).status_code == 200
        assert client.get("/api/blockchain/wallets/not-an-address/balance", headers=headers).status_code == 422
        client.post("/api/demo/reset", headers=headers)
        assert client.get("/api/demo/bootstrap", headers=headers).status_code == 200

        created = client.post("/api/projects", headers=headers, json={
            "name": "Acceptance test forest", "project_type": "forest", "country": "Kenya",
            "region": "Central", "methodology_id": "TEST-METHODOLOGY",
        })
        assert created.status_code == 201
        project_id = created.json()["id"]
        assert client.get(f"/api/projects/{project_id}", headers=headers).status_code == 200

        payload = b"synthetic evidence fixture\n"
        uploaded = client.post(
            f"/api/projects/{project_id}/evidence", headers=headers,
            files={"file": ("evidence.txt", payload, "text/plain")},
            data={"evidence_type": "document", "source_name": "pytest fixture"},
        )
        assert uploaded.status_code == 201
        assert uploaded.json()["sha256"] == hashlib.sha256(payload).hexdigest()
        assert client.post(f"/api/projects/{project_id}/evidence", headers=headers, data={"evidence_type": "unknown"}, files={"file": ("bad.txt", b"x", "text/plain")}).status_code == 422
        assert client.post(
            f"/api/projects/{project_id}/evidence", headers=headers,
            files={"file": ("payload.exe", b"bad", "application/octet-stream")},
        ).status_code == 415

        assessment = client.post("/api/assessments/evidence-review", headers=headers, json={"evidence_id": uploaded.json()["id"]})
        assert assessment.status_code == 201
        assert assessment.json()["automatic_approval"] is False
        decision = client.post(f"/api/assessments/{assessment.json()['id']}/review", headers=headers, json={"decision": "approved", "reason": "Reviewed deterministic findings"})
        assert decision.status_code == 201

        draft = client.post(f"/api/projects/{project_id}/batches", headers=headers, json={
            "serial_start": "TEST-SERIAL-001", "quantity_kg_co2e": 1000,
        })
        assert draft.status_code == 201
        batch_id = draft.json()["id"]
        assert client.post(f"/api/batches/{batch_id}/submit", headers=headers, json={"reason": "Ready for review"}).status_code == 200
        reviewed = client.post(f"/api/batches/{batch_id}/review", headers=headers, json={"decision": "approved", "reason": "Evidence reviewed for demo"})
        assert reviewed.status_code == 201
        issued = client.post(f"/api/batches/{batch_id}/issue", headers=headers, json={"reason": "Local demo issuance"})
        assert issued.status_code == 200
        assert issued.json()["transaction"]["status"] == "not_configured"

        overdraw = client.post(f"/api/batches/{batch_id}/retire", headers=headers, json={
            "quantity_kg_co2e": 1001, "beneficiary": "Example", "purpose": "Test", "reason": "Overdraw should fail",
        })
        assert overdraw.status_code == 409
        retired = client.post(f"/api/batches/{batch_id}/retire", headers=headers, json={
            "quantity_kg_co2e": 400, "beneficiary": "Example", "purpose": "Test", "reason": "Partial demo retirement",
        })
        assert retired.status_code == 200
        assert retired.json()["retired_balance_kg"] == 400
        assert retired.json()["available_balance_kg"] == 600

        public = client.get(f"/api/public/verify/{draft.json()['batch_code']}")
        assert public.status_code == 200
        assert client.get("/verify.html").status_code == 200
        assert "filename" not in public.json()["public_evidence"][0]
        assert "storage_key" not in public.json()["batch"]
        assert public.json()["batch"]["retired_balance_kg"] == 400
        assert all("reason" not in event for event in public.json()["events"])


def test_auth_signup_login_and_role_boundary():
    with TestClient(app) as client:
        email = f"api-test-{uuid.uuid4().hex}@example.invalid"
        signup = client.post("/api/auth/signup", json={
            "display_name": "API Test", "email": email, "password": "LocalDemoPassphrase!",
        })
        assert signup.status_code == 201
        token = signup.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {token}"}
        assert client.get("/api/me", headers=user_headers).json()["email"] == email
        assert client.post("/api/auth/login", json={"email": email, "password": "wrong"}).status_code == 401
        assert client.post("/api/auth/login", json={"email": email, "password": "LocalDemoPassphrase!"}).status_code == 200
        assert client.post("/api/alerts/ALT-DEMO-001/review", headers=user_headers, json={"decision": "alert_rejected", "reason": "Role boundary check"}).status_code == 403
