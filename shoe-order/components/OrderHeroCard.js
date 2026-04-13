import { escapeHtml, renderChip } from "../renderUtils.js";

export function OrderHeroCard(hero) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--hero">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(hero.sectionLabel)}</h2>
      </div>
      <div class="shoe-status-hero">
        <div class="shoe-status-hero__headline-wrap">
          <h3 class="shoe-status-hero__headline">${escapeHtml(hero.headline)}</h3>
          <p class="shoe-status-hero__summary">${escapeHtml(hero.summary)}</p>
        </div>
        <div class="shoe-status-hero__chips">
          ${hero.chips.map((chip) => renderChip(chip.label, chip.tone)).join("")}
        </div>
        <div class="shoe-status-stepper" aria-label="Order progress">
          ${hero.steps
            .map(
              (step, index) => `
                <div class="shoe-status-step shoe-status-step--${step.status}">
                  <span class="shoe-status-step__number">${index + 1}</span>
                  <span class="shoe-status-step__label">${escapeHtml(step.label)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    </article>
  `;
}
