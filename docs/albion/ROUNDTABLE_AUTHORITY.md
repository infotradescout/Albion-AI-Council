# Roundtable Authority

## Supreme Approval Authority
- The Roundtable is the sole final approval authority for Albion decisions that require approval.
- The High Court is advisory and does not have final pass power.

## Knights (Exact and Exclusive)
- Gwaine (Thomas)
- Lancelot (Levon)
- Percival (Dylan)

No additional founder/Roundtable Knight seats are active.

## Knight Profile Doctrine
- The Knight names and authority are fixed.
- The Knight operating roles are not predefined by system doctrine.
- Each Knight's profile is defined through onboarding output.
- Source of truth packets:
  - roundtable_knight_profile_v1
  - roundtable_alignment_packet_v1

## Decision Rule
- Required threshold: 3/3 unanimous approval.
- Passage requires:
  - Gwaine = approve
  - Lancelot = approve
  - Percival = approve
- Any single reject blocks passage.

## Outcomes
- 3 approves: passed_3_of_3
- Any reject or not unanimous: blocked_not_unanimous
- Incomplete state: pending

## Required Packet
Roundtable decisions are recorded as roundtable_mandate_v1 and must include:
- schemaVersion
- inputId
- kingdomId
- roundtableDecision: approved | blocked | needs_revision | human_discussion_required
- requiredKnights: ["Gwaine", "Lancelot", "Percival"]
- approvals.Gwaine: approve | reject | abstain
- approvals.Lancelot: approve | reject | abstain
- approvals.Percival: approve | reject | abstain
- blockedBy[]
- conditions[]
- decisionNotes[]
- mandateStatus: passed_3_of_3 | blocked_not_unanimous | pending
- routeDecision:
  - destinationReached
  - startingPointVerified
  - routeLawful
  - checkpointsPassed
  - kingdomIsolationPreserved
  - approvedForMerlin

## Enforcement
- No approved Albion output goes to Merlin without Roundtable 3/3 when approval is required.
- Blocked items return for revision or human discussion.

## Route Governance Rules
- The destination cannot change without Roundtable authorization.
- A blocked route must return as reroute or human discussion, never random execution.
- Arrival must be evidenced before approvedForMerlin is true.

## Alignment Gate Before Major Approval
- Roundtable major-approval work must use onboarded Knight profiles.
- If profiles are missing or stale, decision status must be pending until profile alignment is complete.
