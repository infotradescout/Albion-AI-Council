# Repository Lanes

## Repo
- Name: albion-ai-council
- Working repo label: AI Council

## Repo Doctrine
Albion AI Council is the doctrine, governance, packet, and local execution surface for Albion. Albion is the full Kingdom operating system. Merlin is the Operational Router inside Albion and executes approved routes only.

Core doctrine for this repo:
- Preserve Albion authority boundaries.
- Preserve Roundtable 3/3 requirements for AI-related authority, behavior, execution, safety, or governance changes.
- The High Court remains strictly advisory and holds no execution or blocking authority.
- Preserve brand and Kingdom isolation.
- Preserve evidence law: no evidence, no claim; no test artifact, no test pass claim.
- Keep product behavior changes separate from operating-doc or governance-document slices unless explicitly assigned.

## Safe Parallel Lanes
- operating-docs: repo operating docs, lane definitions, return formats, and non-product process documentation.
- albion-doctrine-docs: Albion doctrine documents under `docs/albion/`.
- packet-contracts: packet shape contracts and contract tests for Albion packets.
- run-ledger: run ledger data structures, tests, and documentation.
- action-packet-queue: approval action packet queue implementation, tests, and contracts.
- private-command-surface: private command surface data, implementation, UI-facing tests, and supporting docs.
- run-flow: Albion run flow implementation, contracts, and tests.
- frontend-shell: top-level Vite shell, styles, and UI integration only when explicitly assigned.
- build-tooling: package scripts, TypeScript, Vitest, Vite, and repository configuration.

## Unsafe Lane Pairings
Do not run these lane pairings in parallel without Gawain approval:

- operating-docs with albion-doctrine-docs, when both edit governance authority or AI execution rules.
- packet-contracts with run-flow, when both change the same packet contract or route status values.
- packet-contracts with action-packet-queue, when both change approval packet shapes.
- run-ledger with run-flow, when both change run lifecycle states or ledger evidence fields.
- private-command-surface with frontend-shell, when both edit `src/main.ts` or `src/styles.css`.
- build-tooling with any lane that depends on validation behavior.
- any two lanes editing the same file.

## Branch Naming Convention
Use:

`<lane>/<short-scope>`

Examples:
- `operating-docs/parallel-ai-execution`
- `packet-contracts/replay-evidence`
- `run-flow/arrival-proof`
- `private-command-surface/approval-actions`

## Lane-Specific Allowed Files
- operating-docs: `docs/AI_PARALLEL_EXECUTION.md`, `docs/REPO_LANES.md`, and other repo-level process docs under `docs/` when assigned.
- albion-doctrine-docs: `docs/albion/**/*.md` and `docs/albion/**/*.json` when assigned.
- packet-contracts: `tests/*.contract.test.ts`, packet format docs under `docs/albion/`, and directly related `src/albion/*` contract types when assigned.
- run-ledger: `src/albion/albionRunLedger.ts`, `tests/albion-run-ledger.test.ts`, and directly related docs.
- action-packet-queue: `src/albion/albionActionPacketQueue.ts`, `src/albion/albionApprovalActionPackets.ts`, `tests/albion-action-packet-queue.test.ts`, `tests/albion-approval-action-packets.test.ts`, and directly related docs.
- private-command-surface: `src/albion/privateCommandSurface.ts`, `src/albion/privateCommandSurfaceData.ts`, `tests/albion-private-command-surface.test.ts`, and assigned UI integration files.
- run-flow: `src/albion/albionRunFlow.ts`, `tests/albion-os-mvp-run-flow.contract.test.ts`, and directly related docs.
- frontend-shell: `src/main.ts`, `src/styles.css`, `index.html`, and UI tests when assigned.
- build-tooling: `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, and build/test configuration files.

## Lane-Specific Banned Files
- operating-docs: banned from changing `src/**`, `tests/**`, package files, generated output, or product copy.
- albion-doctrine-docs: banned from changing `src/**`, `tests/**`, package files, or generated output unless explicitly assigned.
- packet-contracts: banned from unrelated UI shell files, unrelated doctrine rewrites, and package files unless validation tooling is assigned.
- run-ledger: banned from private command surface files, frontend shell files, and unrelated packet contracts.
- action-packet-queue: banned from run ledger internals, frontend shell files, and unrelated doctrine rewrites.
- private-command-surface: banned from run ledger internals, unrelated packet contracts, and package files unless assigned.
- run-flow: banned from private command surface implementation, frontend shell styling, and unrelated doctrine rewrites.
- frontend-shell: banned from changing Albion doctrine, packet contracts, ledger internals, or package files unless assigned.
- build-tooling: banned from behavior changes in `src/**`, doctrine changes in `docs/**`, and test expectation changes unless assigned.

## Validation Expectations
Inspect `package.json` before choosing validation. Current validation scripts are:

- `npm run typecheck`
- `npm test`
- `npm run test:contracts`
- `npm run test:ui`
- `npm run build`

Default validation:
- Docs-only lanes: run `npm run typecheck` and `npm test` when dependencies are available.
- Contract or behavior lanes: run `npm run typecheck`, `npm test`, and the most specific relevant script.
- Frontend-shell lanes: run `npm run typecheck`, `npm test`, and `npm run build`.
- Build-tooling lanes: run every affected validation script and report any changed validation behavior.

If validation cannot run, report the exact command attempted and the observed blocker.

## Return Format
Every Codex lane must return:

- repo
- lane chosen
- branch
- baseline SHA
- files inspected
- files changed
- tests run
- test results
- commit SHA if committed
- PR link if opened
- final git status
- risks / follow-up needed
