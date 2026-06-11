import {
  applyApprovalActionPacket,
  buildApprovalActionPacket,
  type AlbionApprovalActionPacket,
  type ApprovalActionType,
} from "./albionApprovalActionPackets";
import {
  buildAlbionRunLedgerEntries,
  serializeAlbionRunLedger,
  type AlbionRunLedger,
  type AlbionRunLedgerEntry,
} from "./albionRunLedger";
import type {
  ApprovalLevel,
  ApprovalVote,
  KnightName,
  MandateStatus,
} from "./albionRunFlow";

export interface AlbionActionPacketQueue {
  schemaVersion: "albion_action_packet_queue_v1";
  packets: AlbionApprovalActionPacket[];
}

export interface QueueAppendResult {
  accepted: boolean;
  rejectedReason?: QueueRejectedReason;
  queue: AlbionActionPacketQueue;
}

export interface QueueReplayResult {
  replayed: boolean;
  rejectedReason?: QueueRejectedReason;
  rejectedPacketId?: string;
  resultingLedgerPreview: AlbionRunLedger;
  resultingRunPreviews: AlbionRunLedgerEntry[];
  appliedPacketIds: string[];
}

export interface AlbionQueueReplayEvidencePacket {
  schemaVersion: "albion_queue_replay_evidence_packet_v1";
  evidencePacketId: string;
  queueId: string;
  replayId: string;
  runId: string;
  createdAt: string;
  previousLedgerHash: string;
  packetCount: number;
  acceptedPacketCount: number;
  rejectedPacketCount: number;
  resultingLedgerPreview: AlbionRunLedger;
  runApprovalPreview: AlbionRunLedgerEntry;
  merlinHandoffPreview?: AlbionRunLedgerEntry["merlinHandoffEligibility"];
  ledgerPreviewHash: string;
  deterministicSummary: string;
  executionAuthority: AlbionReplayExecutionAuthorityEvidence;
  exportHandoffPreview: AlbionEvidencePacketExportHandoffPreview;
  exportAllowed: false;
  mutationAllowed: false;
  executionAllowed: false;
  liveIntegrationAllowed: false;
}

export interface AlbionReplayExecutionAuthorityEvidence {
  claimedForExecution: boolean;
  authoritySource: "none" | "high_court_advisory" | "roundtable_3_of_3";
  approvalRequired: boolean;
  approvalLevel: ApprovalLevel;
  requiredKnights: KnightName[];
  approvals: Record<KnightName, ApprovalVote>;
  mandateStatus: MandateStatus;
  approvedForMerlin: boolean;
  highCourtAdvisoryOnly: true;
}

export interface AlbionEvidencePacketExportHandoffPreview {
  handoffTitle: string;
  handoffSummary: string;
  wouldExportTo: string[];
  wouldExportArtifacts: string[];
  requiredFutureApproval: string;
  guardrails: {
    exportAllowed: false;
    mutationAllowed: false;
    executionAllowed: false;
    liveIntegrationAllowed: false;
  };
}

export interface QueueReplayEvidencePacketResult {
  created: boolean;
  rejectedReason?: QueueReplayEvidenceRejectedReason;
  packet?: AlbionQueueReplayEvidencePacket;
}

export type AlbionExportReviewDecision = "approved" | "rejected";

export interface AlbionExportReviewRevocation {
  isRevoked: boolean;
  revokedAt?: string;
  revokedBy?: string;
  revocationReasonCode?: string;
}

export interface AlbionExportReviewContractArtifact {
  schemaVersion: "albion_export_review_contract_v1";
  reviewArtifactId: string;
  evidencePacketId: string;
  runId: string;
  queueId: string;
  replayId: string;
  reviewerIdentity: string;
  reviewTimestamp: string;
  reviewedSnapshotHash: string;
  policyVersion: string;
  decision: AlbionExportReviewDecision;
  reasonCode: string;
  reviewerNote?: string;
  approvalExpiresAt: string;
  revocation: AlbionExportReviewRevocation;
  deterministicSummary: string;
  reviewArtifactHash: string;
  exportAllowed: false;
  mutationAllowed: false;
  executionAllowed: false;
  liveIntegrationAllowed: false;
}

export interface AlbionExportReviewRevocationArtifact {
  schemaVersion: "albion_export_review_revocation_v1";
  revocationArtifactId: string;
  evidencePacketId: string;
  runId: string;
  revokedReviewArtifactHash: string;
  revokerIdentity: string;
  revocationTimestamp: string;
  reasonCode: string;
  policyVersion: string;
  deterministicRevocationSummary: string;
  deterministicRevocationHash: string;
  exportAllowed: false;
  mutationAllowed: false;
  executionAllowed: false;
  liveIntegrationAllowed: false;
}

export interface AlbionExportReviewHistorySupersessionState {
  latestDecision: AlbionExportReviewDecision | "none";
  latestReviewArtifactId?: string;
  latestApprovedReviewArtifactId?: string;
  isApprovalSupersededByNewerRejection: boolean;
}

export interface AlbionExportReviewHistoryLatestValidReference {
  reviewArtifactId: string;
  reviewArtifactHash: string;
  reviewTimestamp: string;
}

export interface AlbionExportReviewHistoryArtifact {
  schemaVersion: "albion_export_review_history_contract_v1";
  historyArtifactId: string;
  evidencePacketId: string;
  runId: string;
  reviewedSnapshotHash: string;
  policyVersion: string;
  orderedReviewArtifacts: AlbionExportReviewContractArtifact[];
  orderedRevocationArtifacts: AlbionExportReviewRevocationArtifact[];
  supersessionState: AlbionExportReviewHistorySupersessionState;
  latestValidReviewReference?: AlbionExportReviewHistoryLatestValidReference;
  deterministicHistorySummary: string;
  deterministicHistoryHash: string;
  exportAllowed: false;
  mutationAllowed: false;
  executionAllowed: false;
  liveIntegrationAllowed: false;
}

// Backward-compatible alias while the rest of Albion transitions to P7 naming.
export type AlbionExportHandoffReviewContract = AlbionExportReviewContractArtifact;

export interface ExportHandoffReviewContractResult {
  created: boolean;
  rejectedReason?: ExportHandoffReviewRejectedReason;
  contract?: AlbionExportReviewContractArtifact;
}

export interface ExportReviewRevocationArtifactResult {
  created: boolean;
  rejectedReason?: ExportReviewRevocationRejectedReason;
  artifact?: AlbionExportReviewRevocationArtifact;
}

export interface ExportReviewHistoryArtifactResult {
  created: boolean;
  rejectedReason?: ExportReviewHistoryRejectedReason;
  artifact?: AlbionExportReviewHistoryArtifact;
}

export interface AlbionDeterministicSnapshotMetadata {
  snapshotHash: string;
  policyVersion: string;
  snapshotTimestamp: string;
}

export interface AlbionExportPreviewMetadata {
  evidencePacketId: string;
  runId: string;
  previewTimestamp: string;
  exportAllowed: false;
  mutationAllowed: false;
  executionAllowed: false;
  liveIntegrationAllowed: false;
}

export type AlbionExportEligibilityDecision = "eligible_preview_only" | "denied";

export type AlbionExportEligibilityReasonCode =
  | "eligible_preview_only"
  | "missing_review_artifact"
  | "missing_review_history"
  | "empty_review_history"
  | "no_approval_exists"
  | "stale_review_artifact"
  | "expired_review_artifact"
  | "revoked_review_artifact"
  | "latest_approval_revoked"
  | "approval_superseded_by_newer_rejection"
  | "snapshot_hash_mismatch"
  | "policy_version_mismatch"
  | "rejected_review_decision"
  | "malformed_history_ordering"
  | "malformed_revocation_artifact"
  | "revoked_artifact_hash_not_found"
  | "malformed_reviewer_identity"
  | "malformed_review_timestamp"
  | "malformed_artifact";

export interface AlbionExportEligibilityResult {
  decision: AlbionExportEligibilityDecision;
  reasonCode: AlbionExportEligibilityReasonCode;
  exportEligible: boolean;
  evaluatedAt: string;
  evidencePacketId: string;
  runId: string;
  reviewedSnapshotHash?: string;
  expectedSnapshotHash: string;
  policyVersion: string;
  reviewArtifactId?: string;
  previewOnly: true;
  exportAllowed: false;
  mutationAllowed: false;
  executionAllowed: false;
  liveIntegrationAllowed: false;
}

export function serializeAlbionQueueReplayEvidencePacket(
  packet: AlbionQueueReplayEvidencePacket,
): string {
  return `${stableStringify(packet)}\n`;
}

export function serializeAlbionExportHandoffReviewContract(
  contract: AlbionExportReviewContractArtifact,
): string {
  return `${stableStringify(contract)}\n`;
}

export function serializeAlbionExportReviewRevocationArtifact(
  artifact: AlbionExportReviewRevocationArtifact,
): string {
  return `${stableStringify(artifact)}\n`;
}

export function serializeAlbionExportReviewHistoryArtifact(
  artifact: AlbionExportReviewHistoryArtifact,
): string {
  return `${stableStringify(artifact)}\n`;
}

export type QueueRejectedReason =
  | "duplicate_packet_id"
  | "missing_packet_id"
  | "missing_run_id"
  | "invalid_action_type"
  | "actor_authority_mismatch"
  | "mutation_allowed_mismatch"
  | "execution_allowed_true"
  | "packet_run_id_mismatch"
  | "packet_application_failed";

export type QueueReplayEvidenceRejectedReason =
  | "missing_evidence_packet_id"
  | "missing_replay_id"
  | "missing_run_id"
  | "replay_run_mismatch"
  | "invalid_replay_result"
  | "missing_ledger_preview"
  | "run_preview_not_found"
  | "export_allowed_true"
  | "mutation_allowed_true"
  | "execution_allowed_true"
  | "live_integration_allowed_true";

export type ExportHandoffReviewRejectedReason =
  | "missing_review_artifact_id"
  | "missing_evidence_packet"
  | "missing_reviewer_identity"
  | "missing_policy_version"
  | "invalid_reviewer_identity"
  | "invalid_review_timestamp"
  | "invalid_approval_expires_at"
  | "export_allowed_true"
  | "mutation_allowed_true"
  | "execution_allowed_true"
  | "live_integration_allowed_true";

export type ExportReviewRevocationRejectedReason =
  | "missing_revocation_artifact_id"
  | "missing_evidence_packet"
  | "missing_revoked_review_artifact_hash"
  | "missing_revoker_identity"
  | "missing_policy_version"
  | "invalid_revoker_identity"
  | "invalid_revocation_timestamp"
  | "export_allowed_true"
  | "mutation_allowed_true"
  | "execution_allowed_true"
  | "live_integration_allowed_true";

export type ExportReviewHistoryRejectedReason =
  | "missing_history_artifact_id"
  | "missing_evidence_packet"
  | "missing_policy_version"
  | "missing_review_artifacts"
  | "review_artifact_evidence_mismatch"
  | "review_artifact_snapshot_mismatch"
  | "review_artifact_policy_mismatch"
  | "export_allowed_true"
  | "mutation_allowed_true"
  | "execution_allowed_true"
  | "live_integration_allowed_true";

const VALID_ACTION_TYPES: ApprovalActionType[] = [
  "knight_approve",
  "knight_reject",
  "knight_request_changes",
  "high_court_note",
  "evidence_attach",
  "mark_run_complete",
  "merlin_handoff_preview_requested",
];

export function createActionPacketQueue(
  packets: AlbionApprovalActionPacket[] = [],
): AlbionActionPacketQueue {
  return {
    schemaVersion: "albion_action_packet_queue_v1",
    packets: sortPackets(packets),
  };
}

export function appendActionPacketToQueue(input: {
  queue: AlbionActionPacketQueue;
  packet: AlbionApprovalActionPacket;
}): QueueAppendResult {
  const validationError = validateQueuePacket(input.queue, input.packet);

  if (validationError) {
    return {
      accepted: false,
      rejectedReason: validationError,
      queue: input.queue,
    };
  }

  return {
    accepted: true,
    queue: createActionPacketQueue([...input.queue.packets, input.packet]),
  };
}

export function replayActionPacketQueue(input: {
  queue: AlbionActionPacketQueue;
  ledger: AlbionRunLedger;
  appBaseUrl: string;
  expectedRunId?: string;
}): QueueReplayResult {
  let resultingLedgerPreview = input.ledger;
  const appliedPacketIds: string[] = [];
  const seenPacketIds = new Set<string>();

  for (const packet of sortPackets(input.queue.packets)) {
    if (seenPacketIds.has(packet.packetId)) {
      return rejectedReplay({
        ledger: resultingLedgerPreview,
        appBaseUrl: input.appBaseUrl,
        rejectedReason: "duplicate_packet_id",
        rejectedPacketId: packet.packetId,
        appliedPacketIds,
      });
    }
    seenPacketIds.add(packet.packetId);

    if (input.expectedRunId && packet.runId !== input.expectedRunId) {
      return rejectedReplay({
        ledger: resultingLedgerPreview,
        appBaseUrl: input.appBaseUrl,
        rejectedReason: "packet_run_id_mismatch",
        rejectedPacketId: packet.packetId,
        appliedPacketIds,
      });
    }

    const validationError = validateQueuePacket(
      createActionPacketQueue(
        input.queue.packets.filter(
          (candidate) => candidate.packetId !== packet.packetId,
        ),
      ),
      packet,
    );

    if (validationError) {
      return rejectedReplay({
        ledger: resultingLedgerPreview,
        appBaseUrl: input.appBaseUrl,
        rejectedReason: validationError,
        rejectedPacketId: packet.packetId,
        appliedPacketIds,
      });
    }

    const applied = applyApprovalActionPacket({
      ledger: resultingLedgerPreview,
      packet,
      appBaseUrl: input.appBaseUrl,
    });

    if (!applied.applied) {
      return rejectedReplay({
        ledger: resultingLedgerPreview,
        appBaseUrl: input.appBaseUrl,
        rejectedReason: "packet_application_failed",
        rejectedPacketId: packet.packetId,
        appliedPacketIds,
      });
    }

    resultingLedgerPreview = applied.resultingLedgerPreview;
    appliedPacketIds.push(packet.packetId);
  }

  return {
    replayed: true,
    resultingLedgerPreview,
    resultingRunPreviews: buildAlbionRunLedgerEntries({
      ledger: resultingLedgerPreview,
      appBaseUrl: input.appBaseUrl,
    }),
    appliedPacketIds,
  };
}

export function createAlbionQueueReplayEvidencePacket(input: {
  queue: AlbionActionPacketQueue;
  queueReplayResult: QueueReplayResult;
  previousLedger: AlbionRunLedger;
  evidencePacketId: string;
  queueId?: string;
  replayId: string;
  runId: string;
  createdAt: string;
  appBaseUrl: string;
  exportAllowed?: boolean;
  mutationAllowed?: boolean;
  executionAllowed?: boolean;
  liveIntegrationAllowed?: boolean;
}): QueueReplayEvidencePacketResult {
  if (!input.evidencePacketId) {
    return { created: false, rejectedReason: "missing_evidence_packet_id" };
  }

  if (!input.replayId) {
    return { created: false, rejectedReason: "missing_replay_id" };
  }

  if (!input.runId) {
    return { created: false, rejectedReason: "missing_run_id" };
  }

  if (input.exportAllowed) {
    return { created: false, rejectedReason: "export_allowed_true" };
  }

  if (input.mutationAllowed) {
    return { created: false, rejectedReason: "mutation_allowed_true" };
  }

  if (input.executionAllowed) {
    return { created: false, rejectedReason: "execution_allowed_true" };
  }

  if (input.liveIntegrationAllowed) {
    return { created: false, rejectedReason: "live_integration_allowed_true" };
  }

  if (!input.queueReplayResult?.resultingLedgerPreview) {
    return { created: false, rejectedReason: "missing_ledger_preview" };
  }

  const queueRunMismatch = input.queue.packets.some(
    (packet) => packet.runId !== input.runId,
  );

  if (queueRunMismatch) {
    return { created: false, rejectedReason: "replay_run_mismatch" };
  }

  if (!input.queueReplayResult.replayed) {
    return { created: false, rejectedReason: "invalid_replay_result" };
  }

  const recomputedRunPreview = buildAlbionRunLedgerEntries({
    ledger: input.queueReplayResult.resultingLedgerPreview,
    appBaseUrl: input.appBaseUrl,
  }).find((entry) => entry.run.runId === input.runId);

  if (!recomputedRunPreview) {
    return { created: false, rejectedReason: "run_preview_not_found" };
  }

  const packetCount = input.queue.packets.length;
  const acceptedPacketCount = input.queueReplayResult.appliedPacketIds.length;
  const rejectedPacketCount = Math.max(packetCount - acceptedPacketCount, 0);
  const previousLedgerHash = hashString(
    serializeAlbionRunLedger(input.previousLedger),
  );
  const ledgerPreviewHash = hashString(
    serializeAlbionRunLedger(input.queueReplayResult.resultingLedgerPreview),
  );
  const executionAuthority = buildReplayExecutionAuthorityEvidence(
    recomputedRunPreview,
  );

  return {
    created: true,
    packet: {
      schemaVersion: "albion_queue_replay_evidence_packet_v1",
      evidencePacketId: input.evidencePacketId,
      queueId: input.queueId ?? `queue-${input.runId}`,
      replayId: input.replayId,
      runId: input.runId,
      createdAt: input.createdAt,
      previousLedgerHash,
      packetCount,
      acceptedPacketCount,
      rejectedPacketCount,
      resultingLedgerPreview: input.queueReplayResult.resultingLedgerPreview,
      runApprovalPreview: recomputedRunPreview,
      merlinHandoffPreview: recomputedRunPreview.merlinHandoffEligibility,
      ledgerPreviewHash,
      deterministicSummary: [
        input.queueId ?? `queue-${input.runId}`,
        input.replayId,
        input.runId,
        previousLedgerHash,
        String(packetCount),
        String(acceptedPacketCount),
        String(rejectedPacketCount),
        ledgerPreviewHash,
        executionAuthority.authoritySource,
        executionAuthority.claimedForExecution ? "claimed" : "not_claimed",
        recomputedRunPreview.run.mandate?.mandateStatus ?? "pending",
        recomputedRunPreview.merlinHandoffEligibility.eligible ? "eligible" : "blocked",
      ].join("|"),
      executionAuthority,
      exportHandoffPreview: buildAlbionEvidencePacketExportHandoffPreview({
        runId: input.runId,
        evidencePacketId: input.evidencePacketId,
        replayId: input.replayId,
        queueId: input.queueId ?? `queue-${input.runId}`,
      }),
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    },
  };
}

function buildReplayExecutionAuthorityEvidence(
  runPreview: AlbionRunLedgerEntry,
): AlbionReplayExecutionAuthorityEvidence {
  const mandate = runPreview.run.mandate;
  const hasHighCourtNote = runPreview.ledgerRecord.advisoryNotes.some(
    (note) => note.source === "High Court",
  );

  return {
    claimedForExecution: Boolean(mandate?.approvedForMerlin),
    authoritySource: mandate?.approvedForMerlin
      ? "roundtable_3_of_3"
      : hasHighCourtNote
        ? "high_court_advisory"
        : "none",
    approvalRequired: runPreview.run.approvalRequirement.approvalRequired,
    approvalLevel: runPreview.run.approvalRequirement.approvalLevel,
    requiredKnights: [...runPreview.run.approvalRequirement.requiredKnights],
    approvals: {
      ...runPreview.run.mandate?.approvals ?? runPreview.ledgerRecord.approvals,
    },
    mandateStatus: runPreview.run.mandate?.mandateStatus ?? "pending",
    approvedForMerlin: Boolean(mandate?.approvedForMerlin),
    highCourtAdvisoryOnly: true,
  };
}

export function createAlbionExportHandoffReviewContract(input: {
  reviewArtifactId: string;
  evidencePacket?: AlbionQueueReplayEvidencePacket;
  reviewerIdentity: string;
  reviewTimestamp: string;
  policyVersion: string;
  decision: AlbionExportReviewDecision;
  reasonCode: string;
  reviewerNote?: string;
  approvalValidForMinutes?: number;
  approvalExpiresAt?: string;
  revocation?: AlbionExportReviewRevocation;
  exportAllowed?: boolean;
  mutationAllowed?: boolean;
  executionAllowed?: boolean;
  liveIntegrationAllowed?: boolean;
}): ExportHandoffReviewContractResult {
  if (!input.reviewArtifactId) {
    return { created: false, rejectedReason: "missing_review_artifact_id" };
  }

  if (!input.evidencePacket) {
    return { created: false, rejectedReason: "missing_evidence_packet" };
  }

  if (!input.reviewerIdentity) {
    return { created: false, rejectedReason: "missing_reviewer_identity" };
  }

  if (!isValidReviewerIdentity(input.reviewerIdentity)) {
    return { created: false, rejectedReason: "invalid_reviewer_identity" };
  }

  if (!input.policyVersion) {
    return { created: false, rejectedReason: "missing_policy_version" };
  }

  if (!isIsoTimestamp(input.reviewTimestamp)) {
    return { created: false, rejectedReason: "invalid_review_timestamp" };
  }

  if (input.exportAllowed || input.evidencePacket.exportAllowed) {
    return { created: false, rejectedReason: "export_allowed_true" };
  }

  if (input.mutationAllowed || input.evidencePacket.mutationAllowed) {
    return { created: false, rejectedReason: "mutation_allowed_true" };
  }

  if (input.executionAllowed || input.evidencePacket.executionAllowed) {
    return { created: false, rejectedReason: "execution_allowed_true" };
  }

  if (input.liveIntegrationAllowed || input.evidencePacket.liveIntegrationAllowed) {
    return { created: false, rejectedReason: "live_integration_allowed_true" };
  }

  const calculatedApprovalExpiresAt = input.approvalExpiresAt
    ?? addMinutesToIsoTimestamp(
      input.reviewTimestamp,
      Math.max(input.approvalValidForMinutes ?? 60, 1),
    );

  if (!isIsoTimestamp(calculatedApprovalExpiresAt)) {
    return { created: false, rejectedReason: "invalid_approval_expires_at" };
  }

  const revocation: AlbionExportReviewRevocation = {
    isRevoked: Boolean(input.revocation?.isRevoked),
    revokedAt: input.revocation?.revokedAt,
    revokedBy: input.revocation?.revokedBy,
    revocationReasonCode: input.revocation?.revocationReasonCode,
  };

  const deterministicSummary = [
    input.reviewArtifactId,
    input.evidencePacket.evidencePacketId,
    input.evidencePacket.runId,
    input.reviewerIdentity,
    input.reviewTimestamp,
    input.evidencePacket.ledgerPreviewHash,
    input.policyVersion,
    input.decision,
    input.reasonCode,
    calculatedApprovalExpiresAt,
    revocation.isRevoked ? "revoked" : "active",
    revocation.revokedAt ?? "",
    revocation.revocationReasonCode ?? "",
  ].join("|");
  const reviewArtifactHash = hashString(deterministicSummary);

  return {
    created: true,
    contract: {
      schemaVersion: "albion_export_review_contract_v1",
      reviewArtifactId: input.reviewArtifactId,
      evidencePacketId: input.evidencePacket.evidencePacketId,
      runId: input.evidencePacket.runId,
      queueId: input.evidencePacket.queueId,
      replayId: input.evidencePacket.replayId,
      reviewerIdentity: input.reviewerIdentity,
      reviewTimestamp: input.reviewTimestamp,
      reviewedSnapshotHash: input.evidencePacket.ledgerPreviewHash,
      policyVersion: input.policyVersion,
      decision: input.decision,
      reasonCode: input.reasonCode,
      reviewerNote: input.reviewerNote,
      approvalExpiresAt: calculatedApprovalExpiresAt,
      revocation,
      deterministicSummary,
      reviewArtifactHash,
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    },
  };
}

export function createAlbionExportReviewRevocationArtifact(input: {
  revocationArtifactId: string;
  evidencePacket?: AlbionQueueReplayEvidencePacket;
  revokedReviewArtifactHash: string;
  revokerIdentity: string;
  revocationTimestamp: string;
  reasonCode: string;
  policyVersion: string;
  exportAllowed?: boolean;
  mutationAllowed?: boolean;
  executionAllowed?: boolean;
  liveIntegrationAllowed?: boolean;
}): ExportReviewRevocationArtifactResult {
  if (!input.revocationArtifactId) {
    return { created: false, rejectedReason: "missing_revocation_artifact_id" };
  }

  if (!input.evidencePacket) {
    return { created: false, rejectedReason: "missing_evidence_packet" };
  }

  if (!input.revokedReviewArtifactHash) {
    return { created: false, rejectedReason: "missing_revoked_review_artifact_hash" };
  }

  if (!input.revokerIdentity) {
    return { created: false, rejectedReason: "missing_revoker_identity" };
  }

  if (!isValidReviewerIdentity(input.revokerIdentity)) {
    return { created: false, rejectedReason: "invalid_revoker_identity" };
  }

  if (!input.policyVersion) {
    return { created: false, rejectedReason: "missing_policy_version" };
  }

  if (!isIsoTimestamp(input.revocationTimestamp)) {
    return { created: false, rejectedReason: "invalid_revocation_timestamp" };
  }

  if (input.exportAllowed || input.evidencePacket.exportAllowed) {
    return { created: false, rejectedReason: "export_allowed_true" };
  }

  if (input.mutationAllowed || input.evidencePacket.mutationAllowed) {
    return { created: false, rejectedReason: "mutation_allowed_true" };
  }

  if (input.executionAllowed || input.evidencePacket.executionAllowed) {
    return { created: false, rejectedReason: "execution_allowed_true" };
  }

  if (input.liveIntegrationAllowed || input.evidencePacket.liveIntegrationAllowed) {
    return { created: false, rejectedReason: "live_integration_allowed_true" };
  }

  const deterministicRevocationSummary = [
    input.revocationArtifactId,
    input.evidencePacket.evidencePacketId,
    input.evidencePacket.runId,
    input.revokedReviewArtifactHash,
    input.revokerIdentity,
    input.revocationTimestamp,
    input.reasonCode,
    input.policyVersion,
  ].join("|");

  return {
    created: true,
    artifact: {
      schemaVersion: "albion_export_review_revocation_v1",
      revocationArtifactId: input.revocationArtifactId,
      evidencePacketId: input.evidencePacket.evidencePacketId,
      runId: input.evidencePacket.runId,
      revokedReviewArtifactHash: input.revokedReviewArtifactHash,
      revokerIdentity: input.revokerIdentity,
      revocationTimestamp: input.revocationTimestamp,
      reasonCode: input.reasonCode,
      policyVersion: input.policyVersion,
      deterministicRevocationSummary,
      deterministicRevocationHash: hashString(deterministicRevocationSummary),
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    },
  };
}

export function createAlbionExportReviewHistoryArtifact(input: {
  historyArtifactId: string;
  evidencePacket?: AlbionQueueReplayEvidencePacket;
  policyVersion: string;
  reviewArtifacts: AlbionExportReviewContractArtifact[];
  revocationArtifacts?: AlbionExportReviewRevocationArtifact[];
  exportAllowed?: boolean;
  mutationAllowed?: boolean;
  executionAllowed?: boolean;
  liveIntegrationAllowed?: boolean;
}): ExportReviewHistoryArtifactResult {
  if (!input.historyArtifactId) {
    return { created: false, rejectedReason: "missing_history_artifact_id" };
  }

  if (!input.evidencePacket) {
    return { created: false, rejectedReason: "missing_evidence_packet" };
  }

  if (!input.policyVersion) {
    return { created: false, rejectedReason: "missing_policy_version" };
  }

  if (!input.reviewArtifacts) {
    return { created: false, rejectedReason: "missing_review_artifacts" };
  }

  if (input.exportAllowed || input.evidencePacket.exportAllowed) {
    return { created: false, rejectedReason: "export_allowed_true" };
  }

  if (input.mutationAllowed || input.evidencePacket.mutationAllowed) {
    return { created: false, rejectedReason: "mutation_allowed_true" };
  }

  if (input.executionAllowed || input.evidencePacket.executionAllowed) {
    return { created: false, rejectedReason: "execution_allowed_true" };
  }

  if (input.liveIntegrationAllowed || input.evidencePacket.liveIntegrationAllowed) {
    return { created: false, rejectedReason: "live_integration_allowed_true" };
  }

  for (const artifact of input.reviewArtifacts) {
    if (artifact.evidencePacketId !== input.evidencePacket.evidencePacketId) {
      return { created: false, rejectedReason: "review_artifact_evidence_mismatch" };
    }

    if (artifact.reviewedSnapshotHash !== input.evidencePacket.ledgerPreviewHash) {
      return { created: false, rejectedReason: "review_artifact_snapshot_mismatch" };
    }

    if (artifact.policyVersion !== input.policyVersion) {
      return { created: false, rejectedReason: "review_artifact_policy_mismatch" };
    }
  }

  const orderedReviewArtifacts = sortReviewArtifacts(input.reviewArtifacts);
  const orderedRevocationArtifacts = sortRevocationArtifacts(
    input.revocationArtifacts ?? [],
  );
  const supersessionState = buildHistorySupersessionState(orderedReviewArtifacts);
  const latestValidReviewReference = findLatestHistoryValidReviewReference({
    reviewArtifacts: orderedReviewArtifacts,
    revocationArtifacts: orderedRevocationArtifacts,
  });
  const deterministicHistorySummary = [
    input.historyArtifactId,
    input.evidencePacket.evidencePacketId,
    input.evidencePacket.runId,
    input.evidencePacket.ledgerPreviewHash,
    input.policyVersion,
    orderedReviewArtifacts.map((artifact) => artifact.reviewArtifactHash).join(","),
    orderedRevocationArtifacts
      .map((artifact) => artifact.deterministicRevocationHash)
      .join(","),
    supersessionState.latestDecision,
    supersessionState.latestApprovedReviewArtifactId ?? "",
    latestValidReviewReference?.reviewArtifactHash ?? "",
  ].join("|");

  return {
    created: true,
    artifact: {
      schemaVersion: "albion_export_review_history_contract_v1",
      historyArtifactId: input.historyArtifactId,
      evidencePacketId: input.evidencePacket.evidencePacketId,
      runId: input.evidencePacket.runId,
      reviewedSnapshotHash: input.evidencePacket.ledgerPreviewHash,
      policyVersion: input.policyVersion,
      orderedReviewArtifacts,
      orderedRevocationArtifacts,
      supersessionState,
      latestValidReviewReference,
      deterministicHistorySummary,
      deterministicHistoryHash: hashString(deterministicHistorySummary),
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    },
  };
}

export function buildAlbionDeterministicSnapshotMetadata(input: {
  evidencePacket: AlbionQueueReplayEvidencePacket;
  policyVersion: string;
  snapshotTimestamp?: string;
}): AlbionDeterministicSnapshotMetadata {
  return {
    snapshotHash: input.evidencePacket.ledgerPreviewHash,
    policyVersion: input.policyVersion,
    snapshotTimestamp: input.snapshotTimestamp ?? input.evidencePacket.createdAt,
  };
}

export function buildAlbionExportPreviewMetadata(
  evidencePacket: AlbionQueueReplayEvidencePacket,
): AlbionExportPreviewMetadata {
  return {
    evidencePacketId: evidencePacket.evidencePacketId,
    runId: evidencePacket.runId,
    previewTimestamp: evidencePacket.createdAt,
    exportAllowed: false,
    mutationAllowed: false,
    executionAllowed: false,
    liveIntegrationAllowed: false,
  };
}

export function evaluateAlbionExportEligibility(input: {
  exportPreview: AlbionExportPreviewMetadata;
  snapshot: AlbionDeterministicSnapshotMetadata;
  reviewArtifact?: AlbionExportReviewContractArtifact;
  now?: string;
}): AlbionExportEligibilityResult {
  const evaluatedAt = input.now ?? new Date().toISOString();

  if (
    input.exportPreview.exportAllowed
    || input.exportPreview.mutationAllowed
    || input.exportPreview.executionAllowed
    || input.exportPreview.liveIntegrationAllowed
  ) {
    return deniedEligibility(input, evaluatedAt, "malformed_artifact");
  }

  if (!input.reviewArtifact) {
    return deniedEligibility(input, evaluatedAt, "missing_review_artifact");
  }

  if (!isValidReviewerIdentity(input.reviewArtifact.reviewerIdentity)) {
    return deniedEligibility(input, evaluatedAt, "malformed_reviewer_identity");
  }

  if (!isIsoTimestamp(input.reviewArtifact.reviewTimestamp)) {
    return deniedEligibility(input, evaluatedAt, "malformed_review_timestamp");
  }

  if (!isIsoTimestamp(input.reviewArtifact.approvalExpiresAt)) {
    return deniedEligibility(input, evaluatedAt, "malformed_artifact");
  }

  if (input.reviewArtifact.evidencePacketId !== input.exportPreview.evidencePacketId) {
    return deniedEligibility(input, evaluatedAt, "stale_review_artifact");
  }

  if (input.reviewArtifact.reviewedSnapshotHash !== input.snapshot.snapshotHash) {
    return deniedEligibility(input, evaluatedAt, "snapshot_hash_mismatch");
  }

  if (input.reviewArtifact.policyVersion !== input.snapshot.policyVersion) {
    return deniedEligibility(input, evaluatedAt, "policy_version_mismatch");
  }

  if (input.reviewArtifact.decision !== "approved") {
    return deniedEligibility(input, evaluatedAt, "rejected_review_decision");
  }

  if (input.reviewArtifact.revocation.isRevoked) {
    return deniedEligibility(input, evaluatedAt, "revoked_review_artifact");
  }

  const nowTime = Date.parse(evaluatedAt);
  const reviewTime = Date.parse(input.reviewArtifact.reviewTimestamp);
  const expirationTime = Date.parse(input.reviewArtifact.approvalExpiresAt);

  if (!Number.isFinite(nowTime) || !Number.isFinite(reviewTime) || !Number.isFinite(expirationTime)) {
    return deniedEligibility(input, evaluatedAt, "malformed_artifact");
  }

  if (reviewTime > nowTime) {
    return deniedEligibility(input, evaluatedAt, "stale_review_artifact");
  }

  if (expirationTime < nowTime) {
    return deniedEligibility(input, evaluatedAt, "expired_review_artifact");
  }

  return {
    decision: "eligible_preview_only",
    reasonCode: "eligible_preview_only",
    exportEligible: true,
    evaluatedAt,
    evidencePacketId: input.exportPreview.evidencePacketId,
    runId: input.exportPreview.runId,
    reviewedSnapshotHash: input.reviewArtifact.reviewedSnapshotHash,
    expectedSnapshotHash: input.snapshot.snapshotHash,
    policyVersion: input.snapshot.policyVersion,
    reviewArtifactId: input.reviewArtifact.reviewArtifactId,
    previewOnly: true,
    exportAllowed: false,
    mutationAllowed: false,
    executionAllowed: false,
    liveIntegrationAllowed: false,
  };
}

export function evaluateAlbionExportEligibilityFromHistory(input: {
  exportPreview: AlbionExportPreviewMetadata;
  snapshot: AlbionDeterministicSnapshotMetadata;
  reviewHistory?: AlbionExportReviewHistoryArtifact;
  now?: string;
}): AlbionExportEligibilityResult {
  const evaluatedAt = input.now ?? new Date().toISOString();

  if (
    input.exportPreview.exportAllowed
    || input.exportPreview.mutationAllowed
    || input.exportPreview.executionAllowed
    || input.exportPreview.liveIntegrationAllowed
  ) {
    return deniedHistoryEligibility(input, evaluatedAt, "malformed_artifact");
  }

  if (!input.reviewHistory) {
    return deniedHistoryEligibility(input, evaluatedAt, "missing_review_history");
  }

  if (
    input.reviewHistory.exportAllowed
    || input.reviewHistory.mutationAllowed
    || input.reviewHistory.executionAllowed
    || input.reviewHistory.liveIntegrationAllowed
  ) {
    return deniedHistoryEligibility(input, evaluatedAt, "malformed_artifact");
  }

  if (input.reviewHistory.orderedReviewArtifacts.length === 0) {
    return deniedHistoryEligibility(input, evaluatedAt, "empty_review_history");
  }

  if (input.reviewHistory.reviewedSnapshotHash !== input.snapshot.snapshotHash) {
    return deniedHistoryEligibility(input, evaluatedAt, "snapshot_hash_mismatch");
  }

  if (input.reviewHistory.policyVersion !== input.snapshot.policyVersion) {
    return deniedHistoryEligibility(input, evaluatedAt, "policy_version_mismatch");
  }

  const sortedReviews = sortReviewArtifacts(input.reviewHistory.orderedReviewArtifacts);
  const sortedReviewIds = sortedReviews.map((artifact) => artifact.reviewArtifactId);
  const historyReviewIds = input.reviewHistory.orderedReviewArtifacts.map(
    (artifact) => artifact.reviewArtifactId,
  );

  if (sortedReviewIds.join("|") !== historyReviewIds.join("|")) {
    return deniedHistoryEligibility(input, evaluatedAt, "malformed_history_ordering");
  }

  const sortedRevocations = sortRevocationArtifacts(
    input.reviewHistory.orderedRevocationArtifacts,
  );
  const sortedRevocationIds = sortedRevocations.map(
    (artifact) => artifact.revocationArtifactId,
  );
  const historyRevocationIds = input.reviewHistory.orderedRevocationArtifacts.map(
    (artifact) => artifact.revocationArtifactId,
  );

  if (sortedRevocationIds.join("|") !== historyRevocationIds.join("|")) {
    return deniedHistoryEligibility(input, evaluatedAt, "malformed_history_ordering");
  }

  if (!hasValidRevocationArtifacts(input.reviewHistory.orderedRevocationArtifacts)) {
    return deniedHistoryEligibility(input, evaluatedAt, "malformed_revocation_artifact");
  }

  const reviewHashSet = new Set(
    input.reviewHistory.orderedReviewArtifacts.map((artifact) => artifact.reviewArtifactHash),
  );
  const unknownRevokedHash = input.reviewHistory.orderedRevocationArtifacts.find(
    (artifact) => !reviewHashSet.has(artifact.revokedReviewArtifactHash),
  );

  if (unknownRevokedHash) {
    return deniedHistoryEligibility(input, evaluatedAt, "revoked_artifact_hash_not_found");
  }

  const latestApproved = [...input.reviewHistory.orderedReviewArtifacts]
    .reverse()
    .find((artifact) => artifact.decision === "approved");

  if (!latestApproved) {
    return deniedHistoryEligibility(input, evaluatedAt, "no_approval_exists");
  }

  const latestReview = input.reviewHistory.orderedReviewArtifacts.at(-1);

  if (latestReview && latestReview.reviewArtifactId !== latestApproved.reviewArtifactId && latestReview.decision === "rejected") {
    return deniedHistoryEligibility(
      input,
      evaluatedAt,
      "approval_superseded_by_newer_rejection",
      latestApproved,
    );
  }

  if (
    latestApproved.revocation.isRevoked
    || input.reviewHistory.orderedRevocationArtifacts.some(
      (artifact) => artifact.revokedReviewArtifactHash === latestApproved.reviewArtifactHash,
    )
  ) {
    return deniedHistoryEligibility(input, evaluatedAt, "latest_approval_revoked", latestApproved);
  }

  if (!isValidReviewerIdentity(latestApproved.reviewerIdentity)) {
    return deniedHistoryEligibility(input, evaluatedAt, "malformed_reviewer_identity", latestApproved);
  }

  if (!isIsoTimestamp(latestApproved.reviewTimestamp)) {
    return deniedHistoryEligibility(input, evaluatedAt, "malformed_review_timestamp", latestApproved);
  }

  if (!isIsoTimestamp(latestApproved.approvalExpiresAt)) {
    return deniedHistoryEligibility(input, evaluatedAt, "malformed_artifact", latestApproved);
  }

  const nowTime = Date.parse(evaluatedAt);
  const expirationTime = Date.parse(latestApproved.approvalExpiresAt);

  if (!Number.isFinite(nowTime) || !Number.isFinite(expirationTime)) {
    return deniedHistoryEligibility(input, evaluatedAt, "malformed_artifact", latestApproved);
  }

  if (expirationTime < nowTime) {
    return deniedHistoryEligibility(input, evaluatedAt, "expired_review_artifact", latestApproved);
  }

  return {
    decision: "eligible_preview_only",
    reasonCode: "eligible_preview_only",
    exportEligible: true,
    evaluatedAt,
    evidencePacketId: input.exportPreview.evidencePacketId,
    runId: input.exportPreview.runId,
    reviewedSnapshotHash: latestApproved.reviewedSnapshotHash,
    expectedSnapshotHash: input.snapshot.snapshotHash,
    policyVersion: input.snapshot.policyVersion,
    reviewArtifactId: latestApproved.reviewArtifactId,
    previewOnly: true,
    exportAllowed: false,
    mutationAllowed: false,
    executionAllowed: false,
    liveIntegrationAllowed: false,
  };
}

function rejectedReplay(input: {
  ledger: AlbionRunLedger;
  appBaseUrl: string;
  rejectedReason: QueueRejectedReason;
  rejectedPacketId?: string;
  appliedPacketIds: string[];
}): QueueReplayResult {
  return {
    replayed: false,
    rejectedReason: input.rejectedReason,
    rejectedPacketId: input.rejectedPacketId,
    resultingLedgerPreview: input.ledger,
    resultingRunPreviews: buildAlbionRunLedgerEntries({
      ledger: input.ledger,
      appBaseUrl: input.appBaseUrl,
    }),
    appliedPacketIds: input.appliedPacketIds,
  };
}

function validateQueuePacket(
  queue: AlbionActionPacketQueue,
  packet: AlbionApprovalActionPacket,
): QueueRejectedReason | undefined {
  if (!packet.packetId) {
    return "missing_packet_id";
  }

  if (!packet.runId) {
    return "missing_run_id";
  }

  if (!VALID_ACTION_TYPES.includes(packet.actionType)) {
    return "invalid_action_type";
  }

  if (queue.packets.some((candidate) => candidate.packetId === packet.packetId)) {
    return "duplicate_packet_id";
  }

  if (packet.executionAllowed) {
    return "execution_allowed_true";
  }

  const canonicalPacket = buildApprovalActionPacket({
    packetId: packet.packetId,
    runId: packet.runId,
    actor: packet.actor,
    actionType: packet.actionType,
    createdAt: packet.createdAt,
    payload: packet.payload,
  });

  if (packet.actorAuthority !== canonicalPacket.actorAuthority) {
    return "actor_authority_mismatch";
  }

  if (packet.mutationAllowed !== canonicalPacket.mutationAllowed) {
    return "mutation_allowed_mismatch";
  }

  return undefined;
}

function sortPackets(
  packets: AlbionApprovalActionPacket[],
): AlbionApprovalActionPacket[] {
  return [...packets].sort((a, b) =>
    `${a.createdAt}:${a.packetId}`.localeCompare(`${b.createdAt}:${b.packetId}`),
  );
}

function sortReviewArtifacts(
  artifacts: AlbionExportReviewContractArtifact[],
): AlbionExportReviewContractArtifact[] {
  return [...artifacts].sort((a, b) =>
    `${a.reviewTimestamp}:${a.reviewArtifactId}`.localeCompare(
      `${b.reviewTimestamp}:${b.reviewArtifactId}`,
    ),
  );
}

function sortRevocationArtifacts(
  artifacts: AlbionExportReviewRevocationArtifact[],
): AlbionExportReviewRevocationArtifact[] {
  return [...artifacts].sort((a, b) =>
    `${a.revocationTimestamp}:${a.revocationArtifactId}`.localeCompare(
      `${b.revocationTimestamp}:${b.revocationArtifactId}`,
    ),
  );
}

function buildHistorySupersessionState(
  orderedReviewArtifacts: AlbionExportReviewContractArtifact[],
): AlbionExportReviewHistorySupersessionState {
  const latestReview = orderedReviewArtifacts.at(-1);
  const latestApproved = [...orderedReviewArtifacts]
    .reverse()
    .find((artifact) => artifact.decision === "approved");

  return {
    latestDecision: latestReview?.decision ?? "none",
    latestReviewArtifactId: latestReview?.reviewArtifactId,
    latestApprovedReviewArtifactId: latestApproved?.reviewArtifactId,
    isApprovalSupersededByNewerRejection:
      latestReview?.decision === "rejected"
      && latestApproved !== undefined
      && latestReview.reviewArtifactId !== latestApproved.reviewArtifactId,
  };
}

function findLatestHistoryValidReviewReference(input: {
  reviewArtifacts: AlbionExportReviewContractArtifact[];
  revocationArtifacts: AlbionExportReviewRevocationArtifact[];
}): AlbionExportReviewHistoryLatestValidReference | undefined {
  const revokedHashes = new Set(
    input.revocationArtifacts.map((artifact) => artifact.revokedReviewArtifactHash),
  );

  const latest = [...input.reviewArtifacts]
    .reverse()
    .find(
      (artifact) =>
        artifact.decision === "approved"
        && !artifact.revocation.isRevoked
        && !revokedHashes.has(artifact.reviewArtifactHash),
    );

  if (!latest) {
    return undefined;
  }

  return {
    reviewArtifactId: latest.reviewArtifactId,
    reviewArtifactHash: latest.reviewArtifactHash,
    reviewTimestamp: latest.reviewTimestamp,
  };
}

function hasValidRevocationArtifacts(
  artifacts: AlbionExportReviewRevocationArtifact[],
): boolean {
  return artifacts.every(
    (artifact) =>
      Boolean(artifact.revokedReviewArtifactHash)
      && Boolean(artifact.reasonCode)
      && isValidReviewerIdentity(artifact.revokerIdentity)
      && isIsoTimestamp(artifact.revocationTimestamp)
      && Boolean(artifact.deterministicRevocationHash)
      && artifact.exportAllowed === false
      && artifact.mutationAllowed === false
      && artifact.executionAllowed === false
      && artifact.liveIntegrationAllowed === false,
  );
}

function hashString(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function deniedEligibility(
  input: {
    exportPreview: AlbionExportPreviewMetadata;
    snapshot: AlbionDeterministicSnapshotMetadata;
    reviewArtifact?: AlbionExportReviewContractArtifact;
  },
  evaluatedAt: string,
  reasonCode: AlbionExportEligibilityReasonCode,
): AlbionExportEligibilityResult {
  return {
    decision: "denied",
    reasonCode,
    exportEligible: false,
    evaluatedAt,
    evidencePacketId: input.exportPreview.evidencePacketId,
    runId: input.exportPreview.runId,
    reviewedSnapshotHash: input.reviewArtifact?.reviewedSnapshotHash,
    expectedSnapshotHash: input.snapshot.snapshotHash,
    policyVersion: input.snapshot.policyVersion,
    reviewArtifactId: input.reviewArtifact?.reviewArtifactId,
    previewOnly: true,
    exportAllowed: false,
    mutationAllowed: false,
    executionAllowed: false,
    liveIntegrationAllowed: false,
  };
}

function deniedHistoryEligibility(
  input: {
    exportPreview: AlbionExportPreviewMetadata;
    snapshot: AlbionDeterministicSnapshotMetadata;
    reviewHistory?: AlbionExportReviewHistoryArtifact;
  },
  evaluatedAt: string,
  reasonCode: AlbionExportEligibilityReasonCode,
  latestReview?: AlbionExportReviewContractArtifact,
): AlbionExportEligibilityResult {
  return {
    decision: "denied",
    reasonCode,
    exportEligible: false,
    evaluatedAt,
    evidencePacketId: input.exportPreview.evidencePacketId,
    runId: input.exportPreview.runId,
    reviewedSnapshotHash:
      latestReview?.reviewedSnapshotHash
      ?? input.reviewHistory?.reviewedSnapshotHash,
    expectedSnapshotHash: input.snapshot.snapshotHash,
    policyVersion: input.snapshot.policyVersion,
    reviewArtifactId:
      latestReview?.reviewArtifactId
      ?? input.reviewHistory?.latestValidReviewReference?.reviewArtifactId,
    previewOnly: true,
    exportAllowed: false,
    mutationAllowed: false,
    executionAllowed: false,
    liveIntegrationAllowed: false,
  };
}

function addMinutesToIsoTimestamp(value: string, minutes: number): string {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return new Date(timestamp + (minutes * 60 * 1000)).toISOString();
}

function isIsoTimestamp(value: string): boolean {
  if (!value || Number.isNaN(Date.parse(value))) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value);
}

function isValidReviewerIdentity(value: string): boolean {
  if (!value) {
    return false;
  }

  return /^[a-zA-Z0-9._@:-]{3,120}$/.test(value);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableSortValue(value), null, 2);
}

function stableSortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stableSortValue(item));
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const sortedEntries = Object.keys(objectValue)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => [key, stableSortValue(objectValue[key])] as const);

    return Object.fromEntries(sortedEntries);
  }

  return value;
}

function buildAlbionEvidencePacketExportHandoffPreview(input: {
  runId: string;
  evidencePacketId: string;
  replayId: string;
  queueId: string;
}): AlbionEvidencePacketExportHandoffPreview {
  return {
    handoffTitle: "Albion Evidence Export Handoff Preview",
    handoffSummary:
      "Preview only. This packet describes what would be exported after explicit founder approval.",
    wouldExportTo: [
      "Google Sheets (not enabled)",
      "Google Drive (not enabled)",
      "Discord (not enabled)",
    ],
    wouldExportArtifacts: [
      `Evidence packet snapshot ${input.evidencePacketId}`,
      `Replay trace ${input.replayId} from ${input.queueId}`,
      `Run approval preview for ${input.runId}`,
      `Merlin handoff eligibility preview for ${input.runId}`,
    ],
    requiredFutureApproval:
      "Explicit approval is required before any external export path can be enabled.",
    guardrails: {
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    },
  };
}
