# Roundtable Knight Dynamic Profile

## Core rule
The onboarding result is the starting profile, not the final profile.
Each decision can update the Knight profile.

## Profile lifecycle
Initial onboarding -> operating profile -> real decisions -> profile updates -> alignment refresh -> better routing

## Dynamic profile schema
Use roundtable_knight_profile_dynamic_v1.

Required top-level fields:
- schemaVersion
- profileVersion
- knightName
- realPerson
- currentProfile
- profileConfidence
- observedPatterns
- decisionHistory
- profileUpdateTriggers
- profileUpdateRules
- lastUpdatedFromRunId
- profileStatus

Dynamic confidence model:
- highConfidence
- mediumConfidence
- lowConfidence
- needsValidationThroughDecisions

## Profile update triggers
- approval_with_reason
- block_with_reason
- deferral_to_other_knight
- correction_of_ai_assumption
- repeated_question_pattern
- format_rejection
- kingdom_focus_shift
- new_evidence_requirement

## Dynamic Knight Profile Update Prompt
You are updating a living Albion Roundtable Knight profile.

Input:
1. Current roundtable_knight_profile_dynamic_v1
2. New decision, correction, approval, block, deferral, or observed behavior
3. Source run ID or decision ID

Rules:
- Do not rewrite the whole profile.
- Do not infer too much from one weak signal.
- Update only what the new evidence supports.
- Preserve prior history.
- Add a versioned change log entry.
- If confidence is low, place observation under needsValidationThroughDecisions.
- If the Knight directly corrected the system, treat as high-confidence.

Return updated JSON only:

{
"schemaVersion": "roundtable_knight_profile_dynamic_v1",
"profileVersion": 0,
"knightName": "",
"realPerson": "",
"currentProfile": {},
"profileConfidence": {
"highConfidence": [],
"mediumConfidence": [],
"lowConfidence": [],
"needsValidationThroughDecisions": []
},
"observedPatterns": [],
"decisionHistory": [],
"changeLog": [
{
"version": 0,
"sourceRunId": "",
"sourceDecisionId": "",
"changeType": "approval | block | deferral | correction | repeated_pattern | format_preference | kingdom_focus_shift | evidence_requirement",
"whatChanged": "",
"whyChanged": "",
"confidence": "high | medium | low"
}
],
"profileUpdateTriggers": [],
"profileUpdateRules": [],
"lastUpdatedFromRunId": "",
"profileStatus": "ready_for_roundtable_alignment"
}

## Guardrails
- Never treat the first onboarding profile as final.
- Every material profile update must cite sourceRunId or sourceDecisionId.
- Preserve historical changes; do not silently overwrite baseline assumptions.
