# VERICARB

VERICARB is a FastAPI + SQLite application with a static responsive workspace and a Hardhat/Solidity registry. Database demo records are labelled; a chain transaction is shown only after a successful X1 receipt and state read-back. An on-chain record proves the submitted identifiers and hashes were recorded; it does not prove that environmental claims are true or certify credits.

## Workspace

- Project and evidence management with SHA-256 evidence hashing.
- Registry imports and conflict checks against imported records.
- Monitoring signals, integrity assessments, and human review workflows.
- Batch issuance, local transfer and retirement workflows, and public verification.
- X1 testnet network status, project registration, evidence anchoring, and batch issuance.

## Run locally

Use Python 3.11 or newer and Node.js 20+. From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r services\api\requirements.txt
npm --prefix services\contracts install
Copy-Item .env.example .env
python -m uvicorn services.api.app.main:app --reload --port 8000
```

Open [http://localhost:8000/auth.html](http://localhost:8000/auth.html) and select **Explore the demo workspace**. API docs are at [http://localhost:8000/api/docs](http://localhost:8000/api/docs). SQLite and off-chain evidence files are stored under `data/` and are not committed.

The example configuration targets X1 EcoChain Maculatus Testnet (chain ID `10778`) but contains no private keys or registry address. Configure those values in your ignored local `.env` to enable chain actions. Never commit credentials, wallet keys, local databases, or uploaded evidence. Set `VERICARB_TOKEN_SECRET` to a long random value before sharing a running instance.

## Repository layout

- Root HTML, JavaScript, and CSS files: public pages, authentication, and the application workspace.
- [services/api](services/api): FastAPI backend, database migrations, and API tests.
- [services/contracts](services/contracts): Solidity registry, Hardhat tests, and explicit testnet scripts.
- [sample-data](sample-data): preserved synthetic JSON fixtures and registry CSV examples.
- [docs](docs): architecture, demo walkthrough, contract reference, and deployment runbooks.

## Sample data

The sample data is synthetic and does not represent certified credits or real monitoring observations.

- [demo_project.json](sample-data/demo_project.json): example project record.
- [demo_monitoring_observation.json](sample-data/demo_monitoring_observation.json): example monitoring signal.
- [demo_registry_records.csv](sample-data/demo_registry_records.csv): registry import examples, including a duplicate serial for conflict checking.
- [registry_import_template.csv](sample-data/registry_import_template.csv): header-only registry import template.

The JSON files are illustrative fixtures, not a guarantee of compatibility with every API request schema. Use `/api/docs` for current endpoint payloads.

## X1 commands

From `services/contracts`:

```powershell
npm test
npm run compile
npm run chain:check
npm run chain:deploy:testnet -- --confirm-testnet
npm run chain:configure:testnet -- --confirm-testnet
npm run chain:verify:testnet
```

The live deploy/configure scripts require local `X1_DEPLOYER_PRIVATE_KEY`, `X1_REGISTRAR_PRIVATE_KEY`, and `X1_REVIEWER_PRIVATE_KEY` values in ignored `.env`. Never paste keys into chat or put them in source control. Deployment and role assignment are separate explicit commands; neither is part of ordinary tests. Review the printed address and cost plan before running the confirmation form. Use the deployment commands only when intentionally creating or configuring a testnet deployment.

A confirmed testnet deployment and QA transaction flow are recorded in [docs/DEPLOYMENT_AND_VERIFICATION.md](docs/DEPLOYMENT_AND_VERIFICATION.md). This does not configure a fresh checkout: its local keys and registry address must still be set explicitly.

After deployment, the backend supports project registration (`POST /api/projects/{id}/register-chain`), evidence hash anchoring (`POST /api/evidence/{id}/anchor`), and reviewed batch issuance (`POST /api/batches/{id}/issue`). The first two require a deployed registry and registrar role. Transfer, retirement, risk alert, and reviewer decisions are currently database workflows; on-chain lifecycle calls are not yet connected to those API actions.

The live testnet lifecycle harness can verify a confirmed, active batch and run the contract-only lifecycle with the separate registrar/reviewer signers: `npm run chain:test:lifecycle -- <batch-id>`. This is an explicit testnet command and is not part of local tests. The completed QA run and its actual transaction links are documented in `docs/DEPLOYMENT_AND_VERIFICATION.md`.

## Tests

```powershell
python -m pytest services\api\tests -q
node --check app.js
node --check auth.js
node --check public-verify.js
node --check script.js
python -m compileall -q services/api/app
npm --prefix services\contracts test
```

API workflow tests use a temporary SQLite database and evidence directory. Contract tests run locally; ordinary tests do not broadcast testnet transactions. See [docs/TEST_REPORT.md](docs/TEST_REPORT.md) for recorded results and [docs/X1_TESTNET_SETUP.md](docs/X1_TESTNET_SETUP.md) for network configuration details.

## Product limits

- Synthetic demo data and deterministic assessments are not certifications or live environmental observations.
- Registry conflict checks cover only imported records.
- Evidence files remain off-chain; only SHA-256 digests are sent to the registry.
- Local transfer, retirement, risk, and review flows do not yet submit chain transactions.
- The Solidity registry has a recorded testnet deployment but has not been audited or source-verified on the explorer. No mainnet deployment is supported.
- The marketplace remains a preview and does not sell credits.

Reset synthetic data from **Settings > Reset demo workspace** or the authenticated `POST /api/demo/reset` endpoint.
