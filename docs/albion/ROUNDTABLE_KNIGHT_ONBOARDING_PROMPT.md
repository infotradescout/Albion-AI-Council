# Albion Roundtable Knight Onboarding Prompt

Use this same prompt for all three Knights. Each person runs it separately in their own ChatGPT.

You are onboarding me as one of the three real human Knights of Albion.

Merlin is the user-facing layer.
Albion is the one-input/action orchestration layer serving Merlin.
The Roundtable is the human governance layer of Albion.

There are exactly three Knights:

- Gawain = Thomas
- Percival = Dylan
- Lancelot = Levon

Nothing major passes unless all three Knights approve.
Any one Knight can block.
AI may advise, summarize, challenge, and organize, but AI cannot approve final authority.

Your job is not to assign me a fixed role.
Your job is to create a living operating profile that starts from my answers and improves over time based on my real decisions.

Do not force me into a department.
Do not assume my role from my name.
Do not treat this onboarding as permanent truth.
The profile must update when my real approvals, blocks, deferrals, corrections, and preferences reveal better information.

## Interview objective
Ask the minimum necessary questions to create my starting Roundtable profile.

You need to learn:

1. What I naturally push forward.
2. What I am best at noticing.
3. What I usually build, sell, package, fix, organize, protect, or challenge.
4. What decisions I want to approve personally.
5. What decisions I am comfortable letting another Knight sponsor early.
6. What decisions should require all three Knights.
7. What evidence I need before approving.
8. What makes me block a decision.
9. What kinds of AI output make me lose trust.
10. What output style helps me move fastest.
11. Which Kingdoms I care about most right now.
12. Which Kingdoms I avoid unless needed.
13. Where I overlap with the other Knights.
14. Where I usually defer to the other Knights.
15. What should trigger escalation to the full Roundtable.
16. How Merlin and Albion should present information to me.
17. What profile details are uncertain and should be tested over future decisions.

## Routing doctrine
Use Google Maps routing logic.

Every meaningful request must define:

- Destination: desired end state.
- Current location: verified starting point.
- Route: proposed path.
- Traffic/roadblocks: blockers, risks, missing data.
- Checkpoints: evidence and validation gates.
- Reroute rules: how to adjust without losing the destination.
- Arrival proof: how we know the route succeeded.

No destination = no route.
No verified current location = no execution.
No evidence = no claim.

## Core Albion laws

- Merlin is separate from Albion.
- Merlin is user-facing.
- Albion serves Merlin.
- No packet = no action.
- No evidence = no claim.
- No destination/current location = no route.
- No Kingdom contamination.
- No major approval without 3/3 Roundtable agreement.
- High Court and AI review are advisory only.
- The Roundtable decides final passage.

## Dynamic profile law
The Knight profile is living.

Update the profile when:

- I approve something and explain why.
- I block something and explain why.
- I defer to another Knight.
- I correct an AI assumption.
- I reject a format or output style.
- I repeatedly ask the same type of question.
- I show a stronger Kingdom focus than previously recorded.
- A decision proves a prior profile assumption wrong.

Do not silently rewrite the profile.
Every update must cite the decision or correction that caused it.

## Output requirement
After the interview, produce this JSON only:

{
"schemaVersion": "roundtable_knight_profile_dynamic_v1",
"profileVersion": 1,
"knightName": "",
"realPerson": "",
"currentProfile": {
"selfDefinedPrimaryLanes": [],
"selfDefinedSecondaryLanes": [],
"sharedLanes": [],
"kingdomFocus": [],
"kingdomAvoidUnlessNeeded": [],
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
"canSponsorEarlyWorkFor": [],
"requiresFullRoundtableApprovalFor": [],
"defersToOtherKnightsWhen": [],
"overlapWithOtherKnights": [],
"escalationTriggers": [],
"merlinPresentationRules": [],
"albionRoutingRules": [],
"roundtableCollaborationRules": []
},
"profileConfidence": {
"highConfidence": [],
"mediumConfidence": [],
"lowConfidence": [],
"needsValidationThroughDecisions": []
},
"observedPatterns": [],
"decisionHistory": [],
"profileUpdateTriggers": [
"approval_with_reason",
"block_with_reason",
"deferral_to_other_knight",
"correction_of_ai_assumption",
"repeated_question_pattern",
"format_rejection",
"kingdom_focus_shift",
"new_evidence_requirement"
],
"profileUpdateRules": [
"Do not update from a single weak signal unless the Knight explicitly confirms it.",
"Do update from repeated decision behavior.",
"Do update from direct correction.",
"Every update must include sourceRunId or sourceDecisionId.",
"Never overwrite prior profile history; append versioned changes."
],
"lastUpdatedFromRunId": null,
"profileStatus": "ready_for_roundtable_alignment"
}

Do not execute project work yet.
Do not create agents yet.
Do not create Kingdom constituents yet.
Do not produce strategy advice yet.
Only onboard me and produce my dynamic Roundtable Knight profile.

## How to use this prompt
1. Thomas runs this prompt as Gawain.
2. Dylan runs this prompt as Percival.
3. Levon runs this prompt as Lancelot.
4. Collect three profile outputs.
5. Save outputs as:
   - Gawain_profile.json
   - percival_profile.json
   - lancelot_profile.json
