import {
  buildDiscordAlertPayload,
  buildDriveFolderPlan,
  canCreateMerlinHandoff,
  classifyApprovalRequirement,
  evaluateRoundtableMandate,
  type ApprovalVote,
  type DiscordAlertType,
  type EvidenceRecord,
  type KnightName,
  type RouteClassificationInput,
  type RouteStatus,
  type RunRecord,
} from "./albionRunFlow";

export interface LocalRunFixture {
  runId: string;
  kingdomId: string;
  destination: string;
  currentLocationSummary: string;
  routeDepth: number;
  priority: RunRecord["priority"];
  status: RouteStatus;
  sponsor: KnightName;
  nextAction: string;
  currentLocationVerified: boolean;
  consequenceForecastComplete: boolean;
  classification: RouteClassificationInput;
  approvals: Record<KnightName, ApprovalVote>;
  evidence: EvidenceRecord[];
  highCourtRecommendation?: "approved" | "blocked" | "needs_revision";
}

export interface PrivateCommandSurfaceRun {
  run: RunRecord;
  alertType: DiscordAlertType;
  merlinHandoffEligibility: ReturnType<typeof canCreateMerlinHandoff>;
  driveVaultPlan: ReturnType<typeof buildDriveFolderPlan>;
  discordAlertPreview: ReturnType<typeof buildDiscordAlertPayload>;
}

export const LOCAL_RUN_FIXTURES: LocalRunFixture[] = [
  {
    runId: "albion-ai-governance-001",
    kingdomId: "Albion Core",
    destination: "Approve AI governance route for private command surface",
    currentLocationSummary: "Kernel rules are tested and doctrine baseline is locked.",
    routeDepth: 5,
    priority: "P1",
    status: "roundtable_review",
    sponsor: "Gawain",
    nextAction: "Collect Lancelot approval before Merlin handoff.",
    currentLocationVerified: true,
    consequenceForecastComplete: true,
    classification: {
      isAiRelated: true,
      riskFlags: ["core_albion_law_change"],
      routeDepth: 5,
    },
    approvals: {
      Gawain: "approve",
      Lancelot: "pending",
      Percival: "approve",
    },
    evidence: [
      {
        runId: "albion-ai-governance-001",
        evidenceType: "test_artifact",
        description: "Albion OS MVP run-flow contract test output.",
        driveFileUrl: "preview://drive/albion-ai-governance-001/evidence/tests",
        source: "local fixture",
        addedBy: "Scribe",
        addedAt: "2026-06-09T20:46:23.000-05:00",
      },
    ],
    highCourtRecommendation: "approved",
  },
  {
    runId: "tradescout-public-copy-002",
    kingdomId: "TradeScout",
    destination: "Review public customer promise copy before release",
    currentLocationSummary: "Draft copy exists; claim strength still needs proof review.",
    routeDepth: 4,
    priority: "P2",
    status: "blocked",
    sponsor: "Lancelot",
    nextAction: "Rewrite unsupported claims and return for Roundtable review.",
    currentLocationVerified: true,
    consequenceForecastComplete: true,
    classification: {
      isAiRelated: false,
      riskFlags: ["public_customer_promise"],
      routeDepth: 4,
    },
    approvals: {
      Gawain: "reject",
      Lancelot: "approve",
      Percival: "approve",
    },
    evidence: [
      {
        runId: "tradescout-public-copy-002",
        evidenceType: "draft_artifact",
        description: "Local draft copy packet for TradeScout public promise review.",
        driveFileUrl: "preview://drive/tradescout-public-copy-002/evidence/copy",
        source: "local fixture",
        addedBy: "Scribe",
        addedAt: "2026-06-09T20:50:00.000-05:00",
      },
    ],
    highCourtRecommendation: "approved",
  },
  {
    runId: "scoutfitters-materials-003",
    kingdomId: "Scoutfitters",
    destination: "Prepare NFC card production checklist",
    currentLocationSummary: "Material route is internal preparation only.",
    routeDepth: 2,
    priority: "P3",
    status: "in_progress",
    sponsor: "Percival",
    nextAction: "Confirm material quantities and target sales use case.",
    currentLocationVerified: true,
    consequenceForecastComplete: false,
    classification: {
      isAiRelated: false,
      riskFlags: [],
      routeDepth: 2,
    },
    approvals: {
      Gawain: "pending",
      Lancelot: "pending",
      Percival: "approve",
    },
    evidence: [],
  },
];

export function buildPrivateCommandSurfaceRuns(input: {
  appBaseUrl: string;
  fixtures?: LocalRunFixture[];
}): PrivateCommandSurfaceRun[] {
  return (input.fixtures ?? LOCAL_RUN_FIXTURES).map((fixture) => {
    const approvalRequirement = classifyApprovalRequirement(
      fixture.classification,
    );
    const mandate = evaluateRoundtableMandate({
      approvalRequired: approvalRequirement.approvalRequired,
      approvalLevel: approvalRequirement.approvalLevel,
      approvals: fixture.approvals,
      highCourtRecommendation: fixture.highCourtRecommendation
        ? {
            recommendedDecision: fixture.highCourtRecommendation,
          }
        : undefined,
    });

    const run: RunRecord = {
      runId: fixture.runId,
      kingdomId: fixture.kingdomId,
      destination: fixture.destination,
      currentLocationSummary: fixture.currentLocationSummary,
      routeDepth: fixture.routeDepth,
      priority: fixture.priority,
      status: fixture.status,
      sponsor: fixture.sponsor,
      nextAction: fixture.nextAction,
      currentLocationVerified: fixture.currentLocationVerified,
      consequenceForecastComplete: fixture.consequenceForecastComplete,
      evidence: fixture.evidence,
      approvalRequirement,
      mandate,
    };

    const merlinHandoffEligibility = canCreateMerlinHandoff(run);
    const alertType = selectDiscordAlertType(run, merlinHandoffEligibility);

    return {
      run,
      alertType,
      merlinHandoffEligibility,
      driveVaultPlan: buildDriveFolderPlan(fixture.runId),
      discordAlertPreview: buildDiscordAlertPayload({
        alertType,
        runId: fixture.runId,
        appBaseUrl: input.appBaseUrl,
        status: fixture.status,
      }),
    };
  });
}

function selectDiscordAlertType(
  run: RunRecord,
  merlinHandoffEligibility: ReturnType<typeof canCreateMerlinHandoff>,
): DiscordAlertType {
  if (merlinHandoffEligibility.eligible) {
    return "merlin_ready";
  }

  if (run.mandate?.roundtableDecision === "blocked") {
    return "blocked";
  }

  return "approval_needed";
}
