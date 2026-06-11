import type {
  ApprovalVote,
  EvidenceRecord,
  KnightName,
  RouteClassificationInput,
  RouteStatus,
  RunRecord,
} from "./albionRunFlow";
import {
  buildAlbionRunLedgerEntries,
  createAlbionRunLedger,
  type AdvisoryNote,
  type AlbionRunLedgerEntry,
  type AlbionRunLedgerRecord,
} from "./albionRunLedger";
import {
  applyApprovalActionPacket,
  buildApprovalActionPacket,
  type AlbionApprovalActionPacket,
} from "./albionApprovalActionPackets";
import {
  appendActionPacketToQueue,
  buildAlbionDeterministicSnapshotMetadata,
  buildAlbionExportPreviewMetadata,
  createAlbionExportHandoffReviewContract,
  createAlbionQueueReplayEvidencePacket,
  createActionPacketQueue,
  evaluateAlbionExportEligibility,
  replayActionPacketQueue,
  type AlbionQueueReplayEvidencePacket,
} from "./albionActionPacketQueue";

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
  advisoryNotes: AdvisoryNote[];
}

export interface PrivateCommandSurfaceRun extends AlbionRunLedgerEntry {
  actionPacketPreview: {
    packet: AlbionApprovalActionPacket;
    applied: boolean;
    handoffEligible: boolean;
    queuedPacketCount: number;
    replayed: boolean;
    evidencePacketCreated: boolean;
    evidencePacketPreviewMetadata?: AlbionEvidencePacketPreviewMetadata;
  };
}

export interface AlbionEvidencePacketPreviewMetadata {
  evidencePacketId: string;
  queueId: string;
  replayId: string;
  runId: string;
  createdAt: string;
  packetCount: number;
  acceptedPacketCount: number;
  rejectedPacketCount: number;
  ledgerPreviewHash: string;
  deterministicSummary: string;
  exportHandoffCopy: {
    handoffTitle: string;
    handoffSummary: string;
    wouldExportTo: string[];
    wouldExportArtifacts: string[];
    requiredFutureApproval: string;
  };
  exportHandoffReviewContractPreview?: {
    reviewArtifactId: string;
    reviewerIdentity: string;
    reviewTimestamp: string;
    policyVersion: string;
    decision: "approved" | "rejected";
    reasonCode: string;
    approvalExpiresAt: string;
    reviewArtifactHash: string;
    exportEligible: boolean;
    eligibilityReasonCode: string;
    exportAllowed: false;
    mutationAllowed: false;
    executionAllowed: false;
    liveIntegrationAllowed: false;
  };
  exportAllowed: false;
  mutationAllowed: false;
  executionAllowed: false;
  liveIntegrationAllowed: false;
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
    advisoryNotes: [
      {
        noteId: "high-court-albion-ai-governance-001",
        source: "High Court",
        recommendation: "approved",
        summary:
          "Advisory review says the route is lawful, but Roundtable approval is still incomplete.",
        addedAt: "2026-06-09T20:47:00.000-05:00",
      },
    ],
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
    advisoryNotes: [
      {
        noteId: "high-court-tradescout-public-copy-002",
        source: "High Court",
        recommendation: "approved",
        summary:
          "Advisory review does not override Gawain's rejection of unsupported public claims.",
        addedAt: "2026-06-09T20:51:00.000-05:00",
      },
    ],
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
    advisoryNotes: [
      {
        noteId: "scribe-scoutfitters-materials-003",
        source: "Scribe",
        summary:
          "Preparation may continue locally, but Merlin handoff needs a complete forecast and evidence.",
        addedAt: "2026-06-09T20:54:00.000-05:00",
      },
    ],
  },
];

export function buildPrivateCommandSurfaceRuns(input: {
  appBaseUrl: string;
  fixtures?: LocalRunFixture[];
}): PrivateCommandSurfaceRun[] {
  const ledger = createAlbionRunLedger(
    (input.fixtures ?? LOCAL_RUN_FIXTURES).map(toLedgerRecord),
  );

  return buildAlbionRunLedgerEntries({
    ledger,
    appBaseUrl: input.appBaseUrl,
  }).map((entry) => ({
    ...entry,
    actionPacketPreview: buildHandoffActionPacketPreview({
      entry,
      ledger,
      appBaseUrl: input.appBaseUrl,
    }),
  }));
}

export function buildPrivateCommandSurfaceLedgerRecords(
  fixtures: LocalRunFixture[] = LOCAL_RUN_FIXTURES,
): AlbionRunLedgerRecord[] {
  return fixtures.map(toLedgerRecord);
}

function toLedgerRecord(fixture: LocalRunFixture): AlbionRunLedgerRecord {
  return {
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
    classification: fixture.classification,
    approvals: fixture.approvals,
    evidence: fixture.evidence,
    advisoryNotes: fixture.advisoryNotes,
  };
}

function buildHandoffActionPacketPreview(input: {
  entry: AlbionRunLedgerEntry;
  ledger: ReturnType<typeof createAlbionRunLedger>;
  appBaseUrl: string;
}): PrivateCommandSurfaceRun["actionPacketPreview"] {
  const packet = buildApprovalActionPacket({
    packetId: `packet-preview-${input.entry.run.runId}-merlin-handoff`,
    runId: input.entry.run.runId,
    actor: "Merlin",
    actionType: "merlin_handoff_preview_requested",
    createdAt: "2026-06-10T10:35:00.000-05:00",
    payload: {
      requestedBy: "Merlin",
      reason: "Preview local handoff readiness only.",
    },
  });
  const result = applyApprovalActionPacket({
    ledger: input.ledger,
    packet,
    appBaseUrl: input.appBaseUrl,
  });
  const queued = appendActionPacketToQueue({
    queue: createActionPacketQueue(),
    packet,
  });
  const replayed = replayActionPacketQueue({
    queue: queued.queue,
    ledger: input.ledger,
    appBaseUrl: input.appBaseUrl,
    expectedRunId: input.entry.run.runId,
  });
  const evidence = createAlbionQueueReplayEvidencePacket({
    queue: queued.queue,
    queueReplayResult: replayed,
    previousLedger: input.ledger,
    evidencePacketId: `evidence-${input.entry.run.runId}-queue-replay`,
    queueId: `queue-${input.entry.run.runId}`,
    replayId: `replay-${input.entry.run.runId}`,
    runId: input.entry.run.runId,
    createdAt: "2026-06-10T10:36:00.000-05:00",
    appBaseUrl: input.appBaseUrl,
  });

  return {
    packet,
    applied: result.applied,
    handoffEligible:
      result.resultingRunPreview?.merlinHandoffEligibility.eligible ?? false,
    queuedPacketCount: queued.queue.packets.length,
    replayed: replayed.replayed,
    evidencePacketCreated: evidence.created,
    evidencePacketPreviewMetadata: evidence.packet
      ? toEvidencePacketPreviewMetadata(evidence.packet)
      : undefined,
  };
}

function toEvidencePacketPreviewMetadata(
  packet: AlbionQueueReplayEvidencePacket,
): AlbionEvidencePacketPreviewMetadata {
  const policyVersion = "albion_export_review_policy_v1";
  const reviewTimestamp = new Date(packet.createdAt).toISOString();
  const reviewContract = createAlbionExportHandoffReviewContract({
    reviewArtifactId: `review-${packet.evidencePacketId}`,
    evidencePacket: packet,
    reviewerIdentity: "founder.albion",
    reviewTimestamp,
    policyVersion,
    decision: "approved",
    reasonCode: "preview_handoff_verified",
    approvalValidForMinutes: 180,
    reviewerNote: "Preview-only approval metadata. Live export remains blocked.",
  });

  const snapshot = buildAlbionDeterministicSnapshotMetadata({
    evidencePacket: packet,
    policyVersion,
  });
  const exportPreview = buildAlbionExportPreviewMetadata(packet);
  const eligibility = evaluateAlbionExportEligibility({
    exportPreview,
    snapshot,
    reviewArtifact: reviewContract.contract,
    now: reviewTimestamp,
  });

  return {
    evidencePacketId: packet.evidencePacketId,
    queueId: packet.queueId,
    replayId: packet.replayId,
    runId: packet.runId,
    createdAt: packet.createdAt,
    packetCount: packet.packetCount,
    acceptedPacketCount: packet.acceptedPacketCount,
    rejectedPacketCount: packet.rejectedPacketCount,
    ledgerPreviewHash: packet.ledgerPreviewHash,
    deterministicSummary: packet.deterministicSummary,
    exportHandoffCopy: {
      handoffTitle: packet.exportHandoffPreview.handoffTitle,
      handoffSummary: packet.exportHandoffPreview.handoffSummary,
      wouldExportTo: packet.exportHandoffPreview.wouldExportTo,
      wouldExportArtifacts: packet.exportHandoffPreview.wouldExportArtifacts,
      requiredFutureApproval: packet.exportHandoffPreview.requiredFutureApproval,
    },
    exportHandoffReviewContractPreview: reviewContract.contract
      ? {
          reviewArtifactId: reviewContract.contract.reviewArtifactId,
          reviewerIdentity: reviewContract.contract.reviewerIdentity,
          reviewTimestamp: reviewContract.contract.reviewTimestamp,
          policyVersion: reviewContract.contract.policyVersion,
          decision: reviewContract.contract.decision,
          reasonCode: reviewContract.contract.reasonCode,
          approvalExpiresAt: reviewContract.contract.approvalExpiresAt,
          reviewArtifactHash: reviewContract.contract.reviewArtifactHash,
          exportEligible: eligibility.exportEligible,
          eligibilityReasonCode: eligibility.reasonCode,
          exportAllowed: reviewContract.contract.exportAllowed,
          mutationAllowed: reviewContract.contract.mutationAllowed,
          executionAllowed: reviewContract.contract.executionAllowed,
          liveIntegrationAllowed: reviewContract.contract.liveIntegrationAllowed,
        }
      : undefined,
    exportAllowed: packet.exportAllowed,
    mutationAllowed: packet.mutationAllowed,
    executionAllowed: packet.executionAllowed,
    liveIntegrationAllowed: packet.liveIntegrationAllowed,
  };
}
