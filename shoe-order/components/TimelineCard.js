import { escapeHtml, renderChip } from "../renderUtils.js";

export function TimelineCard(card) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--timeline">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(card.sectionLabel)}</h2>
      </div>
      <div class="shoe-status-timeline" role="list">
        ${card.items.length
          ? card.items
              .map(
                (item) => `
                  <article class="shoe-status-timeline__item${item.isLatest ? " is-latest" : ""}" role="listitem">
                    <div class="shoe-status-timeline__header">
                      <div>
                        <h3 class="shoe-status-timeline__title">${escapeHtml(item.label)}</h3>
                        <p class="shoe-status-timeline__date">${escapeHtml(item.date)}</p>
                      </div>
                      ${renderChip(item.isLatest ? "Most recent" : "Milestone", item.tone)}
                    </div>
                    <p class="shoe-status-timeline__copy">${escapeHtml(item.explanation)}</p>
                  </article>
                `,
              )
              .join("")
          : `<p class="shoe-status-card__empty">Timeline updates will appear here as the order progresses.</p>`}
      </div>
    </article>
  `;
}
