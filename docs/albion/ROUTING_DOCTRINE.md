# Routing Doctrine

## Purpose
Albion solves work like Google Maps routing:
- define the destination
- verify the current location
- map route options
- identify traffic and roadblocks
- choose the safest lawful route
- validate checkpoints
- reroute when blocked
- prove arrival

Routing starts only after Dispatch Tower classification.

## Routing Terms
- Destination = end goal and desired state
- Current Location = Square 1 and verified starting state
- Route Options = possible execution plans
- Selected Route = chosen plan
- Traffic = blockers, risk, missing data
- Road Closure = hard blocker
- Detour = workaround
- Checkpoint = validation and test gate
- Arrival = successful output packet
- Wrong Turn = role drift, scope drift, Kingdom contamination
- Rerouting = remediation path

## Routing Laws
1. No destination = no route.
2. No current location = no route.
3. No verified starting state = no execution.
4. The destination cannot change without Roundtable authorization.
5. A blocked route triggers rerouting, not random work.
6. A reroute must preserve the destination.
7. Every route needs checkpoints.
8. Every checkpoint needs evidence.
9. Arrival requires proof, not confidence.
10. Merlin receives an arrival report, blocked route report, or reroute request.

## Albion Routing Flow
1. Dispatch Tower classifies the input and route depth.
2. Intake declares Destination and Current Location.
3. Kingdom routing validates scope and isolation.
4. Constituents and Guilds generate Route Options.
5. Selected Route is recorded with required Checkpoints.
6. Scribe records route summary and evidence.
7. High Court performs advisory route-lawfulness review when required.
8. Roundtable issues final mandate when required by authority level.
9. Albion sends Merlin one of: arrival report, blocked route report, reroute request.

## Route Depth Model
- Depth 0: Merlin answers directly (no Albion run)
- Depth 1: Albion intake only
- Depth 2: Kingdom constituent review
- Depth 3: Guild execution
- Depth 4: Scribe and High Court recommendation
- Depth 5: Roundtable 3/3 mandate

## No-Run Outcomes
If route prerequisites fail, Albion must return a no-run state:
- no_run_missing_destination
- no_run_missing_current_location
- no_run_wrong_kingdom
- no_run_requires_roundtable
- no_run_unsupported_request
- no_run_security_block
- no_run_no_evidence

## Route Integrity Rules
- Wrong turns are tracked as drift events.
- Drift requires remediation before route completion.
- No route may violate Kingdom isolation law.
- No route may proceed without packet evidence.

## Authority Alignment
- High Court is advisory only.
- Roundtable is final authority where approval is required.
- Any one Knight can block route passage.
