export type KnightName = "Gawain" | "Lancelot" | "Percival";

export type ApprovalLevel =
  | "single_sponsor_preparation"
  | "roundtable_3_of_3";

export type ApprovalVote = "approve" | "reject" | "abstain" | "pending";

export type MandateStatus =
  | "passed_3_of_3"
  | "blocked_not_unanimous"
  | "pending";

export type RouteStatus =
  | "intake"
  | "routing"
  | "in_progress"
  | "high_court_review"
  | "roundtable_review"
  | "approved"
  | "blocked"
  | "needs_revision"
  | "reroute_required"
  | "human_discussion_required"
  | "done";

export type DiscordAlertType =
  | "approval_needed"
  | "blocked"
  | "merlin_ready";

export interface RouteClassificationInput {
  isAiRelated: boolean;
  riskFlags?: string[];
  routeDepth?: number;
}

export interface ApprovalRequirement {
  approvalRequired: boolean;
  approvalLevel: ApprovalLevel;
  approvalReason: string;
  requiredKnights: KnightName[];
}

export interface RoundtableVotes {
  Gawain: ApprovalVote;
  Lancelot: ApprovalVote;
  Percival: ApprovalVote;
}

export interface RoundtableMandateInput {
  approvalRequired: boolean;
  approvalLevel: ApprovalLevel;
  approvals: RoundtableVotes;
  highCourtRecommendation?: {
    recommendedDecision?: "approved" | "blocked" | "needs_revision";
  };
}

export interface RoundtableMandate {
  roundtableDecision:
    | "approved"
    | "blocked"
    | "needs_revision"
    | "human_discussion_required";
  requiredKnights: KnightName[];
  approvals: RoundtableVotes;
  blockedBy: KnightName[];
  mandateStatus: MandateStatus;
  approvedForMerlin: boolean;
  highCourtCanApprove: false;
}

export interface EvidenceRecord {
  runId: string;
  evidenceType: string;
  description: string;
  driveFileUrl: string;
  source: string;
  addedBy: string;
  addedAt: string;
}

export interface RunRecord {
  runId: string;
  kingdomId: string;
  destination: string;
  currentLocationSummary: string;
  routeDepth: number;
  priority: "P0" | "P1" | "P2" | "P3" | "P4";
  status: RouteStatus;
  sponsor: string;
  nextAction: string;
  currentLocationVerified: boolean;
  consequenceForecastComplete: boolean;
  evidence: EvidenceRecord[];
  approvalRequirement: ApprovalRequirement;
  mandate?: RoundtableMandate;
}

export interface MerlinHandoffEligibility {
  eligible: boolean;
  blockers: string[];
}

export interface DriveFolderPlan {
  runId: string;
  folders: string[];
}

export interface DiscordAlertPayload {
  runId: string;
  alertType: DiscordAlertType;
  message: string;
  appRunUrl: string;
}

const REQUIRED_KNIGHTS: KnightName[] = ["Gawain", "Lancelot", "Percival"];

const ROUNDTABLE_RISK_FLAGS = new Set([
  "production_release",
  "cross_kingdom_access",
  "pricing_change",
  "business_model_change",
  "security_sensitive",
  "legal_sensitive",
  "compliance_sensitive",
  "irreversible_data_change",
  "public_customer_promise",
  "core_albion_law_change",
]);

export function classifyApprovalRequirement(
  input: RouteClassificationInput,
): ApprovalRequirement {
  const riskFlags = input.riskFlags ?? [];
  const hasRoundtableRisk = riskFlags.some((flag) =>
    ROUNDTABLE_RISK_FLAGS.has(flag),
  );

  if (input.isAiRelated) {
    return {
      approvalRequired: true,
      approvalLevel: "roundtable_3_of_3",
      approvalReason:
        "AI-related decisions require Gawain + Lancelot + Percival unanimous 3/3 approval.",
      requiredKnights: REQUIRED_KNIGHTS,
    };
  }

  if (hasRoundtableRisk || (input.routeDepth ?? 0) >= 5) {
    return {
      approvalRequired: true,
      approvalLevel: "roundtable_3_of_3",
      approvalReason:
        "Material authority trigger requires Roundtable 3/3 approval.",
      requiredKnights: REQUIRED_KNIGHTS,
    };
  }

  return {
    approvalRequired: false,
    approvalLevel: "single_sponsor_preparation",
    approvalReason:
      "Low-risk preparation may proceed with single-sponsor coordination.",
    requiredKnights: [],
  };
}

export function evaluateRoundtableMandate(
  input: RoundtableMandateInput,
): RoundtableMandate {
  const blockedBy = REQUIRED_KNIGHTS.filter(
    (knight) => input.approvals[knight] === "reject",
  );

  if (!input.approvalRequired) {
    return {
      roundtableDecision: "approved",
      requiredKnights: [],
      approvals: input.approvals,
      blockedBy: [],
      mandateStatus: "passed_3_of_3",
      approvedForMerlin: true,
      highCourtCanApprove: false,
    };
  }

  if (blockedBy.length > 0) {
    return {
      roundtableDecision: "blocked",
      requiredKnights: REQUIRED_KNIGHTS,
      approvals: input.approvals,
      blockedBy,
      mandateStatus: "blocked_not_unanimous",
      approvedForMerlin: false,
      highCourtCanApprove: false,
    };
  }

  const allApproved = REQUIRED_KNIGHTS.every(
    (knight) => input.approvals[knight] === "approve",
  );

  if (input.approvalLevel === "roundtable_3_of_3" && allApproved) {
    return {
      roundtableDecision: "approved",
      requiredKnights: REQUIRED_KNIGHTS,
      approvals: input.approvals,
      blockedBy: [],
      mandateStatus: "passed_3_of_3",
      approvedForMerlin: true,
      highCourtCanApprove: false,
    };
  }

  return {
    roundtableDecision: "human_discussion_required",
    requiredKnights: REQUIRED_KNIGHTS,
    approvals: input.approvals,
    blockedBy: [],
    mandateStatus: "pending",
    approvedForMerlin: false,
    highCourtCanApprove: false,
  };
}

export function canCreateMerlinHandoff(
  run: RunRecord,
): MerlinHandoffEligibility {
  const blockers: string[] = [];

  if (!run.destination) {
    blockers.push("missing_destination");
  }

  if (!run.currentLocationVerified) {
    blockers.push("current_location_not_verified");
  }

  if (!run.consequenceForecastComplete) {
    blockers.push("incomplete_consequence_forecast");
  }

  if (run.evidence.length === 0) {
    blockers.push("missing_evidence");
  }

  if (
    run.approvalRequirement.approvalRequired &&
    run.mandate?.mandateStatus !== "passed_3_of_3"
  ) {
    blockers.push("required_approval_not_satisfied");
  }

  if (run.mandate?.blockedBy.length) {
    blockers.push("knight_rejection_active");
  }

  return {
    eligible: blockers.length === 0,
    blockers,
  };
}

export function buildDriveFolderPlan(runId: string): DriveFolderPlan {
  return {
    runId,
    folders: [
      `/Albion OS/Runs/${runId}/packets`,
      `/Albion OS/Runs/${runId}/evidence`,
      `/Albion OS/Runs/${runId}/court-review`,
      `/Albion OS/Runs/${runId}/roundtable-mandate`,
      `/Albion OS/Runs/${runId}/merlin-handoff`,
    ],
  };
}

export function buildDiscordAlertPayload(input: {
  alertType: DiscordAlertType;
  runId: string;
  appBaseUrl: string;
  status?: RouteStatus;
}): DiscordAlertPayload {
  const appRunUrl = `${input.appBaseUrl.replace(/\/$/, "")}/runs/${input.runId}`;

  if (input.alertType === "approval_needed") {
    return {
      runId: input.runId,
      alertType: input.alertType,
      message: `Run ${input.runId} requires app-recorded Roundtable approval.`,
      appRunUrl,
    };
  }

  if (input.alertType === "blocked") {
    return {
      runId: input.runId,
      alertType: input.alertType,
      message: `Run ${input.runId} is blocked and needs revision, reroute, or human discussion.`,
      appRunUrl,
    };
  }

  return {
    runId: input.runId,
    alertType: input.alertType,
    message: `Run ${input.runId} is eligible for Merlin handoff.`,
    appRunUrl,
  };
}
