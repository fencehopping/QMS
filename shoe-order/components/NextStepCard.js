import { escapeHtml } from "../renderUtils.js";

export function NextStepCard(card) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--next">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(card.sectionLabel)}</h2>
      </div>
      <div class="shoe-status-card__body">
        <p class="shoe-status-card__kicker">Next step</p>
        <h3 class="shoe-status-card__headline">${escapeHtml(card.nextStepLabel)}</h3>
        <div class="shoe-status-note">
          <span class="shoe-status-note__label">Owner</span>
          <span class="shoe-status-note__value">${escapeHtml(card.owner)}</span>
        </div>
        <p class="shoe-status-card__copy">${escapeHtml(card.explanation)}</p>
        ${card.cta ? `<a class="pill-button shoe-status-card__button" href="${escapeHtml(card.cta.href)}">${escapeHtml(card.cta.label)}</a>` : ""}
      </div>
    </article>
  `;
}
