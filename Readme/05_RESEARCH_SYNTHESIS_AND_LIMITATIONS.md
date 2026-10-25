# Research Synthesis and Limitations

This synthesis is based on the three research reports supplied in the conversation and the CarbonProof concept/architecture documents. It summarizes their claims and recommendations; it is not an independent audit of every cited publication or a legal opinion.

## Shared findings across the supplied reports
1. Blockchain is most credible as an integrity, provenance, coordination, and audit layer—not as proof that the physical climate outcome is true.
2. Smart contracts can enforce lifecycle rules, but inputs depend on trustworthy evidence, oracles, and human/third-party verification.
3. Double counting includes duplicate issuance, double use, and double claiming; these need different detection methods.
4. Digital MRV can combine satellite data, IoT, AI/ML, field evidence, registries, and blockchain anchoring.
5. Raw datasets and sensitive records should remain off-chain; hashes, identifiers, lifecycle state changes, and audit events can be anchored on-chain.
6. Governance, interoperability, data quality, privacy, and legal recognition remain central challenges.
7. Dynamic monitoring is a promising differentiator because project conditions can change after initial verification.
8. A human reviewer should resolve material alerts; AI and satellite signals should not be presented as independent certification.

## Europe-focused context in the supplied report
The report discusses EU ETS, CBAM, CRCF, CSRD/ESRS, EUDR, Digital Product Passports, GDPR, the Data Act, AI Act, MiCA, eIDAS 2.0, Copernicus, and ICOS.
Design implication: build structured, auditable, interoperable data and privacy controls, but do not claim legal compliance merely because fields are supported.
Important distinction: EU ETS allowances, voluntary carbon credits, and CRCF-certified units are not interchangeable instruments.

## Proposed CarbonProof ideas incorporated into VERICARB
- Carbon Impact Passport
- Reversal Oracle and dynamic credit states
- Double-Claim Firewall
- Dynamic Carbon Integrity Score
- Append-only integrity events and public verification
- Human review and clear alert-vs-confirmed-reversal distinction
- Off-chain raw evidence and on-chain hashes/events

## MVP boundary
Start with forest-carbon projects and synthetic evidence:
- Project registration and passport.
- Evidence upload/hash and AI-assisted review.
- CSV-based registry conflict detection.
- Testnet lifecycle records.
- Synthetic or supported disturbance alert.
- Human review.
- Score breakdown and public explorer.

## Limitations that must remain explicit
- The platform does not certify credits.
- Blockchain does not prove additionality, permanence, measurement accuracy, or regulatory acceptance.
- Registry checks cover only imported/connected sources.
- A unique ID alone cannot prevent all cross-registry duplication.
- Reversal alerts are not proof of environmental reversal.
- Third-party retirement cannot be legally undone by VERICARB.
- Article 6 authorization and corresponding-adjustment data require authoritative sources.
- The score is a prototype heuristic and requires calibration and independent evaluation.
- European regulatory readiness requires legal and technical validation.
- No real-world climate impact should be claimed from synthetic demo data.

## Sources supplied by the user
### Research report: Blockchain for Carbon Markets and Climate Data Transparency
- Blockchain for the carbon market: a literature review — Discover Environment: https://link.springer.com/article/10.1007/s44274-025-00260-4
- Can digital MRV improve carbon markets? — Environmental Research Letters: https://iopscience.iop.org/article/10.1088/1748-9326/ae20ad
- Digital MRV for Decarbonization — Business & Information Systems Engineering: https://link.springer.com/article/10.1007/s12599-025-00953-3
- Tokenisation of forest carbon project — Journal of Tropical Ecology: https://www.cambridge.org/core/services/aop-cambridge-core/content/view/05D1B9E1526E4F9CA4D4E8AE7CA3F64B/S0266467425100151a.pdf
- A Blockchain-based Carbon Credit Ecosystem — arXiv: https://arxiv.org/abs/2107.00185
- Harnessing Blockchain and IoT for Carbon Credit Exchange — Energies: https://www.mdpi.com/1996-1073/17/19/4811
- A proof-of-stake blockchain framework for transparent climate data verification — PLOS Climate: https://journals.plos.org/climate/article?id=10.1371/journal.pclm.0000764

### Europe-focused report
- EU ETS — European Commission: https://climate.ec.europa.eu/areas-action/carbon-markets/about-eu-ets_en
- CBAM definitive regime — European Commission: https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-definitive-regime_en
- Carbon Removals and Carbon Farming Framework — European Commission: https://climate.ec.europa.eu/areas-action/carbon-removals-and-carbon-farming/carbon-removals-and-carbon-farming-crcf-regulation_en
- Digital Product Passport — European Commission: https://single-market-economy.ec.europa.eu/single-market/digital-product-passport_en
- ICOS Cities — https://www.icos-cp.eu/fluxes/4/tools-monitoring-and-guiding-urban-climate-action

### CarbonProof concept and architecture documents
- CarbonProof is the continuous integrity-layer concept contributed in the conversation. Its ideas are adapted into VERICARB; VERICARB remains the chosen product name.
- Treat any competitive positioning or “does not already exist” assertions as hypotheses requiring market research, not verified facts.
