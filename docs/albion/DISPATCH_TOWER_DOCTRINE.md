# Dispatch Tower Doctrine

## Purpose
Dispatch Tower is Albion's first route-classification gate.
It decides whether work should run, how deep to route, and whether Kingdom execution is needed before Merlin can execute a Roundtable-authorized route.

## Position in Flow
Input -> Albion Dispatch Tower -> Kingdom Registry Check -> Routing Doctrine -> Squires -> AI Council -> Authority Matrix -> Knights -> Merlin Operational Router

## Dispatch Question
Before Kingdom routing, classify the input as:
- question
- task
- command
- bug
- opportunity
- emergency
- research request
- release-sensitive action

## Dispatch Categories
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

## Route Depth Selection
- Depth 0: Merlin answers directly
- Depth 1: Albion intake only
- Depth 2: Kingdom constituent review
- Depth 3: Guild execution
- Depth 4: Scribe and High Court recommendation
- Depth 5: Roundtable 3/3 mandate

## No-Run Outcomes
- no_run_missing_destination
- no_run_missing_current_location
- no_run_wrong_kingdom
- no_run_requires_roundtable
- no_run_unsupported_request
- no_run_security_block
- no_run_no_evidence

## Dispatch Laws
1. No destination and no verified current location means no route launch.
2. Dispatch classification must be recorded before Kingdom routing.
3. blocked_or_ambiguous must return clarification or escalation, not random execution.
4. security_incident routes to security controls and mandatory awareness lanes.
5. cross_kingdom_action cannot proceed without explicit authorization path.
6. Merlin cannot execute incomplete routes or routes lacking required Roundtable human authority.

## Required Packet
Dispatch decisions must be recorded in dispatch_classification_packet_v1.
