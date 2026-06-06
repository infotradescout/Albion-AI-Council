# Roundtable Founder Onboarding

## Fixed Facts
- Albion starts with three known human Knights.
- Their names are fixed:
  - Gwaine = Thomas
  - Percival = Dylan
  - Lancelot = Levon
- Their authority is fixed:
  - Nothing major passes without unanimous 3/3 approval.
  - Any one Knight can block.
  - AI recommendations are advisory only.

## Critical Correction
- Knight operating roles are not predefined.
- Do not assign rigid departments or fake boxes.
- The onboarding result defines each Knight profile.
- The onboarding packet is the source of truth.

## Required Packet 1: roundtable_knight_profile_v1
{
  "schemaVersion": "roundtable_knight_profile_v1",
  "knightName": "Gwaine | Percival | Lancelot",
  "realPerson": "Thomas | Dylan | Levon",
  "selfDefinedPrimaryLanes": [],
  "selfDefinedSecondaryLanes": [],
  "sharedLanes": [],
  "kingdomFocus": [],
  "decisionStyle": "",
  "strengths": [],
  "weakSpots": [],
  "preferredInputs": [],
  "preferredOutputs": [],
  "approvalCriteria": [],
  "blockingCriteria": [],
  "evidenceRequiredForApproval": [],
  "questionsTheyAlwaysAsk": [],
  "thingsTheyDoNotWantAIToDo": [],
  "communicationStyle": "",
  "escalationTriggers": [],
  "roundtableCollaborationRules": [],
  "profileStatus": "ready_for_roundtable_alignment"
}

## Required Packet 2: roundtable_alignment_packet_v1
{
  "schemaVersion": "roundtable_alignment_packet_v1",
  "requiredKnights": ["Gwaine", "Percival", "Lancelot"],
  "profiles": {
    "Gwaine": "roundtable_knight_profile_v1",
    "Percival": "roundtable_knight_profile_v1",
    "Lancelot": "roundtable_knight_profile_v1"
  },
  "sharedAuthorityRules": [
    "Nothing major passes without 3/3 approval.",
    "Any Knight can block.",
    "AI recommendations are advisory only.",
    "Knight profiles are produced by onboarding, not assumed."
  ],
  "approvalGate": {
    "passingRule": "unanimous_3_of_3",
    "failureRule": "any_rejection_blocks"
  },
  "profileStatus": "ready"
}

## Roundtable Knight Onboarding Prompt
You are onboarding me as one of the three real human Knights of Albion.

Merlin is the user-facing layer.
Albion is the one-input/action orchestration layer serving Merlin.

The Roundtable is the human governance layer of Albion.

There are exactly three Knights:
- Gwaine = Thomas
- Percival = Dylan
- Lancelot = Levon

Nothing major passes unless all three Knights approve.
Any one Knight can block.
AI can recommend, but AI cannot approve final authority.

Your job is not to assign me a fake role.
Your job is to extract my real operating profile from my answers.

Ask me questions that define:
1. What I naturally own in the business.
2. What I am best at noticing.
3. What I usually build, sell, package, fix, organize, or push forward.
4. What kinds of decisions I want to approve.
5. What kinds of decisions I want to block.
6. What evidence I need before approving.
7. What output style helps me move fastest.
8. Which Kingdoms I care about most.
9. What I do not want AI agents doing without me.
10. Where I overlap with the other Knights.
11. When something should require all 3 Knights.
12. When a single Knight can sponsor early work.
13. What makes me lose trust in an AI output.
14. What should trigger escalation back to the full Roundtable.

After asking the minimum necessary questions, produce this JSON only:
{
  "schemaVersion": "roundtable_knight_profile_v1",
  "knightName": "",
  "realPerson": "",
  "selfDefinedPrimaryLanes": [],
  "selfDefinedSecondaryLanes": [],
  "sharedLanes": [],
  "kingdomFocus": [],
  "decisionStyle": "",
  "strengths": [],
  "weakSpots": [],
  "preferredInputs": [],
  "preferredOutputs": [],
  "approvalCriteria": [],
  "blockingCriteria": [],
  "evidenceRequiredForApproval": [],
  "questionsTheyAlwaysAsk": [],
  "thingsTheyDoNotWantAIToDo": [],
  "communicationStyle": "",
  "escalationTriggers": [],
  "roundtableCollaborationRules": [],
  "profileStatus": "ready_for_roundtable_alignment"
}

Do not execute project work yet.
Do not create Albion agents yet.
Do not create Kingdom constituents yet.
Do not assume my role from my name.
The onboarding result defines the Knight.

## Roundtable Alignment Prompt
You are aligning the three real human Knights of Albion.

Input:
- Gwaine / Thomas profile
- Percival / Dylan profile
- Lancelot / Levon profile

Your job is to combine the three onboarding profiles into one Roundtable operating agreement.

Do not redefine the Knights.
Do not force them into rigid departments.
Use only what their onboarding profiles say.

Produce:
1. Shared authority rules.
2. Each Knight's self-defined primary lanes.
3. Each Knight's secondary lanes.
4. Where the Knights overlap.
5. What requires unanimous 3/3 approval.
6. What can be started by one Knight as sponsorship only.
7. What evidence each Knight needs.
8. What causes each Knight to block.
9. What causes escalation to full Roundtable.
10. How Merlin and Albion should present outputs to each Knight.

Return this JSON only:
{
  "schemaVersion": "roundtable_alignment_packet_v1",
  "requiredKnights": ["Gwaine", "Percival", "Lancelot"],
  "profilesSummarized": {
    "Gwaine": {},
    "Percival": {},
    "Lancelot": {}
  },
  "sharedAuthorityRules": [],
  "primaryLaneMap": {},
  "secondaryLaneMap": {},
  "overlapZones": [],
  "requiresUnanimousApproval": [],
  "singleKnightSponsorshipAllowedFor": [],
  "evidenceRequirementsByKnight": {},
  "blockingCriteriaByKnight": {},
  "escalationTriggers": [],
  "merlinPresentationRules": [],
  "albionRoutingRules": [],
  "approvalGate": {
    "passingRule": "unanimous_3_of_3",
    "failureRule": "any_rejection_blocks"
  },
  "profileStatus": "ready"
}
