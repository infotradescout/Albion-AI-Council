# Authority Matrix

## Purpose
The Authority Matrix determines who can approve what, and when Roundtable 3/3 is mandatory.

## Authority Field Shape
- approvalRequired
- approvalLevel: single_sponsor | roundtable_3_of_3
- approvalReason

## Roundtable 3/3 Required
The following require unanimous approval from Gawain, Lancelot, and Percival:
- AI strategy, AI agent behavior, AI authority, AI execution, AI safety, or AI-governance changes
- production release
- cross-Kingdom access
- pricing or business model changes
- security-sensitive changes
- legal or compliance-sensitive changes
- irreversible data changes
- public customer-facing promise changes
- core Albion law changes

## Single Sponsor Allowed
- intake packet cleanup
- Kingdom-local planning
- documentation draft
- non-release research
- constituent onboarding
- backlog organization

Single sponsor or 2/3 authority is never sufficient for AI-related decisions.

## Court Specialist Review
- Guinevere is the Court specialist for UI/UX, design psychology, and premium product surface quality.
- Guinevere review is required for lanes that materially affect user-facing surfaces, onboarding, landing pages, dashboards, forms, request flows, payment flows, public profiles, menus, search/discovery flows, or conversion-critical copy.
- Guinevere may object to confusing, ugly, over-explained, untrustworthy, inaccessible, conversion-weak, or psychologically weak product surfaces.
- Guinevere's authority is advisory/specialist review only.
- Guinevere cannot approve merges, replace Roundtable authority, define backend architecture, execute code, bypass Gemini review, or make governance decisions.
- Guinevere review never reduces or replaces Roundtable 3/3, Gemini adversarial review, Gawain route control, or any required approval.

## AI Unanimity Law
- Any decision that changes, authorizes, delegates, deploys, or materially directs AI behavior requires Roundtable 3/3.
- The AI Council advises, challenges, prepares options, and records consequence forecasts before the Roundtable decides.
- All Knights must approve before AI work can pass to Merlin or any executing agent.
- Approved AI work must execute through the appropriate agents, guilds, or routers; no single actor may unilaterally bypass the Council, Roundtable, or Merlin route.

## Knight Block Law
- Any one Knight rejection blocks passage.
- Blocked work returns for needs_revision or human_discussion_required.

## Priority Interaction
- P0 and P1 require explicit Roundtable awareness.
- P3 and P4 should not block active revenue-critical work.

## Output Contract
Final decisions are recorded in roundtable_mandate_v1 with mandateStatus and routeDecision.
