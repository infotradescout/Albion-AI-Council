import {
  applyApprovalActionPacket,
  buildApprovalActionPacket,
  type AlbionApprovalActionPacket,
  type ApprovalActionType,
} from "./albionApprovalActionPackets";
import {
  buildAlbionRunLedgerEntries,
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
