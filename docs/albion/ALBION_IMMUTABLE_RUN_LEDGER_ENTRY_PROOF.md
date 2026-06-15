# Albion Immutable Run Ledger Entry Proof

## Purpose
`albion_immutable_run_ledger_entry_proof_v1` is the contract proof for a single immutable Albion run ledger entry snapshot. It records the entry content, its deterministic link to the prior ledger state, and any claimed execution-authority evidence.

This proof is contract-only evidence. It does not append ledger entries, execute routes, route work, or grant authority by itself.

## Required Fields
- `schemaVersion`: must be `albion_immutable_run_ledger_entry_proof_v1`
- `runId`
- `ledgerEntry`
- `previousEntryHash`
- `entryHash`
- `proofHash`
- `proofCreatedAt`
- `proofActorId`
- `proofActionType`
- `authorityEvidence`

## Previous-State Link
Immutable entry proof is invalid without a deterministic previous-state link.

Required previous-state field:
- `previousEntryHash`

Current-state field:
- `entryHash`

Rules:
- Proof missing `previousEntryHash` is rejected.
- Proof missing `entryHash` is rejected.
- The proof must preserve both the prior-state hash and the current entry hash.

## Hash And Proof Rules
- `entryHash` must deterministically match the serialized `ledgerEntry` content.
- `proofHash` must deterministically match the proof metadata:
  - `runId`
  - `previousEntryHash`
  - `entryHash`
  - `proofCreatedAt`
  - `proofActorId`
  - `proofActionType`
  - authority claim summary fields
- A tampered entry is rejected when `entryHash` no longer matches deterministic serialized content.
- A proof missing `proofHash` is rejected.

## Authority Evidence Rule
`authorityEvidence` records whether the immutable entry proof claims execution authority and what source that claim relies on.

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
Immutable entry proof validation is strict.

Rules:
- Unknown fields are rejected.
- Unknown fields must not be silently stripped.
- Validation must not mutate the input object.

## Rejection Rules
Immutable entry proof is rejected when:
- the proof shape is invalid
- the schema version is invalid
- `previousEntryHash` is missing
- `entryHash` is missing
- `proofHash` is missing
- the entry hash no longer matches deterministic serialized content
- authority evidence metadata is malformed
- execution authority is claimed from High Court-only input
- execution authority is claimed without complete Roundtable 3/3 evidence
- unknown fields are present

## Non-Goals
This proof does not:
- append to the run ledger
- mutate ledger entries
- implement runtime execution
- implement route replay
- alter approval processing
- alter Merlin handoff behavior
- enable exports, mutations, live integrations, or execution
- override Merlin, Roundtable, or High Court doctrine
