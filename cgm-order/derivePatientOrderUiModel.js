import { formatDate, formatDateTime, formatOptionalText } from "./renderUtils.js";
import { ORDER_STEPS, getStatusTranslation, translatePriorAuthorization } from "./statusTranslations.js";

const SUPPORT_PHONE_DISPLAY = "1-800-704-6515";
const SUPPORT_PHONE_HREF = "tel:18007046515";

function getStepIndex(stepKey) {
  const index = ORDER_STEPS.findIndex((step) => step.key === stepKey);
  return index === -1 ? 0 : index;
}

function buildVisibleTimeline(order) {
  const mapped = order.timeline
    .map((event) => {
      const translation = getStatusTranslation(event.rawStatus);
      if (!translation?.visible) return null;

      return {
        rawStatus: event.rawStatus,
        occurredAt: event.occurredAt,
        date: formatDate(event.occurredAt, "Date pending"),
        label: translation.label,
        explanation: translation.explanation,
        tone: translation.tone || "neutral",
        progressKey: translation.progressKey || "order_started",
        currentStatusLabel: translation.currentStatusLabel || translation.label,
        heroHeadline: translation.heroHeadline || translation.label,
        patientActionRequired: Boolean(translation.patientActionRequired),
      };
    })
    .filter(Boolean);

  if (order.appointmentDate) {
    mapped.push({
      rawStatus: "APPOINTMENT SCHEDULED",
      occurredAt: order.appointmentDate,
      date: formatDate(order.appointmentDate, "Date pending"),
      label: "Your CGM education appointment was scheduled",
      explanation: "You have a CGM education appointment scheduled to review setup, training, and questions about your supplies.",
      tone: "info",
      progressKey: "education_appointment",
      currentStatusLabel: "Education appointment scheduled",
      heroHeadline: "Your CGM education appointment is scheduled",
      patientActionRequired: true,
    });
  }

  return mapped.sort((left, right) => {
    const leftTime = left.occurredAt ? left.occurredAt.getTime() : 0;
    const rightTime = right.occurredAt ? right.occurredAt.getTime() : 0;
    return leftTime - rightTime;
  });
}

function buildHeroSummary(progressKey) {
  switch (progressKey) {
    case "paperwork_reviewed":
      return "Your prescription and first-order forms are on file, and we are moving through insurance and shipment review.";
    case "insurance_reviewed":
      return "Insurance checks are complete, and your order is being cleared for shipment.";
    case "shipment_prepared":
      return "Your CGM supplies are being prepared so the first shipment can go out.";
    case "order_shipped":
      return "Your first CGM shipment was sent. The next step is making sure you feel confident starting therapy.";
    case "education_appointment":
      return "Your first shipment is in motion and your education visit is scheduled so you know what to expect next.";
    case "ongoing_resupply":
      return "Your first order is active and your ongoing refill cadence is now part of the plan.";
    default:
      return "We started your CGM order and are working through the setup steps needed before long-term resupply begins.";
  }
}

function buildHero(order, latestVisibleItem, progressKey, actionChip, lastUpdated) {
  const activeIndex = getStepIndex(progressKey);

  return {
    sectionLabel: "Your CGM order status",
    headline: latestVisibleItem?.heroHeadline || "Your CGM order is in progress",
    summary: buildHeroSummary(progressKey),
    chips: [
      order.requestId ? { label: `Request #${order.requestId}`, tone: "neutral" } : null,
      order.request.shipmentDuration ? { label: `${order.request.shipmentDuration} shipment cadence`, tone: "info" } : null,
      order.nextSupplyDate ? { label: `Next supply date ${formatDate(order.nextSupplyDate)}`, tone: "neutral" } : null,
      { label: `Last updated ${lastUpdated}`, tone: "info" },
      actionChip,
    ].filter(Boolean),
    steps: ORDER_STEPS.map((step, index) => ({
      label: step.label,
      status: index < activeIndex ? "complete" : index === activeIndex ? "current" : "upcoming",
    })),
  };
}

function buildCurrentStatusCard(latestVisibleItem, lastUpdated, nextStepSummary, actionChip) {
  return {
    sectionLabel: "Current status",
    statusLabel: latestVisibleItem?.currentStatusLabel || "Order in progress",
    lastUpdated,
    explanation: latestVisibleItem?.explanation || "We are actively working on your CGM order.",
    nextStepSummary,
    actionRequiredLabel: actionChip.label,
    actionRequiredTone: actionChip.tone,
  };
}

function buildActionChip(progressKey) {
  if (progressKey === "education_appointment") {
    return {
      label: "Upcoming appointment",
      tone: "info",
    };
  }

  return {
    label: "No action required right now",
    tone: "success",
  };
}

function buildNextStepCard(order, progressKey) {
  switch (progressKey) {
    case "order_started":
    case "paperwork_reviewed":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Finish insurance review",
        owner: order.patientAdvocate || "Quantum care team",
        explanation: "We will finish the insurance check and prepare your first shipment once everything is confirmed.",
        cta: null,
      };
    case "insurance_reviewed":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Prepare your first shipment",
        owner: "Quantum fulfillment team",
        explanation: "Your first CGM shipment is being finalized so it can be sent out.",
        cta: null,
      };
    case "shipment_prepared":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Send your CGM order",
        owner: "Quantum fulfillment team",
        explanation: "The order is prepared. The next step is getting the first shipment out the door.",
        cta: null,
      };
    case "order_shipped":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: order.appointmentDate ? "Attend your CGM education appointment" : "Watch for your delivery",
        owner: order.cgmEducator || "Quantum educator",
        explanation: order.appointmentDate
          ? "Your educator will walk through setup, sensor placement, and common questions so you can start with confidence."
          : "We will coordinate any needed education once your first shipment arrives.",
        cta: { label: `Call CGM support`, href: SUPPORT_PHONE_HREF },
      };
    case "education_appointment":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Attend your CGM education appointment",
        owner: order.cgmEducator || "Quantum educator",
        explanation: "Bring any setup or sensor questions to the visit. After that, your ongoing refill schedule should stay on track.",
        cta: { label: `Call ${SUPPORT_PHONE_DISPLAY}`, href: SUPPORT_PHONE_HREF },
      };
    case "ongoing_resupply":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Stay ready for your next refill",
        owner: order.patientAdvocate || "Quantum care team",
        explanation: "Your order is active. We will continue coordinating the next supply shipment based on your refill schedule.",
        cta: { label: `Call CGM support`, href: SUPPORT_PHONE_HREF },
      };
    default:
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "We will keep your order moving",
        owner: "Quantum care team",
        explanation: "We are reviewing your order and will guide you through the next step.",
        cta: null,
      };
  }
}

function buildAppointmentsCard(order) {
  const nextShipmentValue = order.nextSupplyDate ? formatDateTime(order.nextSupplyDate) : "";

  return {
    sectionLabel: "Appointments",
    primary: {
      label: "CGM education appointment",
      value: formatDateTime(order.appointmentDate, "Not scheduled"),
      emptyState: "We have not scheduled your CGM education appointment yet.",
    },
    secondary: {
      label: "Next expected supply shipment",
      value: nextShipmentValue,
      emptyState: "Your next supply shipment date will appear here once it is scheduled.",
    },
  };
}

function buildProductCard(order) {
  return {
    sectionLabel: "Your CGM supplies",
    eyebrow: "Selected device",
    headline: formatOptionalText(order.request.cgmModel || order.details.cgmModel || order.product || "CGM"),
    previewLabel: formatOptionalText(order.request.cgmModel || order.details.cgmModel || "CGM"),
    fields: [
      { label: "Product", value: formatOptionalText(order.product) },
      { label: "Device model", value: formatOptionalText(order.request.cgmModel || order.details.cgmModel) },
      { label: "Coverage type", value: formatOptionalText(order.request.cgmType || order.details.billingType) },
      { label: "Shipment duration", value: formatOptionalText(order.request.shipmentDuration || order.details.shipmentDuration) },
      { label: "Primary diagnosis", value: formatOptionalText(order.details.diagnosisPrimary) },
      { label: "Ship-to address", value: formatOptionalText(order.request.shippedTo || order.details.shipToAddress) },
      { label: "Order status", value: formatOptionalText(order.details.status) },
    ],
    items: order.request.items.map((item) => ({
      title: item.item || "Supply item",
      quantity: item.quantity > 0 ? `Qty ${item.quantity}` : "Qty not listed",
      lastShipment: item.lastShipmentDate ? `Last shipped ${formatDate(item.lastShipmentDate)}` : "Not shipped yet",
      nextShipment: item.futureShipDate ? `Next eligible shipment ${formatDate(item.futureShipDate)}` : "Next shipment date pending",
    })),
  };
}

function buildPaperworkCard(order, visibleTimelineItems) {
  const paperworkEvent = visibleTimelineItems.find((item) => item.progressKey === "paperwork_reviewed");
  const insuranceEvent = [...visibleTimelineItems]
    .reverse()
    .find((item) => item.progressKey === "insurance_reviewed");

  return {
    sectionLabel: "Insurance and paperwork",
    fields: [
      { label: "Insurance authorization", value: translatePriorAuthorization(order.priorAuthorization) },
      { label: "Prescription received", value: paperworkEvent ? `Received ${paperworkEvent.date}` : "Received" },
      { label: "Paperwork status", value: paperworkEvent?.currentStatusLabel || "In progress" },
      { label: "Insurance status", value: insuranceEvent?.currentStatusLabel || "Being reviewed" },
      { label: "Coverage effective date", value: order.details.effectiveDate ? formatDate(order.details.effectiveDate) : "Not listed" },
    ],
    supportingCopy: "Your patient advocate will contact you only if insurance, paperwork, or shipping details need another update.",
  };
}

function buildCareTeamCard(order) {
  return {
    sectionLabel: "Your care team",
    fields: [
      { label: "Physician", value: formatOptionalText(order.physician) },
      { label: "CGM educator", value: formatOptionalText(order.cgmEducator) },
      { label: "Patient advocate", value: formatOptionalText(order.patientAdvocate) },
      { label: "Order specialist", value: formatOptionalText(order.salesPerson) },
    ],
  };
}

function buildTimelineCard(visibleTimelineItems) {
  return {
    sectionLabel: "Order timeline",
    items: visibleTimelineItems.map((item, index) => ({
      label: item.label,
      date: item.date,
      explanation: item.explanation,
      tone: item.tone,
      isLatest: index === visibleTimelineItems.length - 1,
    })),
  };
}

export function derivePatientOrderUiModel(order) {
  const visibleTimelineItems = buildVisibleTimeline(order);
  const latestVisibleItem = visibleTimelineItems[visibleTimelineItems.length - 1] || null;
  const progressKey = latestVisibleItem?.progressKey || "order_started";
  const lastUpdated = latestVisibleItem?.date || "Recently";
  const actionChip = buildActionChip(progressKey);
  const nextStepCard = buildNextStepCard(order, progressKey);

  return {
    pageTitle: "CGM Order Status",
    hero: buildHero(order, latestVisibleItem, progressKey, actionChip, lastUpdated),
    currentStatusCard: buildCurrentStatusCard(
      latestVisibleItem,
      lastUpdated,
      nextStepCard.nextStepLabel,
      actionChip,
    ),
    nextStepCard,
    productCard: buildProductCard(order),
    appointmentsCard: buildAppointmentsCard(order),
    paperworkCard: buildPaperworkCard(order, visibleTimelineItems),
    careTeamCard: buildCareTeamCard(order),
    timelineCard: buildTimelineCard(visibleTimelineItems),
    meta: {
      requestId: order.requestId,
      lastUpdated,
      supportPhone: SUPPORT_PHONE_DISPLAY,
    },
  };
}
