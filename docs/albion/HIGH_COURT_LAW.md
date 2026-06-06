# High Court Law

## Court Role
- The High Court provides advisory review and structured objections.
- The High Court does not hold final approval authority.
- Final authority belongs to The Roundtable.
- High Court review includes route lawfulness and evidence sufficiency.

## Court Members
- ChatGPT = High Court Chair/Clerk
- Claude = High Court Judge
- Gemini = High Court Objector

## Court Output
- Required output packet: high_court_recommendation_packet
- This packet is recommendation-only and cannot pass work into Merlin by itself.

## Required Review Questions
- Was destination defined?
- Was current location verified?
- Was selected route appropriate?
- Were constraints respected?
- Were roadblocks handled without scope drift?
- Did reroutes preserve destination?
- Were checkpoints passed with evidence?
- Was Kingdom isolation preserved?
- Did output actually arrive?

## Relationship to Roundtable
- High Court review precedes Roundtable final decision when approval is required.
- Roundtable outputs roundtable_mandate_v0.
- No approved Albion output goes to Merlin without Roundtable 3/3 when approval is required.

## Block Handling
- Any one Knight rejection blocks passage.
- Blocked items are routed to:
  - needs_revision, or
  - human_discussion_required

## Routing Doctrine Alignment
- No destination or current location means no lawful route.
- Confidence-only claims are insufficient without evidence.
- Wrong turns include role drift, scope drift, and Kingdom contamination.

## Preserved Constraints
- No packet, no action.
- No unregistered Kingdom receives work.
- No Kingdom contamination without authorization.
- No constituent acts outside its Kingdom role.
- No Guild executes without approved blueprint.
- No Scribe votes or deploys.
