import { AppointmentsCard } from "./components/AppointmentsCard.js";
import { ProductDetailsCard } from "./components/ProductDetailsCard.js";
import { derivePatientOrderUiModel } from "./derivePatientOrderUiModel.js";
import { mockCgmOrderData } from "./mockOrderData.js";
import { normalizeCgmOrder } from "./normalizeCgmOrder.js";
import { escapeHtml } from "./renderUtils.js";
import { CareTeamCard } from "../shoe-order/components/CareTeamCard.js";
import { CurrentStatusCard } from "../shoe-order/components/CurrentStatusCard.js";
import { NextStepCard } from "../shoe-order/components/NextStepCard.js";
import { OrderHeroCard } from "../shoe-order/components/OrderHeroCard.js";
import { PaperworkCard } from "../shoe-order/components/PaperworkCard.js";
import { TimelineCard } from "../shoe-order/components/TimelineCard.js";

export function renderCgmOrderStatusPage(rawResponse = mockCgmOrderData) {
  const normalizedOrder = normalizeCgmOrder(rawResponse);

  if (!normalizedOrder.success) {
    return `
      <div class="shoe-status-page">
        <article class="card surface-card shoe-status-card">
          <div class="surface-card__header shoe-status-card__header">
            <h2 class="shoe-status-card__title">Your CGM order status</h2>
          </div>
          <div class="shoe-status-card__body">
            <p class="shoe-status-card__copy">${escapeHtml(rawResponse?.message || "We could not load the CGM order details right now.")}</p>
          </div>
        </article>
      </div>
    `;
  }

  const uiModel = derivePatientOrderUiModel(normalizedOrder);

  return `
    <div class="shoe-status-page">
      <div class="shoe-status-grid shoe-status-grid--cgm">
        <div class="shoe-status-grid__area shoe-status-grid__area--hero">
          ${OrderHeroCard(uiModel.hero)}
        </div>
        <div class="shoe-status-grid__area shoe-status-grid__area--product">
          ${ProductDetailsCard(uiModel.productCard)}
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
