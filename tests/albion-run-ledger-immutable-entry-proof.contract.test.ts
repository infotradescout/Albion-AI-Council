import { describe, expect, it } from "vitest";
import {
  buildAlbionRunLedgerEntry,
  createAlbionRunLedger,
  type AlbionRunLedgerRecord,
} from "../src/albion/albionRunLedger";
import {
  computeAlbionImmutableRunLedgerEntryProofHash,
  createAlbionImmutableRunLedgerEntryProof,
  type AlbionImmutableRunLedgerEntryProof,
  serializeAlbionImmutableRunLedgerEntryProof,
  validateAlbionImmutableRunLedgerEntryProof,
} from "../src/albion/albionImmutableRunLedgerEntryProof";
import { buildPrivateCommandSurfaceLedgerRecords } from "../src/albion/privateCommandSurfaceData";

const appBaseUrl = "https://albion.example.test";

function buildBaseLedgerRecords(): AlbionRunLedgerRecord[] {
  return buildPrivateCommandSurfaceLedgerRecords();
}

function buildPendingAiEntry() {
  const ledger = createAlbionRunLedger(buildBaseLedgerRecords());
  const record = ledger.records.find(
    (candidate) => candidate.runId === "albion-ai-governance-001",
  );

  return buildAlbionRunLedgerEntry({
    ledgerRecord: structuredClone(record!),
    appBaseUrl,
  });
}

function buildApprovedAiEntry() {
  const records = buildBaseLedgerRecords().map((record) =>
    record.runId === "albion-ai-governance-001"
      ? {
          ...record,
          approvals: {
            Gawain: "approve" as const,
            Lancelot: "approve" as const,
            Percival: "approve" as const,
          },
        }
      : record,
  );
  const ledger = createAlbionRunLedger(records);
  const record = ledger.records.find(
    (candidate) => candidate.runId === "albion-ai-governance-001",
  );

  return buildAlbionRunLedgerEntry({
    ledgerRecord: structuredClone(record!),
    appBaseUrl,
  });
}

function buildValidProof(): AlbionImmutableRunLedgerEntryProof {
  return createAlbionImmutableRunLedgerEntryProof({
    ledgerEntry: buildApprovedAiEntry(),
    previousEntryHash: "fnv1a32:prev0001",
    proofCreatedAt: "2026-06-11T16:40:00.000Z",
    proofActorId: "scribe.albion",
    proofActionType: "ledger_entry_recorded",
  });
}

describe("Albion immutable run ledger entry proof contract", () => {
  it("accepts a valid immutable proof", () => {
    const proof = buildValidProof();

    expect(validateAlbionImmutableRunLedgerEntryProof(proof)).toEqual({
      accepted: true,
      proof,
    });
  });

  it("serializes deterministically for repeated proof generation", () => {
    const first = buildValidProof();
    const second = buildValidProof();

    expect(serializeAlbionImmutableRunLedgerEntryProof(first)).toBe(
      serializeAlbionImmutableRunLedgerEntryProof(second),
    );
  });

  it("rejects a proof without the previous-state link", () => {
    const proof = {
      ...buildValidProof(),
      previousEntryHash: "",
    };

    const result = validateAlbionImmutableRunLedgerEntryProof(proof);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("missing_previous_entry_hash");
  });

  it("rejects a proof without the current entry hash", () => {
    const proof = {
      ...buildValidProof(),
      entryHash: "",
    };

    const result = validateAlbionImmutableRunLedgerEntryProof(proof);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("missing_entry_hash");
  });

  it("rejects a proof without the proof hash", () => {
    const proof = {
      ...buildValidProof(),
      proofHash: "",
    };

    const result = validateAlbionImmutableRunLedgerEntryProof(proof);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("missing_proof_hash");
  });

  it("rejects a tampered ledger entry when the entry hash no longer matches", () => {
    const proof = buildValidProof();
    const tamperedProof: AlbionImmutableRunLedgerEntryProof = {
      ...proof,
      ledgerEntry: {
        ...proof.ledgerEntry,
        ledgerRecord: {
          ...proof.ledgerEntry.ledgerRecord,
          nextAction: "Tampered next action without recomputing the proof.",
        },
      },
    };

    const result = validateAlbionImmutableRunLedgerEntryProof(tamperedProof);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("tampered_entry");
  });

  it("rejects High Court-only authority when execution is claimed", () => {
    const proof = createAlbionImmutableRunLedgerEntryProof({
      ledgerEntry: buildPendingAiEntry(),
      previousEntryHash: "fnv1a32:prev0002",
      proofCreatedAt: "2026-06-11T16:41:00.000Z",
      proofActorId: "scribe.albion",
      proofActionType: "ledger_entry_verified",
    });
    const invalidProof: AlbionImmutableRunLedgerEntryProof = {
      ...proof,
      authorityEvidence: {
        ...proof.authorityEvidence,
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
    invalidProof.proofHash = computeAlbionImmutableRunLedgerEntryProofHash({
      runId: invalidProof.runId,
      previousEntryHash: invalidProof.previousEntryHash,
      entryHash: invalidProof.entryHash,
      proofCreatedAt: invalidProof.proofCreatedAt,
      proofActorId: invalidProof.proofActorId,
      proofActionType: invalidProof.proofActionType,
      authorityEvidence: invalidProof.authorityEvidence,
    });

    const result = validateAlbionImmutableRunLedgerEntryProof(invalidProof);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe(
      "high_court_cannot_grant_execution_authority",
    );
  });

  it("rejects incomplete Roundtable authority when execution is claimed", () => {
    const proof = buildValidProof();
    const invalidProof: AlbionImmutableRunLedgerEntryProof = {
      ...proof,
      authorityEvidence: {
        ...proof.authorityEvidence,
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
    invalidProof.proofHash = computeAlbionImmutableRunLedgerEntryProofHash({
      runId: invalidProof.runId,
      previousEntryHash: invalidProof.previousEntryHash,
      entryHash: invalidProof.entryHash,
      proofCreatedAt: invalidProof.proofCreatedAt,
      proofActorId: invalidProof.proofActorId,
      proofActionType: invalidProof.proofActionType,
      authorityEvidence: invalidProof.authorityEvidence,
    });

    const result = validateAlbionImmutableRunLedgerEntryProof(invalidProof);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe(
      "roundtable_execution_authority_incomplete",
    );
  });

  it("accepts full Gawain, Lancelot, and Percival authority when execution is claimed", () => {
    const proof = buildValidProof();

    expect(proof.authorityEvidence).toMatchObject({
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
    });
    expect(validateAlbionImmutableRunLedgerEntryProof(proof)).toEqual({
      accepted: true,
      proof,
    });
  });

  it("rejects unknown fields instead of silently stripping them", () => {
    const proof = {
      ...buildValidProof(),
      mysteryField: "unexpected",
    };

    const result = validateAlbionImmutableRunLedgerEntryProof(proof);

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("unknown_field");
  });

  it("does not mutate the input object while validating", () => {
    const input = structuredClone(buildValidProof());
    const before = JSON.stringify(input);

    validateAlbionImmutableRunLedgerEntryProof(input);

    expect(JSON.stringify(input)).toBe(before);
  });
});
