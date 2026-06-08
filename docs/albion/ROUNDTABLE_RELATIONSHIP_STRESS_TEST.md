# Roundtable Relationship Stress Test

## Purpose
Stress test the Gawain, Percival, and Lancelot relationship model for gaps, inefficiencies, duplicate authority, and handoff risk.

Source profiles:
- `docs/albion/profiles/gawain.roundtable_knight_profile_dynamic_v1.json`
- `docs/albion/profiles/percival.roundtable_knight_profile_dynamic_v1.json`
- `docs/albion/profiles/lancelot.roundtable_knight_profile_dynamic_v1.json`

Updated output:
- `docs/albion/profiles/roundtable_alignment_packet.json`

## Findings
- The relationship model is complementary, not broken.
- The primary risk is sequencing friction:
  - Gawain is the technical builder, objector, and system-level coordinator who sees what the overall system needs next.
  - Gawain wants evidence, route integrity, rollback, and consequence visibility.
  - Percival wants visible motion, practical examples, trust, real execution ownership, and now owns merchandising/manufacturing for marketing and sales materials.
  - Lancelot is primarily sales and outreach, with public voice, persuasion, follow-up, and relationship-driven growth.
- The main inefficiency is over-escalation. All three Knights care about mission and trust, so routine preparation can accidentally become Roundtable-level work.
- The main handoff gap is sales/outreach movement before operational or material readiness, or manufacturing materials before the target sales use case and message are clear.
- The main communication risk is when two Knights align and the third feels unheard, especially if AI compresses disagreement too early.

## Pairwise Stress Results
- Gawain-Lancelot:
  - Gap: system/build route and objection layer vs sales/outreach instinct.
  - Risk: sales/outreach creates demand before system readiness, claims, rollback, and consequences are safe, or stalls because the build route is not translated into a testable sales motion.
  - Adjustment: Lancelot sponsors sales/outreach language, follow-up, public voice, and persuasion; Gawain guides the system route, raises objections, and gates proof level, consequence forecast, claims, rollback, and release readiness.
- Gawain-Percival:
  - Gap: system-level build needs and objections vs practical visible execution.
  - Risk: Gawain sees what the system needs before the practical path is obvious, or Percival moves before the system route is ready.
  - Adjustment: Gawain translates overall system needs into plain owner rules, examples, and the next required build/route/handoff; Percival validates real execution owner and practical path.
- Percival-Lancelot:
  - Gap: merchandising/manufacturing and operations vs sales/outreach, public voice, and persuasion.
  - Risk: outreach creates demand before metal cards, NFC cards, T-shirts, branded materials, inventory, or fulfillment are ready; or materials are produced before the sales use case and message are clear.
  - Adjustment: Lancelot owns sales/outreach voice, scripts, follow-up, and persuasion; Percival owns merchandising, manufacturing, material purchasing, production readiness, and fulfillment practicality.
- Full Roundtable:
  - Gap: shared trust and mission authority can duplicate review.
  - Risk: routine preparation bottlenecks in 3/3 approval.
  - Adjustment: single-Knight sponsorship is allowed for reversible, low-risk preparation; material triggers require Roundtable.

## Adjustments Added
- Added `relationshipStressTest` to the alignment packet.
- Added phase ownership:
  - System direction: Gawain leads.
  - Sales and outreach: Lancelot leads.
  - Merchandising and marketing/sales materials: Percival leads.
  - Route, evidence, build direction, and objection: Gawain leads.
  - Field execution: Percival leads.
  - Public release: Lancelot leads voice, Gawain gates system readiness/proof/consequence, Percival gates operational readiness.
  - Conflict resolution: objecting Knight is heard first; disagreement converts to approve, block, defer, needs_evidence, or human_discussion_required.
- Added inefficiency controls:
  - Name one lead Knight and two support lenses for every major proposal.
  - Identify execution owner before approval.
  - Sales/outreach routes must identify whether physical sales materials are needed and whether Percival's production lane is ready.
  - Marketing/sales material production must name sales use case, message, production owner, inventory or fulfillment expectation, and stop rule.
  - Convert repeated debate into missing evidence, value disagreement, ownership gap, or doctrine question.
  - Keep low-risk preparation out of full Roundtable unless a material trigger appears.

## Validation Gaps
- Watch whether Percival's trust in Levon and Thomas allows early movement that still needs explicit post-decision communication.
- Watch whether Gawain's evidence gate slows Lancelot's testable sales/outreach too much.
- Watch whether Lancelot's sales/outreach creates production or fulfillment debt for Percival.
- Watch whether Percival manufactures marketing/sales materials before target use case and messaging are clear.
- Watch whether Gawain's routing rules are plain and practical enough for Percival.
- Watch whether routine work escalates because trust language is too broad.

## Status
Relationship stress test complete for current profile baseline.

Alignment packet updated to `alignmentVersion: 5` after Lancelot/Percival role corrections.
