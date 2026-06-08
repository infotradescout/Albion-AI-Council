# Albion OS MVP Run Flow Plan

## Summary
Albion OS moves from a doctrine-first repository into a working MVP run flow. The first implementation slice stabilizes authority rules, route-state rules, approval rules, evidence tracking, Discord alert payloads, and Merlin handoff gates before any dashboard polish.

The MVP is a coordination and approval operating system. It is not an AI executor.

Core flow:
Intake -> Dispatch classification -> Packet checklist -> Evidence and consequence forecast -> High Court advisory review when required -> Roundtable approval when required -> Merlin handoff only after approval.

## MVP Goal
Build the minimum reliable operating path that can:
- classify work by route depth and authority requirement
- preserve AI Unanimity Law
- prepare agent coordination packets without executing AI agents
- track evidence and approval state
- alert through Discord without making Discord the approval authority
- generate Merlin handoff eligibility only for approved complete routes

## Canonical Doctrine Baseline
Canonical doctrine files:
- `ALBION_CONTROL_BIBLE.md`
- `AUTHORITY_MATRIX.md`
- `ROUNDTABLE_AUTHORITY.md`
- `ALBION_PACKET_FORMATS.md`
- `KINGDOM_REGISTRY_V0.md`
- `ROUTING_DOCTRINE.md`

Hard doctrine preserved:
- AI-related decisions require Gawain + Lancelot + Percival unanimous 3/3 approval.
- High Court is advisory only and cannot approve work.
- Discord cannot be the primary approval authority.
- Merlin receives only approved complete routes.
- The MVP coordinates AI agents through packets, prompts, assignments, status, and evidence, but does not directly execute AI agents.

## Operating Architecture
- Next.js app on Render is the future private command surface.
- Google Sheets is the MVP structured operating ledger/source of truth for runs, approvals, statuses, blockers, and audit rows.
- Google Drive is the evidence vault for packet exports, artifacts, screenshots, reports, generated docs, and final Merlin handoffs.
- Discord sends alerts and command pings only.
- Merlin is the downstream execution recipient only after approved complete handoff gates pass.

## MVP Interfaces
Primary MVP interfaces:
- intake creation
- run state tracking
- evidence attachment records
- approval state records
- Discord alert payloads
- Drive folder plans
- Merlin handoff eligibility checks

The first slice uses deterministic local functions and tests only. It does not call external services.

## Google Sheets Ledger Tabs
### Runs
- runId
- kingdomId
- destination
- currentLocationSummary
- routeDepth
- priority
- status
- sponsor
- nextAction

### Approvals
- runId
- Gawain
- Lancelot
- Percival
- blockedBy
- mandateStatus
- decisionNotes
- decidedAt

### Evidence
- runId
- evidenceType
- description
- driveFileUrl
- source
- addedBy
- addedAt

### AuditLog
- runId
- actor
- action
- before
- after
- timestamp

### MerlinHandoffs
- runId
- status
- approvedForMerlin
- handoffDriveUrl
- responseType

## Google Drive Evidence Vault Structure
Drive folder plan for each run:
- `/Albion OS/Runs/{runId}/packets`
- `/Albion OS/Runs/{runId}/evidence`
- `/Albion OS/Runs/{runId}/court-review`
- `/Albion OS/Runs/{runId}/roundtable-mandate`
- `/Albion OS/Runs/{runId}/merlin-handoff`

## App Workflow
1. Create intake from the app or a Discord command.
2. Classify with Dispatch Tower fields.
3. Generate required packet checklist from route depth and authority level.
4. Attach evidence and consequence forecast.
5. Prepare High Court advisory packet when required.
6. Send Roundtable approval request when required.
7. Require unanimous 3/3 for AI-related or other major decisions.
8. Produce Merlin handoff only when mandateStatus is passed_3_of_3 and approvedForMerlin is true.
9. Record blocked, needs_revision, reroute_required, or human_discussion_required when approval fails.

## Discord Integration
Discord is used for:
- intake confirmations
- approval-needed alerts
- blocked-route alerts
- Merlin-ready notifications
- links back to the app run detail page

Discord is not used as the primary approval authority in the MVP.
MVP approval decisions happen in the app, not Discord.

## Merlin Handoff Gate
Merlin handoff is allowed only when:
- the route has a destination
- current location is verified
- required evidence is represented in the run record
- required consequence forecast is complete
- required approval is satisfied
- AI-related work has passed Roundtable 3/3
- no Knight rejection is active
- High Court output is advisory only

No approved mandate means no Merlin handoff.

## Test Plan
Contract tests must verify:
- AI-related routes always require `roundtable_3_of_3`.
- High Court output cannot mark work approved.
- No Merlin handoff can be created without required approval.
- A low-risk draft run can proceed with single-sponsor preparation when no Roundtable approval is required.
- An AI-governance run requires all three Knights.
- One Knight rejection blocks the route.
- All three Knight approvals make Merlin handoff eligible.
- Drive evidence attachment is represented in the run record.
- Discord approval-needed and blocked alerts link back to the correct run.

## Non-Goals
- No dashboard UI in the first stabilization slice.
- No direct AI execution.
- No Google API calls.
- No Discord API calls.
- No generated or sample production data.
- No Discord-only approval.
- No High Court approval authority.
- No Merlin handoff without required approval.
- No cross-wiring Albion with TradeScout, MealScout, Trader's Corner, or other Kingdoms.

## Assumptions
- TypeScript + Vitest is the minimal test foundation for contract coverage.
- Google Sheets remains the MVP structured operating ledger.
- Google Drive remains the evidence vault.
- Discord remains the alert and command-ping layer.
- The first app version will be a private Next.js app deployed on Render after P0/P1/P2 are stable.
