# Evidence Law

## Purpose
Albion does not accept confidence-only claims.
Every claim must include evidence metadata.

## Allowed Evidence Types
- observed
- tested
- sourced
- inferred
- assumed
- unverified
- blocked

## Standard Evidence Item
{
  "claim": "",
  "evidenceType": "tested",
  "sourceUri": "",
  "commandRun": "",
  "result": "",
  "confidence": "high"
}

## Non-Negotiable Rules
- No evidence = no claim.
- No test artifact = no test pass claim.
- No source = no research claim.
- No deploy log = no deployment claim.
- No evidence basis = no complete consequence forecast.

## Where Evidence Is Mandatory
- albion_input_packet_v1
- route_plan_packet_v1
- scribe_route_summary_v1
- high_court_recommendation_packet_v1
- roundtable_mandate_v1
- consequenceForecast objects in required packets
- albion_action_manifest_v1
- albion_release_packet_v1

## Review Guidance
- inferred and assumed cannot close arrival gates alone.
- unverified or blocked evidence must produce blocker language in output notes.
- consequence forecasts must separate evidence basis, assumptions, unknowns, and risks before material action.
