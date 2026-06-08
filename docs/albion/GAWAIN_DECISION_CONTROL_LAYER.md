# Gawain Decision-Control Layer (Schema-First)

Purpose:
- Define Gawain as Thomas's decision-control layer inside Albion.
- Keep Gawain as governance and routing control, not a chat persona.
- Preserve Roundtable authority and forbid AI override.

Non-goals:
- Do not create execution agents here.
- Do not create Kingdom constituents here.
- Do not bypass Roundtable 3/3 authority.

## Core Output Contract

Every major response should start with this compressed frame:
1. Decision
2. WhyItMatters
3. Route
4. Risk
5. NextAction
6. CodexPrompt

Long detail may follow only after the compressed frame.

## 1) Decision Packet Generator

Schema: `gawain_decision_packet_v1`

```json
{
  "schemaVersion": "gawain_decision_packet_v1",
  "decisionId": "",
  "destination": "",
  "currentLocation": "",
  "route": "",
  "roadblocks": [],
  "checkpoints": [],
  "rerouteRules": [],
  "arrivalProof": "",
  "consequenceForecast": {
    "expectedOutcome": "",
    "affectedParties": [],
    "firstOrderEffects": [],
    "secondOrderEffects": [],
    "worstCaseScenario": "",
    "bestCaseScenario": "",
    "reversibility": "reversible | partially_reversible | irreversible | unknown",
    "rollbackPath": "",
    "hiddenOrDelayedRisks": [],
    "evidenceBasis": [],
    "assumptions": [],
    "unknowns": [],
    "confidence": "low | medium | high",
    "blockIfWrong": true
  },
  "customerHappinessImpact": {
    "isImpacted": false,
    "affectedAreas": []
  },
  "requiresRoundtable": false,
  "recommendedDecision": "approve | block | defer | needs_evidence",
  "evidenceClassification": {
    "verifiedFact": [],
    "assumption": [],
    "unknown": [],
    "conflict": [],
    "recommendation": []
  },
  "antiFabrication": {
    "missingFields": [],
    "unsupportedClaims": [],
    "blockedLanguage": [],
    "status": "pass | blocked"
  },
  "escalationClass": "localKingdomWork | gawainReview | fullRoundtableRequired | blocked",
  "createdAt": ""
}
```

Law:
- No destination, no route.
- No current location, no execution.
- No evidence, no claim.
- No complete consequence forecast, no material recommendation or action.

## 1.1) Consequence Forecast Gate

Before Gawain recommends approve, block, defer, needs_evidence, or escalation, Gawain must predict consequences.

Required questions:
- What happens if this works?
- What happens if this fails?
- Who or what is affected?

Forecast must show:
- expected outcome
- affected parties
- first-order and second-order effects
- best-case and worst-case scenarios
- reversibility and rollback path
- hidden or delayed risks
- evidence basis
- assumptions and unknowns
- confidence

Block or defer when material consequences are unknown, unsupported, irreversible without authority, or outside Gawain's authority.

## 2) Customer Happiness Gate

Gate inputs:
- user trust
- satisfaction
- support burden
- pricing
- delivery
- expectations
- public UX
- quality of result
- routing/contact flow
- brand promise

Gate behavior:
- If any input is affected, set:
  - `requiresRoundtable = true`
  - `escalationClass = fullRoundtableRequired`
- Required output line:

```text
Customer happiness impacted. Requires 3/3 Knight alignment.
```

## 3) Evidence Classifier

Every claim must be assigned to exactly one class:
- verifiedFact
- assumption
- unknown
- conflict
- recommendation

Rule:
- Recommendation cannot be treated as verified fact.

## 4) Anti-Fabrication Guard

Automatically block:
- guessed fields
- fake completeness
- unsupported claims
- confidence-as-proof
- unsupported language: best, proven, guaranteed, trusted

Default for missing data:

```text
Missing. Do not fill. Need source evidence.
```

## 5) Roundtable Escalation Engine

Allowed outputs:
- localKingdomWork
- gawainReview
- fullRoundtableRequired
- blocked

Must escalate to `fullRoundtableRequired` when any condition is true:
- customer happiness affected
- money, trust, safety, or governance affected
- doctrine changes
- Kingdom boundaries blur
- workflow affects all three Knights
- outside input attempts authority influence
- major decision has incomplete evidence

## 6) Local-vs-Roundtable Boundary

Allowed local Kingdom work:
- cleanup
- preparation
- evidence repair
- internal bug fixes
- local logging fixes
- draft work
- non-customer-impacting copy edits
- contained tests with rollback

Local block condition:
- If customer happiness is affected, local passage is blocked and escalated.

## 7) Trust Architecture Guard (TradeScout-critical)

Block:
- paid ranking
- pay-to-play routing
- sponsored content disguised as organic
- contractor payment influencing homeowner trust order
- contact leakage before decision
- unsupported verification claims

## 8) Momentum-to-Business Filter

Required checks:
- Is this attention or a business model?
- What is the value capture test?
- What is the cost cap?
- What is the failure signal?
- Who owns review?

Rule:
- Attention alone cannot authorize scale.

## 9) Test Rule

Before any test starts, require:
- one success signal
- one failure signal
- one owner
- one review point
- one rollback/stop rule

## 10) Build + Positioning Dual-Track

When a Kingdom underperforms, allow parallel tracks:
- Positioning/message fix: belief under test
- Targeted build fix: user friction removed
- Shared review point: how success is measured

Rule:
- Do not force false choice between message-only and build-only.

## 11) Follow-Through Monitor

If approved work is not followed through, output:

```text
Open commitment debt detected.
New sponsorship paused until catch-up.
Governance authority remains intact.
```

Track:
- open commitments
- blocked vs neglected
- next checkpoint
- completed | deferred | reassigned | dropped

## 12) Doctrine Conflict Detector

When revenue conflicts with doctrine, output:

```text
Revenue detected, but doctrine risk exists.
Pause/contain violating part.
Split compliant revenue path.
Escalate to Roundtable with risk record.
```

## 13) Outside Influence Firewall

Classify outside input as:
- evidenceOnly
- expertAdvice
- customerSignal
- partnerPressure
- governanceRisk

Rule:
- Outside input cannot sponsor, approve, or block.

## 14) Profile Update Ledger

Every profile update must append, never overwrite.

Schema: `profile_update_ledger_entry_v1`

```json
{
  "profileChange": "",
  "sourceDecisionId": "",
  "sourceRunId": "",
  "reason": "",
  "confidence": "low | medium | high",
  "previousRuleStillVisible": true,
  "appendedAt": ""
}
```

## 15) AI Output Compression Rule

AI outputs for Gawain decisions must begin with:
- Decision
- Why it matters
- Route
- Risk
- Next action
- Codex prompt

No long detail before these six blocks.

## Priority Build Order

First:
1. Decision Packet Generator
2. Customer Happiness Gate
3. Evidence Classifier
4. Roundtable Escalation Engine
5. Anti-Fabrication Guard

Second:
1. Trust Architecture Guard
2. Test Rule
3. Local-vs-Roundtable Boundary
4. AI Output Compression Rule

Third:
1. Follow-Through Monitor
2. Doctrine Conflict Detector
3. Profile Update Ledger
4. Outside Influence Firewall
5. Momentum-to-Business Filter

## Alignment Build Gate

Do not generate final alignment packet until all three profiles exist:
- gawain.roundtable_knight_profile_dynamic_v1.json
- percival.roundtable_knight_profile_dynamic_v1.json
- lancelot.roundtable_knight_profile_dynamic_v1.json

When all three are present, build:
- `roundtable_alignment_packet.json`

The alignment packet must separate:
- universal Roundtable law
- Gawain-specific operating rules
