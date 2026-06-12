# Dynamic Roundtable Alignment Prompt

Use this after all three dynamic profiles exist. Re-run whenever one profile changes materially.

You are aligning the three living Knight profiles of Albion.

Input:
- Gawain dynamic profile
- Percival dynamic profile
- Lancelot dynamic profile

If either Percival or Lancelot profile is missing, do not generate a final alignment.
Return only:
- alignmentStatus: waiting_for_profiles
- missingProfiles: []

Your job is to create or update the Roundtable operating agreement.

Do not force static roles.
Do not erase overlap.
Do not average away conflict.
Do not invent alignment not supported by profiles.

The alignment is dynamic and updates as Knights make real decisions.

Produce this JSON only:

{
"schemaVersion": "roundtable_alignment_packet_dynamic_v1",
"alignmentVersion": 1,
"requiredKnights": ["Gawain", "Percival", "Lancelot"],
"courtSpecialistReview": {
"Guinevere": {
"canonicalSpelling": "Guinevere",
"role": "UI/UX and behavioral design reviewer",
"status": "court_specialist_advisory_only",
"scope": [
"user-facing product surfaces",
"usability",
"interface clarity",
"visual hierarchy",
"behavioral psychology",
"trust signals",
"conversion friction",
"accessibility",
"premium product quality",
"confusing copy and layout detection",
"architecture leaking onto the glass"
],
"requiredReviewTriggers": [
"user-facing surfaces",
"onboarding",
"landing pages",
"dashboards",
"forms",
"request flows",
"payment flows",
"public profiles",
"menus",
"search/discovery flows",
"conversion-critical copy"
],
"authorityBoundary": [
"cannot approve merges",
"cannot replace Roundtable authority",
"cannot define backend architecture",
"cannot execute code",
"cannot bypass Gemini review",
"cannot make governance decisions"
],
"doctrine": "Internal architecture must not leak onto the glass. User-facing screens should present one clear job, one primary action, and the minimum explanation required."
}
},
"profilesSummarized": {
"Gawain": {},
"Percival": {},
"Lancelot": {}
},
"universalRoundtableLaw": [],
"gawainSpecificRules": [],
"sharedAuthorityRules": [
"Nothing major passes without unanimous 3/3 approval.",
"Any Knight can block.",
"AI recommendations are advisory only.",
"Knight profiles are living and updated from observed decisions."
],
"primaryLaneMap": {},
"secondaryLaneMap": {},
"overlapZones": [],
"knownTensionZones": [],
"leadSupportMap": [],
"requiresUnanimousApproval": [],
"requiresGuinevereReview": [],
"singleKnightSponsorshipAllowedFor": [],
"evidenceRequirementsByKnight": {},
"blockingCriteriaByKnight": {},
"escalationTriggers": [],
"merlinPresentationRules": [],
"albionRoutingRules": [],
"antiSpiralRules": [],
"profileUpdatePolicy": {
"whenToRefreshAlignment": [
"any Knight profile changes materially",
"a Knight blocks for a new reason",
"a repeated conflict appears",
"a Kingdom focus changes",
"Merlin presentation rules change"
],
"changeRequiresRoundtableConfirmation": true
},
"approvalGate": {
"passingRule": "unanimous_3_of_3",
"failureRule": "any_rejection_blocks"
},
"alignmentStatus": "ready | waiting_for_profiles"
}

## How to use
1. Run shared onboarding prompt separately for Thomas, Dylan, and Levon.
2. Collect three roundtable_knight_profile_dynamic_v1 outputs.
3. If Dylan (Percival) or Levon (Lancelot) profile is missing, stop and return waiting_for_profiles.
4. Run this alignment prompt to create alignment baseline.
5. Save output as roundtable_alignment_packet.json.
6. Re-run this prompt after material profile change events.

## Guinevere Boundary
Guinevere is the Court's UI/UX and behavioral design reviewer only. She reviews user-facing product surfaces for usability, clarity, visual hierarchy, behavioral psychology, trust, conversion friction, accessibility, and premium product quality. She may object to confusing, ugly, over-explained, untrustworthy, inaccessible, conversion-weak, or psychologically weak product surfaces.

Guinevere cannot approve merges, replace Roundtable authority, define backend architecture, execute code, bypass Gemini review, or make governance decisions. Her review is required when lanes materially affect user-facing surfaces, onboarding, landing pages, dashboards, forms, request flows, payment flows, public profiles, menus, search/discovery flows, or conversion-critical copy.
