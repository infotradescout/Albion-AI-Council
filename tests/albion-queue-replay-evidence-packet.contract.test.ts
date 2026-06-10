import { describe, expect, it } from "vitest";
import {
  createAlbionQueueReplayEvidencePacket,
  createActionPacketQueue,
  replayActionPacketQueue,
  serializeAlbionQueueReplayEvidencePacket,
} from "../src/albion/albionActionPacketQueue";
import { buildApprovalActionPacket } from "../src/albion/albionApprovalActionPackets";
import { createAlbionRunLedger } from "../src/albion/albionRunLedger";
import { buildPrivateCommandSurfaceRuns } from "../src/albion/privateCommandSurfaceData";

const appBaseUrl = "https://albion.example.test";

function testLedger() {
  const runs = buildPrivateCommandSurfaceRuns({ appBaseUrl });

  return createAlbionRunLedger(runs.map((run) => run.ledgerRecord));
}

function testReplayInput() {
  const queue = createActionPacketQueue([
    buildApprovalActionPacket({
      packetId: "packet-contract-lancelot-approve",
      runId: "albion-ai-governance-001",
      actor: "Lancelot",
      actionType: "knight_approve",
      createdAt: "2026-06-10T11:00:00.000-05:00",
      payload: { decisionReason: "Contract lock." },
    }),
  ]);
  const replayed = replayActionPacketQueue({
    queue,
    ledger: testLedger(),
    appBaseUrl,
    expectedRunId: "albion-ai-governance-001",
  });

  return {
    queue,
    replayed,
  };
}

describe("Albion queue replay evidence packet snapshot contract", () => {
  it("uses stable key ordering in serialized output", () => {
    const { queue, replayed } = testReplayInput();
    const created = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-contract-001",
      queueId: "queue-contract-001",
      replayId: "replay-contract-001",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T11:10:00.000-05:00",
      appBaseUrl,
    });

    expect(created.created).toBe(true);

    const serialized = serializeAlbionQueueReplayEvidencePacket(created.packet!);
    const acceptedIndex = serialized.indexOf('"acceptedPacketCount"');
    const createdAtIndex = serialized.indexOf('"createdAt"');
    const deterministicSummaryIndex = serialized.indexOf('"deterministicSummary"');
    const evidencePacketIdIndex = serialized.indexOf('"evidencePacketId"');
    const executionAllowedIndex = serialized.indexOf('"executionAllowed"');

    expect(acceptedIndex).toBeGreaterThan(-1);
    expect(createdAtIndex).toBeGreaterThan(acceptedIndex);
    expect(deterministicSummaryIndex).toBeGreaterThan(createdAtIndex);
    expect(evidencePacketIdIndex).toBeGreaterThan(deterministicSummaryIndex);
    expect(executionAllowedIndex).toBeGreaterThan(evidencePacketIdIndex);
  });

  it("keeps deterministicSummary and ledgerPreviewHash stable", () => {
    const { queue, replayed } = testReplayInput();
    const first = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-contract-002",
      queueId: "queue-contract-002",
      replayId: "replay-contract-002",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T11:10:00.000-05:00",
      appBaseUrl,
    });
    const second = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-contract-002",
      queueId: "queue-contract-002",
      replayId: "replay-contract-002",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T11:10:00.000-05:00",
      appBaseUrl,
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(true);
    expect(first.packet?.deterministicSummary).toBe(second.packet?.deterministicSummary);
    expect(first.packet?.ledgerPreviewHash).toBe(second.packet?.ledgerPreviewHash);
  });

  it("serializes identically for repeated generation from same replay", () => {
    const { queue, replayed } = testReplayInput();
    const first = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-contract-003",
      queueId: "queue-contract-003",
      replayId: "replay-contract-003",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T11:10:00.000-05:00",
      appBaseUrl,
    });
    const second = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-contract-003",
      queueId: "queue-contract-003",
      replayId: "replay-contract-003",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T11:10:00.000-05:00",
      appBaseUrl,
    });

    expect(
      serializeAlbionQueueReplayEvidencePacket(first.packet!),
    ).toBe(serializeAlbionQueueReplayEvidencePacket(second.packet!));
  });

  it("fails closed and cannot set exportAllowed true", () => {
    const { queue, replayed } = testReplayInput();
    const blocked = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      evidencePacketId: "evidence-contract-004",
      queueId: "queue-contract-004",
      replayId: "replay-contract-004",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T11:10:00.000-05:00",
      appBaseUrl,
      exportAllowed: true,
    });

    expect(blocked.created).toBe(false);
    expect(blocked.rejectedReason).toBe("export_allowed_true");
    expect(blocked.packet).toBeUndefined();
  });

  it("private command surface exposes metadata-only evidence preview", () => {
    const aiRun = buildPrivateCommandSurfaceRuns({ appBaseUrl }).find(
      (run) => run.run.runId === "albion-ai-governance-001",
    );

    expect(aiRun?.actionPacketPreview.evidencePacketPreviewMetadata).toBeDefined();
    expect(
      aiRun?.actionPacketPreview.evidencePacketPreviewMetadata,
    ).toMatchObject({
      runId: "albion-ai-governance-001",
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    });
    expect(
      aiRun?.actionPacketPreview.evidencePacketPreviewMetadata,
    ).not.toHaveProperty("resultingLedgerPreview");
    expect(
      aiRun?.actionPacketPreview.evidencePacketPreviewMetadata,
    ).not.toHaveProperty("runApprovalPreview");
  });
});
