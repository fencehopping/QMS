import { escapeHtml, renderRows } from "../renderUtils.js";

export function ProductDetailsCard(card) {
  return `
    <article class="card surface-card shoe-status-card shoe-status-card--product">
      <div class="surface-card__header shoe-status-card__header">
        <h2 class="shoe-status-card__title">${escapeHtml(card.sectionLabel)}</h2>
      </div>
      <div class="shoe-status-card__body shoe-status-stack">
        <div class="shoe-status-product__hero">
          <div class="shoe-status-product__hero-copy">
            <p class="shoe-status-card__kicker">Selected pair</p>
            <h3 class="shoe-status-card__headline shoe-status-card__headline--product">${escapeHtml(card.fields.find((field) => field.label === "Product description")?.value || card.image.alt)}</h3>
          </div>
          <div class="shoe-status-product__thumbnail">
            <img src="${escapeHtml(card.image.src)}" alt="${escapeHtml(card.image.alt)}" />
          </div>
        </div>
        ${renderRows(card.fields)}
        ${card.backupOption.length
          ? `
            <div class="shoe-status-subsection">
              <p class="shoe-status-card__kicker">Optional backup option</p>
              ${renderRows(card.backupOption, "shoe-status-list shoe-status-list--compact")}
            </div>
          `
          : ""}
      </div>
    </article>
  `;
}
