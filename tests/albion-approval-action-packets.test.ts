import { describe, expect, it } from "vitest";
import {
  applyApprovalActionPacket,
  buildApprovalActionPacket,
  type ActionActor,
} from "../src/albion/albionApprovalActionPackets";
import {
  buildAlbionRunLedgerEntries,
  createAlbionRunLedger,
  restoreAlbionRunLedger,
  serializeAlbionRunLedger,
} from "../src/albion/albionRunLedger";
import { buildPrivateCommandSurfaceLedgerRecords } from "../src/albion/privateCommandSurfaceData";

const appBaseUrl = "https://albion.example.test";

function testLedger() {
  return createAlbionRunLedger(buildPrivateCommandSurfaceLedgerRecords());
}

describe("Albion approval action packets", () => {
  it("applies a Gawain approve packet to the ledger approval state", () => {
    const result = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-gawain-approve-001",
        runId: "scoutfitters-materials-003",
        actor: "Gawain",
        actionType: "knight_approve",
        createdAt: "2026-06-10T10:00:00.000-05:00",
        payload: {
          decisionReason: "Preparation route is acceptable.",
        },
      }),
    });

    const updatedRecord = result.resultingLedgerPreview.records.find(
      (record) => record.runId === "scoutfitters-materials-003",
    );

    expect(result.applied).toBe(true);
    expect(result.packet).toMatchObject({
      actorAuthority: "roundtable_knight",
      mutationAllowed: true,
      executionAllowed: false,
    });
    expect(updatedRecord?.approvals.Gawain).toBe("approve");
  });

  it("keeps Lancelot rejection blocking Merlin handoff", () => {
    const result = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-lancelot-reject-001",
        runId: "albion-ai-governance-001",
        actor: "Lancelot",
        actionType: "knight_reject",
        createdAt: "2026-06-10T10:05:00.000-05:00",
        payload: {
          decisionReason: "Route needs stronger controls.",
        },
      }),
    });

    expect(result.resultingRunPreview?.run.mandate).toMatchObject({
      roundtableDecision: "blocked",
      blockedBy: ["Lancelot"],
      mandateStatus: "blocked_not_unanimous",
      approvedForMerlin: false,
    });
    expect(result.resultingRunPreview?.merlinHandoffEligibility.blockers).toContain(
      "knight_rejection_active",
    );
  });

  it("lets Percival request changes and marks the route incomplete", () => {
    const result = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-percival-changes-001",
        runId: "albion-ai-governance-001",
        actor: "Percival",
        actionType: "knight_request_changes",
        createdAt: "2026-06-10T10:10:00.000-05:00",
        payload: {
          requestedChanges: "Show the practical owner and rollback path first.",
        },
      }),
    });

    expect(result.resultingRunPreview?.run.status).toBe("needs_revision");
    expect(result.resultingRunPreview?.run.consequenceForecastComplete).toBe(
      false,
    );
    expect(result.resultingRunPreview?.merlinHandoffEligibility.blockers).toEqual(
      expect.arrayContaining([
        "incomplete_consequence_forecast",
        "required_approval_not_satisfied",
        "knight_rejection_active",
      ]),
    );
  });

  it("persists High Court notes without approving the route", () => {
    const result = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-high-court-note-001",
        runId: "albion-ai-governance-001",
        actor: "High Court",
        actionType: "high_court_note",
        createdAt: "2026-06-10T10:15:00.000-05:00",
        payload: {
          recommendation: "approved",
          summary: "Advisory approval only; Roundtable remains final.",
        },
      }),
    });

    expect(result.resultingRunPreview?.ledgerRecord.advisoryNotes).toContainEqual(
      expect.objectContaining({
        source: "High Court",
        recommendation: "approved",
        summary: "Advisory approval only; Roundtable remains final.",
      }),
    );
    expect(result.resultingRunPreview?.run.mandate?.highCourtCanApprove).toBe(
      false,
    );
    expect(result.resultingRunPreview?.run.mandate?.approvedForMerlin).toBe(
      false,
    );
  });

  it("lets Scribe attach evidence without executing integrations", () => {
    const result = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-evidence-attach-001",
        runId: "scoutfitters-materials-003",
        actor: "Scribe",
        actionType: "evidence_attach",
        createdAt: "2026-06-10T10:18:00.000-05:00",
        payload: {
          evidence: {
            runId: "scoutfitters-materials-003",
            evidenceType: "local_packet",
            description: "Local production checklist draft.",
            driveFileUrl:
              "preview://drive/scoutfitters-materials-003/evidence/checklist",
            source: "local packet",
            addedBy: "Scribe",
            addedAt: "2026-06-10T10:18:00.000-05:00",
          },
        },
      }),
    });

    expect(result.applied).toBe(true);
    expect(result.packet).toMatchObject({
      actorAuthority: "scribe_local_record",
      executionAllowed: false,
    });
    expect(result.resultingRunPreview?.run.evidence).toContainEqual(
      expect.objectContaining({
        driveFileUrl:
          "preview://drive/scoutfitters-materials-003/evidence/checklist",
      }),
    );
  });

  it("does not let mark_run_complete bypass 3/3 approval", () => {
    const result = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-complete-001",
        runId: "albion-ai-governance-001",
        actor: "Gawain",
        actionType: "mark_run_complete",
        createdAt: "2026-06-10T10:20:00.000-05:00",
        payload: {
          currentLocationVerified: true,
          consequenceForecastComplete: true,
        },
      }),
    });

    expect(result.resultingRunPreview?.run.mandate?.mandateStatus).toBe(
      "pending",
    );
    expect(result.resultingRunPreview?.merlinHandoffEligibility).toEqual({
      eligible: false,
      blockers: ["required_approval_not_satisfied"],
    });
  });

  it("makes Merlin handoff eligible after 3/3 approval and complete run state", () => {
    const firstApproval = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-lancelot-approve-001",
        runId: "albion-ai-governance-001",
        actor: "Lancelot",
        actionType: "knight_approve",
        createdAt: "2026-06-10T10:25:00.000-05:00",
        payload: {
          decisionReason: "Controls are acceptable.",
        },
      }),
    });

    const completed = applyApprovalActionPacket({
      ledger: firstApproval.resultingLedgerPreview,
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-complete-002",
        runId: "albion-ai-governance-001",
        actor: "Gawain",
        actionType: "mark_run_complete",
        createdAt: "2026-06-10T10:30:00.000-05:00",
        payload: {
          currentLocationVerified: true,
          consequenceForecastComplete: true,
        },
      }),
    });

    expect(completed.resultingRunPreview?.run.mandate?.mandateStatus).toBe(
      "passed_3_of_3",
    );
    expect(completed.resultingRunPreview?.merlinHandoffEligibility).toEqual({
      eligible: true,
      blockers: [],
    });
  });

  it("keeps handoff preview packet preview-only", () => {
    const result = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-merlin-preview-001",
        runId: "albion-ai-governance-001",
        actor: "Merlin",
        actionType: "merlin_handoff_preview_requested",
        createdAt: "2026-06-10T10:35:00.000-05:00",
        payload: {
          requestedBy: "Merlin",
          reason: "Preview handoff readiness only.",
        },
      }),
    });

    expect(result.applied).toBe(true);
    expect(result.packet).toMatchObject({
      actorAuthority: "merlin_preview_only",
      mutationAllowed: true,
      executionAllowed: false,
    });
    expect(result.resultingRunPreview?.merlinHandoffEligibility.eligible).toBe(
      false,
    );
  });

  it("fails closed for invalid actor/action pairings", () => {
    const packet = buildApprovalActionPacket({
      packetId: "packet-invalid-001",
      runId: "albion-ai-governance-001",
      actor: "High Court",
      actionType: "knight_approve",
      createdAt: "2026-06-10T10:40:00.000-05:00",
      payload: {
        decisionReason: "Invalid approval attempt.",
      },
    });
    const result = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet,
    });

    expect(result.applied).toBe(false);
    expect(result.rejectedReason).toBe("mutation_not_allowed");
    expect(result.resultingRunPreview).toBeUndefined();
  });

  it("fails closed for unknown actors supplied from untyped data", () => {
    const result = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-invalid-actor-001",
        runId: "albion-ai-governance-001",
        actor: "Unknown Founder" as ActionActor,
        actionType: "knight_approve",
        createdAt: "2026-06-10T10:45:00.000-05:00",
        payload: {
          decisionReason: "Invalid actor.",
        },
      }),
    });

    expect(result.applied).toBe(false);
    expect(result.rejectedReason).toBe("mutation_not_allowed");
  });

  it("keeps restored ledgers with applied packets under kernel control", () => {
    const applied = applyApprovalActionPacket({
      ledger: testLedger(),
      appBaseUrl,
      packet: buildApprovalActionPacket({
        packetId: "packet-lancelot-approve-restore-001",
        runId: "albion-ai-governance-001",
        actor: "Lancelot",
        actionType: "knight_approve",
        createdAt: "2026-06-10T10:50:00.000-05:00",
        payload: {
          decisionReason: "Approve for restored-ledger check.",
        },
      }),
    });
    const restoredLedger = restoreAlbionRunLedger(
      serializeAlbionRunLedger(applied.resultingLedgerPreview),
    );
    const restoredEntry = buildAlbionRunLedgerEntries({
      ledger: restoredLedger,
      appBaseUrl,
    }).find((entry) => entry.run.runId === "albion-ai-governance-001");

    expect(restoredEntry?.run.mandate?.mandateStatus).toBe("passed_3_of_3");
    expect(restoredEntry?.merlinHandoffEligibility.eligible).toBe(true);
    expect(restoredEntry?.discordAlertPreview.alertType).toBe("merlin_ready");
  });
});
