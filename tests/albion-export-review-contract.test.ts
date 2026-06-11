import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildAlbionDeterministicSnapshotMetadata,
  buildAlbionExportPreviewMetadata,
  createAlbionExportHandoffReviewContract,
  createAlbionQueueReplayEvidencePacket,
  createActionPacketQueue,
  evaluateAlbionExportEligibility,
  replayActionPacketQueue,
} from "../src/albion/albionActionPacketQueue";
import { buildApprovalActionPacket } from "../src/albion/albionApprovalActionPackets";
import { createAlbionRunLedger } from "../src/albion/albionRunLedger";
import { buildPrivateCommandSurfaceLedgerRecords } from "../src/albion/privateCommandSurfaceData";

const appBaseUrl = "https://albion.example.test";

function buildEvidencePacket() {
  const queue = createActionPacketQueue([
    buildApprovalActionPacket({
      packetId: "packet-p7-lancelot-approve",
      runId: "albion-ai-governance-001",
      actor: "Lancelot",
      actionType: "knight_approve",
      createdAt: "2026-06-10T11:20:00.000-05:00",
      payload: { decisionReason: "P7 governance proof." },
    }),
  ]);
  const replay = replayActionPacketQueue({
    queue,
    ledger: createAlbionRunLedger(buildPrivateCommandSurfaceLedgerRecords()),
    appBaseUrl,
    expectedRunId: "albion-ai-governance-001",
  });
  const evidence = createAlbionQueueReplayEvidencePacket({
    queue,
    queueReplayResult: replay,
    evidencePacketId: "evidence-p7-001",
    queueId: "queue-p7-001",
    replayId: "replay-p7-001",
    runId: "albion-ai-governance-001",
    createdAt: "2026-06-10T16:25:00.000Z",
    appBaseUrl,
  });

  expect(evidence.created).toBe(true);
  return evidence.packet!;
}

function buildApprovedReviewArtifact() {
  const evidencePacket = buildEvidencePacket();
  const review = createAlbionExportHandoffReviewContract({
    reviewArtifactId: "review-p7-001",
    evidencePacket,
    reviewerIdentity: "founder.albion",
    reviewTimestamp: "2026-06-10T16:30:00.000Z",
    policyVersion: "albion_export_review_policy_v1",
    decision: "approved",
    reasonCode: "snapshot_verified",
    approvalExpiresAt: "2026-06-10T18:30:00.000Z",
  });

  expect(review.created).toBe(true);
  return {
    evidencePacket,
    reviewArtifact: review.contract!,
    snapshot: buildAlbionDeterministicSnapshotMetadata({
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
    }),
    exportPreview: buildAlbionExportPreviewMetadata(evidencePacket),
  };
}

describe("P7 export review eligibility fail-closed rules", () => {
  it("denies when review artifact is missing", () => {
    const built = buildApprovedReviewArtifact();

    const result = evaluateAlbionExportEligibility({
      exportPreview: built.exportPreview,
      snapshot: built.snapshot,
      now: "2026-06-10T16:35:00.000Z",
    });

    expect(result.reasonCode).toBe("missing_review_artifact");
    expect(result.exportEligible).toBe(false);
  });

  it("denies when snapshot hash mismatches", () => {
    const built = buildApprovedReviewArtifact();

    const result = evaluateAlbionExportEligibility({
      exportPreview: built.exportPreview,
      snapshot: {
        ...built.snapshot,
        snapshotHash: "fnv1a32:deadbeef",
      },
      reviewArtifact: built.reviewArtifact,
      now: "2026-06-10T16:35:00.000Z",
    });

    expect(result.reasonCode).toBe("snapshot_hash_mismatch");
    expect(result.exportEligible).toBe(false);
  });

  it("denies when policy version mismatches", () => {
    const built = buildApprovedReviewArtifact();

    const result = evaluateAlbionExportEligibility({
      exportPreview: built.exportPreview,
      snapshot: {
        ...built.snapshot,
        policyVersion: "albion_export_review_policy_v2",
      },
      reviewArtifact: built.reviewArtifact,
      now: "2026-06-10T16:35:00.000Z",
    });

    expect(result.reasonCode).toBe("policy_version_mismatch");
    expect(result.exportEligible).toBe(false);
  });

  it("denies when approval is expired", () => {
    const built = buildApprovedReviewArtifact();

    const result = evaluateAlbionExportEligibility({
      exportPreview: built.exportPreview,
      snapshot: built.snapshot,
      reviewArtifact: built.reviewArtifact,
      now: "2026-06-10T18:31:00.000Z",
    });

    expect(result.reasonCode).toBe("expired_review_artifact");
    expect(result.exportEligible).toBe(false);
  });

  it("denies when review is revoked", () => {
    const built = buildApprovedReviewArtifact();

    const revokedReview = {
      ...built.reviewArtifact,
      revocation: {
        isRevoked: true,
        revokedAt: "2026-06-10T16:45:00.000Z",
        revokedBy: "high-court-audit",
        revocationReasonCode: "manual_revoke",
      },
    };

    const result = evaluateAlbionExportEligibility({
      exportPreview: built.exportPreview,
      snapshot: built.snapshot,
      reviewArtifact: revokedReview,
      now: "2026-06-10T16:50:00.000Z",
    });

    expect(result.reasonCode).toBe("revoked_review_artifact");
    expect(result.exportEligible).toBe(false);
  });

  it("denies when review decision is rejected", () => {
    const built = buildApprovedReviewArtifact();

    const rejectedReview = {
      ...built.reviewArtifact,
      decision: "rejected" as const,
      reasonCode: "manual_reject",
    };

    const result = evaluateAlbionExportEligibility({
      exportPreview: built.exportPreview,
      snapshot: built.snapshot,
      reviewArtifact: rejectedReview,
      now: "2026-06-10T16:50:00.000Z",
    });

    expect(result.reasonCode).toBe("rejected_review_decision");
    expect(result.exportEligible).toBe(false);
  });

  it("denies malformed reviewer identity and malformed timestamp", () => {
    const built = buildApprovedReviewArtifact();

    const badIdentity = evaluateAlbionExportEligibility({
      exportPreview: built.exportPreview,
      snapshot: built.snapshot,
      reviewArtifact: {
        ...built.reviewArtifact,
        reviewerIdentity: "x",
      },
      now: "2026-06-10T16:50:00.000Z",
    });

    const badTimestamp = evaluateAlbionExportEligibility({
      exportPreview: built.exportPreview,
      snapshot: built.snapshot,
      reviewArtifact: {
        ...built.reviewArtifact,
        reviewTimestamp: "bad-timestamp",
      },
      now: "2026-06-10T16:50:00.000Z",
    });

    expect(badIdentity.reasonCode).toBe("malformed_reviewer_identity");
    expect(badTimestamp.reasonCode).toBe("malformed_review_timestamp");
  });

  it("returns eligible metadata only for valid approval", () => {
    const built = buildApprovedReviewArtifact();

    const result = evaluateAlbionExportEligibility({
      exportPreview: built.exportPreview,
      snapshot: built.snapshot,
      reviewArtifact: built.reviewArtifact,
      now: "2026-06-10T16:40:00.000Z",
    });

    expect(result).toMatchObject({
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

  it("does not add connector or live export paths", () => {
    const files = [
      "src/albion/albionActionPacketQueue.ts",
      "src/albion/privateCommandSurfaceData.ts",
      "src/albion/privateCommandSurface.ts",
      "src/albion/albionRunFlow.ts",
    ];
    const source = files
      .map((file) => readFileSync(resolve(file), "utf8"))
      .join("\n");

    const forbiddenTokens = [
      "googleapis",
      "sheets.googleapis.com",
      "drive.googleapis.com",
      "discord.js",
      "discordapp.com/api",
      "webhook",
      "executeExport",
      "performLiveExport",
      "postToDiscord",
      "runExportJob",
      "mutationRoute",
      "executionRoute",
    ];

    for (const token of forbiddenTokens) {
      expect(source.toLowerCase()).not.toContain(token.toLowerCase());
    }
  });
});
