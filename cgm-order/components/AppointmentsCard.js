import { escapeHtml } from "../renderUtils.js";

function renderAppointmentBlock(block) {
  return `
    <div class="shoe-status-appointment">
      <span class="shoe-status-note__label">${escapeHtml(block.label)}</span>
      ${block.value
        ? `<span class="shoe-status-row__value">${escapeHtml(block.value)}</span>`
        : `<p class="shoe-status-card__empty">${escapeHtml(block.emptyState)}</p>`}
    </div>
  `;
}

export function AppointmentsCard(card) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--appointments">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(card.sectionLabel)}</h2>
      </div>
      <div class="shoe-status-card__body shoe-status-stack">
        ${renderAppointmentBlock(card.primary)}
        ${renderAppointmentBlock(card.secondary)}
      </div>
    </article>
  `;
}
