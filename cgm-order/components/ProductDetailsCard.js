import { escapeHtml, renderRows } from "../renderUtils.js";

export function ProductDetailsCard(card) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--product">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(card.sectionLabel)}</h2>
      </div>
      <div class="shoe-status-card__body shoe-status-stack">
        <div class="shoe-status-product__hero shoe-status-product__hero--cgm">
          <div class="shoe-status-product__hero-copy">
            <p class="shoe-status-card__kicker">${escapeHtml(card.eyebrow)}</p>
            <h3 class="shoe-status-card__headline shoe-status-card__headline--product">${escapeHtml(card.headline)}</h3>
          </div>
          <div class="shoe-status-device-badge" aria-hidden="true">
            <span>${escapeHtml(card.previewLabel)}</span>
          </div>
        </div>
        ${renderRows(card.fields)}
        <div class="shoe-status-subsection">
          <p class="shoe-status-card__kicker">Included in this order</p>
          <div class="shoe-status-supply-list">
            ${card.items
              .map(
                (item) => `
                  <article class="shoe-status-supply-item">
                    <div class="shoe-status-supply-item__header">
                      <h4 class="shoe-status-supply-item__title">${escapeHtml(item.title)}</h4>
                      <span class="shoe-status-chip shoe-status-chip--neutral">${escapeHtml(item.quantity)}</span>
                    </div>
                    <p class="shoe-status-supply-item__meta">${escapeHtml(item.lastShipment)}</p>
                    <p class="shoe-status-supply-item__meta">${escapeHtml(item.nextShipment)}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </article>
  `;
}
