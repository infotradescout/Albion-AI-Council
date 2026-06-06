# Authority Matrix

## Purpose
The Authority Matrix determines who can approve what, and when Roundtable 3/3 is mandatory.

## Authority Field Shape
- approvalRequired
- approvalLevel: single_sponsor | roundtable_3_of_3
- approvalReason

## Roundtable 3/3 Required
The following require unanimous approval from Gawain, Lancelot, and Percival:
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

## Knight Block Law
- Any one Knight rejection blocks passage.
- Blocked work returns for needs_revision or human_discussion_required.

## Priority Interaction
- P0 and P1 require explicit Roundtable awareness.
- P3 and P4 should not block active revenue-critical work.

## Output Contract
Final decisions are recorded in roundtable_mandate_v1 with mandateStatus and routeDecision.
