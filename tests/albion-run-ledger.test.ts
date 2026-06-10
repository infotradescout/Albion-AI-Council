import { describe, expect, it } from "vitest";
import {
  buildAlbionRunLedgerEntries,
  createAlbionRunLedger,
  restoreAlbionRunLedger,
  serializeAlbionRunLedger,
  type AlbionRunLedgerRecord,
} from "../src/albion/albionRunLedger";
import {
  buildPrivateCommandSurfaceLedgerRecords,
  buildPrivateCommandSurfaceRuns,
} from "../src/albion/privateCommandSurfaceData";

const appBaseUrl = "https://albion.example.test";

function ledgerRecords(): AlbionRunLedgerRecord[] {
  return buildPrivateCommandSurfaceLedgerRecords();
}

describe("Albion persistent run ledger", () => {
  it("serializes and restores run records deterministically", () => {
    const ledger = createAlbionRunLedger([...ledgerRecords()].reverse());
    const serializedLedger = serializeAlbionRunLedger(ledger);
    const restoredLedger = restoreAlbionRunLedger(serializedLedger);

    expect(serializedLedger).toBe(
      serializeAlbionRunLedger(restoreAlbionRunLedger(serializedLedger)),
    );
    expect(restoredLedger.records.map((record) => record.runId)).toEqual([
      "albion-ai-governance-001",
      "scoutfitters-materials-003",
      "tradescout-public-copy-002",
    ]);
  });

  it("evaluates restored AI-related records through the governance kernel", () => {
    const restoredEntries = buildAlbionRunLedgerEntries({
      ledger: restoreAlbionRunLedger(
        serializeAlbionRunLedger(createAlbionRunLedger(ledgerRecords())),
      ),
      appBaseUrl,
    });
    const aiRun = restoredEntries.find(
      (entry) => entry.run.runId === "albion-ai-governance-001",
    );

    expect(aiRun?.run.approvalRequirement).toMatchObject({
      approvalRequired: true,
      approvalLevel: "roundtable_3_of_3",
      requiredKnights: ["Gawain", "Lancelot", "Percival"],
    });
    expect(aiRun?.run.mandate?.mandateStatus).toBe("pending");
    expect(aiRun?.merlinHandoffEligibility).toEqual({
      eligible: false,
      blockers: ["required_approval_not_satisfied"],
    });
  });

  it("preserves Knight rejection blocking after reload", () => {
    const restoredEntries = buildAlbionRunLedgerEntries({
      ledger: restoreAlbionRunLedger(
        serializeAlbionRunLedger(createAlbionRunLedger(ledgerRecords())),
      ),
      appBaseUrl,
    });
    const rejectedRun = restoredEntries.find(
      (entry) => entry.run.runId === "tradescout-public-copy-002",
    );

    expect(rejectedRun?.run.mandate).toMatchObject({
      roundtableDecision: "blocked",
      blockedBy: ["Gawain"],
      mandateStatus: "blocked_not_unanimous",
      approvedForMerlin: false,
    });
    expect(rejectedRun?.merlinHandoffEligibility.blockers).toContain(
      "knight_rejection_active",
    );
    expect(rejectedRun?.alertType).toBe("blocked");
  });

  it("persists High Court notes without granting approval authority", () => {
    const restoredEntries = buildAlbionRunLedgerEntries({
      ledger: restoreAlbionRunLedger(
        serializeAlbionRunLedger(createAlbionRunLedger(ledgerRecords())),
      ),
      appBaseUrl,
    });
    const aiRun = restoredEntries.find(
      (entry) => entry.run.runId === "albion-ai-governance-001",
    );

    expect(aiRun?.ledgerRecord.advisoryNotes).toContainEqual(
      expect.objectContaining({
        source: "High Court",
        recommendation: "approved",
      }),
    );
    expect(aiRun?.run.mandate?.highCourtCanApprove).toBe(false);
    expect(aiRun?.run.mandate?.approvedForMerlin).toBe(false);
  });

  it("recomputes handoff eligibility and previews consistently after restore", () => {
    const ledger = createAlbionRunLedger(ledgerRecords());
    const beforeRestore = buildAlbionRunLedgerEntries({
      ledger,
      appBaseUrl,
    });
    const afterRestore = buildAlbionRunLedgerEntries({
      ledger: restoreAlbionRunLedger(serializeAlbionRunLedger(ledger)),
      appBaseUrl,
    });

    expect(
      afterRestore.map((entry) => entry.merlinHandoffEligibility),
    ).toEqual(beforeRestore.map((entry) => entry.merlinHandoffEligibility));
    expect(afterRestore[0]?.driveVaultPlan.folders[0]).toMatch(
      /^\/Albion OS\/Runs\/.+\/packets$/,
    );
    expect(afterRestore[0]?.discordAlertPreview.appRunUrl).toMatch(
      /^https:\/\/albion\.example\.test\/runs\/.+$/,
    );
    expect(JSON.stringify(afterRestore)).toContain("preview://drive/");
  });

  it("lets the private command surface consume ledger-backed records", () => {
    const runs = buildPrivateCommandSurfaceRuns({ appBaseUrl });

    expect(runs[0]?.ledgerRecord.runId).toBe("albion-ai-governance-001");
    expect(runs[0]?.ledgerRecord.advisoryNotes.length).toBeGreaterThan(0);
    expect(runs.map((entry) => entry.run.runId)).toEqual([
      "albion-ai-governance-001",
      "scoutfitters-materials-003",
      "tradescout-public-copy-002",
    ]);
  });
});
