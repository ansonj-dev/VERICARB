# Technical Architecture

## Proposed stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS, accessible component system.
- Backend: Python FastAPI.
- Database: Supabase PostgreSQL (local PostgreSQL is an acceptable development alternative).
- File storage: Supabase Storage or encrypted object storage.
- Evidence hashing: SHA-256.
- Smart contracts: Solidity + Hardhat.
- Wallet: MetaMask or another compatible EVM wallet.
- AI: LLM structured output behind an interface; deterministic fallback when not configured.
- Deployment: Vercel frontend and a suitable Python backend host.
- Chain: X1 EcoChain Maculatus testnet is the intended first target, subject to verification of current official docs, network settings, faucet, explorer, and developer access.

## Architecture principles
1. Keep raw documents, personal data, large satellite imagery, and commercially sensitive records off-chain.
2. On-chain data should be minimized to hashes, IDs, lifecycle states, and events.
3. Build a blockchain adapter so chain settings can be swapped without rewriting business logic.
4. Use deterministic rules for critical validation and smart-contract invariants; AI is advisory.
5. Separate current state from append-only event history.
6. Use role-based access control and audit admin/reviewer actions.
7. Validate all inputs server-side.
8. Never expose secrets in frontend bundles or repository history.
9. Provide seed/demo mode when external services are unavailable.
10. No fabricated transaction hashes, data feeds, source citations, or explorer links.

## High-level data flow
1. Project developer creates project and uploads evidence.
2. API validates fields and stores files off-chain.
3. API computes SHA-256 hashes and saves evidence metadata.
4. Deterministic validation runs; optional LLM creates structured findings.
5. Registry adapter checks imported/connected records for potential conflicts.
6. Reviewer approves or rejects with a reason.
7. Authorized action writes lifecycle state/hash to the configured EVM chain.
8. Monitoring adapter submits observation records.
9. Reversal rules create a risk alert.
10. Reviewer confirms/rejects; event is appended and on-chain event recorded where supported.
11. Frontend shows current state, score breakdown, event history, and actual transaction details.

## Suggested monorepo
```text
vericarb/
  apps/web/
    app/
    components/
    lib/
    public/
    tests/
  services/api/
    app/
      main.py
      config.py
      models/
      schemas/
      routers/
      services/
      adapters/
      tests/
    pyproject.toml or requirements.txt
  contracts/
    contracts/VericarbRegistry.sol
    test/
    scripts/
    hardhat.config.ts
  docs/
    product/
    architecture/
    api/
    security/
  sample-data/
  scripts/
  .env.example
  README.md
```

## Data model (suggested)
### profiles
- id (UUID)
- display_name
- role
- wallet_address (nullable)
- created_at

### projects
- id (UUID)
- project_code (unique)
- name
- project_type (forest, soil, renewable, industrial, other)
- country, region
- boundary_geojson (nullable)
- methodology_id
- vintage_start, vintage_end
- registry_name, registry_project_ref
- baseline_summary
- status
- is_demo (boolean)
- created_by
- created_at, updated_at

### evidence_files
- id (UUID)
- project_id (FK)
- credit_batch_id (nullable FK)
- filename
- content_type
- size_bytes
- storage_key
- sha256
- evidence_type
- source_name
- observed_at (nullable)
- uploaded_by
- is_demo
- created_at

### assessments
- id (UUID)
- project_id (FK)
- credit_batch_id (nullable FK)
- assessment_type (document_review, duplicate_check, reversal_check, score)
- status
- result_json
- model_name (nullable)
- is_demo
- created_at

### reviews
- id (UUID)
- assessment_id (FK)
- reviewer_id
- decision (approved, rejected, needs_more_evidence, alert_confirmed, alert_rejected)
- reason
- created_at

### credit_batches
- id (UUID)
- batch_code (unique)
- project_id (FK)
- registry_name
- registry_batch_ref
- serial_start, serial_end or external_unit_ids
- quantity_kg_co2e (integer)
- vintage_start, vintage_end
- methodology_id
- evidence_hash
- state (draft, submitted, verified, issued, active, at_risk, under_review, reversed, retired, cancelled)
- available_balance_kg
- is_demo
- chain_id, contract_address, tx_hash (nullable)
- created_at, updated_at

### credit_events (append-only)
- id (UUID)
- project_id
- credit_batch_id
- event_type (created, evidence_added, assessed, conflict_detected, approved, issued, transferred, retired, warning, at_risk, review_opened, reversal_confirmed, reversal_rejected, cancelled)
- from_state, to_state
- actor_id or actor_address
- quantity_kg_co2e (nullable)
- evidence_hash (nullable)
- reason (nullable)
- chain_id, tx_hash, block_number (nullable)
- is_demo
- created_at

### registry_records
- id (UUID)
- source_name
- external_project_id
- external_project_name
- external_serial
- serial_start, serial_end
- vintage_start, vintage_end
- methodology_id
- country, region
- boundary_hash or boundary_geojson (nullable)
- quantity_kg_co2e
- status (active, retired, cancelled, unknown)
- source_timestamp
- is_demo
- raw_record_hash

### claims
- id (UUID)
- credit_batch_id
- claimant_entity
- claim_purpose
- target_framework (nullable)
- claim_status
- external_claim_ref (nullable)
- authorization_status (unknown, authorized, not_required, pending, rejected)
- corresponding_adjustment_status (unknown, yes, no, pending, not_applicable)
- evidence_hash (nullable)
- is_demo
- created_at

### monitoring_observations
- id (UUID)
- project_id
- source_name
- signal_type (forest_loss, fire, land_use_change, sensor_anomaly, data_gap, other)
- severity
- affected_area_percent (nullable)
- observed_at
- evidence_file_id (nullable)
- evidence_hash
- is_synthetic
- raw_payload_json
- created_at

### integrity_scores
- id (UUID)
- credit_batch_id
- score_total (0-100)
- evidence_quality_score
- verification_score
- registry_consistency_score
- reversal_resilience_score
- authorization_score
- missing_data_flags
- explanation_json
- calculated_at
- is_demo

## API outline
- `GET /health`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{project_id}`
- `POST /api/projects/{project_id}/evidence`
- `GET /api/projects/{project_id}/evidence`
- `POST /api/assessments/evidence-review`
- `POST /api/registry/import`
- `POST /api/registry/check-conflicts`
- `POST /api/projects/{project_id}/batches`
- `POST /api/batches/{batch_id}/submit`
- `POST /api/batches/{batch_id}/review`
- `POST /api/batches/{batch_id}/issue`
- `POST /api/batches/{batch_id}/transfer`
- `POST /api/batches/{batch_id}/retire`
- `POST /api/projects/{project_id}/monitoring-observations`
- `POST /api/monitoring-observations/{observation_id}/evaluate`
- `POST /api/alerts/{alert_id}/review`
- `GET /api/batches/{batch_id}/integrity`
- `GET /api/public/verify/{batch_code}`
- `GET /api/batches/{batch_id}/events`
- `GET /api/claims`
- `POST /api/claims`
- `GET /api/admin/data-sources`

Use versioned, typed schemas and consistent error formats. Document auth requirements for every endpoint.

## Smart contract design notes
Potential contract: `VericarbRegistry.sol`.
- Role-based access: admin, issuer/operator, oracle, verifier.
- Batch registration with unique batch ID and evidence hash.
- Credit quantity in integer kg CO2e.
- Transfers and retirement constrained by available balance and current state.
- At-risk and review state transitions restricted to authorized roles.
- Reversal confirmation requires reviewer role and an appropriate prior state.
- Event emission for every material lifecycle change.
- Avoid claiming that a public-chain contract can independently establish real-world facts.
- Carefully model partial retirement and partial reversal. If complexity risks delaying the MVP, support whole-batch state transitions first and document the limitation.
- Consider preserving retirement history separately from current integrity state.

## Integrity score initial formula
Proposed prototype formula, weights are assumptions to be calibrated:
S = 0.25M + 0.20V + 0.20C + 0.25R + 0.10A
- M: evidence quality/freshness (0–100)
- V: independent verification/methodology evidence (0–100)
- C: registry consistency (100 = no detected conflict; lower with unresolved conflicts)
- R: reversal resilience (100 = no material signal; lower with alerts)
- A: authorization/accounting evidence (100 = complete where applicable; missing/unknown must be explicitly flagged, not silently treated as perfect)
Show component values, missing-data flags, reason codes, timestamp, and score history.

## Chain integration
- Verify current official X1 EcoChain documentation before setting chain ID, RPC URL, explorer URL, gas token, faucet, wallet configuration, or deployment commands.
- Store configuration in environment variables and provide `.env.example` with placeholders.
- Keep a generic EVM adapter and test locally first.
- Never hardcode made-up chain parameters.
- Only show a transaction as confirmed after receipt/status verification.
- If chain integration is blocked, demo a local Hardhat chain and label it clearly; do not misrepresent it as X1 testnet.
