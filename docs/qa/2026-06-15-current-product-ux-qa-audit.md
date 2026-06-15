# Current Product UX QA Audit

## Summary
- Repo: AI Council / Albion
- Lane: Current Product UX QA Audit
- Branch: doctrine/gemini-pass-routing-accelerator
- Baseline SHA: d9e823433f349dd2ab3b9323c2abee0414318336
- Date: 2026-06-15
- Release decision: BLOCKED
- Recommended next lane: Critical/High UX Fixes

This audit applies the QA + DRY release gate from `docs/QA_DRY_RELEASE_GATE.md`.
It is evidence-only. No product behavior, runtime code, schema, automation, or feature changes were made.

## App / Run Context
- App: Albion OS Private Command Surface
- Runtime: Vite dev server
- Local URL tested: `http://127.0.0.1:5173/`
- Data source: local fixtures only
- Live APIs: none
- Auth/session layer: none present
- Forms: none present
- Primary UI implementation inspected:
  - `src/main.ts`
  - `src/albion/privateCommandSurface.ts`
  - `src/albion/privateCommandSurfaceData.ts`
  - `src/styles.css`

## Major Flows Audited
1. Open private command surface default route.
2. Select a run from the run list by hash navigation.
3. Review route state, approval state, Roundtable votes, advisory notes, Merlin handoff state, Discord alert preview, action packet preview, evidence export preview, and Drive vault plan.
4. Load a generated app run URL from the Discord alert preview shape.
5. Review blocked, pending, and in-progress fixture states.

## Screens Inventoried
| Screen | Purpose | States Checked | Notes |
| --- | --- | --- | --- |
| Run Control shell | Shows local run list and active run detail | success | Static fixture-backed shell. |
| Run list | Selects active run | pending, blocked, in_progress | Uses hash links. |
| Route State | Shows route metadata and next action | success | Long text overflows in captured desktop view. |
| Approval State | Shows authority requirement and votes | pending, blocked | High Court correctly shown as non-binding. |
| Merlin Handoff | Shows eligibility and blockers | blocked, not eligible | No eligible fixture in current data. |
| Discord Alert Preview | Shows generated alert payload | success | Generated `appRunUrl` conflicts with hash router. |
| Action Packet Preview | Shows metadata-only local preview | success | No mutation or execution allowed. |
| Evidence Export Preview | Shows preview metadata | success | No live export enabled. |
| Drive Vault Plan Preview | Shows planned folders | success | Static preview only. |

## Devices / Viewports Tested
- Desktop: Chrome headless, `1440x1000`
- Mobile: Chrome headless, `390x844`
- CSS inspection: responsive breakpoint at `max-width: 820px`

## Browser(s) Tested
- Google Chrome headless from `C:\Program Files\Google\Chrome\Application\chrome.exe`
- PowerShell `Invoke-WebRequest` HTTP probes

Manual cross-browser compatibility was not completed in this lane. No Firefox, Safari, or Edge render pass was performed.

## Artifacts
- Desktop screenshot: `docs/qa/artifacts/2026-06-15-private-command-surface-desktop.png`
- Mobile screenshot: `docs/qa/artifacts/2026-06-15-private-command-surface-mobile.png`
- Headless DOM evidence for `/runs/tradescout-public-copy-002` showed `albion-ai-governance-001` rendered as the active page.

## Console / Network Observations
- Vite dev server started successfully at `http://127.0.0.1:5173/`.
- `GET /` returned HTTP 200.
- `GET /#/runs/tradescout-public-copy-002` returned HTTP 200.
- `GET /definitely-not-a-real-path` returned HTTP 200 through Vite SPA fallback.
- Build completed successfully.
- No live API calls exist in this app surface.
- No console-error capture was available beyond Chrome headless command output.

## QA Checklist Result
- User flows: checked.
- Screen inventory: checked.
- Buttons/clickables: run-list anchors checked by source and screenshot; no buttons present.
- Forms and validation: not applicable; no forms present.
- Loading / empty / error / success states: success state checked; empty state exists in renderer but is not reachable from current fixture flow; loading/error states not applicable because rendering is synchronous and local.
- Responsive layouts: checked; blocked by horizontal overflow.
- Visual consistency: partially checked; blocked by overflow.
- Navigation, deep links, and refresh behavior: checked; blocked by generated path links not matching hash router.
- Permissions and roles: no auth/permission layer present.
- Realistic messy data: fixture data includes pending approval, Knight rejection, missing evidence, missing forecast, long route text.
- Accessibility basics: landmarks and aria labels present; keyboard focus/contrast not fully audited by browser tooling.
- Browser compatibility: Chrome headless only.
- Session behavior: not applicable; no session layer present.
- API error handling: not applicable; no live API layer present.
- AI sloppiness checks: found route mismatch and responsive overflow.
- Feature-level checklist: completed for current private command surface.
- Bug priority classification: completed below.
- Final release check: BLOCKED.

## Bugs Found

### Critical
None found.

### High

#### UX-HIGH-001: Generated run URLs do not open the intended run
- Priority: High
- Flow: Open run detail from generated app run URL / Discord alert preview
- Environment: Vite dev server, Chrome headless, baseline `d9e823433f349dd2ab3b9323c2abee0414318336`

Reproduction steps:
1. Start the app with `npm run dev -- --port 5173`.
2. Open `http://127.0.0.1:5173/runs/tradescout-public-copy-002`.
3. Observe the active run in the rendered page.

Expected result:
- The app opens `tradescout-public-copy-002`.

Actual result:
- The app renders `albion-ai-governance-001` as the active run.

Evidence:
- `src/main.ts` reads active run IDs only from hash routes matching `#/runs/:id`.
- `src/albion/privateCommandSurface.ts` run-list links use `href="#/runs/{runId}"`.
- `src/albion/albionRunFlow.ts` builds `appRunUrl` as `/runs/{runId}`.
- Existing tests assert `/runs/{runId}` URLs.
- Headless DOM for `/runs/tradescout-public-copy-002` showed `albion-ai-governance-001` with `aria-current="page"`.

Impact:
- Alert links and direct run URLs can load the app but silently show the wrong run.
- This breaks navigation, deep links, and release trust for the main review workflow.
- Release blocker: yes.

Recommended fix lane:
- Critical/High UX Fixes.
- Align generated `appRunUrl` and router parsing. Either generate hash URLs or teach the app to parse path routes.
- Add a UI test proving `/runs/:id` and/or `#/runs/:id` opens the intended run.

#### UX-HIGH-002: Layout overflows horizontally on desktop and mobile
- Priority: High
- Flow: Review Run Control screen on desktop and mobile
- Environment: Chrome headless screenshots, baseline `d9e823433f349dd2ab3b9323c2abee0414318336`

Reproduction steps:
1. Start the app with `npm run dev -- --port 5173`.
2. Capture or open `http://127.0.0.1:5173/` at `1440x1000`.
3. Capture or open `http://127.0.0.1:5173/#/runs/tradescout-public-copy-002` at `390x844`.
4. Inspect horizontal overflow and clipped long text.

Expected result:
- Content wraps within the viewport with no horizontal page scrolling.
- Long run titles and route facts remain readable.

Actual result:
- Desktop screenshot shows horizontal page scroll and clipped route-state text.
- Mobile screenshot shows horizontal page scroll and run/detail titles clipped off-screen.

Evidence:
- Desktop artifact: `docs/qa/artifacts/2026-06-15-private-command-surface-desktop.png`
- Mobile artifact: `docs/qa/artifacts/2026-06-15-private-command-surface-mobile.png`
- CSS has responsive grid collapse at `max-width: 820px`, but long grid/link content still overflows.

Impact:
- Users cannot reliably scan run details on mobile.
- Important run title and route-state content can be cut off.
- Release blocker: yes.

Recommended fix lane:
- Critical/High UX Fixes.
- Add overflow-safe constraints for grid children, run-list items, and detail headers.
- Re-QA at desktop and mobile widths after the fix.

### Medium
None found in this audit.

### Low
None logged as release issues in this audit.

## DRY/SRP Observations
No DRY/SRP refactor was performed.

Watchlist for later planning:
- The private command surface renderer is a single string-rendering module with multiple responsibilities: shell, list, detail, votes, blockers, previews, and escaping.
- This is not a current release blocker because the active lane is UX QA evidence and there are High UX issues to fix first.

## Release Decision
BLOCKED.

New feature work remains blocked because two High UX bugs were found.

## Recommended Next Lane
Critical/High UX Fixes.

Scope recommendation:
- Fix path/hash deep-link mismatch.
- Fix responsive horizontal overflow.
- Add or adjust UI tests for both issues.
- Re-run QA on the affected flows before any DRY/SRP refactor or feature lane.

