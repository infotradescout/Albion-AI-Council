import type {
  AlbionEvidencePacketExportHandoffPreview,
  AlbionQueueReplayEvidencePacket,
  AlbionReplayExecutionAuthorityEvidence,
} from "./albionActionPacketQueue";
import type {
  AlbionRunLedger,
  AlbionRunLedgerEntry,
  AlbionRunLedgerRecord,
  AdvisoryNote,
} from "./albionRunLedger";
import type {
  ApprovalRequirement,
  DiscordAlertPayload,
  DriveFolderPlan,
  EvidenceRecord,
  MerlinHandoffEligibility,
  RoundtableMandate,
  RouteClassificationInput,
  RunRecord,
} from "./albionRunFlow";

export type ReplayEvidenceValidationRejectedReason =
  | "invalid_packet"
  | "unknown_field"
  | "missing_previous_ledger_hash"
  | "invalid_schema_version"
  | "invalid_execution_authority"
  | "high_court_cannot_grant_execution_authority"
  | "roundtable_execution_authority_incomplete";

export interface ReplayEvidenceValidationResult {
  accepted: boolean;
  rejectedReason?: ReplayEvidenceValidationRejectedReason;
  packet?: AlbionQueueReplayEvidencePacket;
}

export function validateAlbionReplayEvidencePacket(
  input: unknown,
): ReplayEvidenceValidationResult {
  if (!isPlainObject(input)) {
    return rejected("invalid_packet");
  }

  if (!hasExactKeys(input, TOP_LEVEL_KEYS)) {
    return rejected("unknown_field");
  }

  if (input.schemaVersion !== "albion_queue_replay_evidence_packet_v1") {
    return rejected("invalid_schema_version");
  }

  if (!isNonEmptyString(input.previousLedgerHash)) {
    return rejected("missing_previous_ledger_hash");
  }

  if (!isReplayEvidencePacketShape(input)) {
    return rejected("invalid_packet");
  }

  const packet = input;
  const authority = packet.executionAuthority;

  if (authority.highCourtAdvisoryOnly !== true) {
    return rejected("invalid_execution_authority");
  }

  if (authority.claimedForExecution) {
    if (authority.authoritySource === "high_court_advisory") {
      return rejected("high_court_cannot_grant_execution_authority");
    }

    if (
      authority.authoritySource !== "roundtable_3_of_3"
      || authority.approvalLevel !== "roundtable_3_of_3"
      || authority.mandateStatus !== "passed_3_of_3"
      || authority.approvedForMerlin !== true
      || authority.approvals.Gawain !== "approve"
      || authority.approvals.Lancelot !== "approve"
      || authority.approvals.Percival !== "approve"
    ) {
      return rejected("roundtable_execution_authority_incomplete");
    }
  }

  return {
    accepted: true,
    packet,
  };
}

const TOP_LEVEL_KEYS = [
  "acceptedPacketCount",
  "createdAt",
  "deterministicSummary",
  "evidencePacketId",
  "executionAllowed",
  "executionAuthority",
  "exportAllowed",
  "exportHandoffPreview",
  "ledgerPreviewHash",
  "liveIntegrationAllowed",
  "merlinHandoffPreview",
  "mutationAllowed",
  "packetCount",
  "previousLedgerHash",
  "queueId",
  "rejectedPacketCount",
  "replayId",
  "resultingLedgerPreview",
  "runApprovalPreview",
  "runId",
  "schemaVersion",
] as const;

function rejected(
  rejectedReason: ReplayEvidenceValidationRejectedReason,
): ReplayEvidenceValidationResult {
  return {
    accepted: false,
    rejectedReason,
  };
}

function isReplayEvidencePacketShape(
  value: unknown,
): value is AlbionQueueReplayEvidencePacket {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.schemaVersion)
    && isNonEmptyString(value.evidencePacketId)
    && isNonEmptyString(value.queueId)
    && isNonEmptyString(value.replayId)
    && isNonEmptyString(value.runId)
    && isTimestampLike(value.createdAt)
    && isNonEmptyString(value.previousLedgerHash)
    && isNonNegativeInteger(value.packetCount)
    && isNonNegativeInteger(value.acceptedPacketCount)
    && isNonNegativeInteger(value.rejectedPacketCount)
    && isAlbionRunLedger(value.resultingLedgerPreview)
    && isAlbionRunLedgerEntry(value.runApprovalPreview)
    && (value.merlinHandoffPreview === undefined
      || isMerlinHandoffEligibility(value.merlinHandoffPreview))
    && isNonEmptyString(value.ledgerPreviewHash)
    && isNonEmptyString(value.deterministicSummary)
    && isReplayExecutionAuthorityEvidence(value.executionAuthority)
    && isExportHandoffPreview(value.exportHandoffPreview)
    && value.exportAllowed === false
    && value.mutationAllowed === false
    && value.executionAllowed === false
    && value.liveIntegrationAllowed === false
  );
}

function isReplayExecutionAuthorityEvidence(
  value: unknown,
): value is AlbionReplayExecutionAuthorityEvidence {
  if (!isPlainObject(value) || !hasExactKeys(value, EXECUTION_AUTHORITY_KEYS)) {
    return false;
  }

  return (
    typeof value.claimedForExecution === "boolean"
    && ["none", "high_court_advisory", "roundtable_3_of_3"].includes(
      value.authoritySource as string,
    )
    && typeof value.approvalRequired === "boolean"
    && ["single_sponsor_preparation", "roundtable_3_of_3"].includes(
      value.approvalLevel as string,
    )
    && isKnightNameArray(value.requiredKnights)
    && isApprovalsRecord(value.approvals)
    && ["passed_3_of_3", "blocked_not_unanimous", "pending"].includes(
      value.mandateStatus as string,
    )
    && typeof value.approvedForMerlin === "boolean"
    && value.highCourtAdvisoryOnly === true
  );
}

function isExportHandoffPreview(
  value: unknown,
): value is AlbionEvidencePacketExportHandoffPreview {
  if (!isPlainObject(value) || !hasExactKeys(value, EXPORT_HANDOFF_PREVIEW_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.handoffTitle)
    && isNonEmptyString(value.handoffSummary)
    && isStringArray(value.wouldExportTo)
    && isStringArray(value.wouldExportArtifacts)
    && isNonEmptyString(value.requiredFutureApproval)
    && isGuardrailFlags(value.guardrails)
  );
}

function isAlbionRunLedger(value: unknown): value is AlbionRunLedger {
  if (!isPlainObject(value) || !hasExactKeys(value, LEDGER_KEYS)) {
    return false;
  }

  return (
    value.schemaVersion === "albion_run_ledger_v1"
    && Array.isArray(value.records)
    && value.records.every((record) => isAlbionRunLedgerRecord(record))
  );
}

function isAlbionRunLedgerRecord(
  value: unknown,
): value is AlbionRunLedgerRecord {
  if (!isPlainObject(value) || !hasExactKeys(value, LEDGER_RECORD_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.runId)
    && isNonEmptyString(value.kingdomId)
    && isNonEmptyString(value.destination)
    && isNonEmptyString(value.currentLocationSummary)
    && isNonNegativeInteger(value.routeDepth)
    && isPriority(value.priority)
    && isRouteStatus(value.status)
    && isKnightName(value.sponsor)
    && isNonEmptyString(value.nextAction)
    && typeof value.currentLocationVerified === "boolean"
    && typeof value.consequenceForecastComplete === "boolean"
    && isRouteClassificationInput(value.classification)
    && isApprovalsRecord(value.approvals)
    && Array.isArray(value.evidence)
    && value.evidence.every((record) => isEvidenceRecord(record))
    && Array.isArray(value.advisoryNotes)
    && value.advisoryNotes.every((note) => isAdvisoryNote(note))
  );
}

function isAlbionRunLedgerEntry(value: unknown): value is AlbionRunLedgerEntry {
  if (!isPlainObject(value) || !hasExactKeys(value, LEDGER_ENTRY_KEYS)) {
    return false;
  }

  return (
    isAlbionRunLedgerRecord(value.ledgerRecord)
    && isRunRecord(value.run)
    && isDiscordAlertType(value.alertType)
    && isMerlinHandoffEligibility(value.merlinHandoffEligibility)
    && isDriveFolderPlan(value.driveVaultPlan)
    && isDiscordAlertPayload(value.discordAlertPreview)
  );
}

function isRunRecord(value: unknown): value is RunRecord {
  if (!isPlainObject(value) || !hasExactKeys(value, RUN_RECORD_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.runId)
    && isNonEmptyString(value.kingdomId)
    && isNonEmptyString(value.destination)
    && isNonEmptyString(value.currentLocationSummary)
    && isNonNegativeInteger(value.routeDepth)
    && isPriority(value.priority)
    && isRouteStatus(value.status)
    && isKnightName(value.sponsor)
    && isNonEmptyString(value.nextAction)
    && typeof value.currentLocationVerified === "boolean"
    && typeof value.consequenceForecastComplete === "boolean"
    && Array.isArray(value.evidence)
    && value.evidence.every((record) => isEvidenceRecord(record))
    && isApprovalRequirement(value.approvalRequirement)
    && (value.mandate === undefined || isRoundtableMandate(value.mandate))
  );
}

function isApprovalRequirement(value: unknown): value is ApprovalRequirement {
  if (!isPlainObject(value) || !hasExactKeys(value, APPROVAL_REQUIREMENT_KEYS)) {
    return false;
  }

  return (
    typeof value.approvalRequired === "boolean"
    && ["single_sponsor_preparation", "roundtable_3_of_3"].includes(
      value.approvalLevel as string,
    )
    && isNonEmptyString(value.approvalReason)
    && isKnightNameArray(value.requiredKnights)
  );
}

function isRoundtableMandate(value: unknown): value is RoundtableMandate {
  if (!isPlainObject(value) || !hasExactKeys(value, ROUNDTABLE_MANDATE_KEYS)) {
    return false;
  }

  return (
    ["approved", "blocked", "needs_revision", "human_discussion_required"].includes(
      value.roundtableDecision as string,
    )
    && isKnightNameArray(value.requiredKnights)
    && isApprovalsRecord(value.approvals)
    && Array.isArray(value.blockedBy)
    && value.blockedBy.every((knight) => isKnightName(knight))
    && ["passed_3_of_3", "blocked_not_unanimous", "pending"].includes(
      value.mandateStatus as string,
    )
    && typeof value.approvedForMerlin === "boolean"
    && value.highCourtCanApprove === false
  );
}

function isRouteClassificationInput(
  value: unknown,
): value is RouteClassificationInput {
  if (!isPlainObject(value) || !hasExactKeys(value, ROUTE_CLASSIFICATION_KEYS)) {
    return false;
  }

  return (
    typeof value.isAiRelated === "boolean"
    && (value.riskFlags === undefined || isStringArray(value.riskFlags))
    && (value.routeDepth === undefined || isNonNegativeInteger(value.routeDepth))
  );
}

function isEvidenceRecord(value: unknown): value is EvidenceRecord {
  if (!isPlainObject(value) || !hasExactKeys(value, EVIDENCE_RECORD_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.runId)
    && isNonEmptyString(value.evidenceType)
    && isNonEmptyString(value.description)
    && isNonEmptyString(value.driveFileUrl)
    && isNonEmptyString(value.source)
    && isNonEmptyString(value.addedBy)
    && isTimestampLike(value.addedAt)
  );
}

function isAdvisoryNote(value: unknown): value is AdvisoryNote {
  if (!isPlainObject(value) || !hasExactKeys(value, ADVISORY_NOTE_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.noteId)
    && ["High Court", "Scribe", "Council", "Roundtable"].includes(
      value.source as string,
    )
    && (value.recommendation === undefined
      || ["approved", "blocked", "needs_revision"].includes(
        value.recommendation as string,
      ))
    && isNonEmptyString(value.summary)
    && isTimestampLike(value.addedAt)
  );
}

function isMerlinHandoffEligibility(
  value: unknown,
): value is MerlinHandoffEligibility {
  if (!isPlainObject(value) || !hasExactKeys(value, MERLIN_HANDOFF_KEYS)) {
    return false;
  }

  return (
    typeof value.eligible === "boolean"
    && isStringArray(value.blockers)
  );
}

function isDriveFolderPlan(value: unknown): value is DriveFolderPlan {
  if (!isPlainObject(value) || !hasExactKeys(value, DRIVE_FOLDER_PLAN_KEYS)) {
    return false;
  }

  return isNonEmptyString(value.runId) && isStringArray(value.folders);
}

function isDiscordAlertPayload(value: unknown): value is DiscordAlertPayload {
  if (!isPlainObject(value) || !hasExactKeys(value, DISCORD_ALERT_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.runId)
    && isDiscordAlertType(value.alertType)
    && isNonEmptyString(value.message)
    && isNonEmptyString(value.appRunUrl)
  );
}

function isGuardrailFlags(value: unknown): boolean {
  if (!isPlainObject(value) || !hasExactKeys(value, GUARDRAIL_KEYS)) {
    return false;
  }

  return (
    value.exportAllowed === false
    && value.mutationAllowed === false
    && value.executionAllowed === false
    && value.liveIntegrationAllowed === false
  );
}

function isApprovalsRecord(value: unknown): value is Record<string, unknown> {
  if (!isPlainObject(value) || !hasExactKeys(value, APPROVAL_KEYS)) {
    return false;
  }

  return (
    isApprovalVote(value.Gawain)
    && isApprovalVote(value.Lancelot)
    && isApprovalVote(value.Percival)
  );
}

function isApprovalVote(value: unknown): boolean {
  return ["approve", "reject", "abstain", "pending"].includes(value as string);
}

function isPriority(value: unknown): boolean {
  return ["P0", "P1", "P2", "P3", "P4"].includes(value as string);
}

function isRouteStatus(value: unknown): boolean {
  return [
    "intake",
    "routing",
    "in_progress",
    "high_court_review",
    "roundtable_review",
    "approved",
    "blocked",
    "needs_revision",
    "reroute_required",
    "human_discussion_required",
    "done",
  ].includes(value as string);
}

function isDiscordAlertType(value: unknown): boolean {
  return ["approval_needed", "blocked", "merlin_ready"].includes(value as string);
}

function isKnightName(value: unknown): boolean {
  return ["Gawain", "Lancelot", "Percival"].includes(value as string);
}

function isKnightNameArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((entry) => isKnightName(entry));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => isNonEmptyString(entry));
}

function isTimestampLike(value: unknown): boolean {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isNonNegativeInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort();
  const sortedExpected = [...expectedKeys].sort();

  return actualKeys.every((key) => sortedExpected.includes(key));
}

const EXECUTION_AUTHORITY_KEYS = [
  "approvalLevel",
  "approvalRequired",
  "approvedForMerlin",
  "approvals",
  "authoritySource",
  "claimedForExecution",
  "highCourtAdvisoryOnly",
  "mandateStatus",
  "requiredKnights",
] as const;

const EXPORT_HANDOFF_PREVIEW_KEYS = [
  "guardrails",
  "handoffSummary",
  "handoffTitle",
  "requiredFutureApproval",
  "wouldExportArtifacts",
  "wouldExportTo",
] as const;

const GUARDRAIL_KEYS = [
  "executionAllowed",
  "exportAllowed",
  "liveIntegrationAllowed",
  "mutationAllowed",
] as const;

const LEDGER_KEYS = ["records", "schemaVersion"] as const;

const LEDGER_RECORD_KEYS = [
  "advisoryNotes",
  "approvals",
  "classification",
  "consequenceForecastComplete",
  "currentLocationSummary",
  "currentLocationVerified",
  "destination",
  "evidence",
  "kingdomId",
  "nextAction",
  "priority",
  "routeDepth",
  "runId",
  "sponsor",
  "status",
] as const;

const LEDGER_ENTRY_KEYS = [
  "alertType",
  "discordAlertPreview",
  "driveVaultPlan",
  "ledgerRecord",
  "merlinHandoffEligibility",
  "run",
] as const;

const RUN_RECORD_KEYS = [
  "approvalRequirement",
  "consequenceForecastComplete",
  "currentLocationSummary",
  "currentLocationVerified",
  "destination",
  "evidence",
  "kingdomId",
  "mandate",
  "nextAction",
  "priority",
  "routeDepth",
  "runId",
  "sponsor",
  "status",
] as const;

const APPROVAL_REQUIREMENT_KEYS = [
  "approvalLevel",
  "approvalReason",
  "approvalRequired",
  "requiredKnights",
] as const;

const ROUNDTABLE_MANDATE_KEYS = [
  "approvedForMerlin",
  "approvals",
  "blockedBy",
  "highCourtCanApprove",
  "mandateStatus",
  "requiredKnights",
  "roundtableDecision",
] as const;

const ROUTE_CLASSIFICATION_KEYS = [
  "isAiRelated",
  "riskFlags",
  "routeDepth",
] as const;

const EVIDENCE_RECORD_KEYS = [
  "addedAt",
  "addedBy",
  "description",
  "driveFileUrl",
  "evidenceType",
  "runId",
  "source",
] as const;

const ADVISORY_NOTE_KEYS = [
  "addedAt",
  "noteId",
  "recommendation",
  "source",
  "summary",
] as const;

const MERLIN_HANDOFF_KEYS = ["blockers", "eligible"] as const;

const DRIVE_FOLDER_PLAN_KEYS = ["folders", "runId"] as const;

const DISCORD_ALERT_KEYS = ["alertType", "appRunUrl", "message", "runId"] as const;

const APPROVAL_KEYS = ["Gawain", "Lancelot", "Percival"] as const;
