import { derivePatientOrderUiModel } from "./derivePatientOrderUiModel.js";
import { mockShoeOrderData } from "./mockOrderData.js";
import { normalizeShoeOrder } from "./normalizeShoeOrder.js";
import { escapeHtml } from "./renderUtils.js";
import { AppointmentsCard } from "./components/AppointmentsCard.js";
import { CareTeamCard } from "./components/CareTeamCard.js";
import { CurrentStatusCard } from "./components/CurrentStatusCard.js";
import { NextStepCard } from "./components/NextStepCard.js";
import { OrderHeroCard } from "./components/OrderHeroCard.js";
import { PaperworkCard } from "./components/PaperworkCard.js";
import { ProductDetailsCard } from "./components/ProductDetailsCard.js";
import { TimelineCard } from "./components/TimelineCard.js";

export function renderShoeOrderStatusPage(rawResponse = mockShoeOrderData) {
  const normalizedOrder = normalizeShoeOrder(rawResponse);
  if (!normalizedOrder.success) {
    return `
      <div class="shoe-status-page">
        <article class="card surface-card shoe-status-card">
          <div class="surface-card__header shoe-status-card__header">
            <h2 class="shoe-status-card__title">Your shoe order status</h2>
          </div>
          <div class="shoe-status-card__body">
            <p class="shoe-status-card__copy">${escapeHtml(rawResponse?.message || "We could not load the shoe order details right now.")}</p>
          </div>
        </article>
      </div>
    `;
  }

  const uiModel = derivePatientOrderUiModel(normalizedOrder);

  return `
    <div class="shoe-status-page">
      <div class="shoe-status-grid">
        <div class="shoe-status-grid__area shoe-status-grid__area--hero">
          ${OrderHeroCard(uiModel.hero)}
        </div>
        <div class="shoe-status-grid__area shoe-status-grid__area--current">
          ${CurrentStatusCard(uiModel.currentStatusCard)}
        </div>
        <div class="shoe-status-grid__area shoe-status-grid__area--next">
          ${NextStepCard(uiModel.nextStepCard)}
        </div>
        <div class="shoe-status-grid__area shoe-status-grid__area--appointments">
          ${AppointmentsCard(uiModel.appointmentsCard)}
        </div>
        <div class="shoe-status-grid__area shoe-status-grid__area--product">
          ${ProductDetailsCard(uiModel.productCard)}
        </div>
        <div class="shoe-status-grid__area shoe-status-grid__area--paperwork">
          ${PaperworkCard(uiModel.paperworkCard)}
        </div>
        <div class="shoe-status-grid__area shoe-status-grid__area--care-team">
          ${CareTeamCard(uiModel.careTeamCard)}
        </div>
        <div class="shoe-status-grid__area shoe-status-grid__area--timeline">
          ${TimelineCard(uiModel.timelineCard)}
        </div>
      </div>
    </div>
  `;
}
