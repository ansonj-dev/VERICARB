# VERICARB

**Carbon integrity, evidence provenance, and traceable credit lifecycles.**

VERICARB is a working prototype that connects climate-project records, supporting evidence, registry conflict checks, monitoring signals, and human review in one workspace. It combines a vanilla JavaScript frontend, a FastAPI backend, SQLite persistence, and a Solidity registry on X1 EcoChain's Maculatus testnet.

**Status:** local prototype with synthetic demo data and a recorded testnet deployment. It is not a production credit registry, certification service, or live marketplace. An on-chain record proves that identifiers and hashes were recorded, not that the underlying environmental claim is true.

## Features

- Project and evidence management with SHA-256 evidence hashing.
- Registry imports and conflict checks against imported records.
- Monitoring signals, integrity assessments, and human review workflows.
- Batch issuance, local transfer and retirement workflows, and public verification.
- X1 testnet network status, project registration, evidence anchoring, and batch issuance.

## Repository Structure

```text
VERICARB/
|-- frontend/
|   |-- index.html              Public website
|   |-- auth.html               Sign-in and demo access
|   |-- app.html                Application workspace
|   |-- verify.html             Public batch verification
|   `-- assets/
|       |-- css/                Stylesheets
|       |-- js/                 Browser application code
|       `-- images/             Icons and local images
|-- services/
|   |-- api/
|   |   |-- app/                FastAPI routes, models, and business services
|   |   |-- migrations/         Alembic database migrations
|   |   |-- tests/              API and static-hosting tests
|   |   `-- requirements.txt    Python dependencies
|   `-- contracts/
|       |-- contracts/          Solidity registry
|       |-- scripts/            Deployment and testnet operations
|       |-- test/               Hardhat contract tests
|       `-- package.json        Contract tooling and commands
|-- docs/                       Architecture, walkthroughs, and runbooks
|-- sample-data/                Synthetic JSON fixtures and CSV templates
|-- .env.example                Configuration template without secrets
|-- .gitignore                  Local and generated file exclusions
|-- alembic.ini                 Database migration configuration
`-- README.md                   Project overview and getting started
```

The frontend is served at the site root, so moving the source files does not change URLs such as `/auth.html` or `/app.html`. FastAPI serves static content only from [frontend](frontend), not the repository root. API requests remain under `/api/`.

Local-only directories such as `data/`, `.venv/`, `node_modules/`, contract artifacts, and editor settings are intentionally excluded from the tracked project layout. Optional development utilities live under `tools/`.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript, Lucide icons |
| Backend | Python 3.11+, FastAPI, Pydantic, SQLAlchemy |
| Persistence | SQLite, Alembic migrations, off-chain evidence files |
| Blockchain | Solidity, Hardhat, ethers, Web3.py, X1 Maculatus testnet |
| Tests | pytest, FastAPI TestClient, Hardhat |

## Getting Started

Use Python 3.11 or newer and Node.js 20+. From the repository root:

### 1. Install dependencies

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r services\api\requirements.txt
npm --prefix services\contracts ci
```

### 2. Configure the application

For a fresh checkout, create a local configuration file:

```powershell
Copy-Item .env.example .env
```

Keep an existing `.env` rather than overwriting it. Set `VERICARB_TOKEN_SECRET` to a long random value. The default database and evidence directories are created locally when the application starts.

### 3. Start the application

```powershell
python -m uvicorn services.api.app.main:app --reload --host 127.0.0.1 --port 8000
```

| Page | Local URL |
| --- | --- |
| Public website | [localhost:8000](http://localhost:8000/) |
| Sign-in and demo access | [localhost:8000/auth.html](http://localhost:8000/auth.html) |
| Application workspace | [localhost:8000/app.html](http://localhost:8000/app.html) |
| Interactive API documentation | [localhost:8000/api/docs](http://localhost:8000/api/docs) |

Select **Explore the demo workspace** on the sign-in page to load synthetic records. No separate frontend server or JavaScript build step is required. Use the FastAPI origin rather than opening the HTML directly for authenticated workflows.

The example configuration targets X1 EcoChain Maculatus Testnet (chain ID `10778`) but contains no private keys or registry address. Configure those values in your ignored local `.env` to enable chain actions. Never commit credentials, wallet keys, local databases, or uploaded evidence. Set `VERICARB_TOKEN_SECRET` to a long random value before sharing a running instance.

## Sample Data

The sample data is synthetic and does not represent certified credits or real monitoring observations.

- [demo_project.json](sample-data/demo_project.json): example project record.
- [demo_monitoring_observation.json](sample-data/demo_monitoring_observation.json): example monitoring signal.
- [demo_registry_records.csv](sample-data/demo_registry_records.csv): registry import examples, including a duplicate serial for conflict checking.
- [registry_import_template.csv](sample-data/registry_import_template.csv): header-only registry import template.

The JSON files are illustrative fixtures, not a guarantee of compatibility with every API request schema. Use `/api/docs` for current endpoint payloads.

## X1 Testnet

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
node --check frontend/assets/js/app.js
node --check frontend/assets/js/auth.js
node --check frontend/assets/js/public-verify.js
node --check frontend/assets/js/script.js
python -m compileall -q services/api/app
npm --prefix services\contracts test
```

API workflow tests use a temporary SQLite database and evidence directory. Static-hosting tests check the public pages and assets and confirm that private repository paths return 404. Contract tests run locally; ordinary tests do not broadcast testnet transactions.

## Documentation

| Guide | Contents |
| --- | --- |
| [Project explained](docs/PROJECT_EXPLAINED_A_TO_Z.md) | Product context, architecture, trust boundaries, and roadmap |
| [Demo walkthrough](docs/DEMO_WALKTHROUGH.md) | Demonstration flow and expected behavior |
| [Blockchain architecture](docs/BLOCKCHAIN_ARCHITECTURE.md) | Off-chain and on-chain responsibilities |
| [Contract reference](docs/CONTRACTS.md) | Registry roles, operations, and lifecycle |
| [X1 setup](docs/X1_TESTNET_SETUP.md) | Network configuration and operational prerequisites |
| [Deployment and verification](docs/DEPLOYMENT_AND_VERIFICATION.md) | Recorded deployment and explicit testnet operations |
| [Test report](docs/TEST_REPORT.md) | Recorded verification results and known dependency findings |

## Security and Limitations

Only [frontend](frontend) is publicly mounted. Original evidence downloads use authenticated API routes; hashes are not encryption. Keep the prototype on a trusted local environment: demo access, shared demo credentials, and reset actions are not suitable for a production deployment. Protect signing keys and assess dependency findings before exposing an instance publicly.

- Synthetic demo data and deterministic assessments are not certifications or live environmental observations.
- Registry conflict checks cover only imported records.
- Evidence files remain off-chain; only SHA-256 digests are sent to the registry.
- Local transfer, retirement, risk, and review flows do not yet submit chain transactions.
- The Solidity registry has a recorded testnet deployment but has not been audited or source-verified on the explorer. No mainnet deployment is supported.
- The marketplace remains a preview and does not sell credits.

Reset synthetic data from **Settings > Reset demo workspace** or the authenticated `POST /api/demo/reset` endpoint.
