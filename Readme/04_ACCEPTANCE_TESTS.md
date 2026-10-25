# Acceptance Criteria and Test Plan

## Product behavior
- [ ] All demo records show a visible DEMO DATA label.
- [ ] User can create a project and view its Carbon Impact Passport.
- [ ] Evidence uploads are stored off-chain and have reproducible SHA-256 hashes.
- [ ] Invalid file types, oversized files, malformed metadata, and invalid quantities are rejected safely.
- [ ] AI assessment returns structured findings; deterministic validation works without an LLM key.
- [ ] AI never auto-approves or certifies a credit.
- [ ] Reviewer can approve, reject, or request more evidence with a reason.
- [ ] Duplicate serial or registry-reference conflicts are detected from imported records.
- [ ] Conflicts are explainable and can block approval until reviewed.
- [ ] Unavailable external registry sources are shown as unavailable, not silently assumed clear.
- [ ] Synthetic reversal observation triggers a reproducible alert.
- [ ] Alert and confirmed reversal are distinct states.
- [ ] Only authorized reviewers can confirm/reject reversal alerts.
- [ ] Historical events are append-only and auditable.
- [ ] Retired credits cannot be transferred or retired again.
- [ ] Transfers and retirement cannot exceed available balances.
- [ ] A confirmed reversal does not erase the retirement record.
- [ ] Integrity score explains components, missing inputs, timestamp, and reasons for change.
- [ ] Public verification page exposes only non-sensitive information.
- [ ] Blockchain transaction hashes are real and tied to receipts; no fake explorer URLs.
- [ ] Pending, failed, and confirmed transaction states are handled distinctly.
- [ ] No private key, seed phrase, or secret is logged or committed.

## Smart contract tests
- [ ] Authorized issuer can register a unique batch.
- [ ] Unauthorized issuer is rejected.
- [ ] Duplicate batch ID is rejected.
- [ ] Zero or invalid quantity is rejected.
- [ ] Transfer over available balance reverts.
- [ ] Retirement over available balance reverts.
- [ ] Retired quantity cannot be reused.
- [ ] Invalid state transitions revert.
- [ ] Unauthorized oracle cannot mark a batch at risk.
- [ ] Unauthorized reviewer cannot confirm reversal.
- [ ] Events emit correct IDs, quantities, evidence hashes, and timestamps.
- [ ] Reversal/impairment preserves previous lifecycle events.

## UI and accessibility
- [ ] Loading, empty, error, and success states are present.
- [ ] Dashboard labels synthetic data clearly.
- [ ] Status badges have text labels and are not color-only.
- [ ] Tables are usable on smaller screens.
- [ ] Forms validate fields and show useful error messages.
- [ ] Public page has copyable credit ID and evidence hash.
- [ ] Score breakdown includes text explanations.
- [ ] Keyboard navigation and semantic labels are supported.

## Delivery
- [ ] README has local setup, test, deploy, and demo instructions.
- [ ] `.env.example` contains placeholders only.
- [ ] Database schema/migrations and seed data are included.
- [ ] Contract deployment script and test results are documented.
- [ ] API docs are available.
- [ ] Demo script takes 3–5 minutes.
- [ ] Limitations and non-certification disclaimer are visible.
