import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildAlbionDeterministicSnapshotMetadata,
  buildAlbionExportPreviewMetadata,
  createAlbionExportHandoffReviewContract,
  createAlbionExportReviewHistoryArtifact,
  createAlbionExportReviewRevocationArtifact,
  createAlbionQueueReplayEvidencePacket,
  createActionPacketQueue,
  evaluateAlbionExportEligibilityFromHistory,
  replayActionPacketQueue,
  serializeAlbionExportReviewHistoryArtifact,
  serializeAlbionExportReviewRevocationArtifact,
} from "../src/albion/albionActionPacketQueue";
import { buildApprovalActionPacket } from "../src/albion/albionApprovalActionPackets";
import { createAlbionRunLedger } from "../src/albion/albionRunLedger";
import { buildPrivateCommandSurfaceLedgerRecords } from "../src/albion/privateCommandSurfaceData";

const appBaseUrl = "https://albion.example.test";

function buildEvidencePacket() {
  const queue = createActionPacketQueue([
    buildApprovalActionPacket({
      packetId: "packet-p8-lancelot-approve",
      runId: "albion-ai-governance-001",
      actor: "Lancelot",
      actionType: "knight_approve",
      createdAt: "2026-06-10T11:20:00.000-05:00",
      payload: { decisionReason: "P8 history proof." },
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
    evidencePacketId: "evidence-p8-001",
    queueId: "queue-p8-001",
    replayId: "replay-p8-001",
    runId: "albion-ai-governance-001",
    createdAt: "2026-06-10T16:00:00.000Z",
    appBaseUrl,
  });

  expect(evidence.created).toBe(true);
  return evidence.packet!;
}

function buildReviewArtifact(input: {
  evidencePacket: ReturnType<typeof buildEvidencePacket>;
  id: string;
  timestamp: string;
  decision: "approved" | "rejected";
  expiresAt?: string;
}) {
  const review = createAlbionExportHandoffReviewContract({
    reviewArtifactId: input.id,
    evidencePacket: input.evidencePacket,
    reviewerIdentity: "founder.albion",
    reviewTimestamp: input.timestamp,
    policyVersion: "albion_export_review_policy_v1",
    decision: input.decision,
    reasonCode: input.decision === "approved" ? "approved_for_preview" : "rejected_for_preview",
    approvalExpiresAt: input.expiresAt ?? "2026-06-10T18:00:00.000Z",
  });

  expect(review.created).toBe(true);
  return review.contract!;
}

function evaluateFromHistory(history?: Parameters<typeof evaluateAlbionExportEligibilityFromHistory>[0]["reviewHistory"], now = "2026-06-10T16:30:00.000Z") {
  const evidencePacket = buildEvidencePacket();
  const snapshot = buildAlbionDeterministicSnapshotMetadata({
    evidencePacket,
    policyVersion: "albion_export_review_policy_v1",
  });

  return evaluateAlbionExportEligibilityFromHistory({
    exportPreview: buildAlbionExportPreviewMetadata(evidencePacket),
    snapshot,
    reviewHistory: history,
    now,
  });
}

describe("P8 revocation and review history governance", () => {
  it("denies when history is missing", () => {
    const result = evaluateFromHistory(undefined);

    expect(result.reasonCode).toBe("missing_review_history");
    expect(result.exportEligible).toBe(false);
  });

  it("denies when history is empty", () => {
    const evidencePacket = buildEvidencePacket();
    const history = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-empty",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [],
      revocationArtifacts: [],
    });

    expect(history.created).toBe(true);

    const snapshot = buildAlbionDeterministicSnapshotMetadata({
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
    });
    const result = evaluateAlbionExportEligibilityFromHistory({
      exportPreview: buildAlbionExportPreviewMetadata(evidencePacket),
      snapshot,
      reviewHistory: history.artifact,
      now: "2026-06-10T16:30:00.000Z",
    });

    expect(result.reasonCode).toBe("empty_review_history");
  });

  it("denies when approval is revoked", () => {
    const evidencePacket = buildEvidencePacket();
    const approved = buildReviewArtifact({
      evidencePacket,
      id: "review-approved-01",
      timestamp: "2026-06-10T16:05:00.000Z",
      decision: "approved",
    });
    const revocation = createAlbionExportReviewRevocationArtifact({
      revocationArtifactId: "revoke-01",
      evidencePacket,
      revokedReviewArtifactHash: approved.reviewArtifactHash,
      revokerIdentity: "founder.albion",
      revocationTimestamp: "2026-06-10T16:10:00.000Z",
      reasonCode: "manual_revoke",
      policyVersion: "albion_export_review_policy_v1",
    });
    const history = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-revoked",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [approved],
      revocationArtifacts: [revocation.artifact!],
    });

    expect(revocation.created).toBe(true);
    expect(history.created).toBe(true);

    const result = evaluateFromHistory(history.artifact);
    expect(result.reasonCode).toBe("latest_approval_revoked");
  });

  it("denies when approval is superseded by newer rejection", () => {
    const evidencePacket = buildEvidencePacket();
    const approved = buildReviewArtifact({
      evidencePacket,
      id: "review-approved-02",
      timestamp: "2026-06-10T16:05:00.000Z",
      decision: "approved",
    });
    const rejected = buildReviewArtifact({
      evidencePacket,
      id: "review-rejected-02",
      timestamp: "2026-06-10T16:15:00.000Z",
      decision: "rejected",
    });
    const history = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-superseded",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [approved, rejected],
      revocationArtifacts: [],
    });

    expect(history.created).toBe(true);

    const result = evaluateFromHistory(history.artifact);
    expect(result.reasonCode).toBe("approval_superseded_by_newer_rejection");
  });

  it("returns eligible when rejection is superseded by newer approval", () => {
    const evidencePacket = buildEvidencePacket();
    const rejected = buildReviewArtifact({
      evidencePacket,
      id: "review-rejected-03",
      timestamp: "2026-06-10T16:05:00.000Z",
      decision: "rejected",
    });
    const approved = buildReviewArtifact({
      evidencePacket,
      id: "review-approved-03",
      timestamp: "2026-06-10T16:15:00.000Z",
      decision: "approved",
      expiresAt: "2026-06-10T18:30:00.000Z",
    });
    const history = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-reapproved",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [rejected, approved],
      revocationArtifacts: [],
    });

    const result = evaluateFromHistory(history.artifact, "2026-06-10T16:20:00.000Z");

    expect(result).toMatchObject({
      reasonCode: "eligible_preview_only",
      decision: "eligible_preview_only",
      exportEligible: true,
      previewOnly: true,
      exportAllowed: false,
      mutationAllowed: false,
      executionAllowed: false,
      liveIntegrationAllowed: false,
    });
  });

  it("denies when latest approval is expired", () => {
    const evidencePacket = buildEvidencePacket();
    const approved = buildReviewArtifact({
      evidencePacket,
      id: "review-approved-expired",
      timestamp: "2026-06-10T16:05:00.000Z",
      decision: "approved",
      expiresAt: "2026-06-10T16:10:00.000Z",
    });
    const history = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-expired",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [approved],
      revocationArtifacts: [],
    });

    const result = evaluateFromHistory(history.artifact, "2026-06-10T16:30:00.000Z");
    expect(result.reasonCode).toBe("expired_review_artifact");
  });

  it("denies policy mismatch and snapshot mismatch", () => {
    const evidencePacket = buildEvidencePacket();
    const approved = buildReviewArtifact({
      evidencePacket,
      id: "review-approved-mismatch",
      timestamp: "2026-06-10T16:05:00.000Z",
      decision: "approved",
    });
    const history = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-mismatch",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [approved],
      revocationArtifacts: [],
    });

    const preview = buildAlbionExportPreviewMetadata(evidencePacket);
    const policyMismatch = evaluateAlbionExportEligibilityFromHistory({
      exportPreview: preview,
      snapshot: {
        snapshotHash: evidencePacket.ledgerPreviewHash,
        policyVersion: "albion_export_review_policy_v2",
        snapshotTimestamp: evidencePacket.createdAt,
      },
      reviewHistory: history.artifact,
      now: "2026-06-10T16:20:00.000Z",
    });
    const snapshotMismatch = evaluateAlbionExportEligibilityFromHistory({
      exportPreview: preview,
      snapshot: {
        snapshotHash: "fnv1a32:badbeef0",
        policyVersion: "albion_export_review_policy_v1",
        snapshotTimestamp: evidencePacket.createdAt,
      },
      reviewHistory: history.artifact,
      now: "2026-06-10T16:20:00.000Z",
    });

    expect(policyMismatch.reasonCode).toBe("policy_version_mismatch");
    expect(snapshotMismatch.reasonCode).toBe("snapshot_hash_mismatch");
  });

  it("denies malformed history ordering", () => {
    const evidencePacket = buildEvidencePacket();
    const older = buildReviewArtifact({
      evidencePacket,
      id: "review-older",
      timestamp: "2026-06-10T16:05:00.000Z",
      decision: "approved",
    });
    const newer = buildReviewArtifact({
      evidencePacket,
      id: "review-newer",
      timestamp: "2026-06-10T16:15:00.000Z",
      decision: "approved",
    });

    const malformedOrderHistory = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-order",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [newer, older],
      revocationArtifacts: [],
    });

    expect(malformedOrderHistory.created).toBe(true);

    const badHistory = {
      ...malformedOrderHistory.artifact!,
      orderedReviewArtifacts: [newer, older],
    };

    const result = evaluateFromHistory(badHistory);
    expect(result.reasonCode).toBe("malformed_history_ordering");
  });

  it("denies malformed revocation artifact and unknown revoked hash", () => {
    const evidencePacket = buildEvidencePacket();
    const approved = buildReviewArtifact({
      evidencePacket,
      id: "review-approved-revoke",
      timestamp: "2026-06-10T16:05:00.000Z",
      decision: "approved",
    });

    const validRevocation = createAlbionExportReviewRevocationArtifact({
      revocationArtifactId: "revoke-valid",
      evidencePacket,
      revokedReviewArtifactHash: approved.reviewArtifactHash,
      revokerIdentity: "founder.albion",
      revocationTimestamp: "2026-06-10T16:08:00.000Z",
      reasonCode: "manual_revoke",
      policyVersion: "albion_export_review_policy_v1",
    });

    const malformedRevocationHistory = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-malformed-revocation",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [approved],
      revocationArtifacts: [
        {
          ...validRevocation.artifact!,
          revocationTimestamp: "bad-time",
        },
      ],
    });

    const unknownHashHistory = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-unknown-hash",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [approved],
      revocationArtifacts: [
        {
          ...validRevocation.artifact!,
          revokedReviewArtifactHash: "fnv1a32:ffffffff",
        },
      ],
    });

    const malformedResult = evaluateFromHistory(malformedRevocationHistory.artifact);
    const unknownHashResult = evaluateFromHistory(unknownHashHistory.artifact);

    expect(malformedResult.reasonCode).toBe("malformed_revocation_artifact");
    expect(unknownHashResult.reasonCode).toBe("revoked_artifact_hash_not_found");
  });

  it("produces deterministic revocation and history artifacts", () => {
    const evidencePacket = buildEvidencePacket();
    const approved = buildReviewArtifact({
      evidencePacket,
      id: "review-approved-hash",
      timestamp: "2026-06-10T16:05:00.000Z",
      decision: "approved",
    });

    const revocationA = createAlbionExportReviewRevocationArtifact({
      revocationArtifactId: "revoke-hash-01",
      evidencePacket,
      revokedReviewArtifactHash: approved.reviewArtifactHash,
      revokerIdentity: "founder.albion",
      revocationTimestamp: "2026-06-10T16:09:00.000Z",
      reasonCode: "manual_revoke",
      policyVersion: "albion_export_review_policy_v1",
    });
    const revocationB = createAlbionExportReviewRevocationArtifact({
      revocationArtifactId: "revoke-hash-01",
      evidencePacket,
      revokedReviewArtifactHash: approved.reviewArtifactHash,
      revokerIdentity: "founder.albion",
      revocationTimestamp: "2026-06-10T16:09:00.000Z",
      reasonCode: "manual_revoke",
      policyVersion: "albion_export_review_policy_v1",
    });

    const historyA = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-hash-01",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [approved],
      revocationArtifacts: [revocationA.artifact!],
    });
    const historyB = createAlbionExportReviewHistoryArtifact({
      historyArtifactId: "history-hash-01",
      evidencePacket,
      policyVersion: "albion_export_review_policy_v1",
      reviewArtifacts: [approved],
      revocationArtifacts: [revocationB.artifact!],
    });

    expect(serializeAlbionExportReviewRevocationArtifact(revocationA.artifact!)).toBe(
      serializeAlbionExportReviewRevocationArtifact(revocationB.artifact!),
    );
    expect(serializeAlbionExportReviewHistoryArtifact(historyA.artifact!)).toBe(
      serializeAlbionExportReviewHistoryArtifact(historyB.artifact!),
    );
  });

  it("does not add connector, webhook, export runtime, or connector env requirements", () => {
    const files = [
      "src/albion/albionActionPacketQueue.ts",
      "src/albion/privateCommandSurfaceData.ts",
      "src/albion/privateCommandSurface.ts",
      "src/albion/albionRunFlow.ts",
    ];
    const source = files
      .map((file) => readFileSync(resolve(file), "utf8"))
      .join("\n")
      .toLowerCase();

    const forbiddenTokens = [
      "googleapis",
      "sheets.googleapis.com",
      "drive.googleapis.com",
      "discord.js",
      "discordapp.com/api",
      "webhook dispatch",
      "webhookurl",
      "executeexport",
      "performliveexport",
      "runexportjob",
      "mutationroute",
      "executionroute",
      "google_sheets_api_key",
      "google_drive_api_key",
      "discord_token",
      "webhook_secret",
      "connector_credential",
    ];

    for (const token of forbiddenTokens) {
      expect(source).not.toContain(token);
    }
  });
});
