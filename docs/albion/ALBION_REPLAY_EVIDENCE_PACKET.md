# Albion Replay Evidence Packet

## Purpose
`albion_queue_replay_evidence_packet_v1` is the contract packet for deterministic replay evidence snapshots in Albion OS. It records what queue replay produced, which prior state it came from, and what execution authority evidence is present.

This packet is contract-only evidence. It does not authorize runtime execution by itself.

## Required Fields
- `schemaVersion`: must be `albion_queue_replay_evidence_packet_v1`
- `evidencePacketId`
- `queueId`
- `replayId`
- `runId`
- `createdAt`
- `previousLedgerHash`
- `packetCount`
- `acceptedPacketCount`
- `rejectedPacketCount`
- `resultingLedgerPreview`
- `runApprovalPreview`
- `merlinHandoffPreview`
- `ledgerPreviewHash`
- `deterministicSummary`
- `executionAuthority`
- `exportHandoffPreview`
- `exportAllowed`: must be `false`
- `mutationAllowed`: must be `false`
- `executionAllowed`: must be `false`
- `liveIntegrationAllowed`: must be `false`

## Previous-State Link
Replay evidence is invalid without a deterministic previous-state link.

Required previous-state field:
- `previousLedgerHash`

Current-state field:
- `ledgerPreviewHash`

Rule:
- Replay evidence missing `previousLedgerHash` is rejected.
- The packet must preserve both the prior-state hash and the resulting-state hash.

## Execution Authority Evidence
`executionAuthority` records whether the replay evidence claims execution authority and what source that claim relies on.

Fields:
- `claimedForExecution`
- `authoritySource`: `none | high_court_advisory | roundtable_3_of_3`
- `approvalRequired`
- `approvalLevel`
- `requiredKnights`
- `approvals.Gawain`
- `approvals.Lancelot`
- `approvals.Percival`
- `mandateStatus`
- `approvedForMerlin` (legacy field meaning Roundtable human authority and Merlin eligibility gates are satisfied)
- `highCourtAdvisoryOnly`: must be `true`

Authority rules:
- High Court is advisory only.
- High Court-only input cannot grant execution authority.
- Execution authority claims require Roundtable 3/3 evidence.
- Valid execution authority requires:
  - `authoritySource = roundtable_3_of_3`
  - `approvalLevel = roundtable_3_of_3`
  - `mandateStatus = passed_3_of_3`
  - `approvedForMerlin = true` as a Roundtable-backed Merlin eligibility signal
  - `approvals.Gawain = approve`
  - `approvals.Lancelot = approve`
  - `approvals.Percival = approve`

## Unknown-Field Rule
Replay evidence validation is strict.

Rule:
- Unknown fields are rejected.
- Unknown fields must not be silently stripped.
- Validation must not mutate the input object.

## Rejection Rules
Replay evidence is rejected when:
- the packet shape is invalid
- the schema version is invalid
- `previousLedgerHash` is missing
- execution authority metadata is malformed
- execution authority is claimed from High Court-only input
- execution authority is claimed without complete Roundtable 3/3 evidence
- unknown fields are present

## Non-Goals
This packet does not:
- execute routes
- replay routes in production
- append to the run ledger
- alter approval processing
- enable exports, mutations, live integrations, or execution
- override Merlin, Roundtable, or High Court doctrine
