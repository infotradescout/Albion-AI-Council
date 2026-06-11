import { describe, expect, it } from "vitest";
import {
  type AlbionQueueReplayEvidencePacket,
  buildAlbionDeterministicSnapshotMetadata,
  buildAlbionExportPreviewMetadata,
  createAlbionExportHandoffReviewContract,
  createAlbionQueueReplayEvidencePacket,
  createActionPacketQueue,
  evaluateAlbionExportEligibility,
  replayActionPacketQueue,
  serializeAlbionExportHandoffReviewContract,
  serializeAlbionQueueReplayEvidencePacket,
} from "../src/albion/albionActionPacketQueue";
import { validateAlbionReplayEvidencePacket } from "../src/albion/albionReplayEvidenceContracts";
import { buildApprovalActionPacket } from "../src/albion/albionApprovalActionPackets";
import { createAlbionRunLedger } from "../src/albion/albionRunLedger";
import { buildPrivateCommandSurfaceRuns } from "../src/albion/privateCommandSurfaceData";

const appBaseUrl = "https://albion.example.test";

function testLedger() {
  const runs = buildPrivateCommandSurfaceRuns({ appBaseUrl });

  return createAlbionRunLedger(runs.map((run) => run.ledgerRecord));
}

function testReplayInput() {
  const ledger = testLedger();
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
    ledger,
    appBaseUrl,
    expectedRunId: "albion-ai-governance-001",
  });

  return {
    ledger,
    queue,
    replayed,
  };
}

describe("Albion queue replay evidence packet snapshot contract", () => {
  it("uses stable key ordering in serialized output", () => {
    const { ledger, queue, replayed } = testReplayInput();
    const created = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      previousLedger: ledger,
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
    const { ledger, queue, replayed } = testReplayInput();
    const first = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      previousLedger: ledger,
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
      previousLedger: ledger,
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
    expect(first.packet?.exportHandoffPreview).toEqual(second.packet?.exportHandoffPreview);
  });

  it("serializes identically for repeated generation from same replay", () => {
    const { ledger, queue, replayed } = testReplayInput();
    const first = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      previousLedger: ledger,
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
      previousLedger: ledger,
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
    const { ledger, queue, replayed } = testReplayInput();
    const blocked = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      previousLedger: ledger,
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
      exportHandoffCopy: {
        handoffTitle: "Albion Evidence Export Handoff Preview",
      },
      exportHandoffReviewContractPreview: {
        reviewArtifactId: "review-evidence-albion-ai-governance-001-queue-replay",
        decision: "approved",
        exportEligible: true,
      },
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

  it("creates deterministic export handoff review contract with all authority flags false", () => {
    const { ledger, queue, replayed } = testReplayInput();
    const packet = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      previousLedger: ledger,
      evidencePacketId: "evidence-contract-005",
      queueId: "queue-contract-005",
      replayId: "replay-contract-005",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T11:10:00.000-05:00",
      appBaseUrl,
    });
    const firstReview = createAlbionExportHandoffReviewContract({
      reviewArtifactId: "review-contract-005",
      evidencePacket: packet.packet,
      reviewerIdentity: "founder.albion",
      reviewTimestamp: "2026-06-10T16:12:00.000Z",
      policyVersion: "albion_export_review_policy_v1",
      decision: "approved",
      reasonCode: "snapshot_approved",
      approvalValidForMinutes: 120,
    });
    const secondReview = createAlbionExportHandoffReviewContract({
      reviewArtifactId: "review-contract-005",
      evidencePacket: packet.packet,
      reviewerIdentity: "founder.albion",
      reviewTimestamp: "2026-06-10T16:12:00.000Z",
      policyVersion: "albion_export_review_policy_v1",
      decision: "approved",
      reasonCode: "snapshot_approved",
      approvalValidForMinutes: 120,
    });

    expect(firstReview.created).toBe(true);
    expect(secondReview.created).toBe(true);
    expect(firstReview.contract).toMatchObject({
      schemaVersion: "albion_export_review_contract_v1",
      reviewArtifactId: "review-contract-005",
      reviewerIdentity: "founder.albion",
      policyVersion: "albion_export_review_policy_v1",
      decision: "approved",
      reasonCode: "snapshot_approved",
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    });
    expect(
      serializeAlbionExportHandoffReviewContract(firstReview.contract!),
    ).toBe(serializeAlbionExportHandoffReviewContract(secondReview.contract!));
  });

  it("fails closed when review contract attempts live export authority", () => {
    const { ledger, queue, replayed } = testReplayInput();
    const packet = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      previousLedger: ledger,
      evidencePacketId: "evidence-contract-006",
      queueId: "queue-contract-006",
      replayId: "replay-contract-006",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T11:10:00.000-05:00",
      appBaseUrl,
    });
    const blocked = createAlbionExportHandoffReviewContract({
      reviewArtifactId: "review-contract-006",
      evidencePacket: packet.packet,
      reviewerIdentity: "founder.albion",
      reviewTimestamp: "2026-06-10T16:12:00.000Z",
      policyVersion: "albion_export_review_policy_v1",
      decision: "approved",
      reasonCode: "snapshot_approved",
      exportAllowed: true,
    });

    expect(blocked.created).toBe(false);
    expect(blocked.rejectedReason).toBe("export_allowed_true");
    expect(blocked.contract).toBeUndefined();
  });

  it("evaluates approved review as eligible metadata only", () => {
    const { ledger, queue, replayed } = testReplayInput();
    const evidence = createAlbionQueueReplayEvidencePacket({
      queue,
      queueReplayResult: replayed,
      previousLedger: ledger,
      evidencePacketId: "evidence-contract-007",
      queueId: "queue-contract-007",
      replayId: "replay-contract-007",
      runId: "albion-ai-governance-001",
      createdAt: "2026-06-10T11:10:00.000-05:00",
      appBaseUrl,
    });
    const snapshot = buildAlbionDeterministicSnapshotMetadata({
      evidencePacket: evidence.packet!,
      policyVersion: "albion_export_review_policy_v1",
    });
    const review = createAlbionExportHandoffReviewContract({
      reviewArtifactId: "review-contract-007",
      evidencePacket: evidence.packet,
      reviewerIdentity: "founder.albion",
      reviewTimestamp: "2026-06-10T16:12:00.000Z",
      policyVersion: "albion_export_review_policy_v1",
      decision: "approved",
      reasonCode: "snapshot_approved",
      approvalExpiresAt: "2026-06-10T18:12:00.000Z",
    });

    const eligibility = evaluateAlbionExportEligibility({
      exportPreview: buildAlbionExportPreviewMetadata(evidence.packet!),
      snapshot,
      reviewArtifact: review.contract,
      now: "2026-06-10T16:30:00.000Z",
    });

    expect(eligibility).toMatchObject({
      decision: "eligible_preview_only",
      reasonCode: "eligible_preview_only",
      exportEligible: true,
      previewOnly: true,
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    });
  });

  it("accepts replay evidence with previous-state link and full Roundtable 3/3 authority", () => {
    const packet = buildValidatedReplayEvidencePacket();

    expect(validateAlbionReplayEvidencePacket(packet)).toEqual({
      accepted: true,
      packet,
    });
  });

  it("rejects replay evidence missing previous-state link", () => {
    const packet = buildValidatedReplayEvidencePacket();
    const invalidPacket = {
      ...packet,
      previousLedgerHash: "",
    };

    const result = validateAlbionReplayEvidencePacket(invalidPacket);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("missing_previous_ledger_hash");
  });

  it("rejects replay evidence that claims execution from High Court-only authority", () => {
    const packet = buildValidatedReplayEvidencePacket();
    const invalidPacket: AlbionQueueReplayEvidencePacket = {
      ...packet,
      executionAuthority: {
        ...packet.executionAuthority,
        claimedForExecution: true,
        authoritySource: "high_court_advisory",
        approvalLevel: "roundtable_3_of_3",
        mandateStatus: "pending",
        approvedForMerlin: false,
        approvals: {
          Gawain: "pending",
          Lancelot: "pending",
          Percival: "pending",
        },
      },
    };

    const result = validateAlbionReplayEvidencePacket(invalidPacket);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe(
      "high_court_cannot_grant_execution_authority",
    );
  });

  it("rejects replay evidence with incomplete Roundtable execution authority", () => {
    const packet = buildValidatedReplayEvidencePacket();
    const invalidPacket: AlbionQueueReplayEvidencePacket = {
      ...packet,
      executionAuthority: {
        ...packet.executionAuthority,
        claimedForExecution: true,
        authoritySource: "roundtable_3_of_3",
        approvalLevel: "roundtable_3_of_3",
        mandateStatus: "pending",
        approvedForMerlin: false,
        approvals: {
          Gawain: "approve",
          Lancelot: "approve",
          Percival: "pending",
        },
      },
    };

    const result = validateAlbionReplayEvidencePacket(invalidPacket);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe(
      "roundtable_execution_authority_incomplete",
    );
  });

  it("rejects unknown fields instead of silently stripping them", () => {
    const packet = buildValidatedReplayEvidencePacket();
    const invalidPacket = {
      ...packet,
      mysteryField: "unexpected",
    };

    const result = validateAlbionReplayEvidencePacket(invalidPacket);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("unknown_field");
  });

  it("does not mutate the input object while validating", () => {
    const packet = buildValidatedReplayEvidencePacket();
    const input = structuredClone(packet);
    const before = JSON.stringify(input);

    validateAlbionReplayEvidencePacket(input);

    expect(JSON.stringify(input)).toBe(before);
  });
});

function buildValidatedReplayEvidencePacket(): AlbionQueueReplayEvidencePacket {
  const { ledger, queue, replayed } = testReplayInput();
  const created = createAlbionQueueReplayEvidencePacket({
    queue,
    queueReplayResult: replayed,
    previousLedger: ledger,
    evidencePacketId: "evidence-contract-authority-001",
    queueId: "queue-contract-authority-001",
    replayId: "replay-contract-authority-001",
    runId: "albion-ai-governance-001",
    createdAt: "2026-06-10T11:10:00.000-05:00",
    appBaseUrl,
  });

  expect(created.created).toBe(true);

  return {
    ...created.packet!,
    executionAuthority: {
      ...created.packet!.executionAuthority,
      claimedForExecution: true,
      authoritySource: "roundtable_3_of_3",
      approvalLevel: "roundtable_3_of_3",
      mandateStatus: "passed_3_of_3",
      approvedForMerlin: true,
      approvals: {
        Gawain: "approve",
        Lancelot: "approve",
        Percival: "approve",
      },
    },
  };
}
