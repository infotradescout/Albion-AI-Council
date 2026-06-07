# Next Founder Onboarding Gate

## Hard Gate
Do not generate `roundtable_alignment_packet_dynamic_v1` until all three profile files exist.

Required files:
- `docs/albion/profiles/gawain.roundtable_knight_profile_dynamic_v1.json`
- `docs/albion/profiles/percival.roundtable_knight_profile_dynamic_v1.json`
- `docs/albion/profiles/lancelot.roundtable_knight_profile_dynamic_v1.json`

Current status:
- Gawain/Thomas profile exists and parses as valid JSON.
- Percival/Dylan profile missing.
- Lancelot/Levon profile exists and parses as valid JSON.

## Canonical Knight Names
- Gawain = Thomas
- Percival = Dylan
- Lancelot = Levon

## Plain Explanation
This is not a personality quiz. It tells Albion how to route work, what you need to approve, what you block, and how AI should present decisions to you.

## Dylan (Percival) Instructions
1. Open ChatGPT.
2. Open `docs/albion/ROUNDTABLE_KNIGHT_ONBOARDING_PROMPT.md`.
3. Paste the full prompt into ChatGPT.
4. State clearly: "I am Percival/Dylan."
5. Answer naturally from real decision behavior.
6. Return JSON only.
7. Save the result as `docs/albion/profiles/percival.roundtable_knight_profile_dynamic_v1.json`.

## Levon (Lancelot) Status
Lancelot/Levon has returned a complete valid JSON profile and is no longer blocking alignment generation.

## Preserved Albion Laws
- All major decisions require unanimous 3/3.
- Any Knight can block.
- AI is advisory only.
- No packet, no action.
- No evidence, no claim.
- No destination/current location, no route.

## Final Stop Rule
Do not create `roundtable_alignment_packet_dynamic_v1` yet.
Do not create placeholder Percival profiles.
Do not infer Dylan profiles from Thomas, Levon, or Gawain.
Create alignment only after the Percival profile file is present and parses as valid JSON.
