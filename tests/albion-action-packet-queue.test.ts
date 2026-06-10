import { describe, expect, it } from "vitest";
import {
  appendActionPacketToQueue,
  createActionPacketQueue,
  replayActionPacketQueue,
} from "../src/albion/albionActionPacketQueue";
import {
  buildApprovalActionPacket,
  type AlbionApprovalActionPacket,
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

function packet(input: {
  packetId: string;
  runId?: string;
  createdAt: string;
  actor?: "Gawain" | "Lancelot" | "Percival" | "High Court" | "Scribe" | "Merlin";
  actionType?:
    | "knight_approve"
    | "knight_reject"
    | "knight_request_changes"
    | "high_court_note"
    | "evidence_attach"
    | "mark_run_complete"
    | "merlin_handoff_preview_requested";
}): AlbionApprovalActionPacket {
  return buildApprovalActionPacket({
    packetId: input.packetId,
    runId: input.runId ?? "albion-ai-governance-001",
    actor: input.actor ?? "Lancelot",
    actionType: input.actionType ?? "knight_approve",
    createdAt: input.createdAt,
    payload: { decisionReason: "Queue replay test." },
  });
}

describe("Albion local action packet queue replay", () => {
  it("appends packets in deterministic createdAt then packetId order", () => {
    const first = packet({
      packetId: "packet-b",
      createdAt: "2026-06-10T10:10:00.000-05:00",
    });
    const second = packet({
      packetId: "packet-a",
      createdAt: "2026-06-10T10:10:00.000-05:00",
    });
    const third = packet({
      packetId: "packet-c",
      createdAt: "2026-06-10T10:05:00.000-05:00",
    });

    const withFirst = appendActionPacketToQueue({
      queue: createActionPacketQueue(),
      packet: first,
    });
    const withSecond = appendActionPacketToQueue({
      queue: withFirst.queue,
      packet: second,
    });
    const withThird = appendActionPacketToQueue({
      queue: withSecond.queue,
      packet: third,
    });

    expect(withThird.accepted).toBe(true);
    expect(withThird.queue.packets.map((queued) => queued.packetId)).toEqual([
      "packet-c",
      "packet-a",
      "packet-b",
    ]);
  });

  it("replays packets deterministically into the same ledger preview", () => {
    const queue = createActionPacketQueue([
      packet({
        packetId: "packet-complete",
        createdAt: "2026-06-10T10:30:00.000-05:00",
        actor: "Gawain",
        actionType: "mark_run_complete",
      }),
      packet({
        packetId: "packet-lancelot-approve",
        createdAt: "2026-06-10T10:20:00.000-05:00",
        actor: "Lancelot",
        actionType: "knight_approve",
      }),
    ]);
    const firstReplay = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
    });
    const secondReplay = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
    });

    expect(firstReplay.replayed).toBe(true);
    expect(firstReplay.appliedPacketIds).toEqual([
      "packet-lancelot-approve",
      "packet-complete",
    ]);
    expect(serializeAlbionRunLedger(firstReplay.resultingLedgerPreview)).toBe(
      serializeAlbionRunLedger(secondReplay.resultingLedgerPreview),
    );
  });

  it("refuses duplicate packetId on append", () => {
    const queue = createActionPacketQueue([
      packet({
        packetId: "packet-duplicate",
        createdAt: "2026-06-10T10:00:00.000-05:00",
      }),
    ]);
    const result = appendActionPacketToQueue({
      queue,
      packet: packet({
        packetId: "packet-duplicate",
        createdAt: "2026-06-10T10:01:00.000-05:00",
      }),
    });

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("duplicate_packet_id");
  });

  it("fails closed for missing packetId and missing runId", () => {
    const missingPacketId = appendActionPacketToQueue({
      queue: createActionPacketQueue(),
      packet: {
        ...packet({
          packetId: "packet-present",
          createdAt: "2026-06-10T10:00:00.000-05:00",
        }),
        packetId: "",
      },
    });
    const missingRunId = appendActionPacketToQueue({
      queue: createActionPacketQueue(),
      packet: {
        ...packet({
          packetId: "packet-missing-run",
          createdAt: "2026-06-10T10:00:00.000-05:00",
        }),
        runId: "",
      },
    });

    expect(missingPacketId.rejectedReason).toBe("missing_packet_id");
    expect(missingRunId.rejectedReason).toBe("missing_run_id");
  });

  it("fails closed for invalid actionType", () => {
    const result = appendActionPacketToQueue({
      queue: createActionPacketQueue(),
      packet: {
        ...packet({
          packetId: "packet-invalid-action",
          createdAt: "2026-06-10T10:00:00.000-05:00",
        }),
        actionType: "launch_dragon" as never,
      },
    });

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("invalid_action_type");
  });

  it("fails closed when a packet tampers mutationAllowed to true", () => {
    const tamperedPacket: AlbionApprovalActionPacket = {
      ...packet({
        packetId: "packet-tampered-mutation",
        createdAt: "2026-06-10T10:00:00.000-05:00",
        actor: "High Court",
        actionType: "knight_approve",
      }),
      mutationAllowed: true,
    };
    const result = appendActionPacketToQueue({
      queue: createActionPacketQueue(),
      packet: tamperedPacket,
    });

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("mutation_allowed_mismatch");
  });

  it("fails closed when executionAllowed is true", () => {
    const result = appendActionPacketToQueue({
      queue: createActionPacketQueue(),
      packet: {
        ...packet({
          packetId: "packet-execution-true",
          createdAt: "2026-06-10T10:00:00.000-05:00",
        }),
        executionAllowed: true,
      } as unknown as AlbionApprovalActionPacket,
    });

    expect(result.accepted).toBe(false);
    expect(result.rejectedReason).toBe("execution_allowed_true");
  });

  it("refuses packet runId mismatch during replay", () => {
    const queue = createActionPacketQueue([
      packet({
        packetId: "packet-mismatched-run",
        runId: "tradescout-public-copy-002",
        createdAt: "2026-06-10T10:00:00.000-05:00",
        actor: "Lancelot",
      }),
    ]);
    const result = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
      expectedRunId: "albion-ai-governance-001",
    });

    expect(result.replayed).toBe(false);
    expect(result.rejectedReason).toBe("packet_run_id_mismatch");
    expect(result.rejectedPacketId).toBe("packet-mismatched-run");
  });

  it("keeps High Court note advisory after queue replay", () => {
    const queue = createActionPacketQueue([
      buildApprovalActionPacket({
        packetId: "packet-high-court-advisory",
        runId: "albion-ai-governance-001",
        actor: "High Court",
        actionType: "high_court_note",
        createdAt: "2026-06-10T10:00:00.000-05:00",
        payload: {
          recommendation: "approved",
          summary: "Advisory only.",
        },
      }),
    ]);
    const result = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
    });
    const run = result.resultingRunPreviews.find(
      (entry) => entry.run.runId === "albion-ai-governance-001",
    );

    expect(result.replayed).toBe(true);
    expect(run?.run.mandate?.highCourtCanApprove).toBe(false);
    expect(run?.run.mandate?.approvedForMerlin).toBe(false);
  });

  it("keeps Knight approval path under existing authority rules", () => {
    const queue = createActionPacketQueue([
      packet({
        packetId: "packet-lancelot-approve-authority",
        createdAt: "2026-06-10T10:00:00.000-05:00",
        actor: "Lancelot",
      }),
    ]);
    const result = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
    });
    const run = result.resultingRunPreviews.find(
      (entry) => entry.run.runId === "albion-ai-governance-001",
    );

    expect(run?.run.mandate?.mandateStatus).toBe("passed_3_of_3");
    expect(run?.merlinHandoffEligibility.eligible).toBe(true);
  });

  it("restored replayed ledger still obeys the kernel", () => {
    const queue = createActionPacketQueue([
      packet({
        packetId: "packet-lancelot-approve-restore",
        createdAt: "2026-06-10T10:00:00.000-05:00",
        actor: "Lancelot",
      }),
    ]);
    const replayed = replayActionPacketQueue({
      queue,
      ledger: testLedger(),
      appBaseUrl,
    });
    const restoredEntries = buildAlbionRunLedgerEntries({
      ledger: restoreAlbionRunLedger(
        serializeAlbionRunLedger(replayed.resultingLedgerPreview),
      ),
      appBaseUrl,
    });
    const run = restoredEntries.find(
      (entry) => entry.run.runId === "albion-ai-governance-001",
    );

    expect(run?.run.mandate?.mandateStatus).toBe("passed_3_of_3");
    expect(run?.discordAlertPreview.alertType).toBe("merlin_ready");
  });
});
