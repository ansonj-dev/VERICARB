# MVP Scope and Demo Script

## MVP objective
Demonstrate one end-to-end forest-carbon integrity workflow with synthetic data:
register project → submit evidence → AI review → duplicate check → human approval → testnet anchoring → transfer/retirement → reversal alert → reviewer decision → public verification.

## Six MVP modules

### 1. Carbon Impact Passport
Persistent identifiers for project, parcel, methodology, verification, credit batch, retirement, claim, and reversal event.
Fields include project name, country/region, boundary GeoJSON (optional in first build), methodology, vintage, registry of origin/reference, serial range, quantity, evidence hashes, verifier, current status, and event history.

### 2. AI Evidence Intelligence
- Accept PDF/CSV/JSON and common document uploads subject to size/type limits.
- Compute SHA-256 for uploaded evidence.
- Use deterministic validation first: required fields, unit consistency, quantity checks, dates, duplicate references, file metadata.
- Optionally call an LLM to return structured JSON findings.
- Findings include severity, category, explanation, evidence/reference, confidence (if supported), and recommended next step.
- AI must not approve or certify a credit automatically.
- If no LLM API key is configured, use a deterministic mock assessment and clearly label it.

### 3. Double-Claim Firewall
- Import sample registry data by CSV; add adapter interface for future APIs.
- Normalize registry name, project ID/name, serial number/range, vintage, methodology, geography, unit, issuance/retirement status, and source timestamp.
- Detect exact duplicate serials and close metadata matches.
- If GeoJSON is supported, calculate overlaps only with a documented geospatial method; otherwise report that geospatial overlap is not yet evaluated.
- Display conflicts with match reasons and source record.
- Do not claim a global guarantee. Checks cover imported/connected records only.
- A conflict should block issuance or require reviewer override with reason.

### 4. Reversal Oracle
- For MVP, support a reproducible synthetic disturbance event and an adapter interface for a real data source.
- Project monitoring records include observed_at, source, signal type, boundary/area affected, severity, evidence file/hash, and whether synthetic.
- Rules create WARNING or AT_RISK signals based on configurable thresholds.
- AT_RISK triggers a review request and can pause transfers of eligible non-retired units.
- Only an authorized reviewer can confirm/reject a suspected reversal.
- Confirmed reversal/impairment appends an event and preserves original issuance/retirement records.
- Retired credits remain retired historically; show an impairment/reversal event linked to them if applicable. Do not imply an external registry transaction was undone.

### 5. Blockchain Integrity Layer
- Solidity contract with access control and event-based audit trail.
- Core actions: register/issue after approval, transfer available balance, retire available balance, mark at risk, open review, confirm/reject reversal, and record evidence hash.
- Use integer units (e.g. kg CO2e) on-chain to avoid floating point.
- Unique IDs and state transition validation.
- Prevent transfer/retirement exceeding available balance.
- Prevent transfers of units placed under review where the model supports per-batch locking.
- Keep raw evidence off-chain; only hashes, minimal identifiers, state changes, and timestamps/events go on-chain.
- Frontend wallet signing preferred for user-initiated transactions; never store seed phrases. If a backend relayer is used, document key management and do not use production keys in local demo.
- Display real transaction hashes only when an actual transaction succeeds. Pending/failed transactions must be shown accurately.

### 6. Carbon Integrity Score + Public Explorer
- Score range 0–100; explain components and missing data.
- Display score history and why it changed.
- Public credit page shows project/batch identity, source/registry reference, status, integrity score and breakdown, evidence hashes (not private files), review findings suitable for public disclosure, ownership/retirement events, risk/reversal events, chain/network, transaction hash, and explorer link if verified.
- Add clear DEMO DATA labels to synthetic projects, registry records, and reversal events.

## Suggested demo storyline
Use a fictional project such as “Demo Forest Project ES-001” and a synthetic batch of 1,000 tCO2e. Label all figures as fictional demo data.

1. Register the project and batch.
2. Upload sample evidence. Show its hash and AI/deterministic findings.
3. Import a sample registry CSV containing one matching serial/reference; show a conflict and block approval.
4. Resolve or explicitly review the conflict, then have an authorized reviewer approve.
5. Submit the registration transaction and show the actual transaction hash.
6. Transfer a small quantity if transfer is included.
7. Retire a portion and show the irreversible retirement record.
8. Submit a synthetic forest-disturbance event.
9. Show the Reversal Oracle alert and score change.
10. Reviewer confirms or rejects the alert; event history remains append-only.
11. Open the public verification page and inspect all history.

## Out of scope for first prototype
- Production carbon-credit certification.
- Claim of legal compliance with EU CRCF, EU ETS, CBAM, CSRD/ESRS, EUDR, or Article 6.
- Global cross-registry double-count prevention.
- Full trading marketplace, exchange, order book, or token economy.
- Production satellite AI model trained from scratch.
- Unverified real-world credit issuance.
- Complex DAO/governance.
- Real Article 6 accounting decisions.
- Any claim that the platform can legally reverse a retirement in a third-party registry.

## Demo data safety
Seed data must include `is_demo: true` (or equivalent) and a visible “DEMO DATA — NOT CERTIFIED CARBON CREDITS” label. Do not mix demo records with records presented as live or verified.
