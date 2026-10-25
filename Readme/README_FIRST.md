# VERICARB Prototype Pack

**Product:** VERICARB — Continuous Carbon Integrity Network  
**Tagline:** Every Credit. One Traceable History.

This package consolidates the VERICARB concept, the CarbonProof-inspired continuous integrity features, the research context supplied in the conversation, the prototype scope, technical architecture, acceptance criteria, and a comprehensive build prompt for Codex.

## Start here
1. Read `01_PRODUCT_VISION.md`.
2. Read `02_MVP_SCOPE_AND_DEMO.md`.
3. Read `03_TECHNICAL_ARCHITECTURE.md`.
4. Give `CODEX_MASTER_BUILD_PROMPT.md` to Codex in the repository where you want the application built.
5. Use `04_ACCEPTANCE_TESTS.md` to verify the result.

## Product in one paragraph
VERICARB is a continuous carbon-integrity platform that connects carbon-credit provenance, AI-assisted evidence review, duplicate/conflict detection, environmental reversal alerts, human verification, explainable integrity scoring, and blockchain-backed audit trails. It is not merely a carbon-credit marketplace. It helps users inspect where a credit came from, what evidence supports it, which conflicts or risks have been detected, and whether later evidence has changed its status.

## Important scope and truthfulness rules
- The MVP is a prototype, not a certified carbon registry, accredited verifier, or legal compliance product.
- Clearly label all synthetic project/credit data as DEMO DATA.
- AI findings are decision support, not certification.
- A blockchain transaction proves that a record/event was written to that chain; it does not prove the real-world climate outcome is true.
- Duplicate checks only cover data available to VERICARB. Do not claim global cross-registry double-counting prevention without broad, reliable integrations and governance.
- A suspected reversal is an alert, not a confirmed environmental reversal. A human reviewer must confirm or reject it.
- Preserve the original retirement record. If later impairment/reversal is confirmed, append an event; do not erase history or imply a third-party registry retirement was legally undone.
- Keep raw documents, personal data, satellite images, and sensitive commercial data off-chain. Anchor hashes and minimal state/identifier data on-chain.
- Do not invent X1 EcoChain RPC URLs, chain IDs, faucets, explorers, or deployment details. Verify against official docs when implementing. If X1 is unavailable, keep a chain adapter and use a documented EVM testnet fallback only with an explicit configuration.
- Never request, store, or expose seed phrases. Never commit private keys or secrets.

## Suggested repository layout
```text
vericarb/
├── apps/
│   └── web/                  # Next.js frontend
├── services/
│   └── api/                  # FastAPI backend
├── contracts/                # Solidity + Hardhat + tests
├── docs/                     # Product, architecture, API, threat model
├── sample-data/              # Clearly marked synthetic records
├── scripts/
├── .env.example
├── docker-compose.yml        # Optional local development
└── README.md
```

This is a planning pack. It does not claim that code, smart contracts, deployment, or testnet transactions have already been created or verified.
