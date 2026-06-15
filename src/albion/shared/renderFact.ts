import { escapeHtml } from "./escapeHtml";

export function renderFact(label: string, value: string): string {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}
