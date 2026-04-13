import { escapeHtml, renderChip } from "../renderUtils.js";

export function CurrentStatusCard(card) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--current">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(card.sectionLabel)}</h2>
        ${renderChip(card.actionRequiredLabel, card.actionRequiredTone)}
      </div>
      <div class="shoe-status-card__body">
        <p class="shoe-status-card__kicker">Status</p>
        <h3 class="shoe-status-card__headline">${escapeHtml(card.statusLabel)}</h3>
        <p class="shoe-status-card__supporting">Last updated ${escapeHtml(card.lastUpdated)}</p>
        <p class="shoe-status-card__copy">${escapeHtml(card.explanation)}</p>
        <div class="shoe-status-note">
          <span class="shoe-status-note__label">Next step</span>
          <span class="shoe-status-note__value">${escapeHtml(card.nextStepSummary)}</span>
        </div>
      </div>
    </article>
  `;
}
