import { escapeHtml } from "../renderUtils.js";

export function AppointmentsCard(card) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--appointments">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(card.sectionLabel)}</h2>
      </div>
      <div class="shoe-status-card__body shoe-status-stack">
        <div class="shoe-status-appointment">
          <span class="shoe-status-note__label">${escapeHtml(card.fittingAppointment.label)}</span>
          <span class="shoe-status-row__value">${escapeHtml(card.fittingAppointment.value)}</span>
        </div>
        <div class="shoe-status-appointment">
          <span class="shoe-status-note__label">${escapeHtml(card.deliveryAppointment.label)}</span>
          ${card.deliveryAppointment.value
            ? `<span class="shoe-status-row__value">${escapeHtml(card.deliveryAppointment.value)}</span>`
            : `<p class="shoe-status-card__empty">${escapeHtml(card.deliveryAppointment.emptyState)}</p>`}
        </div>
      </div>
    </article>
  `;
}
