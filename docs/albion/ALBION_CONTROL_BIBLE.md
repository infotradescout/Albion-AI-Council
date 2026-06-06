# Albion Control Bible

## Realm Separation
- Merlin remains separate from Albion.
- Merlin is user-facing.
- Albion is Merlin's one-input/action orchestration layer.
- Albion serves Merlin and returns clean output to Merlin.

## Dispatch Tower
Dispatch Tower is the first Albion gate after Merlin.

Flow:
1. Merlin input enters Albion Dispatch Tower.
2. Dispatch classifies input type and required route depth.
3. Dispatch chooses no-run, direct answer, or Kingdom-routed execution.
4. Only then does Kingdom routing begin.

Dispatch categories:
- answer_only
- intake_needed
- kingdom_action
- cross_kingdom_action
- research_required
- code_execution_required
- review_required
- release_sensitive
- security_incident
- human_roundtable_required
- blocked_or_ambiguous

## Routing Doctrine
Albion treats execution as route planning and lawful navigation:
1. Define Destination.
2. Verify Current Location.
3. Compare Route Options.
4. Select lawful route.
5. Run checkpoint evidence gates.
6. Reroute on block without changing destination.
7. Prove Arrival before release.

## Core Routing Chain
Albion routes work through:
1. Dispatch Tower
2. Kingdom Registry and Kingdom routing
3. Routing Doctrine
4. Authority Matrix
5. Kingdom Constituents
6. Guild execution
7. The Scribe
8. The High Court review
9. The Roundtable final authority
10. Albion manifest output to Merlin

## Priority and Triage
Every run must declare triage:
- priority: P0 | P1 | P2 | P3 | P4
- urgencyReason
- deadline
- blastRadius: single_user | kingdom | cross_kingdom | production
- revenueImpact: none | low | medium | high | critical

Triage law:
- P0 and P1 require explicit Roundtable awareness.
- P3 and P4 cannot preempt active revenue-critical lanes.

## Authority Matrix
Approval levels are explicit and not all work requires 3/3.

Roundtable 3/3 required for:
- production release
- cross-Kingdom access
- pricing or business model changes
- security-sensitive changes
- legal or compliance-sensitive changes
- irreversible data changes
- public customer-facing promise changes
- core Albion law changes

Single sponsor allowed for:
- intake packet cleanup
- Kingdom-local planning
- documentation draft
- non-release research
- constituent onboarding
- backlog organization

Authority field:
- approvalRequired
- approvalLevel: single_sponsor | roundtable_3_of_3
- approvalReason

## Evidence Law
Every claim must carry evidence type:
- observed
- tested
- sourced
- inferred
- assumed
- unverified
- blocked

Non-negotiable:
- No evidence = no claim.
- No test artifact = no test pass claim.
- No source = no research claim.
- No deploy log = no deployment claim.

## Budget Governor
Every run has an explicit budget:
- maxAgents
- maxCouncilCycles
- maxSandboxAttempts
- maxContextTokens
- maxWallClockTier: short | medium | long
- allowLargeContextModel

## Memory Retrieval Rules
Before action, Albion asks:
- Have we solved this before?
- Is there a Chronicle summary?
- Is there a prior blocker?
- Is there a Kingdom law?
- Is there a previous Roundtable decision?

Retrieval order:
1. Current input packet
2. Kingdom Registry
3. Active project docs
4. Chronicle summaries
5. Ledger mandates
6. Armory raw artifacts only if needed

Key rule: retrieve summaries first, raw logs last.

## Contradiction Gate
Before execution, Albion checks for conflict with:
- Kingdom law
- Roundtable law
- prior mandate
- current user instruction
- brand isolation

Blocking contradictions require explicit resolution owner.

## Rollback and Undo Law
Every action answers:
- Can this be undone?
- How?
- Who authorizes undo?
- What evidence proves rollback?

## Merlin Output Quality Contract
Every final output sent to Merlin must include:
- Decision
- Route taken
- Evidence
- What changed
- What is blocked
- Next action
- Who must approve

## No-Run Outcomes
Albion must return explicit no-run states instead of fake progress:
- no_run_missing_destination
- no_run_missing_current_location
- no_run_wrong_kingdom
- no_run_requires_roundtable
- no_run_unsupported_request
- no_run_security_block
- no_run_no_evidence

## Reusable Route Templates
Albion should use a route library before creating net-new routes:
- bug_fix_route
- feature_planning_route
- admin_ui_cleanup_route
- data_import_route
- security_patch_route
- market_research_route
- founder_decision_route
- deployment_route
- blocked_investigation_route

## Operational Tooling Baseline
- Schema validation is required before packet acceptance.
- Run Ledger is required for run tracking.
- Founder Approval Board is required for approval visibility.
- Kingdom Registry Sheet is required as source of truth.
- Prompt Library is required to prevent prompt drift.
- Red-Team checklist is required before high-risk approvals.
- Decision log is required for durable founder decisions.
- Agent scorecard is required for quality control.

## Route Laws
- No destination, no route.
- No current location, no route.
- No verified starting state, no execution.
- Destination changes require Roundtable authorization.
- A blocked route triggers rerouting, not random work.
- Every route needs checkpoints and checkpoint evidence.
- Arrival requires proof, not confidence.
- Merlin receives one of: arrival report, blocked route report, reroute request.

## Final Authority
- Final approval authority belongs to The Roundtable, not the AI High Court.
- Albion has exactly 3 Knights in the founder/Roundtable layer:
  - Thomas = Gawain
  - Levon = Lancelot
  - Dylan = Percival
- Knight names are fixed and authority is fixed.
- Knight operating roles are not predefined and must be extracted from onboarding.
- Knight profiles are produced by onboarding and are source of truth.
- Nothing passes when approval is required unless all 3 Knights approve.
- Required approvals:
  - Gawain approve
  - Lancelot approve
  - Percival approve
- Any single Knight rejection blocks passage.
- Blocked items return for revision or human discussion.
- No approved Albion output goes to Merlin without Roundtable 3/3 when approval is required.

## High Court Role
- The High Court is advisory/review only.
- The High Court does not hold final approval authority.
- High Court roles:
  - ChatGPT = High Court Chair/Clerk
  - Claude = High Court Judge
  - Gemini = High Court Objector
- High Court output packet: high_court_recommendation_packet_v1

## Roundtable Output
- Roundtable output packet: roundtable_mandate_v1
- Roundtable profile packets:
  - roundtable_knight_profile_dynamic_v1
  - roundtable_alignment_packet_dynamic_v1
- Mandate decisions govern final pass/block status.
- Mandate includes routeDecision:
  - destinationReached
  - startingPointVerified
  - routeLawful
  - checkpointsPassed
  - kingdomIsolationPreserved
  - approvedForMerlin

## Preserved Albion Laws
- No packet, no action.
- No unregistered Kingdom receives work.
- No Kingdom contamination without authorization.
- No constituent acts outside its Kingdom role.
- No Guild executes without approved blueprint.
- No Scribe votes or deploys.
- Merlin is separate and user-facing.
- Albion serves Merlin.
- Albion returns clean output to Merlin.
