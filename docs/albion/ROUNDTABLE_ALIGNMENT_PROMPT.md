# Dynamic Roundtable Alignment Prompt

Use this after all three dynamic profiles exist. Re-run whenever one profile changes materially.

You are aligning the three living Knight profiles of Albion.

Input:
- Gwaine dynamic profile
- Percival dynamic profile
- Lancelot dynamic profile

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
"requiredKnights": ["Gwaine", "Percival", "Lancelot"],
"profilesSummarized": {
"Gwaine": {},
"Percival": {},
"Lancelot": {}
},
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
"alignmentStatus": "ready"
}

## How to use
1. Run shared onboarding prompt separately for Thomas, Dylan, and Levon.
2. Collect three roundtable_knight_profile_dynamic_v1 outputs.
3. Run this alignment prompt to create alignment baseline.
4. Re-run this prompt after material profile change events.
