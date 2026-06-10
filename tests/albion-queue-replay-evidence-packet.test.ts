import { describe, expect, it } from "vitest";
import {
  createAlbionQueueReplayEvidencePacket,
  createActionPacketQueue,
  replayActionPacketQueue,
  serializeAlbionQueueReplayEvidencePacket,
} from "../src/albion/albionActionPacketQueue";
import { buildApprovalActionPacket } from "../src/albion/albionApprovalActionPackets";
import {
  createAlbionRunLedger,
  serializeAlbionRunLedger,
} from "../src/albion/albionRunLedger";
import { buildPrivateCommandSurfaceLedgerRecords } from "../src/albion/privateCommandSurfaceData";

const appBaseUrl = "https://albion.example.test";

function testLedger() {
  return createAlbionRunLedger(buildPrivateCommandSurfaceLedgerRecords());
}

function testQueue() {
  return createActionPacketQueue([
    buildApprovalActionPacket({
      packetId: "packet-lancelot-approve-evidence",
      runId: "albion-ai-governance-001",
      actor: "Lancelot",
      actionType: "knight_approve",
      createdAt: "2026-06-10T10:20:00.000-05:00",
      payload: { decisionReason: "P4 evidence coverage." },
    }),
    buildApprovalActionPacket({
      packetId: "packet-merlin-preview-evidence",
      runId: "albion-ai-governance-001",
      actor: "Merlin",
      actionType: "merlin_handoff_preview_requested",
      createdAt: "2026-06-10T10:21:00.000-05:00",
      payload: {
        requestedBy: "Merlin",
        reason: "Preview handoff readiness for export packet.",
      },
    }),
  ]);
}

describe("Albion queue replay evidence packet", () => {
  it("creates deterministic evidence packet from valid replay", () => {
    const queue = testQueue();
    const replayed = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
      expectedRunId: "albion-ai-governance-001",
    });

    const first = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-packet-001",
      queueId: "queue-albion-ai-governance-001",
      replayId: "replay-albion-ai-governance-001",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T10:40:00.000-05:00",
      appBaseUrl,
    });

    const second = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-packet-001",
      queueId: "queue-albion-ai-governance-001",
      replayId: "replay-albion-ai-governance-001",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T10:40:00.000-05:00",
      appBaseUrl,
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(true);
    expect(first.packet).toBeDefined();
    expect(first.packet?.packetCount).toBe(2);
    expect(first.packet?.acceptedPacketCount).toBe(2);
    expect(first.packet?.rejectedPacketCount).toBe(0);
    expect(first.packet?.runApprovalPreview.run.runId).toBe(
      "albion-ai-governance-001",
    );
    expect(first.packet?.merlinHandoffPreview).toBeDefined();
    expect(first.packet?.executionAllowed).toBe(false);
    expect(first.packet?.mutationAllowed).toBe(false);
    expect(first.packet?.exportAllowed).toBe(false);
    expect(first.packet?.liveIntegrationAllowed).toBe(false);
    expect(first.packet?.exportHandoffPreview).toMatchObject({
      handoffTitle: "Albion Evidence Export Handoff Preview",
      guardrails: {
        exportAllowed: false,
        mutationAllowed: false,
        executionAllowed: false,
        liveIntegrationAllowed: false,
      },
    });
    expect(first.packet?.ledgerPreviewHash).toBe(second.packet?.ledgerPreviewHash);
    expect(first.packet?.deterministicSummary).toBe(second.packet?.deterministicSummary);
    expect(
      serializeAlbionQueueReplayEvidencePacket(first.packet!),
    ).toBe(serializeAlbionQueueReplayEvidencePacket(second.packet!));
    expect(
      serializeAlbionRunLedger(first.packet!.resultingLedgerPreview),
    ).toBe(serializeAlbionRunLedger(second.packet!.resultingLedgerPreview));
  });

  it("refuses missing evidencePacketId", () => {
    const queue = testQueue();
    const replayed = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
      expectedRunId: "albion-ai-governance-001",
    });

    const result = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "",
      replayId: "replay-albion-ai-governance-001",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T10:40:00.000-05:00",
      appBaseUrl,
    });

    expect(result.created).toBe(false);
    expect(result.rejectedReason).toBe("missing_evidence_packet_id");
  });

  it("refuses replay and run mismatch", () => {
    const queue = testQueue();
    const replayed = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
      expectedRunId: "albion-ai-governance-001",
    });

    const result = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-packet-002",
      replayId: "replay-albion-ai-governance-001",
      runId: "tradescout-public-copy-002",
      createdAt: "2026-06-10T10:41:00.000-05:00",
      appBaseUrl,
    });

    expect(result.created).toBe(false);
    expect(result.rejectedReason).toBe("replay_run_mismatch");
  });

  it("refuses exportAllowed true", () => {
    const queue = testQueue();
    const replayed = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
      expectedRunId: "albion-ai-governance-001",
    });

    const result = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-packet-003",
      replayId: "replay-albion-ai-governance-001",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T10:41:00.000-05:00",
      appBaseUrl,
      exportAllowed: true,
    });

    expect(result.created).toBe(false);
    expect(result.rejectedReason).toBe("export_allowed_true");
  });

  it("refuses mutationAllowed true", () => {
    const queue = testQueue();
    const replayed = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
      expectedRunId: "albion-ai-governance-001",
    });

    const result = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-packet-004",
      replayId: "replay-albion-ai-governance-001",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T10:41:00.000-05:00",
      appBaseUrl,
      mutationAllowed: true,
    });

    expect(result.created).toBe(false);
    expect(result.rejectedReason).toBe("mutation_allowed_true");
  });

  it("refuses executionAllowed true", () => {
    const queue = testQueue();
    const replayed = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
      expectedRunId: "albion-ai-governance-001",
    });

    const result = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-packet-005",
      replayId: "replay-albion-ai-governance-001",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T10:41:00.000-05:00",
      appBaseUrl,
      executionAllowed: true,
    });

    expect(result.created).toBe(false);
    expect(result.rejectedReason).toBe("execution_allowed_true");
  });

  it("refuses liveIntegrationAllowed true", () => {
    const queue = testQueue();
    const replayed = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
      expectedRunId: "albion-ai-governance-001",
    });

    const result = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-packet-006",
      replayId: "replay-albion-ai-governance-001",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T10:41:00.000-05:00",
      appBaseUrl,
      liveIntegrationAllowed: true,
    });

    expect(result.created).toBe(false);
    expect(result.rejectedReason).toBe("live_integration_allowed_true");
  });
});
