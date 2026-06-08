import { describe, expect, it } from "vitest";
import {
  buildDiscordAlertPayload,
  buildDriveFolderPlan,
  canCreateMerlinHandoff,
  classifyApprovalRequirement,
  evaluateRoundtableMandate,
  type EvidenceRecord,
  type RunRecord,
} from "../src/albion/albionRunFlow";

const evidence: EvidenceRecord = {
  runId: "run-001",
  evidenceType: "drive_artifact",
  description: "Route packet export",
  driveFileUrl: "https://drive.google.com/file/d/example",
  source: "Google Drive",
  addedBy: "Scribe",
  addedAt: "2026-06-08T12:00:00.000Z",
};

function approvedAiRun(): RunRecord {
  const approvalRequirement = classifyApprovalRequirement({
    isAiRelated: true,
  });

  const mandate = evaluateRoundtableMandate({
    approvalRequired: approvalRequirement.approvalRequired,
    approvalLevel: approvalRequirement.approvalLevel,
    approvals: {
      Gawain: "approve",
      Lancelot: "approve",
      Percival: "approve",
    },
  });

  return {
    runId: "run-001",
    kingdomId: "Albion Core",
    destination: "Approve AI governance route",
    currentLocationSummary: "Doctrine baseline locked",
    routeDepth: 5,
    priority: "P2",
    status: "approved",
    sponsor: "Gawain",
    nextAction: "Prepare Merlin handoff",
    currentLocationVerified: true,
    consequenceForecastComplete: true,
    evidence: [evidence],
    approvalRequirement,
    mandate,
  };
}

describe("Albion OS MVP run flow contract", () => {
  it("requires roundtable_3_of_3 for AI-related routes", () => {
    const requirement = classifyApprovalRequirement({
      isAiRelated: true,
      routeDepth: 1,
    });

    expect(requirement.approvalRequired).toBe(true);
    expect(requirement.approvalLevel).toBe("roundtable_3_of_3");
    expect(requirement.requiredKnights).toEqual([
      "Gawain",
      "Lancelot",
      "Percival",
    ]);
  });

  it("does not allow High Court output to approve work", () => {
    const mandate = evaluateRoundtableMandate({
      approvalRequired: true,
      approvalLevel: "roundtable_3_of_3",
      approvals: {
        Gawain: "pending",
        Lancelot: "pending",
        Percival: "pending",
      },
      highCourtRecommendation: {
        recommendedDecision: "approved",
      },
    });

    expect(mandate.highCourtCanApprove).toBe(false);
    expect(mandate.mandateStatus).toBe("pending");
    expect(mandate.approvedForMerlin).toBe(false);
  });

  it("does not create Merlin handoff eligibility without required approval", () => {
    const approvalRequirement = classifyApprovalRequirement({
      isAiRelated: true,
    });

    const run: RunRecord = {
      ...approvedAiRun(),
      approvalRequirement,
      mandate: evaluateRoundtableMandate({
        approvalRequired: true,
        approvalLevel: "roundtable_3_of_3",
        approvals: {
          Gawain: "approve",
          Lancelot: "pending",
          Percival: "approve",
        },
      }),
    };

    expect(canCreateMerlinHandoff(run)).toEqual({
      eligible: false,
      blockers: ["required_approval_not_satisfied"],
    });
  });

  it("allows low-risk draft runs to proceed with single-sponsor preparation", () => {
    const requirement = classifyApprovalRequirement({
      isAiRelated: false,
      riskFlags: [],
      routeDepth: 1,
    });

    expect(requirement.approvalRequired).toBe(false);
    expect(requirement.approvalLevel).toBe("single_sponsor_preparation");
    expect(requirement.requiredKnights).toEqual([]);
  });

  it("requires all three Knights for AI-governance runs", () => {
    const requirement = classifyApprovalRequirement({
      isAiRelated: true,
      riskFlags: ["core_albion_law_change"],
    });

    expect(requirement.requiredKnights).toEqual([
      "Gawain",
      "Lancelot",
      "Percival",
    ]);
  });

  it("blocks the route when one Knight rejects", () => {
    const mandate = evaluateRoundtableMandate({
      approvalRequired: true,
      approvalLevel: "roundtable_3_of_3",
      approvals: {
        Gawain: "approve",
        Lancelot: "reject",
        Percival: "approve",
      },
    });

    expect(mandate.roundtableDecision).toBe("blocked");
    expect(mandate.mandateStatus).toBe("blocked_not_unanimous");
    expect(mandate.blockedBy).toEqual(["Lancelot"]);
    expect(mandate.approvedForMerlin).toBe(false);
  });

  it("makes Merlin handoff eligible after all three Knights approve", () => {
    expect(canCreateMerlinHandoff(approvedAiRun())).toEqual({
      eligible: true,
      blockers: [],
    });
  });

  it("represents Drive evidence attachment in the run record", () => {
    const run = approvedAiRun();
    const folderPlan = buildDriveFolderPlan(run.runId);

    expect(run.evidence).toContainEqual(evidence);
    expect(folderPlan.folders).toContain(
      "/Albion OS/Runs/run-001/evidence",
    );
    expect(run.evidence[0]?.driveFileUrl).toContain("drive.google.com");
  });

  it("links Discord approval-needed and blocked alerts to the correct run", () => {
    const approvalNeeded = buildDiscordAlertPayload({
      alertType: "approval_needed",
      runId: "run-001",
      appBaseUrl: "https://albion.example.com",
    });
    const blocked = buildDiscordAlertPayload({
      alertType: "blocked",
      runId: "run-001",
      appBaseUrl: "https://albion.example.com/",
    });

    expect(approvalNeeded.appRunUrl).toBe(
      "https://albion.example.com/runs/run-001",
    );
    expect(blocked.appRunUrl).toBe("https://albion.example.com/runs/run-001");
    expect(approvalNeeded.alertType).toBe("approval_needed");
    expect(blocked.alertType).toBe("blocked");
    expect(approvalNeeded.message).toContain("app-recorded");
  });
});
