import type { ApprovalVote, EvidenceRecord, KnightName } from "./albionRunFlow";
import {
  buildAlbionRunLedgerEntry,
  createAlbionRunLedger,
  type AdvisoryNote,
  type AlbionRunLedger,
  type AlbionRunLedgerEntry,
  type AlbionRunLedgerRecord,
} from "./albionRunLedger";

export type ApprovalActionType =
  | "knight_approve"
  | "knight_reject"
  | "knight_request_changes"
  | "high_court_note"
  | "evidence_attach"
  | "mark_run_complete"
  | "merlin_handoff_preview_requested";

export type ActionActor =
  | KnightName
  | "High Court"
  | "Scribe"
  | "Merlin";

export type ActorAuthority =
  | "roundtable_knight"
  | "advisory_only"
  | "scribe_local_record"
  | "merlin_preview_only";

export type ApprovalActionPayload =
  | KnightApprovalPayload
  | KnightRequestChangesPayload
  | HighCourtNotePayload
  | EvidenceAttachPayload
  | MarkRunCompletePayload
  | MerlinHandoffPreviewPayload;

export interface AlbionApprovalActionPacket {
  packetId: string;
  runId: string;
  actor: ActionActor;
  actorAuthority: ActorAuthority;
  actionType: ApprovalActionType;
  createdAt: string;
  payload: ApprovalActionPayload;
  mutationAllowed: boolean;
  executionAllowed: false;
}

export interface KnightApprovalPayload {
  decisionReason: string;
}

export interface KnightRequestChangesPayload {
  requestedChanges: string;
}

export interface HighCourtNotePayload {
  recommendation?: AdvisoryNote["recommendation"];
  summary: string;
}

export interface EvidenceAttachPayload {
  evidence: EvidenceRecord;
}

export interface MarkRunCompletePayload {
  currentLocationVerified: boolean;
  consequenceForecastComplete: boolean;
}

export interface MerlinHandoffPreviewPayload {
  requestedBy: string;
  reason: string;
}

export interface ApprovalActionApplicationResult {
  packet: AlbionApprovalActionPacket;
  applied: boolean;
  rejectedReason?: string;
  resultingLedgerPreview: AlbionRunLedger;
  resultingRunPreview?: AlbionRunLedgerEntry;
}

const KNIGHT_ACTORS: KnightName[] = ["Gawain", "Lancelot", "Percival"];

export function buildApprovalActionPacket(input: {
  packetId: string;
  runId: string;
  actor: ActionActor;
  actionType: ApprovalActionType;
  createdAt: string;
  payload: ApprovalActionPayload;
}): AlbionApprovalActionPacket {
  return {
    ...input,
    actorAuthority: actorAuthorityFor(input.actor),
    mutationAllowed: mutationAllowedFor(input.actor, input.actionType),
    executionAllowed: false,
  };
}

export function applyApprovalActionPacket(input: {
  ledger: AlbionRunLedger;
  packet: AlbionApprovalActionPacket;
  appBaseUrl: string;
}): ApprovalActionApplicationResult {
  const targetRecord = input.ledger.records.find(
    (record) => record.runId === input.packet.runId,
  );

  if (!targetRecord) {
    return rejectedResult(input.ledger, input.packet, "run_not_found");
  }

  if (!input.packet.mutationAllowed) {
    return rejectedResult(input.ledger, input.packet, "mutation_not_allowed");
  }

  if (!isActorAllowedForAction(input.packet)) {
    return rejectedResult(input.ledger, input.packet, "actor_action_mismatch");
  }

  const updatedRecord = applyPacketToRecord(targetRecord, input.packet);
  const resultingLedgerPreview = createAlbionRunLedger(
    input.ledger.records.map((record) =>
      record.runId === updatedRecord.runId ? updatedRecord : record,
    ),
  );

  return {
    packet: input.packet,
    applied: true,
    resultingLedgerPreview,
    resultingRunPreview: buildAlbionRunLedgerEntry({
      ledgerRecord: updatedRecord,
      appBaseUrl: input.appBaseUrl,
    }),
  };
}

function applyPacketToRecord(
  record: AlbionRunLedgerRecord,
  packet: AlbionApprovalActionPacket,
): AlbionRunLedgerRecord {
  if (packet.actionType === "knight_approve") {
    return updateKnightVote(record, packet.actor as KnightName, "approve");
  }

  if (packet.actionType === "knight_reject") {
    return updateKnightVote(record, packet.actor as KnightName, "reject");
  }

  if (packet.actionType === "knight_request_changes") {
    const payload = packet.payload as KnightRequestChangesPayload;

    return {
      ...updateKnightVote(record, packet.actor as KnightName, "reject"),
      status: "needs_revision",
      consequenceForecastComplete: false,
      advisoryNotes: [
        ...record.advisoryNotes,
        {
          noteId: `${packet.packetId}-request-changes`,
          source: "Roundtable",
          recommendation: "needs_revision",
          summary: payload.requestedChanges,
          addedAt: packet.createdAt,
        },
      ],
    };
  }

  if (packet.actionType === "high_court_note") {
    const payload = packet.payload as HighCourtNotePayload;

    return {
      ...record,
      advisoryNotes: [
        ...record.advisoryNotes,
        {
          noteId: `${packet.packetId}-high-court-note`,
          source: "High Court",
          recommendation: payload.recommendation,
          summary: payload.summary,
          addedAt: packet.createdAt,
        },
      ],
    };
  }

  if (packet.actionType === "evidence_attach") {
    const payload = packet.payload as EvidenceAttachPayload;

    return {
      ...record,
      evidence: [...record.evidence, payload.evidence],
    };
  }

  if (packet.actionType === "mark_run_complete") {
    const payload = packet.payload as MarkRunCompletePayload;

    return {
      ...record,
      currentLocationVerified: payload.currentLocationVerified,
      consequenceForecastComplete: payload.consequenceForecastComplete,
    };
  }

  return record;
}

function updateKnightVote(
  record: AlbionRunLedgerRecord,
  knight: KnightName,
  vote: ApprovalVote,
): AlbionRunLedgerRecord {
  return {
    ...record,
    approvals: {
      ...record.approvals,
      [knight]: vote,
    },
  };
}

function rejectedResult(
  ledger: AlbionRunLedger,
  packet: AlbionApprovalActionPacket,
  rejectedReason: string,
): ApprovalActionApplicationResult {
  return {
    packet,
    applied: false,
    rejectedReason,
    resultingLedgerPreview: ledger,
  };
}

function actorAuthorityFor(actor: ActionActor): ActorAuthority {
  if (isKnight(actor)) {
    return "roundtable_knight";
  }

  if (actor === "High Court") {
    return "advisory_only";
  }

  if (actor === "Merlin") {
    return "merlin_preview_only";
  }

  return "scribe_local_record";
}

function mutationAllowedFor(
  actor: ActionActor,
  actionType: ApprovalActionType,
): boolean {
  if (isKnight(actor)) {
    return [
      "knight_approve",
      "knight_reject",
      "knight_request_changes",
      "mark_run_complete",
      "merlin_handoff_preview_requested",
    ].includes(actionType);
  }

  if (actor === "High Court") {
    return actionType === "high_court_note";
  }

  if (actor === "Scribe") {
    return actionType === "evidence_attach";
  }

  if (actor === "Merlin") {
    return actionType === "merlin_handoff_preview_requested";
  }

  return false;
}

function isActorAllowedForAction(packet: AlbionApprovalActionPacket): boolean {
  if (packet.actionType.startsWith("knight_")) {
    return isKnight(packet.actor) && packet.actorAuthority === "roundtable_knight";
  }

  if (packet.actionType === "high_court_note") {
    return packet.actor === "High Court" && packet.actorAuthority === "advisory_only";
  }

  if (packet.actionType === "evidence_attach") {
    return packet.actor === "Scribe" && packet.actorAuthority === "scribe_local_record";
  }

  if (packet.actionType === "mark_run_complete") {
    return isKnight(packet.actor) && packet.actorAuthority === "roundtable_knight";
  }

  if (packet.actionType === "merlin_handoff_preview_requested") {
    return packet.actor === "Merlin" || isKnight(packet.actor);
  }

  return false;
}

function isKnight(actor: ActionActor): actor is KnightName {
  return KNIGHT_ACTORS.includes(actor as KnightName);
}
