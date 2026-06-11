import type { AlbionRunLedgerEntry, AlbionRunLedgerRecord, AdvisoryNote } from "./albionRunLedger";
import type {
  ApprovalRequirement,
  ApprovalVote,
  DiscordAlertPayload,
  DriveFolderPlan,
  EvidenceRecord,
  KnightName,
  MerlinHandoffEligibility,
  RoundtableMandate,
  RouteClassificationInput,
  RunRecord,
} from "./albionRunFlow";

export type AlbionImmutableRunLedgerEntryProofActionType =
  | "ledger_entry_recorded"
  | "ledger_entry_verified";

export interface AlbionRunLedgerEntryProofAuthorityEvidence {
  claimedForExecution: boolean;
  authoritySource: "none" | "high_court_advisory" | "roundtable_3_of_3";
  approvalRequired: boolean;
  approvalLevel: ApprovalRequirement["approvalLevel"];
  requiredKnights: KnightName[];
  approvals: Record<KnightName, ApprovalVote>;
  mandateStatus: NonNullable<RoundtableMandate["mandateStatus"]>;
  approvedForMerlin: boolean;
  highCourtAdvisoryOnly: true;
}

export interface AlbionImmutableRunLedgerEntryProof {
  schemaVersion: "albion_immutable_run_ledger_entry_proof_v1";
  runId: string;
  ledgerEntry: AlbionRunLedgerEntry;
  previousEntryHash: string;
  entryHash: string;
  proofHash: string;
  proofCreatedAt: string;
  proofActorId: string;
  proofActionType: AlbionImmutableRunLedgerEntryProofActionType;
  authorityEvidence: AlbionRunLedgerEntryProofAuthorityEvidence;
}

export type AlbionImmutableRunLedgerEntryProofRejectedReason =
  | "invalid_proof"
  | "unknown_field"
  | "invalid_schema_version"
  | "missing_previous_entry_hash"
  | "missing_entry_hash"
  | "missing_proof_hash"
  | "tampered_entry"
  | "invalid_authority_evidence"
  | "high_court_cannot_grant_execution_authority"
  | "roundtable_execution_authority_incomplete";

export interface AlbionImmutableRunLedgerEntryProofValidationResult {
  accepted: boolean;
  rejectedReason?: AlbionImmutableRunLedgerEntryProofRejectedReason;
  proof?: AlbionImmutableRunLedgerEntryProof;
}

export function createAlbionImmutableRunLedgerEntryProof(input: {
  ledgerEntry: AlbionRunLedgerEntry;
  previousEntryHash: string;
  proofCreatedAt: string;
  proofActorId: string;
  proofActionType: AlbionImmutableRunLedgerEntryProofActionType;
}): AlbionImmutableRunLedgerEntryProof {
  const entryHash = hashAlbionRunLedgerEntry(input.ledgerEntry);
  const authorityEvidence = buildAlbionRunLedgerEntryProofAuthorityEvidence(
    input.ledgerEntry,
  );

  return {
    schemaVersion: "albion_immutable_run_ledger_entry_proof_v1",
    runId: input.ledgerEntry.run.runId,
    ledgerEntry: input.ledgerEntry,
    previousEntryHash: input.previousEntryHash,
    entryHash,
    proofHash: computeAlbionImmutableRunLedgerEntryProofHash({
      runId: input.ledgerEntry.run.runId,
      previousEntryHash: input.previousEntryHash,
      entryHash,
      proofCreatedAt: input.proofCreatedAt,
      proofActorId: input.proofActorId,
      proofActionType: input.proofActionType,
      authorityEvidence,
    }),
    proofCreatedAt: input.proofCreatedAt,
    proofActorId: input.proofActorId,
    proofActionType: input.proofActionType,
    authorityEvidence,
  };
}

export function validateAlbionImmutableRunLedgerEntryProof(
  input: unknown,
): AlbionImmutableRunLedgerEntryProofValidationResult {
  if (!isPlainObject(input)) {
    return rejected("invalid_proof");
  }

  if (!hasExactKeys(input, TOP_LEVEL_KEYS)) {
    return rejected("unknown_field");
  }

  if (input.schemaVersion !== "albion_immutable_run_ledger_entry_proof_v1") {
    return rejected("invalid_schema_version");
  }

  if (!isNonEmptyString(input.previousEntryHash)) {
    return rejected("missing_previous_entry_hash");
  }

  if (!isNonEmptyString(input.entryHash)) {
    return rejected("missing_entry_hash");
  }

  if (!isNonEmptyString(input.proofHash)) {
    return rejected("missing_proof_hash");
  }

  if (!isImmutableRunLedgerEntryProofShape(input)) {
    return rejected("invalid_proof");
  }

  const proof = input;
  const computedEntryHash = hashAlbionRunLedgerEntry(proof.ledgerEntry);

  if (proof.entryHash !== computedEntryHash) {
    return rejected("tampered_entry");
  }

  const computedProofHash = computeAlbionImmutableRunLedgerEntryProofHash({
    runId: proof.runId,
    previousEntryHash: proof.previousEntryHash,
    entryHash: proof.entryHash,
    proofCreatedAt: proof.proofCreatedAt,
    proofActorId: proof.proofActorId,
    proofActionType: proof.proofActionType,
    authorityEvidence: proof.authorityEvidence,
  });

  if (proof.proofHash !== computedProofHash) {
    return rejected("invalid_proof");
  }

  if (proof.authorityEvidence.highCourtAdvisoryOnly !== true) {
    return rejected("invalid_authority_evidence");
  }

  if (proof.authorityEvidence.claimedForExecution) {
    if (proof.authorityEvidence.authoritySource === "high_court_advisory") {
      return rejected("high_court_cannot_grant_execution_authority");
    }

    if (
      proof.authorityEvidence.authoritySource !== "roundtable_3_of_3"
      || proof.authorityEvidence.approvalLevel !== "roundtable_3_of_3"
      || proof.authorityEvidence.mandateStatus !== "passed_3_of_3"
      || proof.authorityEvidence.approvedForMerlin !== true
      || proof.authorityEvidence.approvals.Gawain !== "approve"
      || proof.authorityEvidence.approvals.Lancelot !== "approve"
      || proof.authorityEvidence.approvals.Percival !== "approve"
    ) {
      return rejected("roundtable_execution_authority_incomplete");
    }
  }

  return {
    accepted: true,
    proof,
  };
}

export function serializeAlbionImmutableRunLedgerEntryProof(
  proof: AlbionImmutableRunLedgerEntryProof,
): string {
  return `${stableStringify(proof)}\n`;
}

export function hashAlbionRunLedgerEntry(entry: AlbionRunLedgerEntry): string {
  return hashString(stableStringify(entry));
}

export function computeAlbionImmutableRunLedgerEntryProofHash(input: {
  runId: string;
  previousEntryHash: string;
  entryHash: string;
  proofCreatedAt: string;
  proofActorId: string;
  proofActionType: AlbionImmutableRunLedgerEntryProofActionType;
  authorityEvidence: AlbionRunLedgerEntryProofAuthorityEvidence;
}): string {
  return hashString(buildProofHashMaterial(input));
}

export function buildAlbionRunLedgerEntryProofAuthorityEvidence(
  entry: AlbionRunLedgerEntry,
): AlbionRunLedgerEntryProofAuthorityEvidence {
  const mandate = entry.run.mandate;
  const hasHighCourtNote = entry.ledgerRecord.advisoryNotes.some(
    (note) => note.source === "High Court",
  );

  return {
    claimedForExecution: Boolean(mandate?.approvedForMerlin),
    authoritySource: mandate?.approvedForMerlin
      ? "roundtable_3_of_3"
      : hasHighCourtNote
        ? "high_court_advisory"
        : "none",
    approvalRequired: entry.run.approvalRequirement.approvalRequired,
    approvalLevel: entry.run.approvalRequirement.approvalLevel,
    requiredKnights: [...entry.run.approvalRequirement.requiredKnights],
    approvals: {
      ...(entry.run.mandate?.approvals ?? entry.ledgerRecord.approvals),
    },
    mandateStatus: entry.run.mandate?.mandateStatus ?? "pending",
    approvedForMerlin: Boolean(mandate?.approvedForMerlin),
    highCourtAdvisoryOnly: true,
  };
}

function buildProofHashMaterial(input: {
  runId: string;
  previousEntryHash: string;
  entryHash: string;
  proofCreatedAt: string;
  proofActorId: string;
  proofActionType: AlbionImmutableRunLedgerEntryProofActionType;
  authorityEvidence: AlbionRunLedgerEntryProofAuthorityEvidence;
}): string {
  return [
    input.runId,
    input.previousEntryHash,
    input.entryHash,
    input.proofCreatedAt,
    input.proofActorId,
    input.proofActionType,
    input.authorityEvidence.authoritySource,
    input.authorityEvidence.claimedForExecution ? "claimed" : "not_claimed",
    input.authorityEvidence.mandateStatus,
    input.authorityEvidence.approvedForMerlin ? "approved" : "blocked",
  ].join("|");
}

function rejected(
  rejectedReason: AlbionImmutableRunLedgerEntryProofRejectedReason,
): AlbionImmutableRunLedgerEntryProofValidationResult {
  return {
    accepted: false,
    rejectedReason,
  };
}

function isImmutableRunLedgerEntryProofShape(
  value: unknown,
): value is AlbionImmutableRunLedgerEntryProof {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.schemaVersion)
    && isNonEmptyString(value.runId)
    && isAlbionRunLedgerEntry(value.ledgerEntry)
    && value.runId === value.ledgerEntry.run.runId
    && isNonEmptyString(value.previousEntryHash)
    && isNonEmptyString(value.entryHash)
    && isNonEmptyString(value.proofHash)
    && isTimestampLike(value.proofCreatedAt)
    && isNonEmptyString(value.proofActorId)
    && isProofActionType(value.proofActionType)
    && isAuthorityEvidence(value.authorityEvidence)
  );
}

function isAuthorityEvidence(
  value: unknown,
): value is AlbionRunLedgerEntryProofAuthorityEvidence {
  if (!isPlainObject(value) || !hasExactKeys(value, AUTHORITY_EVIDENCE_KEYS)) {
    return false;
  }

  return (
    typeof value.claimedForExecution === "boolean"
    && ["none", "high_court_advisory", "roundtable_3_of_3"].includes(
      value.authoritySource as string,
    )
    && typeof value.approvalRequired === "boolean"
    && ["single_sponsor_preparation", "roundtable_3_of_3"].includes(
      value.approvalLevel as string,
    )
    && isKnightNameArray(value.requiredKnights)
    && isApprovalsRecord(value.approvals)
    && ["passed_3_of_3", "blocked_not_unanimous", "pending"].includes(
      value.mandateStatus as string,
    )
    && typeof value.approvedForMerlin === "boolean"
    && value.highCourtAdvisoryOnly === true
  );
}

function isAlbionRunLedgerEntry(value: unknown): value is AlbionRunLedgerEntry {
  if (!isPlainObject(value) || !hasExactKeys(value, LEDGER_ENTRY_KEYS)) {
    return false;
  }

  return (
    isAlbionRunLedgerRecord(value.ledgerRecord)
    && isRunRecord(value.run)
    && isDiscordAlertType(value.alertType)
    && isMerlinHandoffEligibility(value.merlinHandoffEligibility)
    && isDriveFolderPlan(value.driveVaultPlan)
    && isDiscordAlertPayload(value.discordAlertPreview)
  );
}

function isAlbionRunLedgerRecord(
  value: unknown,
): value is AlbionRunLedgerRecord {
  if (!isPlainObject(value) || !hasExactKeys(value, LEDGER_RECORD_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.runId)
    && isNonEmptyString(value.kingdomId)
    && isNonEmptyString(value.destination)
    && isNonEmptyString(value.currentLocationSummary)
    && isNonNegativeInteger(value.routeDepth)
    && isPriority(value.priority)
    && isRouteStatus(value.status)
    && isKnightName(value.sponsor)
    && isNonEmptyString(value.nextAction)
    && typeof value.currentLocationVerified === "boolean"
    && typeof value.consequenceForecastComplete === "boolean"
    && isRouteClassificationInput(value.classification)
    && isApprovalsRecord(value.approvals)
    && Array.isArray(value.evidence)
    && value.evidence.every((record) => isEvidenceRecord(record))
    && Array.isArray(value.advisoryNotes)
    && value.advisoryNotes.every((note) => isAdvisoryNote(note))
  );
}

function isRunRecord(value: unknown): value is RunRecord {
  if (!isPlainObject(value) || !hasExactKeys(value, RUN_RECORD_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.runId)
    && isNonEmptyString(value.kingdomId)
    && isNonEmptyString(value.destination)
    && isNonEmptyString(value.currentLocationSummary)
    && isNonNegativeInteger(value.routeDepth)
    && isPriority(value.priority)
    && isRouteStatus(value.status)
    && isKnightName(value.sponsor)
    && isNonEmptyString(value.nextAction)
    && typeof value.currentLocationVerified === "boolean"
    && typeof value.consequenceForecastComplete === "boolean"
    && Array.isArray(value.evidence)
    && value.evidence.every((record) => isEvidenceRecord(record))
    && isApprovalRequirement(value.approvalRequirement)
    && (value.mandate === undefined || isRoundtableMandate(value.mandate))
  );
}

function isApprovalRequirement(value: unknown): value is ApprovalRequirement {
  if (!isPlainObject(value) || !hasExactKeys(value, APPROVAL_REQUIREMENT_KEYS)) {
    return false;
  }

  return (
    typeof value.approvalRequired === "boolean"
    && ["single_sponsor_preparation", "roundtable_3_of_3"].includes(
      value.approvalLevel as string,
    )
    && isNonEmptyString(value.approvalReason)
    && isKnightNameArray(value.requiredKnights)
  );
}

function isRoundtableMandate(value: unknown): value is RoundtableMandate {
  if (!isPlainObject(value) || !hasExactKeys(value, ROUNDTABLE_MANDATE_KEYS)) {
    return false;
  }

  return (
    ["approved", "blocked", "needs_revision", "human_discussion_required"].includes(
      value.roundtableDecision as string,
    )
    && isKnightNameArray(value.requiredKnights)
    && isApprovalsRecord(value.approvals)
    && Array.isArray(value.blockedBy)
    && value.blockedBy.every((knight) => isKnightName(knight))
    && ["passed_3_of_3", "blocked_not_unanimous", "pending"].includes(
      value.mandateStatus as string,
    )
    && typeof value.approvedForMerlin === "boolean"
    && value.highCourtCanApprove === false
  );
}

function isRouteClassificationInput(
  value: unknown,
): value is RouteClassificationInput {
  if (!isPlainObject(value) || !hasExactKeys(value, ROUTE_CLASSIFICATION_KEYS)) {
    return false;
  }

  return (
    typeof value.isAiRelated === "boolean"
    && (value.riskFlags === undefined || isStringArray(value.riskFlags))
    && (value.routeDepth === undefined || isNonNegativeInteger(value.routeDepth))
  );
}

function isEvidenceRecord(value: unknown): value is EvidenceRecord {
  if (!isPlainObject(value) || !hasExactKeys(value, EVIDENCE_RECORD_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.runId)
    && isNonEmptyString(value.evidenceType)
    && isNonEmptyString(value.description)
    && isNonEmptyString(value.driveFileUrl)
    && isNonEmptyString(value.source)
    && isNonEmptyString(value.addedBy)
    && isTimestampLike(value.addedAt)
  );
}

function isAdvisoryNote(value: unknown): value is AdvisoryNote {
  if (!isPlainObject(value) || !hasExactKeys(value, ADVISORY_NOTE_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.noteId)
    && ["High Court", "Scribe", "Council", "Roundtable"].includes(
      value.source as string,
    )
    && (value.recommendation === undefined
      || ["approved", "blocked", "needs_revision"].includes(
        value.recommendation as string,
      ))
    && isNonEmptyString(value.summary)
    && isTimestampLike(value.addedAt)
  );
}

function isMerlinHandoffEligibility(
  value: unknown,
): value is MerlinHandoffEligibility {
  if (!isPlainObject(value) || !hasExactKeys(value, MERLIN_HANDOFF_KEYS)) {
    return false;
  }

  return typeof value.eligible === "boolean" && isStringArray(value.blockers);
}

function isDriveFolderPlan(value: unknown): value is DriveFolderPlan {
  if (!isPlainObject(value) || !hasExactKeys(value, DRIVE_FOLDER_PLAN_KEYS)) {
    return false;
  }

  return isNonEmptyString(value.runId) && isStringArray(value.folders);
}

function isDiscordAlertPayload(value: unknown): value is DiscordAlertPayload {
  if (!isPlainObject(value) || !hasExactKeys(value, DISCORD_ALERT_KEYS)) {
    return false;
  }

  return (
    isNonEmptyString(value.runId)
    && isDiscordAlertType(value.alertType)
    && isNonEmptyString(value.message)
    && isNonEmptyString(value.appRunUrl)
  );
}

function isApprovalsRecord(value: unknown): value is Record<string, unknown> {
  if (!isPlainObject(value) || !hasExactKeys(value, APPROVAL_KEYS)) {
    return false;
  }

  return (
    isApprovalVote(value.Gawain)
    && isApprovalVote(value.Lancelot)
    && isApprovalVote(value.Percival)
  );
}

function isApprovalVote(value: unknown): boolean {
  return ["approve", "reject", "abstain", "pending"].includes(value as string);
}

function isPriority(value: unknown): boolean {
  return ["P0", "P1", "P2", "P3", "P4"].includes(value as string);
}

function isRouteStatus(value: unknown): boolean {
  return [
    "intake",
    "routing",
    "in_progress",
    "high_court_review",
    "roundtable_review",
    "approved",
    "blocked",
    "needs_revision",
    "reroute_required",
    "human_discussion_required",
    "done",
  ].includes(value as string);
}

function isDiscordAlertType(value: unknown): boolean {
  return ["approval_needed", "blocked", "merlin_ready"].includes(value as string);
}

function isKnightName(value: unknown): boolean {
  return ["Gawain", "Lancelot", "Percival"].includes(value as string);
}

function isKnightNameArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((entry) => isKnightName(entry));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => isNonEmptyString(entry));
}

function isTimestampLike(value: unknown): boolean {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isNonNegativeInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isProofActionType(value: unknown): boolean {
  return ["ledger_entry_recorded", "ledger_entry_verified"].includes(value as string);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort();
  const sortedExpected = [...expectedKeys].sort();

  return (
    actualKeys.length === sortedExpected.length
    && actualKeys.every((key, index) => key === sortedExpected[index])
  );
}

function hashString(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableSortValue(value), null, 2);
}

function stableSortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stableSortValue(item));
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const sortedEntries = Object.keys(objectValue)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => [key, stableSortValue(objectValue[key])] as const);

    return Object.fromEntries(sortedEntries);
  }

  return value;
}

const TOP_LEVEL_KEYS = [
  "authorityEvidence",
  "entryHash",
  "ledgerEntry",
  "previousEntryHash",
  "proofActionType",
  "proofActorId",
  "proofCreatedAt",
  "proofHash",
  "runId",
  "schemaVersion",
] as const;

const AUTHORITY_EVIDENCE_KEYS = [
  "approvalLevel",
  "approvalRequired",
  "approvedForMerlin",
  "approvals",
  "authoritySource",
  "claimedForExecution",
  "highCourtAdvisoryOnly",
  "mandateStatus",
  "requiredKnights",
] as const;

const LEDGER_ENTRY_KEYS = [
  "alertType",
  "discordAlertPreview",
  "driveVaultPlan",
  "ledgerRecord",
  "merlinHandoffEligibility",
  "run",
] as const;

const LEDGER_RECORD_KEYS = [
  "advisoryNotes",
  "approvals",
  "classification",
  "consequenceForecastComplete",
  "currentLocationSummary",
  "currentLocationVerified",
  "destination",
  "evidence",
  "kingdomId",
  "nextAction",
  "priority",
  "routeDepth",
  "runId",
  "sponsor",
  "status",
] as const;

const RUN_RECORD_KEYS = [
  "approvalRequirement",
  "consequenceForecastComplete",
  "currentLocationSummary",
  "currentLocationVerified",
  "destination",
  "evidence",
  "kingdomId",
  "mandate",
  "nextAction",
  "priority",
  "routeDepth",
  "runId",
  "sponsor",
  "status",
] as const;

const APPROVAL_REQUIREMENT_KEYS = [
  "approvalLevel",
  "approvalReason",
  "approvalRequired",
  "requiredKnights",
] as const;

const ROUNDTABLE_MANDATE_KEYS = [
  "approvedForMerlin",
  "approvals",
  "blockedBy",
  "highCourtCanApprove",
  "mandateStatus",
  "requiredKnights",
  "roundtableDecision",
] as const;

const ROUTE_CLASSIFICATION_KEYS = [
  "isAiRelated",
  "riskFlags",
  "routeDepth",
] as const;

const EVIDENCE_RECORD_KEYS = [
  "addedAt",
  "addedBy",
  "description",
  "driveFileUrl",
  "evidenceType",
  "runId",
  "source",
] as const;

const ADVISORY_NOTE_KEYS = [
  "addedAt",
  "noteId",
  "recommendation",
  "source",
  "summary",
] as const;

const MERLIN_HANDOFF_KEYS = ["blockers", "eligible"] as const;

const DRIVE_FOLDER_PLAN_KEYS = ["folders", "runId"] as const;

const DISCORD_ALERT_KEYS = ["alertType", "appRunUrl", "message", "runId"] as const;

const APPROVAL_KEYS = ["Gawain", "Lancelot", "Percival"] as const;
