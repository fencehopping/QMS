import { escapeHtml, renderRows } from "../renderUtils.js";

export function CareTeamCard(card) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--care-team">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(card.sectionLabel)}</h2>
      </div>
      <div class="shoe-status-card__body">
        ${renderRows(card.fields)}
      </div>
    </article>
  `;
}
