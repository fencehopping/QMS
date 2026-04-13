import { escapeHtml, renderRows } from "../renderUtils.js";

export function PaperworkCard(card) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--paperwork">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(card.sectionLabel)}</h2>
      </div>
      <div class="shoe-status-card__body shoe-status-stack">
        ${renderRows(card.fields)}
        <p class="shoe-status-card__copy">${escapeHtml(card.supportingCopy)}</p>
      </div>
    </article>
  `;
}
