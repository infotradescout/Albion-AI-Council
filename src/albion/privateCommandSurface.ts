import {
  buildPrivateCommandSurfaceRuns,
  type PrivateCommandSurfaceRun,
} from "./privateCommandSurfaceData";

export interface PrivateCommandSurfaceState {
  activeRunId: string;
  runs: PrivateCommandSurfaceRun[];
}

export function createPrivateCommandSurfaceState(input?: {
  appBaseUrl?: string;
  activeRunId?: string;
}): PrivateCommandSurfaceState {
  const runs = buildPrivateCommandSurfaceRuns({
    appBaseUrl: input?.appBaseUrl ?? "http://localhost:5173",
  });
  const activeRunId = input?.activeRunId ?? runs[0]?.run.runId ?? "";

  return {
    activeRunId,
    runs,
  };
}

export function renderPrivateCommandSurface(
  state: PrivateCommandSurfaceState,
): string {
  const activeRun =
    state.runs.find((candidate) => candidate.run.runId === state.activeRunId) ??
    state.runs[0];

  if (!activeRun) {
    return `<main class="surface-empty">No local Albion runs available.</main>`;
  }

  return `
    <main class="surface-shell" aria-label="Albion OS private command surface">
      <section class="surface-band surface-top">
        <div>
          <p class="eyebrow">Albion OS Private Command Surface P0</p>
          <h1>Run Control</h1>
        </div>
        <div class="surface-summary" aria-label="Kernel status">
          <span>Local fixtures only</span>
          <span>No live Google or Discord calls</span>
          <span>Kernel rules enforced</span>
        </div>
      </section>

      <section class="surface-grid">
        <aside class="run-list" aria-label="Run list">
          <div class="panel-heading">
            <h2>Runs</h2>
            <span>${state.runs.length}</span>
          </div>
          ${state.runs.map((run) => renderRunListItem(run, activeRun.run.runId)).join("")}
        </aside>

        <section class="run-detail" aria-label="Run detail">
          ${renderRunDetail(activeRun)}
        </section>
      </section>
    </main>
  `;
}

function renderRunListItem(
  item: PrivateCommandSurfaceRun,
  activeRunId: string,
): string {
  const isActive = item.run.runId === activeRunId;
  const blockers = item.merlinHandoffEligibility.blockers.length;

  return `
    <a class="run-list-item ${isActive ? "active" : ""}" href="#/runs/${escapeHtml(item.run.runId)}" aria-current="${isActive ? "page" : "false"}">
      <span class="run-title">${escapeHtml(item.run.destination)}</span>
      <span class="run-meta">${escapeHtml(item.run.kingdomId)} · ${escapeHtml(item.run.priority)} · ${escapeHtml(item.run.status)}</span>
      <span class="run-state ${item.merlinHandoffEligibility.eligible ? "ready" : "blocked"}">
        ${item.merlinHandoffEligibility.eligible ? "Merlin ready" : `${blockers} blocker${blockers === 1 ? "" : "s"}`}
      </span>
    </a>
  `;
}

function renderRunDetail(item: PrivateCommandSurfaceRun): string {
  const run = item.run;
  const mandate = run.mandate;

  return `
    <div class="detail-header">
      <div>
        <p class="eyebrow">${escapeHtml(run.runId)}</p>
        <h2>${escapeHtml(run.destination)}</h2>
      </div>
      <span class="status-pill">${escapeHtml(run.status)}</span>
    </div>

    <div class="detail-sections">
      <section class="detail-section" aria-label="Route state">
        <h3>Route State</h3>
        <dl class="fact-grid">
          ${renderFact("Kingdom", run.kingdomId)}
          ${renderFact("Sponsor", run.sponsor)}
          ${renderFact("Route Depth", String(run.routeDepth))}
          ${renderFact("Current Location", run.currentLocationSummary)}
          ${renderFact("Next Action", run.nextAction)}
        </dl>
      </section>

      <section class="detail-section" aria-label="Approval state">
        <h3>Approval State</h3>
        <dl class="fact-grid">
          ${renderFact("Approval Required", run.approvalRequirement.approvalRequired ? "Yes" : "No")}
          ${renderFact("Approval Level", run.approvalRequirement.approvalLevel)}
          ${renderFact("Reason", run.approvalRequirement.approvalReason)}
          ${renderFact("High Court Binding", mandate?.highCourtCanApprove ? "Yes" : "No")}
          ${renderFact("Mandate Status", mandate?.mandateStatus ?? "pending")}
        </dl>
        <div class="vote-grid" aria-label="Roundtable votes">
          ${renderVote("Gawain", mandate?.approvals.Gawain ?? "pending")}
          ${renderVote("Lancelot", mandate?.approvals.Lancelot ?? "pending")}
          ${renderVote("Percival", mandate?.approvals.Percival ?? "pending")}
        </div>
        ${renderAdvisoryNotes(item.ledgerRecord.advisoryNotes)}
      </section>

      <section class="detail-section split" aria-label="Merlin handoff and previews">
        <div>
          <h3>Merlin Handoff</h3>
          <p class="handoff ${item.merlinHandoffEligibility.eligible ? "ready" : "blocked"}">
            ${item.merlinHandoffEligibility.eligible ? "Eligible" : "Not eligible"}
          </p>
          ${renderBlockers(item.merlinHandoffEligibility.blockers)}
        </div>
        <div>
          <h3>Discord Alert Preview</h3>
          <pre>${escapeHtml(JSON.stringify(item.discordAlertPreview, null, 2))}</pre>
        </div>
      </section>

      <section class="detail-section" aria-label="Action packet preview">
        <h3>Action Packet Preview</h3>
        <dl class="fact-grid">
          ${renderFact("Packet", item.actionPacketPreview.packet.packetId)}
          ${renderFact("Action", item.actionPacketPreview.packet.actionType)}
          ${renderFact("Actor", item.actionPacketPreview.packet.actor)}
          ${renderFact("Authority", item.actionPacketPreview.packet.actorAuthority)}
          ${renderFact("Mutation Allowed", item.actionPacketPreview.packet.mutationAllowed ? "Yes" : "No")}
          ${renderFact("Execution Allowed", item.actionPacketPreview.packet.executionAllowed ? "Yes" : "No")}
          ${renderFact("Applied Locally", item.actionPacketPreview.applied ? "Yes" : "No")}
        </dl>
      </section>

      <section class="detail-section" aria-label="Drive vault plan preview">
        <h3>Drive Vault Plan Preview</h3>
        <ul class="folder-list">
          ${item.driveVaultPlan.folders.map((folder) => `<li>${escapeHtml(folder)}</li>`).join("")}
        </ul>
      </section>
    </div>
  `;
}

function renderFact(label: string, value: string): string {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}

function renderVote(label: string, value: string): string {
  return `
    <div class="vote ${escapeHtml(value)}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderAdvisoryNotes(
  notes: PrivateCommandSurfaceRun["ledgerRecord"]["advisoryNotes"],
): string {
  if (notes.length === 0) {
    return `<p class="advisory-list empty">No advisory notes.</p>`;
  }

  return `
    <div class="advisory-list" aria-label="Advisory notes">
      ${notes
        .map(
          (note) => `
            <article>
              <span>${escapeHtml(note.source)}</span>
              <p>${escapeHtml(note.summary)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderBlockers(blockers: string[]): string {
  if (blockers.length === 0) {
    return `<p class="blocker-list empty">No blockers.</p>`;
  }

  return `
    <ul class="blocker-list">
      ${blockers.map((blocker) => `<li>${escapeHtml(blocker)}</li>`).join("")}
    </ul>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
