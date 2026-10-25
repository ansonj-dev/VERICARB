# Data Dictionary (Prototype)

## State definitions
- `DRAFT`: project/batch is being prepared.
- `SUBMITTED`: submitted for review.
- `VERIFIED`: evidence review passed; not a claim of external certification unless that authority is documented.
- `ISSUED`: an authorized issuance event has been recorded.
- `ACTIVE`: available for permitted operations and monitoring.
- `AT_RISK`: a material warning requires review; this is not a confirmed reversal.
- `UNDER_REVIEW`: a reviewer is investigating a conflict or risk.
- `REVERSED`: a reviewer-confirmed environmental outcome reversal/impairment event has been recorded. Does not erase earlier transactions.
- `RETIRED`: a quantity has been retired; retirement history is preserved even if a later integrity event is recorded.
- `CANCELLED`: cancelled according to the configured system's rules.
- `DISPUTED`: a formal dispute is open.

## Units
- Store on-chain quantities as integer kg CO2e. Display as tCO2e only by dividing by 1,000 and formatting appropriately.
- Do not use floating-point quantities in contract logic.
- Store timestamps in UTC; show local time only as a presentation layer.
- Score components are integers or decimals in the 0–100 range, with explicit rounding rules.

## Event types
- `PROJECT_CREATED`
- `EVIDENCE_ADDED`
- `ASSESSMENT_CREATED`
- `CONFLICT_DETECTED`
- `REVIEW_APPROVED`
- `REVIEW_REJECTED`
- `BATCH_ISSUED`
- `CREDIT_TRANSFERRED`
- `CREDIT_RETIRED`
- `MONITORING_OBSERVATION_ADDED`
- `RISK_WARNING`
- `CREDIT_AT_RISK`
- `REVIEW_OPENED`
- `REVERSAL_CONFIRMED`
- `REVERSAL_REJECTED`
- `CLAIM_CREATED`
- `CLAIM_UPDATED`
- `REGISTRY_SYNCED`

Every event should include actor, timestamp, relevant object IDs, reason/evidence reference where applicable, demo/live flag, and chain transaction fields if actually on-chain.
