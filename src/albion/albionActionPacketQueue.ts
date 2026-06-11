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

export interface AlbionExportHandoffReviewContract {
  schemaVersion: "albion_export_handoff_review_contract_v1";
  reviewContractId: string;
  evidencePacketId: string;
  runId: string;
  queueId: string;
  replayId: string;
  createdAt: string;
  reviewSummary: string;
  reviewFindings: string[];
  reviewHash: string;
  exportAllowed: false;
  mutationAllowed: false;
  executionAllowed: false;
  liveIntegrationAllowed: false;
}

export interface ExportHandoffReviewContractResult {
  created: boolean;
  rejectedReason?: ExportHandoffReviewRejectedReason;
  contract?: AlbionExportHandoffReviewContract;
}

export function serializeAlbionQueueReplayEvidencePacket(
  packet: AlbionQueueReplayEvidencePacket,
): string {
  return `${stableStringify(packet)}\n`;
}

export function serializeAlbionExportHandoffReviewContract(
  contract: AlbionExportHandoffReviewContract,
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
  | "missing_review_contract_id"
  | "missing_created_at"
  | "missing_evidence_packet"
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
  reviewContractId: string;
  createdAt: string;
  evidencePacket?: AlbionQueueReplayEvidencePacket;
  exportAllowed?: boolean;
  mutationAllowed?: boolean;
  executionAllowed?: boolean;
  liveIntegrationAllowed?: boolean;
}): ExportHandoffReviewContractResult {
  if (!input.reviewContractId) {
    return { created: false, rejectedReason: "missing_review_contract_id" };
  }

  if (!input.createdAt) {
    return { created: false, rejectedReason: "missing_created_at" };
  }

  if (!input.evidencePacket) {
    return { created: false, rejectedReason: "missing_evidence_packet" };
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

  const reviewSummary =
    "Read-only review: export handoff copy remains preview-only and cannot execute integrations.";
  const reviewFindings = [
    "No Google Sheets export path enabled.",
    "No Google Drive export path enabled.",
    "No Discord export path enabled.",
    "No live export, mutation, or execution authority granted.",
  ];
  const reviewHash = hashString(
    `${serializeAlbionQueueReplayEvidencePacket(input.evidencePacket)}${reviewSummary}|${reviewFindings.join("|")}`,
  );

  return {
    created: true,
    contract: {
      schemaVersion: "albion_export_handoff_review_contract_v1",
      reviewContractId: input.reviewContractId,
      evidencePacketId: input.evidencePacket.evidencePacketId,
      runId: input.evidencePacket.runId,
      queueId: input.evidencePacket.queueId,
      replayId: input.evidencePacket.replayId,
      createdAt: input.createdAt,
      reviewSummary,
      reviewFindings,
      reviewHash,
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    },
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
