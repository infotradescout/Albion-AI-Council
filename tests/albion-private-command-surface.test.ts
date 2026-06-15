import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPrivateCommandSurfaceState,
  renderPrivateCommandSurface,
} from "../src/albion/privateCommandSurface";
import { buildPrivateCommandSurfaceRuns } from "../src/albion/privateCommandSurfaceData";
import { currentRunIdFromLocation } from "../src/main";

describe("Albion OS private command surface read model", () => {
  const runs = buildPrivateCommandSurfaceRuns({
    appBaseUrl: "https://albion.example.test",
  });

  it("displays AI-related routes as Roundtable 3/3 approval work", () => {
    const aiRun = runs.find(
      (candidate) => candidate.run.runId === "albion-ai-governance-001",
    );

    expect(aiRun?.run.approvalRequirement).toMatchObject({
      approvalRequired: true,
      approvalLevel: "roundtable_3_of_3",
      requiredKnights: ["Gawain", "Lancelot", "Percival"],
    });
    expect(aiRun?.run.mandate?.highCourtCanApprove).toBe(false);
    expect(aiRun?.run.mandate?.mandateStatus).toBe("pending");
    expect(aiRun?.merlinHandoffEligibility).toEqual({
      eligible: false,
      blockers: ["required_approval_not_satisfied"],
    });
    expect(aiRun?.alertType).toBe("approval_needed");
  });

  it("keeps High Court recommendations advisory and blocks handoff on Knight rejection", () => {
    const rejectedRun = runs.find(
      (candidate) => candidate.run.runId === "tradescout-public-copy-002",
    );

    expect(rejectedRun?.run.mandate).toMatchObject({
      roundtableDecision: "blocked",
      blockedBy: ["Gawain"],
      mandateStatus: "blocked_not_unanimous",
      approvedForMerlin: false,
      highCourtCanApprove: false,
    });
    expect(rejectedRun?.merlinHandoffEligibility.blockers).toContain(
      "required_approval_not_satisfied",
    );
    expect(rejectedRun?.merlinHandoffEligibility.blockers).toContain(
      "knight_rejection_active",
    );
    expect(rejectedRun?.alertType).toBe("blocked");
  });

  it("shows Drive and Discord outputs as deterministic previews only", () => {
    const aiRun = runs[0];

    expect(aiRun?.driveVaultPlan.folders).toEqual([
      "/Albion OS/Runs/albion-ai-governance-001/packets",
      "/Albion OS/Runs/albion-ai-governance-001/evidence",
      "/Albion OS/Runs/albion-ai-governance-001/court-review",
      "/Albion OS/Runs/albion-ai-governance-001/roundtable-mandate",
      "/Albion OS/Runs/albion-ai-governance-001/merlin-handoff",
    ]);
    expect(aiRun?.discordAlertPreview).toMatchObject({
      runId: "albion-ai-governance-001",
      alertType: "approval_needed",
      appRunUrl:
        "https://albion.example.test/runs/albion-ai-governance-001",
    });
    expect(aiRun?.actionPacketPreview.packet).toMatchObject({
      actionType: "merlin_handoff_preview_requested",
      actorAuthority: "merlin_preview_only",
      executionAllowed: false,
    });
    expect(aiRun?.actionPacketPreview).toMatchObject({
      queuedPacketCount: 1,
      replayed: true,
      evidencePacketCreated: true,
    });
    expect(aiRun?.actionPacketPreview.evidencePacketPreviewMetadata).toMatchObject({
      runId: "albion-ai-governance-001",
      packetCount: 1,
      acceptedPacketCount: 1,
      rejectedPacketCount: 0,
      exportHandoffCopy: {
        handoffTitle: "Albion Evidence Export Handoff Preview",
      },
      exportHandoffReviewContractPreview: {
        reviewArtifactId: "review-evidence-albion-ai-governance-001-queue-replay",
        reviewerIdentity: "founder.albion",
        policyVersion: "albion_export_review_policy_v1",
        decision: "approved",
        exportEligible: true,
        exportAllowed: false,
        mutationAllowed: false,
        executionAllowed: false,
        liveIntegrationAllowed: false,
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
});

describe("Albion OS private command surface rendering", () => {
  it("parses both hash run links and generated app run URLs", () => {
    expect(
      currentRunIdFromLocation({
        hash: "#/runs/tradescout-public-copy-002",
        pathname: "/",
      }),
    ).toBe("tradescout-public-copy-002");
    expect(
      currentRunIdFromLocation({
        hash: "",
        pathname: "/runs/tradescout-public-copy-002",
      }),
    ).toBe("tradescout-public-copy-002");
    expect(
      currentRunIdFromLocation({
        hash: "#/runs/tradescout-public-copy-002",
        pathname: "/runs/albion-ai-governance-001",
      }),
    ).toBe("tradescout-public-copy-002");
  });

  it("renders run list, run detail, approvals, handoff, and previews", () => {
    const html = renderPrivateCommandSurface(
      createPrivateCommandSurfaceState({
        appBaseUrl: "https://albion.example.test",
        activeRunId: "tradescout-public-copy-002",
      }),
    );

    expect(html).toContain("Albion OS Private Command Surface P0");
    expect(html).toContain("Run Control");
    expect(html).toContain("tradescout-public-copy-002");
    expect(html).toContain("Approval State");
    expect(html).toContain("High Court Binding");
    expect(html).toContain("No");
    expect(html).toContain("Advisory notes");
    expect(html).toContain("High Court");
    expect(html).toContain("Merlin Handoff");
    expect(html).toContain("Not eligible");
    expect(html).toContain("Drive Vault Plan Preview");
    expect(html).toContain("Discord Alert Preview");
    expect(html).toContain("Action Packet Preview");
    expect(html).toContain("Evidence Export Preview");
    expect(html).toContain("Export Handoff Copy");
    expect(html).toContain("Export Handoff Review Contract");
    expect(html).toContain("Execution Allowed");
    expect(html).toContain("Export Allowed");
    expect(html).toContain("Live Integration Allowed");
    expect(html).toContain("Queued Packets");
    expect(html).toContain("Replay Preview");
    expect(html).toContain("/Albion OS/Runs/tradescout-public-copy-002/evidence");
  });

  it("keeps audited layout surfaces constrained against page overflow", () => {
    const styles = readFileSync(resolve("src/styles.css"), "utf8");

    expect(styles).toContain("overflow-x: hidden;");
    expect(styles).toContain(".surface-grid");
    expect(styles).toContain("min-width: 0;");
    expect(styles).toContain("overflow-wrap: anywhere;");
    expect(styles).toContain("max-width: 100%;");
  });
});
