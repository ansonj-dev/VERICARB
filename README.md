# VERICARB climate integrity prototype

VERICARB is a FastAPI + SQLite application with a static responsive workspace and a Hardhat/Solidity registry. Database demo records are labelled; a chain transaction is shown only after a successful X1 receipt and state read-back. An on-chain record proves the submitted identifiers and hashes were recorded; it does not prove that environmental claims are true or certify credits.

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

Open [http://localhost:8000/auth.html](http://localhost:8000/auth.html) and select **Explore the demo workspace**. API docs are at `/api/docs`. SQLite and off-chain evidence files are stored under `data/`.

The ignored local `.env` is configured for X1 EcoChain Maculatus Testnet. Network health is checked through JSON-RPC. The authenticated shell shows live RPC and deployment state. No signer keys or contract address are currently configured, so contract actions remain disabled.

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

The live deploy/configure scripts require local `X1_DEPLOYER_PRIVATE_KEY`, `X1_REGISTRAR_PRIVATE_KEY`, and `X1_REVIEWER_PRIVATE_KEY` values in ignored `.env`. Never paste keys into chat or put them in source control. Deployment and role assignment are separate explicit commands; neither is part of ordinary tests. Review the printed address and cost plan before running the confirmation form.

After deployment, the backend supports project registration (`POST /api/projects/{id}/register-chain`), evidence hash anchoring (`POST /api/evidence/{id}/anchor`), and reviewed batch issuance (`POST /api/batches/{id}/issue`). The first two require a deployed registry and registrar role. Transfer, retirement, risk alert, and reviewer decisions are currently database workflows; on-chain lifecycle calls are not yet connected to those API actions.

The live testnet lifecycle harness can verify a confirmed, active batch and run the contract-only lifecycle with the separate registrar/reviewer signers: `npm run chain:test:lifecycle -- <batch-id>`. This is an explicit testnet command and is not part of local tests. The completed QA run and its actual transaction links are documented in `docs/DEPLOYMENT_AND_VERIFICATION.md`.

## Tests

```powershell
python -m pytest services\api\tests -q
node --check app.js
python -m compileall -q services/api/app
```

See [docs/TEST_REPORT.md](docs/TEST_REPORT.md) for the latest results and [docs/X1_TESTNET_SETUP.md](docs/X1_TESTNET_SETUP.md) for independently checked network settings and the live wallet blocker.

## Product limits

- Synthetic demo data and deterministic assessments are not certifications or live environmental observations.
- Registry conflict checks cover only imported records.
- Evidence files remain off-chain; only SHA-256 digests are sent to the registry.
- Local transfer, retirement, risk, and review flows do not yet submit chain transactions.
- The Solidity registry has not been audited or deployed. No mainnet deployment is supported.
- The marketplace remains a preview and does not sell credits.

Reset synthetic data from **Settings → Reset demo workspace** or the authenticated `POST /api/demo/reset` endpoint.
