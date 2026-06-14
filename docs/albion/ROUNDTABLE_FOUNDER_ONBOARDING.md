# Roundtable Founder Onboarding

## Fixed Facts
- Albion starts with three known human Knights.
- Their names are fixed:
  - Gawain = Thomas
  - Percival = Dylan
  - Lancelot = Levon
- Their authority is fixed:
  - Nothing major passes without unanimous 3/3 approval.
  - Any one Knight can block.
  - AI recommendations are advisory only.

## Critical Correction
- Knight operating roles are not predefined.
- Do not assign rigid departments or fake boxes.
- Initial onboarding creates the starting profile only.
- Profiles update over time from real decisions.
- Onboarding plus observed decisions defines each Knight profile.

## Dynamic Source-of-Truth Packets
- roundtable_knight_profile_dynamic_v1
- roundtable_alignment_packet_dynamic_v1

## Dynamic Knight Profile Requirements
Every Knight profile must include:
- profileVersion
- currentProfile
- profileConfidence
  - highConfidence
  - mediumConfidence
  - lowConfidence
  - needsValidationThroughDecisions
- observedPatterns
- decisionHistory
- profileUpdateTriggers
- profileUpdateRules
- lastUpdatedFromRunId
- profileStatus

Profile updates are versioned and must preserve change history.
No silent overwrites are allowed.

## Dynamic Alignment Requirements
Roundtable alignment must include:
- alignmentVersion
- knownTensionZones
- profileUpdatePolicy
- alignmentStatus

Alignment is not one-and-done. It must refresh after material profile changes.

## When Profiles Update
Run dynamic profile updates when a Knight:
- approves with reason
- blocks with reason
- defers to another Knight
- corrects an AI assumption
- repeats a question pattern
- rejects an output format
- changes Kingdom focus
- adds or tightens evidence requirements

Every material update must cite sourceRunId or sourceDecisionId.

## Founder Operating Steps
1. Run the shared onboarding prompt in [docs/albion/ROUNDTABLE_KNIGHT_ONBOARDING_PROMPT.md](docs/albion/ROUNDTABLE_KNIGHT_ONBOARDING_PROMPT.md) separately for Thomas, Dylan, and Levon.
2. Capture three roundtable_knight_profile_dynamic_v1 packets.
3. Run the dynamic alignment prompt in [docs/albion/ROUNDTABLE_ALIGNMENT_PROMPT.md](docs/albion/ROUNDTABLE_ALIGNMENT_PROMPT.md).
4. Publish the initial roundtable_alignment_packet_dynamic_v1 baseline.
5. After meaningful decisions, run the dynamic update process in [docs/albion/ROUNDTABLE_KNIGHT_DYNAMIC_PROFILE.md](docs/albion/ROUNDTABLE_KNIGHT_DYNAMIC_PROFILE.md).
6. Refresh alignment when any profile changes materially.

## Preserved Albion Laws
- Albion is the full Kingdom operating system.
- Merlin is the OR / Operational Router inside Albion.
- Merlin executes routes only after Roundtable human authority is satisfied and Merlin eligibility checks pass.
- Merlin cannot invent missing facts, approve final authority, or override Knights.
- No packet, no action.
- No evidence, no claim.
- No destination/current location, no route.
- No Kingdom contamination.
- Major decisions require unanimous 3/3 approval.
- Any Knight can block.
- High Court and AI review are advisory only.
