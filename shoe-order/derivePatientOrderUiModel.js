import { formatDate, formatDateTime, formatOptionalText } from "./renderUtils.js";
import { ORDER_STEPS, getStatusTranslation, translatePriorAuthorization } from "./statusTranslations.js";

const SUPPORT_PHONE_DISPLAY = "1-800-704-6515";
const SUPPORT_PHONE_HREF = "tel:18007046515";

function formatProgressDate(value, fallback = "Pending") {
  return value ? formatDate(value, fallback) : fallback;
}

function getVisibleTimelineItems(order) {
  return order.timeline
    .map((event) => {
      const translation = getStatusTranslation(event.rawStatus);
      if (!translation?.visible) return null;
      return {
        rawStatus: event.rawStatus,
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
}

function getStepIndex(stepKey) {
  const index = ORDER_STEPS.findIndex((step) => step.key === stepKey);
  return index === -1 ? 0 : index;
}

function getProgressKey(order, visibleTimelineItems) {
  if (order.paperwork.dateDispensed) return "complete";
  if (order.dispensingAppointment) return "final_delivery";
  if (!visibleTimelineItems.length) return "order_started";

  return visibleTimelineItems.reduce((latestKey, item) => (
    getStepIndex(item.progressKey) > getStepIndex(latestKey) ? item.progressKey : latestKey
  ), "order_started");
}

function buildHero(order, latestVisibleItem, progressKey, patientActionRequired, lastUpdated) {
  const activeIndex = getStepIndex(progressKey);
  const statusHeadline = latestVisibleItem?.heroHeadline
    || (patientActionRequired ? "We need a quick paperwork update" : "Your shoe order is in progress");
  const summary = patientActionRequired
    ? "A form needs attention before the order can move forward. Our team will help coordinate the correction so the order can keep progressing."
    : buildHeroSummary(order, progressKey);

  return {
    sectionLabel: "Your shoe order status",
    headline: statusHeadline,
    summary,
    chips: [
      order.requestId ? { label: `Request #${order.requestId}`, tone: "neutral" } : null,
      { label: `Last updated ${lastUpdated}`, tone: "info" },
      {
        label: patientActionRequired ? "Patient action may be needed" : "No patient action required right now",
        tone: patientActionRequired ? "warning" : "success",
      },
    ].filter(Boolean),
    steps: ORDER_STEPS.map((step, index) => ({
      label: step.label,
      status: index < activeIndex ? "complete" : index === activeIndex ? "current" : "upcoming",
    })),
  };
}

function buildHeroSummary(order, progressKey) {
  switch (progressKey) {
    case "paperwork_reviewed":
      return "Your prescription and paperwork are on file, and we are moving through the setup and fitting steps.";
    case "fitting_completed":
      return "Your fitting details have been received, so your selected shoes can move into the ordering process.";
    case "shoes_ordered":
      return "Your selected shoes were submitted to the manufacturer and we are waiting for confirmation.";
    case "manufacturer_confirmed":
      return "The manufacturer confirmed your order. We are now waiting for the shoes to arrive at Quantum Medical Supply.";
    case "shoes_received":
      return "Good news. Your shoes have arrived, and our team is preparing the final delivery or pickup step.";
    case "final_delivery":
      return "The last step is scheduling your final delivery or pickup so you can receive your shoes.";
    case "complete":
      return "Your shoe order is complete. Reach out if you need help with fit, comfort, or inserts.";
    default:
      return "We started your shoe order and are working through the steps needed to get your shoes to you.";
  }
}

function buildCurrentStatusCard(latestVisibleItem, patientActionRequired, lastUpdated, nextStepSummary) {
  return {
    sectionLabel: "Current status",
    statusLabel: latestVisibleItem?.currentStatusLabel || "Order in progress",
    lastUpdated,
    explanation: latestVisibleItem?.explanation || "We are actively working on your shoe order.",
    nextStepSummary,
    actionRequiredLabel: patientActionRequired ? "Yes, we may need an updated form before the order can continue." : "No patient action is required right now.",
    actionRequiredTone: patientActionRequired ? "warning" : "success",
  };
}

function buildNextStepCard(order, progressKey, patientActionRequired) {
  if (patientActionRequired) {
    return {
      sectionLabel: "What happens next",
      nextStepLabel: "Correct the paperwork",
      owner: order.physician || "Your care team",
      explanation: "Our team will help coordinate the needed paperwork update so your order can move forward again.",
      cta: { label: "Call shoe support", href: SUPPORT_PHONE_HREF },
    };
  }

  const fitterOwner = order.fitterInArea || "Quantum care team";

  switch (progressKey) {
    case "order_started":
    case "paperwork_reviewed":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Complete the fitting process",
        owner: fitterOwner,
        explanation: "We will finish the fitting and measurement steps so the order can be placed accurately.",
        cta: null,
      };
    case "fitting_completed":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Place the shoe order",
        owner: fitterOwner,
        explanation: "Your fitting details are on file. The next step is submitting your selected shoes to the manufacturer.",
        cta: null,
      };
    case "shoes_ordered":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Wait for manufacturer confirmation",
        owner: "Manufacturer",
        explanation: "The manufacturer needs to confirm the order before shipment can begin.",
        cta: null,
      };
    case "manufacturer_confirmed":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Receive the shoes from the manufacturer",
        owner: "Quantum receiving team",
        explanation: "We are waiting for the manufacturer shipment to arrive so we can prepare your final handoff.",
        cta: null,
      };
    case "shoes_received":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Schedule final delivery or pickup",
        owner: fitterOwner,
        explanation: "Your shoes are here. Our team will help schedule the final delivery or pickup step.",
        cta: { label: "Call shoe support", href: SUPPORT_PHONE_HREF },
      };
    case "final_delivery":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Attend your final delivery appointment",
        owner: fitterOwner,
        explanation: "Bring any questions about fit or comfort to the final delivery or pickup visit.",
        cta: null,
      };
    case "complete":
      return {
        sectionLabel: "What happens next",
        nextStepLabel: "Stay in touch if you need help",
        owner: "Quantum care team",
        explanation: "Your order is complete. Reach out if you need support with fit, inserts, or follow-up questions.",
        cta: { label: "Call shoe support", href: SUPPORT_PHONE_HREF },
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

function buildAppointmentsCard(order, progressKey) {
  const emptyState = progressKey === "shoes_received"
    ? "We have not scheduled your final delivery or pickup yet. Your fitter should contact you soon now that the shoes have arrived."
    : "Your final delivery or pickup appointment has not been scheduled yet. We will reach out when it is ready.";

  return {
    sectionLabel: "Appointments",
    fittingAppointment: {
      label: "Fitting appointment",
      value: formatDateTime(order.fittingAppointment, "Not scheduled"),
    },
    deliveryAppointment: {
      label: "Final delivery / dispensing appointment",
      value: order.dispensingAppointment ? formatDateTime(order.dispensingAppointment) : "",
      emptyState,
    },
  };
}

function buildProductCard(order) {
  const backupOption = order.product.backupOption
    ? [
        { label: "Backup manufacturer", value: formatOptionalText(order.product.backupOption.manufacturer) },
        { label: "Backup style", value: formatOptionalText(order.product.backupOption.style) },
        { label: "Backup color", value: formatOptionalText(order.product.backupOption.color) },
        { label: "Backup size", value: formatOptionalText(order.product.backupOption.size) },
        { label: "Backup width", value: formatOptionalText(order.product.backupOption.width) },
        { label: "Backup closure type", value: formatOptionalText(order.product.backupOption.closureType) },
      ]
    : [];

  return {
    sectionLabel: "Your selected shoes",
    image: {
      src: "./images/shoes.jpg",
      alt: order.product.description || "Selected diabetic shoes",
    },
    fields: [
      { label: "Manufacturer", value: formatOptionalText(order.product.manufacturer) },
      { label: "Product description", value: formatOptionalText(order.product.description) },
      { label: "Style", value: formatOptionalText(order.product.style) },
      { label: "Color", value: formatOptionalText(order.product.color) },
      { label: "Size", value: formatOptionalText(order.product.size) },
      { label: "Width", value: formatOptionalText(order.product.width) },
      { label: "Closure type", value: formatOptionalText(order.product.closureType) },
      { label: "Insole type", value: formatOptionalText(order.product.insoles) },
      { label: "Insert type", value: formatOptionalText(order.product.insertType) },
    ],
    backupOption,
  };
}

function buildPaperworkCard(order, visibleTimelineItems, patientActionRequired) {
  const latestPaperworkEvent = [...visibleTimelineItems]
    .reverse()
    .find((item) => item.progressKey === "paperwork_reviewed");

  const paperworkStatus = patientActionRequired
    ? "Needs an update before the order can continue"
    : latestPaperworkEvent
      ? `${latestPaperworkEvent.currentStatusLabel} on ${latestPaperworkEvent.date}`
      : "Forms are being reviewed";

  return {
    sectionLabel: "Insurance and paperwork",
    fields: [
      { label: "Insurance authorization", value: translatePriorAuthorization(order.priorAuthorization) },
      { label: "Prescription received", value: order.paperwork.rxSignatureDate ? `Received ${formatDate(order.paperwork.rxSignatureDate)}` : "Not yet received" },
      { label: "Paperwork status", value: paperworkStatus },
    ],
    supportingCopy: patientActionRequired
      ? "If we need anything from you, our team will let you know."
      : "We will contact you only if another form or update is needed.",
  };
}

function buildCareTeamCard(order) {
  return {
    sectionLabel: "Your care team",
    fields: [
      { label: "Physician", value: formatOptionalText(order.physician) },
      { label: "Assigned fitter", value: formatOptionalText(order.fitterInArea) },
      { label: "Alternate fitter", value: formatOptionalText(order.alternateFitter, "Not listed") },
    ],
  };
}

function buildTimelineCard(visibleTimelineItems) {
  const latestIndex = Math.max(visibleTimelineItems.length - 1, 0);
  return {
    sectionLabel: "Order timeline",
    items: visibleTimelineItems.map((item, index) => ({
      label: item.label,
      date: item.date,
      explanation: item.explanation,
      tone: item.tone,
      isLatest: index === latestIndex,
    })),
  };
}

export function derivePatientOrderUiModel(order) {
  const visibleTimelineItems = getVisibleTimelineItems(order);
  const latestVisibleItem = visibleTimelineItems[visibleTimelineItems.length - 1] || null;
  const progressKey = getProgressKey(order, visibleTimelineItems);
  const lastUpdated = latestVisibleItem?.date || formatProgressDate(order.product.arrivalDate, "Pending update");
  const patientActionRequired = Boolean(latestVisibleItem?.patientActionRequired);
  const nextStepCard = buildNextStepCard(order, progressKey, patientActionRequired);
  const nextStepSummary = `${nextStepCard.nextStepLabel}. ${nextStepCard.explanation}`;

  return {
    pageTitle: "Shoe Order Status",
    hero: buildHero(order, latestVisibleItem, progressKey, patientActionRequired, lastUpdated),
    currentStatusCard: buildCurrentStatusCard(latestVisibleItem, patientActionRequired, lastUpdated, nextStepSummary),
    nextStepCard,
    appointmentsCard: buildAppointmentsCard(order, progressKey),
    productCard: buildProductCard(order),
    paperworkCard: buildPaperworkCard(order, visibleTimelineItems, patientActionRequired),
    careTeamCard: buildCareTeamCard(order),
    timelineCard: buildTimelineCard(visibleTimelineItems),
    meta: {
      requestId: order.requestId,
      currentMilestone: progressKey,
      lastUpdated,
      patientActionRequired,
    },
  };
}
