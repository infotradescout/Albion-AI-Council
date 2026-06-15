# QA + DRY Release Gate

## Purpose
This release gate locks Zachary's QA-first engineering direction into the Albion AI Council workflow.

Source grounding:
- Build in steps.
- QA each step.
- Approve and merge before moving on.
- Fix broken or confusing behavior before adding new features.
- Clean duplicated or oversized code after QA exposes the real risk.

This is a process gate only. It does not authorize runtime refactors, feature work, automation expansion, Gemini capability expansion, Merlin authority inference, or schema migration.

## Required Work Order
Every product-facing lane must follow this order:

1. QA the current UX and behavior.
2. Fix critical and high issues found by QA.
3. Perform DRY/SRP cleanup only after behavior is understood.
4. Re-QA the changed flows.
5. Then consider new features.

Do not start a feature lane when the affected user flow still has untriaged QA failures, unclear states, duplicated critical logic, or oversized files that make the change unsafe.

## Release Gate Checklist
A lane is not release-ready until these are true:

- User flow is identified from entry point to completion.
- Screen inventory is complete for the affected flow.
- Clickable elements have been manually or programmatically checked.
- Forms cover validation, disabled states, submit behavior, error behavior, and success behavior.
- Loading, empty, error, and success states are present where applicable.
- Navigation and back/forward behavior are checked.
- Mobile, tablet, and desktop layouts are checked.
- Visual consistency is checked against the current app surface.
- Permissions and session states are checked when relevant.
- Realistic data has been used for QA, not only ideal placeholder data.
- Accessibility basics are checked: labels, focus order, keyboard use, contrast, and visible errors.
- Browser compatibility is checked for the supported browser set.
- Console and network panels have no unexplained errors in the tested flow.
- API failure behavior is checked when the flow depends on network calls.
- AI-generated UI is checked for hidden sloppy states, duplicated logic, dead buttons, and confusing copy.
- Bugs are logged with reproduction steps and priority.
- Critical and high bugs are fixed before feature expansion.
- Re-QA is completed after fixes.

## DRY/SRP Gate
DRY/SRP cleanup follows QA. It does not replace QA.

Start a DRY/SRP refactor plan when QA or inspection finds:

- Oversized files that hide unrelated responsibilities.
- Repeated server `try/catch` blocks.
- Raw `fetch()` calls that bypass the standard request helper.
- Duplicated formatters or display helpers.
- Repeated validation or permission checks.
- Components that mix data access, transformation, rendering, and side effects.

Known Zachary watchlist targets for future refactor planning:

- `admin-dashboard.tsx`
- `parking-pass.tsx`
- `shared/schema/legacy.ts`
- `server/storage.ts`
- repeated server `try/catch` blocks
- raw `fetch()` bypasses where `apiRequest()` should be used
- duplicated formatters

These are planning targets only in this lane. Do not refactor them without a separate approved implementation lane.

## Priority Rules
- Critical: user cannot complete the main flow, data is lost, payment/trust/security is affected, or production is blocked.
- High: flow works only with confusion, broken responsive behavior, major visual trust damage, missing error handling, or duplicated code creates high change risk.
- Medium: rough edge, inconsistent copy, minor state gap, or maintainability issue not blocking near-term work.
- Low: polish, cleanup, naming, or small consistency improvement.

Critical and high issues block feature work in the affected flow.

## Required Lane Return
QA and DRY gate lanes must report:

- flow or files inspected
- QA method used
- bugs found by priority
- fixes made
- DRY/SRP risks found
- refactors intentionally deferred
- validation run
- remaining release blockers
