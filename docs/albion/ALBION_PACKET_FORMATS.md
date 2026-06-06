# Albion Packet Formats

## 1) dispatch_classification_packet_v1
Purpose: Dispatch Tower traffic-control decision packet.

Required fields:
- schemaVersion
- inputId
- classification:
	- answer_only
	- intake_needed
	- kingdom_action
	- cross_kingdom_action
	- research_required
	- code_execution_required
	- review_required
	- release_sensitive
	- security_incident
	- human_roundtable_required
	- blocked_or_ambiguous
- routeDepth: 0 | 1 | 2 | 3 | 4 | 5
- noRunStatus: null | no_run_missing_destination | no_run_missing_current_location | no_run_wrong_kingdom | no_run_requires_roundtable | no_run_unsupported_request | no_run_security_block | no_run_no_evidence
- dispatchNotes[]

Gate rule:
- No Kingdom action begins before Dispatch classification.

## 2) albion_input_packet_v1
Purpose: Routing-complete intake packet for Albion action planning.

Version note:
- Replaces albion_input_packet_v0.

Required fields:
- schemaVersion
- inputId
- kingdomId
- source
- project
- repoOrSystem
- destination:
	- endGoal
	- businessKpi
	- successCriteria
	- definitionOfArrival
- currentLocation:
	- verifiedStartingState
	- knownAssets
	- knownProblems
	- knownUnknowns
- routing:
	- constraints
	- nonGoals
	- routeOptions
	- selectedRoute
	- roadblocks
	- requiredCheckpoints
	- rerouteRules
- triage:
	- priority: P0 | P1 | P2 | P3 | P4
	- urgencyReason
	- deadline
	- blastRadius: single_user | kingdom | cross_kingdom | production
	- revenueImpact: none | low | medium | high | critical
- authority:
	- approvalRequired
	- approvalLevel: single_sponsor | roundtable_3_of_3
	- approvalReason
- budget:
	- maxAgents
	- maxCouncilCycles
	- maxSandboxAttempts
	- maxContextTokens
	- maxWallClockTier: short | medium | long
	- allowLargeContextModel
- memoryRetrievalPlan:
	- retrievalOrder[]
	- summaryFirst: true
- contradictions[]
- rollback:
	- required
	- rollbackMethod
	- rollbackOwner
	- rollbackEvidenceRequired[]
- evidence[]

Routing rule:
- No destination, no route.
- No verified current location, no execution.

## 3) route_plan_packet_v1
Purpose: Canonical selected-route packet for execution phases.

Required fields:
- schemaVersion
- inputId
- kingdomId
- destination
- currentLocation
- routeOptions[]
- selectedRoute
- requiredCheckpoints[]
- roadblocks[]
- reroutePlan
- evidence[]

## 4) scribe_route_summary_v1
Purpose: Scribe route evidence and outcome packet.

Required fields:
- schemaVersion
- inputId
- kingdomId
- destination
- currentLocation
- selectedRoute
- trafficRoadblocks[]
- reroutes[]
- checkpoints[]
- arrivalProof[]
- missedTurnsDrift[]
- remainingRisks[]
- finalAssessment: arrived | blocked | reroute_required | human_escalation_required
- evidence[]

## 5) high_court_recommendation_packet_v1
Purpose: Advisory route and governance review output from High Court.

Minimum fields:
- schemaVersion
- inputId
- kingdomId
- findings[]
- objections[]
- recommendations[]
- reviewNotes[]
- reviewQuestionsAnswered[]
- evidence[]

Authority rule:
- Advisory only. Not final approval.

## 6) roundtable_mandate_v1
Purpose: Final Roundtable authority packet when approval is required.

Fields:
- schemaVersion
- inputId
- kingdomId
- roundtableDecision: approved | blocked | needs_revision | human_discussion_required
- requiredKnights: ["Gawain", "Lancelot", "Percival"]
- approvals.Gawain: approve | reject | abstain
- approvals.Lancelot: approve | reject | abstain
- approvals.Percival: approve | reject | abstain
- blockedBy[]
- conditions[]
- decisionNotes[]
- mandateStatus: passed_3_of_3 | blocked_not_unanimous | pending
- authority:
	- approvalRequired
	- approvalLevel
	- approvalReason
- routeDecision:
	- destinationReached
	- startingPointVerified
	- routeLawful
	- checkpointsPassed
	- kingdomIsolationPreserved
	- approvedForMerlin
- evidence[]

Authority rule:
- Approval requires unanimous 3/3 (Gawain, Lancelot, Percival).
- Any single reject blocks.

## 6.1) roundtable_knight_profile_dynamic_v1
Purpose: Individual Knight living profile packet and source of truth for operating behavior.

Required fields:
- schemaVersion
- profileVersion
- knightName: Gawain | Percival | Lancelot
- realPerson: Thomas | Dylan | Levon
- currentProfile:
	- selfDefinedPrimaryLanes[]
	- selfDefinedSecondaryLanes[]
	- sharedLanes[]
	- kingdomFocus[]
	- kingdomAvoidUnlessNeeded[]
	- decisionStyle
	- strengths[]
	- weakSpots[]
	- preferredInputs[]
	- preferredOutputs[]
	- approvalCriteria[]
	- blockingCriteria[]
	- evidenceRequiredForApproval[]
	- questionsTheyAlwaysAsk[]
	- thingsTheyDoNotWantAIToDo[]
	- communicationStyle
	- canSponsorEarlyWorkFor[]
	- requiresFullRoundtableApprovalFor[]
	- defersToOtherKnightsWhen[]
	- overlapWithOtherKnights[]
	- escalationTriggers[]
	- merlinPresentationRules[]
	- albionRoutingRules[]
	- roundtableCollaborationRules[]
- profileConfidence:
	- highConfidence[]
	- mediumConfidence[]
	- lowConfidence[]
	- needsValidationThroughDecisions[]
- observedPatterns[]
- decisionHistory[]
- changeLog[]
- profileUpdateTriggers[]
- profileUpdateRules[]
- lastUpdatedFromRunId
- profileStatus: ready_for_roundtable_alignment

Doctrine rule:
- Knight roles are not assumed by system doctrine.
- The onboarding output defines the starting profile.
- Real decisions and corrections update the profile over time.

## 6.2) roundtable_alignment_packet_dynamic_v1
Purpose: Dynamic Roundtable operating agreement based on the three living Knight profiles.

Required fields:
- schemaVersion
- alignmentVersion
- requiredKnights: ["Gawain", "Percival", "Lancelot"]
- profilesSummarized
- sharedAuthorityRules[]
- primaryLaneMap
- secondaryLaneMap
- overlapZones[]
- knownTensionZones[]
- leadSupportMap[]
- requiresUnanimousApproval[]
- singleKnightSponsorshipAllowedFor[]
- evidenceRequirementsByKnight
- blockingCriteriaByKnight
- escalationTriggers[]
- merlinPresentationRules[]
- albionRoutingRules[]
- antiSpiralRules[]
- profileUpdatePolicy
- approvalGate:
	- passingRule: unanimous_3_of_3
	- failureRule: any_rejection_blocks
- alignmentStatus: ready

Doctrine rule:
- Do not force rigid departments.
- Preserve overlap and shared authority based on profile evidence.
- Refresh alignment whenever a Knight profile changes materially.

## 7) albion_action_manifest_v1
Purpose: Final Albion handoff contract to Merlin.

Required fields:
- schemaVersion
- inputId
- kingdomId
- dispatchClassification
- highCourtRecommendation
- roundtableMandate
- status: approved_by_roundtable | blocked_by_roundtable | needs_revision | human_discussion_required
- merlinRouteReportType: arrival_report | blocked_route_report | reroute_request
- merlinResponseNotes:
	- decision
	- routeTaken
	- evidenceSummary[]
	- userVisibleChanges[]
	- blockers[]
	- nextActions[]
	- approvalStatus
- rollback
- contradictions[]
- evidence[]
- cleanOutputUri
- releaseNotes

Gate rules:
- If approval is required, status can be approved_by_roundtable only when roundtableMandate.mandateStatus is passed_3_of_3.
- blocked_by_roundtable when not unanimous or any Knight reject.
- No output proceeds to Merlin on blocked status.
- Merlin receives one of: arrival report, blocked route report, reroute request.

## 8) albion_release_packet_v1
Purpose: Release-sensitive packet for deploy-facing work.

Required fields:
- schemaVersion
- inputId
- kingdomId
- actionManifestRef
- releaseTarget
- releaseChecksPassed[]
- rollback
- evidence[]
- finalReleaseStatus

## Packet Law
- No packet, no action.
- No approved output to Merlin without valid Roundtable mandate when approval is required.
- No packet claim is valid without evidence entries.
- No Knight role assumption is valid without onboarding profile packets.
