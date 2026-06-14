# Founder Onboarding

## What Albion Is
- Albion is the full Kingdom operating system.
- Merlin is the OR / Operational Router inside Albion.
- Squires gather information.
- AI Council organizes, challenges, and prepares routes.
- Knights approve or deny.
- Merlin executes routes only after Roundtable human authority is satisfied and Merlin eligibility checks pass.
- Do not describe Albion as the OR.

## Routing Doctrine Primer
Albion runs like route navigation:
- Destination = required end state
- Current Location = verified start state
- Route Options = candidate plans
- Selected Route = chosen lawful plan
- Traffic and Roadblocks = risks and blockers
- Checkpoints = evidence gates
- Arrival = proven output packet
- Rerouting = lawful adjustment that preserves destination

## Authority Structure
- The Roundtable is the final approval authority.
- The High Court is advisory/review only.
- The High Court cannot grant final passage.

## Roundtable Composition (Exact)
- Thomas = Gawain
- Levon = Lancelot
- Dylan = Percival

There are exactly 3 Knights in the founder/Roundtable layer.

## Knight Role Definition Rule
- Knight names are fixed.
- Knight authority is fixed.
- Knight operating roles are not assumed.
- Roles, lanes, strengths, evidence needs, approval criteria, and blocking criteria are defined by onboarding.
- Onboarding profile packets are source of truth.

## Approval Law
For decisions that require approval:
- All 3 Knights must approve.
- Any one Knight rejection blocks passage.
- Blocked work returns for revision or human discussion.
- No route goes to Merlin eligibility review without Roundtable 3/3.

## High Court Composition
- ChatGPT = High Court Chair/Clerk
- Claude = High Court Judge
- Gemini = High Court Objector

High Court output is a recommendation packet only:
- high_court_recommendation_packet_v1

Roundtable profile packets:
- roundtable_knight_profile_dynamic_v1
- roundtable_alignment_packet_dynamic_v1

Profile lifecycle rule:
- The first onboarding output is the starting profile, not final truth.
- Profiles update from approvals, blocks, deferrals, corrections, repeated patterns, evidence requirements, and format preferences.
- Material profile updates must cite sourceRunId or sourceDecisionId.
- Alignment must refresh after material profile changes.

## Mandatory Operating Chain
1. Intake packet v1 includes destination and currentLocation
2. Kingdom routing validated
3. Route options defined and selected route recorded
4. Constituent and Guild execution prepared
5. Scribe route summary and evidence packet assembled
6. High Court advisory route review
7. Roundtable mandate decision
8. Merlin executes the Roundtable-authorized route or rejects incomplete work back to Council/human review

## Routing Laws (Founder Baseline)
1. No destination = no route.
2. No current location = no route.
3. No verified starting state = no execution.
4. Destination changes require Roundtable authorization.
5. Blocked route triggers reroute, not random work.
6. Reroutes preserve destination.
7. Every route needs checkpoints.
8. Every checkpoint needs evidence.
9. Arrival requires proof, not confidence.
10. No approval = no execution.
11. Merlin receives route outcome reporting.
12. Merlin cannot invent missing facts, approve final authority, or override Knights.

## Non-Negotiable Laws
- No packet, no action.
- No unregistered Kingdom receives work.
- No Kingdom contamination without authorization.
- No constituent acts outside its Kingdom role.
- No Guild executes without approved blueprint.
- No Scribe votes or deploys.

## Founder Execution Order
1. Run Roundtable Knight Onboarding Prompt separately for Thomas, Dylan, and Levon.
2. Produce three roundtable_knight_profile_dynamic_v1 packets.
3. Run Roundtable Alignment Prompt.
4. Produce roundtable_alignment_packet_dynamic_v1.
5. After meaningful decisions, run profile updates with sourceRunId or sourceDecisionId.
6. Refresh alignment when any Knight profile changes materially.
7. Only then proceed with Kingdom and constituent expansion work.
