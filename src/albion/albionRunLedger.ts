import {
  buildDiscordAlertPayload,
  buildDriveFolderPlan,
  canCreateMerlinHandoff,
  classifyApprovalRequirement,
  evaluateRoundtableMandate,
  type ApprovalVote,
  type DiscordAlertPayload,
  type DiscordAlertType,
  type DriveFolderPlan,
  type EvidenceRecord,
  type KnightName,
  type MerlinHandoffEligibility,
  type RouteClassificationInput,
  type RouteStatus,
  type RunRecord,
} from "./albionRunFlow";

export interface AlbionRunLedger {
  schemaVersion: "albion_run_ledger_v1";
  records: AlbionRunLedgerRecord[];
}

export interface AlbionRunLedgerRecord {
  runId: string;
  kingdomId: string;
  destination: string;
  currentLocationSummary: string;
  routeDepth: number;
  priority: RunRecord["priority"];
  status: RouteStatus;
  sponsor: KnightName;
  nextAction: string;
  currentLocationVerified: boolean;
  consequenceForecastComplete: boolean;
  classification: RouteClassificationInput;
  approvals: Record<KnightName, ApprovalVote>;
  evidence: EvidenceRecord[];
  advisoryNotes: AdvisoryNote[];
}

export interface AdvisoryNote {
  noteId: string;
  source: "High Court" | "Scribe" | "Council" | "Roundtable";
  recommendation?: "approved" | "blocked" | "needs_revision";
  summary: string;
  addedAt: string;
}

export interface AlbionRunLedgerEntry {
  ledgerRecord: AlbionRunLedgerRecord;
  run: RunRecord;
  alertType: DiscordAlertType;
  merlinHandoffEligibility: MerlinHandoffEligibility;
  driveVaultPlan: DriveFolderPlan;
  discordAlertPreview: DiscordAlertPayload;
}

export function createAlbionRunLedger(
  records: AlbionRunLedgerRecord[],
): AlbionRunLedger {
  return {
    schemaVersion: "albion_run_ledger_v1",
    records: [...records].sort((a, b) => a.runId.localeCompare(b.runId)),
  };
}

export function serializeAlbionRunLedger(ledger: AlbionRunLedger): string {
  return `${JSON.stringify(sortLedger(ledger), null, 2)}\n`;
}

export function restoreAlbionRunLedger(serializedLedger: string): AlbionRunLedger {
  const parsed = JSON.parse(serializedLedger) as AlbionRunLedger;

  if (parsed.schemaVersion !== "albion_run_ledger_v1") {
    throw new Error("Unsupported Albion run ledger schema version.");
  }

  return sortLedger(parsed);
}

export function buildAlbionRunLedgerEntries(input: {
  ledger: AlbionRunLedger;
  appBaseUrl: string;
}): AlbionRunLedgerEntry[] {
  return input.ledger.records.map((ledgerRecord) =>
    buildAlbionRunLedgerEntry({
      ledgerRecord,
      appBaseUrl: input.appBaseUrl,
    }),
  );
}

export function buildAlbionRunLedgerEntry(input: {
  ledgerRecord: AlbionRunLedgerRecord;
  appBaseUrl: string;
}): AlbionRunLedgerEntry {
  const approvalRequirement = classifyApprovalRequirement(
    input.ledgerRecord.classification,
  );
  const highCourtRecommendation = mostRecentHighCourtRecommendation(
    input.ledgerRecord.advisoryNotes,
  );
  const mandate = evaluateRoundtableMandate({
    approvalRequired: approvalRequirement.approvalRequired,
    approvalLevel: approvalRequirement.approvalLevel,
    approvals: input.ledgerRecord.approvals,
    highCourtRecommendation: highCourtRecommendation
      ? {
          recommendedDecision: highCourtRecommendation,
        }
      : undefined,
  });

  const run: RunRecord = {
    runId: input.ledgerRecord.runId,
    kingdomId: input.ledgerRecord.kingdomId,
    destination: input.ledgerRecord.destination,
    currentLocationSummary: input.ledgerRecord.currentLocationSummary,
    routeDepth: input.ledgerRecord.routeDepth,
    priority: input.ledgerRecord.priority,
    status: input.ledgerRecord.status,
    sponsor: input.ledgerRecord.sponsor,
    nextAction: input.ledgerRecord.nextAction,
    currentLocationVerified: input.ledgerRecord.currentLocationVerified,
    consequenceForecastComplete:
      input.ledgerRecord.consequenceForecastComplete,
    evidence: input.ledgerRecord.evidence,
    approvalRequirement,
    mandate,
  };

  const merlinHandoffEligibility = canCreateMerlinHandoff(run);
  const alertType = selectDiscordAlertType(run, merlinHandoffEligibility);

  return {
    ledgerRecord: input.ledgerRecord,
    run,
    alertType,
    merlinHandoffEligibility,
    driveVaultPlan: buildDriveFolderPlan(input.ledgerRecord.runId),
    discordAlertPreview: buildDiscordAlertPayload({
      alertType,
      runId: input.ledgerRecord.runId,
      appBaseUrl: input.appBaseUrl,
      status: input.ledgerRecord.status,
    }),
  };
}

function mostRecentHighCourtRecommendation(
  advisoryNotes: AdvisoryNote[],
): AdvisoryNote["recommendation"] | undefined {
  return [...advisoryNotes]
    .sort((a, b) =>
      `${a.addedAt}:${a.noteId}`.localeCompare(`${b.addedAt}:${b.noteId}`),
    )
    .reverse()
    .find((note) => note.source === "High Court")?.recommendation;
}

function selectDiscordAlertType(
  run: RunRecord,
  merlinHandoffEligibility: MerlinHandoffEligibility,
): DiscordAlertType {
  if (merlinHandoffEligibility.eligible) {
    return "merlin_ready";
  }

  if (run.mandate?.roundtableDecision === "blocked") {
    return "blocked";
  }

  return "approval_needed";
}

function sortLedger(ledger: AlbionRunLedger): AlbionRunLedger {
  return {
    schemaVersion: ledger.schemaVersion,
    records: [...ledger.records]
      .map((record) => ({
        ...record,
        advisoryNotes: [...record.advisoryNotes].sort((a, b) =>
          `${a.addedAt}:${a.noteId}`.localeCompare(`${b.addedAt}:${b.noteId}`),
        ),
        evidence: [...record.evidence].sort((a, b) =>
          `${a.runId}:${a.evidenceType}:${a.addedAt}`.localeCompare(
            `${b.runId}:${b.evidenceType}:${b.addedAt}`,
          ),
        ),
      }))
      .sort((a, b) => a.runId.localeCompare(b.runId)),
  };
}
