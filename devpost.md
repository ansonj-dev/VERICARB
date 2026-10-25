# VERICARB — Every Credit. One Traceable History.

**VERICARB** is a carbon-integrity and evidence-provenance prototype that connects climate-project records, supporting evidence, registry conflict checks, monitoring signals, reviewer decisions, and credit-batch history in one workspace.

It is built around a simple question: **Where did this credit come from, what supports it, what has happened to it, and has new information changed its risk?**

> VERICARB is a working prototype using synthetic demo data and a recorded X1 EcoChain Maculatus testnet deployment. It is not a production carbon registry, certification service, or live marketplace. An on-chain record proves that data was recorded—not that the underlying climate claim is true.

## The problem

Carbon-credit information can be scattered across project documents, evidence files, registry records, monitoring updates, and review decisions. This makes provenance and lifecycle history harder to inspect. Duplicate records, outdated evidence, and reversal risks also require careful review.

VERICARB brings these pieces into one traceable workflow. It is designed to support inspection and accountability—not replace independent verification, authoritative registries, or climate-accounting rules.

## What it does

- **Project workspace:** organize project details, methodology, location, vintage, and registry references.
- **Evidence provenance:** store supporting files off-chain and calculate SHA-256 hashes so their recorded fingerprints can be checked.
- **Registry conflict checks:** import registry records and check for matching serials in the available dataset.
- **Integrity assessments:** combine evidence, verification, registry consistency, reversal resilience, and authorization signals into a transparent prototype score.
- **Human review:** record approval, rejection, requests for more evidence, and follow-up on risk signals.
- **Credit-batch lifecycle:** manage batch records and demonstrate issuance, transfer, and retirement workflows.
- **Public verification:** provide a public-facing view of selected batch, evidence-hash, score, and event information.
- **X1 EcoChain integration:** connect to Maculatus testnet and support on-chain project registration, evidence anchoring, and batch issuance when the required contract and signer configuration is present.

## How X1 EcoChain is used

VERICARB uses **X1 EcoChain's Maculatus testnet (chain ID 10778)** as a shared ledger for selected carbon-record commitments and lifecycle information.

The Solidity `VericarbRegistry` contract records project and batch identifiers, evidence hashes, balances, and lifecycle decisions. Role-based permissions separate administrative, issuer, oracle, and verifier capabilities. Contract rules restrict transfers and retirement when a batch is at risk or under review, and prevent transfers or retirement beyond available balances.

Evidence files remain off-chain; their SHA-256 fingerprints can be anchored on-chain. This avoids putting full documents on a public ledger while allowing a recorded fingerprint to be compared later. The contract does not independently validate the environmental claims represented by those files.

**Network:** X1 EcoChain Maculatus Testnet  
**Chain ID:** `10778`  
**Explorer:** https://maculatus-scan.x1eco.com/  
**Registry contract used in the recorded testnet deployment:** `0x5BF650b0b46D40794B116c36f75DABAcF5ed9e8b`

The repository documents a testnet deployment and a synthetic end-to-end test flow. These are recorded project artifacts; this submission does not claim a new transaction or fresh test run.

## How we built it

- **Frontend:** HTML, CSS, vanilla JavaScript, and Lucide icons.
- **API:** Python, FastAPI, Pydantic, and Uvicorn.
- **Persistence:** SQLAlchemy, SQLite, and Alembic migrations.
- **Evidence integrity:** off-chain file storage and SHA-256 hashing.
- **Blockchain:** Solidity 0.8.24, Hardhat, ethers, and Web3.py.
- **Testing:** pytest / FastAPI TestClient and Hardhat contract tests.

The integrity score is a deterministic prototype heuristic—not an AI verdict, probability of truth, price prediction, or certification. Registry checks are limited to the records available to the application. Live satellite ingestion, a production AI assessment service, global registry federation, payments, and a production marketplace are not currently implemented.

## What was challenging

The main design challenge is separating **data integrity** from **real-world truth**. A hash can help show that a file matches a previously recorded fingerprint, and a smart contract can enforce rules over its own records. Neither proves that a project reduced or removed the claimed amount of carbon.

A second challenge is connecting off-chain workflows with on-chain state. VERICARB currently supports selected on-chain actions, while some lifecycle actions and public verification views remain application-side. Production use would require full lifecycle synchronization, authoritative registry integrations, resilient transaction handling, durable storage, stronger operational security, and independent contract review.

## What's next

1. Synchronize every supported lifecycle action with the registry and reconcile database state against confirmed chain events.
2. Replace local demo storage with durable, access-controlled storage and backup policies.
3. Add trusted registry and monitoring integrations with clear source attribution.
4. Improve risk assessment with validated methodologies and human-review controls.
5. Complete security testing, contract review, and production governance before handling real credits.

## Links

- **Source code:** https://github.com/ansonj-dev/VERICARB
- **Prototype:** https://vericarb.onrender.com
- **X1 EcoChain explorer:** https://maculatus-scan.x1eco.com/

---

**VERICARB's principle:** make carbon-credit records easier to inspect, evidence easier to trace, and changes in risk harder to overlook—without confusing a blockchain record with proof of climate impact.
