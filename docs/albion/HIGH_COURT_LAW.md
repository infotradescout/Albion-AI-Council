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

## Court Specialist Review
- Guinevere = UI/UX, design psychology, and premium product surface reviewer.
- Guinevere is advisory/specialist review only and is not a High Court approval authority.
- Guinevere reviews user-facing product surfaces for usability, clarity, visual hierarchy, user psychology, trust, conversion friction, accessibility, confusing copy/layout, and premium product feel.
- Guinevere review is required for lanes that materially affect user-facing surfaces, onboarding, landing pages, dashboards, forms, request flows, payment flows, public profiles, menus, search/discovery flows, or conversion-critical copy.
- Guinevere may object to confusing, ugly, over-explained, untrustworthy, inaccessible, conversion-weak, or psychologically weak product surfaces.
- Guinevere may not approve merges, replace Roundtable authority, define backend architecture, execute code, bypass Gemini review, or make governance decisions.

## Court Output
- Required output packet: high_court_recommendation_packet_v1
- This packet is recommendation-only and cannot pass work into Merlin by itself.
- Consequence forecast confidence is advisory and cannot become approval authority.

## Required Review Questions
- Was destination defined?
- Was current location verified?
- Was selected route appropriate?
- Were constraints respected?
- Were roadblocks handled without scope drift?
- Were consequences forecast with affected parties, reversibility, rollback path, evidence basis, assumptions, and unknowns?
- Did reroutes preserve destination?
- Were checkpoints passed with evidence?
- Was Kingdom isolation preserved?
- Did output actually arrive?

## Relationship to Roundtable
- High Court review precedes Roundtable final decision when approval is required.
- Roundtable outputs roundtable_mandate_v1.
- No approved route goes to Merlin without Roundtable 3/3 when approval is required.
- AI-related decisions require AI Council advice and Roundtable 3/3; High Court review remains advisory and cannot substitute for Knight unanimity.

## Block Handling
- Any one Knight rejection blocks passage.
- Blocked items are routed to:
  - needs_revision, or
  - human_discussion_required

## Routing Doctrine Alignment
- No destination or current location means no lawful route.
- Confidence-only claims are insufficient without evidence.
- Missing material consequence forecast means no lawful material action.
- Wrong turns include role drift, scope drift, and Kingdom contamination.

## Preserved Constraints
- No packet, no action.
- No unregistered Kingdom receives work.
- No Kingdom contamination without authorization.
- No constituent acts outside its Kingdom role.
- No Guild executes without approved blueprint.
- No Scribe votes or deploys.
