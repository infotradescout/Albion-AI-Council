import { escapeHtml } from "./escapeHtml";

export function renderBlockers(blockers: string[]): string {
  if (blockers.length === 0) {
    return `<p class="blocker-list empty">No blockers.</p>`;
  }

  return `
    <ul class="blocker-list">
      ${blockers.map((blocker) => `<li>${escapeHtml(blocker)}</li>`).join("")}
    </ul>
  `;
}
