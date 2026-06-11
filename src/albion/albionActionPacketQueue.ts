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
  packetCount: number;
  acceptedPacketCount: number;
  rejectedPacketCount: number;
  resultingLedgerPreview: AlbionRunLedger;
  runApprovalPreview: AlbionRunLedgerEntry;
  merlinHandoffPreview?: AlbionRunLedgerEntry["merlinHandoffEligibility"];
  ledgerPreviewHash: string;
  deterministicSummary: string;
  exportHandoffPreview: AlbionEvidencePacketExportHandoffPreview;
  exportAllowed: false;
  mutationAllowed: false;
  executionAllowed: false;
  liveIntegrationAllowed: false;
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

// Backward-compatible alias while the rest of Albion transitions to P7 naming.
export type AlbionExportHandoffReviewContract = AlbionExportReviewContractArtifact;

export interface ExportHandoffReviewContractResult {
  created: boolean;
  rejectedReason?: ExportHandoffReviewRejectedReason;
  contract?: AlbionExportReviewContractArtifact;
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
  | "stale_review_artifact"
  | "expired_review_artifact"
  | "revoked_review_artifact"
  | "snapshot_hash_mismatch"
  | "policy_version_mismatch"
  | "rejected_review_decision"
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
  const ledgerPreviewHash = hashString(
    serializeAlbionRunLedger(input.queueReplayResult.resultingLedgerPreview),
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
        String(packetCount),
        String(acceptedPacketCount),
        String(rejectedPacketCount),
        ledgerPreviewHash,
        recomputedRunPreview.run.mandate?.mandateStatus ?? "pending",
        recomputedRunPreview.merlinHandoffEligibility.eligible ? "eligible" : "blocked",
      ].join("|"),
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
