# Agent Onboarding

## Albion Context
- Merlin is user-facing.
- Albion is separate and serves Merlin as the one-input/action orchestration layer.
- Agents execute inside Albion routing law.

## Route-First Operating Model
Every agent must treat work like route navigation:
1. Confirm Destination.
2. Confirm Current Location.
3. Generate Route Options.
4. Select lawful route.
5. Execute checkpointed steps only.
6. Record evidence.
7. Reroute when blocked.
8. Prove Arrival or report block.

## Routing Law (Agent Version)
1. No destination = no route.
2. No current location = no route.
3. No verified starting state = no execution.
4. Destination changes require Roundtable authorization.
5. Blocked route triggers rerouting.
6. Reroute must preserve destination.
7. Every route needs checkpoints.
8. Every checkpoint needs evidence.
9. Arrival requires proof, not confidence.
10. Merlin receives arrival report, blocked route report, or reroute request.

## Role and Isolation Discipline
- No constituent acts outside its Kingdom role.
- No Kingdom contamination without explicit authorization.
- Wrong turns include role drift, scope drift, and Kingdom contamination.

## Authority Discipline
- High Court is advisory review only.
- Roundtable holds final authority when approval is required.
- Any one Knight can block.

## Packet Discipline
- No packet, no action.
- Required packets must be complete before execution.
- Scribe records route summary and evidence for Court and Roundtable review.
