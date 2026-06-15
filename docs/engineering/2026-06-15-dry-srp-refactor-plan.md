# DRY/SRP Refactor Plan

## Summary
- Repo: Albion / AI Council
- Lane: DRY/SRP Refactor Plan
- Baseline SHA: `ec0621472639bb9b0ed170952cf9d65ebfdd4cdf`
- Date: 2026-06-15
- Branch inspected: `main`
- Remote URL status: `origin` was updated from the moved repository URL `https://github.com/infotradescout/Albion.git` to `https://github.com/infotradescout/Albion-AI-Council.git`.
- Plan status: planning only; no runtime refactor, schema change, database change, feature work, governance authority change, or Merlin execution behavior change.

This plan follows `docs/QA_DRY_RELEASE_GATE.md`: QA first, fix Critical/High UX blockers, then plan DRY/SRP cleanup in small behavior-preserving lanes.

## Files Inspected
- `docs/QA_DRY_RELEASE_GATE.md`
- `docs/templates/DRY_SRP_AUDIT_TEMPLATE.md`
- `docs/qa/2026-06-15-current-product-ux-qa-audit.md`
- `docs/qa/2026-06-15-critical-high-ux-fixes-reqa.md`
- `package.json`
- `src/albion/albionActionPacketQueue.ts`
- `src/albion/albionImmutableRunLedgerEntryProof.ts`
- `src/albion/albionReplayEvidenceContracts.ts`
- `src/albion/privateCommandSurface.ts`
- `src/albion/privateCommandSurfaceData.ts`
- `src/styles.css`
- `tests/albion-action-packet-queue.test.ts`
- `tests/albion-queue-replay-evidence-packet.contract.test.ts`
- `tests/albion-run-ledger-immutable-entry-proof.contract.test.ts`
- `tests/albion-private-command-surface.test.ts`

## Commands Used
```text
git branch --show-current
git rev-parse HEAD
git status --short --branch
git remote -v
git ls-files
git ls-files | ForEach-Object { ... line count ... }
rg -n "\btry\s*\{" src server shared --glob '!node_modules/**' --glob '!dist/**'
rg -n "\bfetch\s*\(" src server shared --glob '!node_modules/**' --glob '!dist/**'
rg -n "\bapiRequest\s*\(" src server shared --glob '!node_modules/**' --glob '!dist/**'
rg -n "formatCurrency" src server shared --glob '!node_modules/**' --glob '!dist/**'
rg -n "formatDate" src server shared --glob '!node_modules/**' --glob '!dist/**'
rg -n "function <helper-name>\b" src/albion
rg -n "^export function|^export interface|^export type" src/albion/albionActionPacketQueue.ts src/albion/albionImmutableRunLedgerEntryProof.ts src/albion/albionReplayEvidenceContracts.ts
```

## Known Zachary Targets Checked
The uploaded Zachary watchlist named larger application files from a broader product context. They were verified, not assumed:

| Target | Result |
| --- | --- |
| `admin-dashboard.tsx` | Not found in this repo. |
| `parking-pass.tsx` | Not found in this repo. |
| `shared/schema/legacy.ts` | Not found in this repo. |
| `server/storage.ts` | Not found in this repo. |
| repeated server `try/catch` blocks | `0` source matches; no `server/` tree present. |
| raw `fetch()` calls versus `apiRequest()` | `0` source `fetch()` matches and `0` source `apiRequest()` matches. Docs mention the pattern only. |
| duplicated `formatCurrency` / `formatDate` helpers | `0` source matches. |

## Confirmed Oversized Files
Line counts were taken from tracked project files, excluding `node_modules` and build output.

| File | Lines | Risk | Notes |
| --- | ---: | --- | --- |
| `src/albion/albionActionPacketQueue.ts` | 1502 | High | Mixes queue append/replay, replay evidence packet creation, export review contracts, revocation, review history, eligibility evaluation, deterministic serialization, hashing, timestamp helpers, and export handoff preview copy. |
| `src/albion/albionImmutableRunLedgerEntryProof.ts` | 721 | Medium | Mixes proof creation, proof validation, authority evidence construction, entry hashing, deterministic serialization, and full nested shape validators. |
| `src/albion/albionReplayEvidenceContracts.ts` | 611 | Medium | Mostly validation, but duplicates many nested shape validators already present in immutable proof validation. |
| `src/albion/privateCommandSurfaceData.ts` | 401 | Medium | Mixes local fixtures, ledger record conversion, action packet preview construction, replay evidence preview, and export review preview metadata. |
| `src/styles.css` | 407 | Low | Manageable now, but layout containment rules should remain covered by UI tests if future UI surfaces grow. |

## Confirmed Duplicated Patterns
### Source Repetition Counts
| Pattern | Count | Command |
| --- | ---: | --- |
| Source `try {` blocks | 0 | `rg -n "\btry\s*\{" src server shared --glob '!node_modules/**' --glob '!dist/**'` |
| Source raw `fetch(` calls | 0 | `rg -n "\bfetch\s*\(" src server shared --glob '!node_modules/**' --glob '!dist/**'` |
| Source `apiRequest(` calls | 0 | `rg -n "\bapiRequest\s*\(" src server shared --glob '!node_modules/**' --glob '!dist/**'` |
| Source `formatCurrency` refs | 0 | `rg -n "formatCurrency" src server shared --glob '!node_modules/**' --glob '!dist/**'` |
| Source `formatDate` refs | 0 | `rg -n "formatDate" src server shared --glob '!node_modules/**' --glob '!dist/**'` |

### Duplicated Albion Helper Families
The meaningful DRY risk in this repo is duplicated contract validation and deterministic serialization helpers across `src/albion/albionImmutableRunLedgerEntryProof.ts` and `src/albion/albionReplayEvidenceContracts.ts`.

Each of these helper families has 2 definitions:

```text
isRunRecord
isApprovalRequirement
isRoundtableMandate
isRouteClassificationInput
isEvidenceRecord
isAdvisoryNote
isMerlinHandoffEligibility
isDriveFolderPlan
isDiscordAlertPayload
isApprovalsRecord
isApprovalVote
isPriority
isRouteStatus
isKnightName
isKnightNameArray
isStringArray
isTimestampLike
isNonEmptyString
isNonNegativeInteger
isPlainObject
hasExactKeys
stableStringify
stableSortValue
hashString
```

Risk: duplicated validators can drift in authority-sensitive contract code. This is a maintainability risk, not evidence of current behavior failure.

## Risk Ranking
### Critical
None found. Current QA re-check reports `READY WITH WATCHLIST`, with 0 Critical and 0 High UX issues after the accepted fix lane.

### High
- `src/albion/albionActionPacketQueue.ts` is oversized and owns several distinct responsibilities. Future changes to queue replay, export review, revocation, eligibility, hashing, or preview copy have elevated regression risk.
- Duplicated authority-adjacent validators across replay evidence and immutable proof modules could drift if one path changes without the other.

### Medium
- `src/albion/albionImmutableRunLedgerEntryProof.ts` and `src/albion/albionReplayEvidenceContracts.ts` duplicate nested shape validation logic.
- `src/albion/privateCommandSurfaceData.ts` mixes fixture data with data-building and preview orchestration.
- UI layout rules now have regression tests, but any growth of the command surface should preserve overflow checks and screenshot QA.

### Low
- `src/styles.css` is not yet oversized, but accumulated layout rules should stay tied to UI test coverage.
- Docs and JSON profile files are large enough to be reviewed carefully, but they are not runtime DRY/SRP targets.

## Recommended Refactor Lanes
### Lane 1: Shared Albion Validation Helpers
- Goal: Extract duplicated primitive and nested shape validators used by replay evidence and immutable proof validation into a small internal helper module.
- Files likely touched:
  - `src/albion/albionReplayEvidenceContracts.ts`
  - `src/albion/albionImmutableRunLedgerEntryProof.ts`
  - new `src/albion/albionContractValidation.ts` or similarly narrow helper
  - related contract tests only if import boundaries need coverage
- Expected risk: Medium, because this touches authority-adjacent validation paths.
- Required regression tests:
  - `npm run test:contracts`
  - `npm test`
  - targeted tests for unknown field rejection, High Court execution rejection, incomplete Roundtable authority rejection, and full 3/3 acceptance.
- Behavior-parity evidence required:
  - Before/after validation results for representative replay evidence and immutable proof fixtures.
  - Stable serialized output checks must remain identical.
  - No accepted field list broadening.
- Re-QA requirement:
  - No browser re-QA required unless UI imports change; run command-surface UI tests as a guard.

### Lane 2: Deterministic Serialization and Hash Helpers
- Goal: Move `stableStringify`, `stableSortValue`, and `hashString` to a shared deterministic utility only after Lane 1 or together with a very small helper lane if pre-flight approves.
- Files likely touched:
  - `src/albion/albionActionPacketQueue.ts`
  - `src/albion/albionImmutableRunLedgerEntryProof.ts`
  - new narrow utility module
- Expected risk: High, because hash output is contract evidence.
- Required regression tests:
  - Deterministic serialization tests.
  - Ledger preview hash stability tests.
  - Immutable proof hash stability tests.
- Behavior-parity evidence required:
  - Exact serialized strings and hashes unchanged for existing tests.
  - No timestamp or key-order behavior changes.
- Re-QA requirement:
  - Not UI-facing, but run full contracts and full unit test suite.

### Lane 3: Split Action Packet Queue by Contract Responsibility
- Goal: Split `albionActionPacketQueue.ts` into behavior-preserving modules after helper extraction reduces duplicate risk.
- Files likely touched:
  - `src/albion/albionActionPacketQueue.ts`
  - likely new modules for queue replay, replay evidence packet creation, export review contracts, revocation/history, eligibility, and preview handoff copy
  - existing tests
- Expected risk: High.
- Required regression tests:
  - `tests/albion-action-packet-queue.test.ts`
  - `tests/albion-queue-replay-evidence-packet.contract.test.ts`
  - `tests/albion-export-review-contract.test.ts`
  - `tests/albion-review-history-governance.test.ts`
  - `npm run test:contracts`
  - `npm test`
- Behavior-parity evidence required:
  - Public exports unchanged or deliberately bridged.
  - Queue ordering unchanged.
  - Replay ledger output unchanged.
  - Export/revocation/history artifacts unchanged.
  - All authority flags remain false where currently false.
- Re-QA requirement:
  - Run UI tests because private command surface consumes queue preview data.

### Lane 4: Private Command Surface Data Builder Separation
- Goal: Separate fixture records from preview-building orchestration without changing rendered output.
- Files likely touched:
  - `src/albion/privateCommandSurfaceData.ts`
  - possible new fixture/helper module
  - `tests/albion-private-command-surface.test.ts`
- Expected risk: Medium.
- Required regression tests:
  - UI tests proving hash/path route behavior, rendered sections, preview metadata, and layout containment remain intact.
- Behavior-parity evidence required:
  - Rendered HTML snapshots or targeted assertions unchanged.
  - Reuse current desktop/mobile QA surfaces.
- Re-QA requirement:
  - Re-run command surface at desktop and mobile widths; capture screenshots if rendered output changes.

### Lane 5: CSS Surface Boundary Review
- Goal: Keep the recently fixed overflow behavior stable while organizing CSS only if future UI growth makes it necessary.
- Files likely touched:
  - `src/styles.css`
  - `tests/albion-private-command-surface.test.ts`
- Expected risk: Low to Medium.
- Required regression tests:
  - Existing layout containment assertions.
  - Browser screenshot re-QA if selectors or layout rules move.
- Behavior-parity evidence required:
  - No horizontal overflow on desktop and mobile audited surfaces.
- Re-QA requirement:
  - Desktop and mobile command-surface screenshot pass.

## Explicit Non-Goals
- No runtime refactor in this planning lane.
- No file splitting in this planning lane.
- No app behavior change.
- No feature work.
- No schema or database changes.
- No governance authority expansion.
- No AI Council authority expansion.
- No Gemini capability expansion.
- No Merlin execution authority change.
- No DRY/SRP implementation before a separate approved implementation lane.
- No production deployment claim.

## Recommended First Implementation Lane
Start with **Lane 1: Shared Albion Validation Helpers**.

Reason: it addresses confirmed duplication in authority-adjacent validation code while keeping the blast radius smaller than splitting `albionActionPacketQueue.ts`. It should be executed as a behavior-preserving helper extraction with contract tests proving identical accept/reject behavior before any larger queue or export-review module split.

New feature work should remain behind the QA + DRY release gate until this first DRY/SRP lane is accepted or explicitly deferred.
