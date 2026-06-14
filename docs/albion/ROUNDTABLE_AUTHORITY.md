# Roundtable Authority

## Supreme Approval Authority
- The Roundtable is the sole final approval authority for Albion decisions that require approval.
- Roundtable is the human authority layer for the three Knights, dispatch, human input, and future human-facing output.
- Albion defines the law. Roundtable holds human authority. AI Council advises and objects. Merlin transports and executes only after authority is satisfied.
- The High Court is advisory and does not have final pass power.

## Knights (Exact and Exclusive)
- Gawain (Thomas)
- Lancelot (Levon)
- Percival (Dylan)

No additional founder/Roundtable Knight seats are active.

## Court Specialist Role
- Guinevere is a Court specialist, not a Roundtable Knight.
- Guinevere's role is UI/UX and behavioral design reviewer.
- Guinevere reviews user-facing product surfaces for usability, clarity, visual hierarchy, user psychology, trust, conversion friction, accessibility, confusing copy/layout, and premium product feel.
- Guinevere may object to confusing, ugly, over-explained, untrustworthy, inaccessible, conversion-weak, or psychologically weak product surfaces.
- Guinevere may not approve merges, override Roundtable authority, define backend architecture, execute code, bypass Gemini review, or make governance decisions.
- Guinevere review is required when a lane materially affects user-facing surfaces, onboarding, landing pages, dashboards, forms, request flows, payment flows, public profiles, menus, search/discovery flows, or conversion-critical copy.

## Knight Profile Doctrine
- The Knight names and authority are fixed.
- The Knight operating roles are not predefined by system doctrine.
- Each Knight's profile is defined through onboarding output and observed decisions over time.
- Source of truth packets:
  - roundtable_knight_profile_dynamic_v1
  - roundtable_alignment_packet_dynamic_v1

## Dynamic Profile Law
- The onboarding profile is a starting point, not permanent truth.
- Profiles update from approvals, blocks, deferrals, direct corrections, repeated patterns, and evidence requirements.
- Profile updates must cite sourceRunId or sourceDecisionId.
- Profiles are versioned and historical updates are preserved.

## Decision Rule
- Required threshold: 3/3 unanimous approval.
- Passage requires:
  - Gawain = approve
  - Lancelot = approve
  - Percival = approve
- Any single reject blocks passage.

## AI Unanimity Law
- AI-related decisions always require Roundtable 3/3 unanimous approval.
- The 3/3 law belongs to Roundtable as human authority, not to the AI Council.
- This includes AI strategy, AI agent behavior, AI authority, AI execution, AI safety, and AI-governance changes.
- Individual Knight authority and 2/3 approval are not valid for AI-related decisions.
- The AI Council must advise, challenge, prepare route options, and surface consequence forecasts before the Roundtable decides.
- Once unanimously approved, AI work executes through the appropriate agents, guilds, or Merlin route rather than by unilateral action.

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
- requiredKnights: ["Gawain", "Lancelot", "Percival"]
- approvals.Gawain: approve | reject | abstain
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
- No approved route goes to Merlin without Roundtable 3/3 when approval is required.
- Blocked items return for revision or human discussion.
- No AI-related route goes to Merlin or any executing agent without Roundtable 3/3.

## Route Governance Rules
- The destination cannot change without Roundtable authorization.
- A blocked route must return as reroute or human discussion, never random execution.
- Arrival must be evidenced before approvedForMerlin is true.

## Alignment Gate Before Major Approval
- Roundtable major-approval work must use onboarded Knight profiles.
- If profiles are missing or stale, decision status must be pending until profile alignment is complete.
- If a Knight profile changes materially, roundtable_alignment_packet_dynamic_v1 must be refreshed before major approval.
