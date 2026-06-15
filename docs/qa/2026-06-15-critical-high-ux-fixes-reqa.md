# Critical/High UX Fixes Re-QA

## Summary
- Repo: AI Council / Albion
- Lane: Critical/High UX Fixes
- Branch: doctrine/gemini-pass-routing-accelerator
- Baseline SHA: 101efa1a51c57da34422ad5ef2a07c2d67c00635
- Date: 2026-06-15
- Previous QA result: BLOCKED
- Re-QA result: READY WITH WATCHLIST

This re-QA verifies the two High blockers from `docs/qa/2026-06-15-current-product-ux-qa-audit.md`.

## Gemini Pre-Flight
Gemini pre-flight verdict supplied by the user: PASS WITH CONDITIONS.

The referenced local file `docs/qa/2026-06-15-albion-ux-fixes-preflight.md` was not present in the workspace during Codex execution, so this lane used the user-provided Gemini verdict text as the governing pre-flight record.

Conditions observed:
- No governance, consensus, Merlin core execution, schema, authority, or doctrine files were modified.
- Runtime changes were limited to client routing and layout CSS.
- No DRY/SRP refactor was performed.
- No new features were added.

## Fixes Verified

### UX-HIGH-001: Generated run URLs do not open the intended run
Status: fixed.

Fix:
- `src/main.ts` now parses both hash-router links (`#/runs/:id`) and generated app URLs (`/runs/:id`).
- Hash routes remain preferred when both hash and path are present.

Regression evidence:
- `tests/albion-private-command-surface.test.ts` now verifies hash links, generated path links, and hash-precedence behavior.
- Chrome headless DOM for `http://127.0.0.1:5173/runs/tradescout-public-copy-002` showed:
  - `tradescout-public-copy-002` as `aria-current="page"`
  - run detail eyebrow `tradescout-public-copy-002`
  - Discord alert preview still preserving `/runs/tradescout-public-copy-002`

### UX-HIGH-002: Layout overflows horizontally on desktop and mobile
Status: fixed.

Fix:
- `src/styles.css` now constrains the shell, grid, run list, run detail, grid children, list item spans, and preview blocks with targeted width/min-width/max-width and wrapping rules.
- Mobile run-list items use block flow to prevent title/meta/status crowding.

Regression evidence:
- `tests/albion-private-command-surface.test.ts` includes a layout containment CSS regression check.
- Desktop re-QA screenshot shows the deep-linked run and wrapped route-state text without horizontal page overflow.
- Narrow/mobile re-QA screenshot shows run titles and detail heading wrapping without clipping.

## Re-QA Artifacts
- Desktop: `docs/qa/artifacts/2026-06-15-private-command-surface-desktop-reqa.png`
- Narrow/mobile: `docs/qa/artifacts/2026-06-15-private-command-surface-mobile-reqa.png`

## Screens / Flows Re-Audited
1. Open `/runs/tradescout-public-copy-002` directly from a generated app URL.
2. Open `#/runs/tradescout-public-copy-002` through the current hash-router path.
3. Review run list, route state, approval state, Merlin handoff section, and Discord alert preview on desktop.
4. Review run list and run detail header on narrow/mobile viewport.

## Remaining Watchlist
- Chrome `--window-size=390` screenshot capture appeared to crop a wider headless layout viewport. The final narrow/mobile artifact was captured at `500x844`, which reflected Chrome's stable headless layout behavior in this workspace.
- Manual cross-browser testing outside Chrome headless was not performed.
- The private command surface remains a static fixture-backed P0 surface with no auth/session/forms/live API behavior to QA.
- DRY/SRP cleanup remains blocked until UX fix acceptance and merge posture are complete.

## Release Decision
READY WITH WATCHLIST.

The two High blockers found in the previous QA audit are resolved in local re-QA. New feature work should still wait for Gemini audit/Gawain acceptance of this fix lane.

