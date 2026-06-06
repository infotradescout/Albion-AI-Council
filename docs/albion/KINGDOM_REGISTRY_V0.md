# Kingdom Registry V0

## Purpose
The Kingdom Registry is Albion's required control point for routing work.
No unregistered Kingdom receives work.

## Registry Rule
- Every work item must declare kingdomId.
- kingdomId must match a registered Kingdom entry.
- Constituents and Guilds may only execute within their registered Kingdom scope.
- Cross-Kingdom contamination is prohibited unless explicitly authorized.

## Active Kingdoms (Current)
- TradeScout
- MealScout
- Community Builders
- Scoutfitters
- sway.tips
- HomeScout
- PriceScout
- Continuum
- LISA
- AutoBott
- Albion Core

Merlin boundary rule:
- Merlin is separate and user-facing.
- Merlin is not a Kingdom.
- Merlin is not listed in the Kingdom Registry.
- Albion serves Merlin and returns clean action/release packets to Merlin.

## Governance Flow
1. Intake packet with kingdomId
2. Kingdom routing and constituent checks
3. Guild execution preparation
4. Scribe packaging
5. High Court advisory review (high_court_recommendation_packet)
6. Roundtable final mandate (roundtable_mandate_v0)
7. Clean output to Merlin when approved

## Approval Separation
- High Court is advisory only.
- Roundtable is final authority where approval is required.
- 3/3 unanimous Knight approval is required:
  - Gwaine
  - Lancelot
  - Percival
- Any one Knight rejection blocks passage.
- Blocked items return for revision or human discussion.

## Preserved Laws
- No packet, no action.
- No unregistered Kingdom receives work.
- No Kingdom contamination without authorization.
- No constituent acts outside its Kingdom role.
- No Guild executes without approved blueprint.
- No Scribe votes or deploys.
- Merlin is separate and user-facing.
- Albion serves Merlin.
- Albion returns clean output to Merlin.
