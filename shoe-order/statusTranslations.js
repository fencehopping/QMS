export const ORDER_STEPS = [
  { key: "order_started", label: "Order started" },
  { key: "paperwork_reviewed", label: "Prescription & forms reviewed" },
  { key: "fitting_completed", label: "Fitting completed" },
  { key: "shoes_ordered", label: "Shoes ordered" },
  { key: "manufacturer_confirmed", label: "Manufacturer confirmed" },
  { key: "shoes_received", label: "Shoes received" },
  { key: "final_delivery", label: "Final delivery / pickup" },
  { key: "complete", label: "Complete" },
];

export const RAW_STATUS_TRANSLATIONS = {
  "CREATED D.O.": {
    visible: true,
    label: "Your shoe order was started",
    explanation: "We started your order and began collecting the paperwork needed to move it forward.",
    tone: "info",
    progressKey: "order_started",
    currentStatusLabel: "Order started",
    heroHeadline: "Your shoe order is underway",
    patientActionRequired: false,
  },
  "FAX IN QUE TO SEND": {
    visible: false,
  },
  "INCOMPLETE D.O": {
    visible: true,
    label: "Paperwork needed correction",
    explanation: "One of the required forms needed a correction before your order could keep moving.",
    tone: "warning",
    progressKey: "paperwork_reviewed",
    currentStatusLabel: "Paperwork needs attention",
    heroHeadline: "We need to correct part of your paperwork",
    patientActionRequired: true,
  },
  "CREATED D.O Incomplete": {
    visible: false,
  },
  USEABLE: {
    visible: false,
  },
  "INCOMPLETE D.O MARKED AS COMPLETED": {
    visible: false,
  },
  "D.O. FILLED": {
    visible: true,
    label: "Paperwork was completed",
    explanation: "Your prescription and forms were completed and are on file.",
    tone: "success",
    progressKey: "paperwork_reviewed",
    currentStatusLabel: "Paperwork complete",
    heroHeadline: "Your prescription and forms are on file",
    patientActionRequired: false,
  },
  "SHOE FITTER ASSIGNED": {
    visible: true,
    label: "A fitter was assigned",
    explanation: "A fitter was assigned to help guide the rest of your shoe order.",
    tone: "info",
    progressKey: "paperwork_reviewed",
    currentStatusLabel: "Fitter assigned",
    heroHeadline: "Your fitter is assigned",
    patientActionRequired: false,
  },
  "FITTER DOCUMENT SIGNED": {
    visible: true,
    label: "Your fitting documentation was completed",
    explanation: "Your fitting details were completed and added to your order.",
    tone: "success",
    progressKey: "fitting_completed",
    currentStatusLabel: "Fitting completed",
    heroHeadline: "Your fitting is complete",
    patientActionRequired: false,
  },
  "CREATED REVISE D.O": {
    visible: true,
    label: "Paperwork was updated",
    explanation: "Your paperwork was updated so your order can keep moving without delays.",
    tone: "info",
    progressKey: "paperwork_reviewed",
    currentStatusLabel: "Paperwork updated",
    heroHeadline: "Your paperwork was updated",
    patientActionRequired: false,
  },
  REQUESTED: {
    visible: false,
  },
  "3D SCANNED LINKED TO ORDER": {
    visible: true,
    label: "Your fitting scan was received",
    explanation: "Your scan was attached to the order so the shoes could be placed accurately.",
    tone: "success",
    progressKey: "fitting_completed",
    currentStatusLabel: "Fitting scan received",
    heroHeadline: "We received your fitting scan",
    patientActionRequired: false,
  },
  ORDERED: {
    visible: true,
    label: "Your shoes were ordered",
    explanation: "We placed your selected shoes with the manufacturer.",
    tone: "info",
    progressKey: "shoes_ordered",
    currentStatusLabel: "Shoes ordered",
    heroHeadline: "Your shoes were ordered",
    patientActionRequired: false,
  },
  "ORDER CONFIRMED BY MANUFACTURER": {
    visible: true,
    label: "The manufacturer confirmed your order",
    explanation: "The manufacturer confirmed your shoe order and is preparing it for shipment.",
    tone: "success",
    progressKey: "manufacturer_confirmed",
    currentStatusLabel: "Manufacturer confirmed",
    heroHeadline: "The manufacturer confirmed your order",
    patientActionRequired: false,
  },
  RESERVED: {
    visible: true,
    label: "Your shoes arrived",
    explanation: "Your shoes were received by Quantum Medical Supply and are ready for the final delivery or pickup step.",
    tone: "success",
    progressKey: "shoes_received",
    currentStatusLabel: "Shoes received",
    heroHeadline: "Your shoes have arrived",
    patientActionRequired: false,
  },
};

export const PRIOR_AUTH_TRANSLATIONS = {
  "Auth Started": "In progress",
  Approved: "Approved",
  Pending: "Pending review",
  Denied: "Needs follow-up",
};

export function getStatusTranslation(rawStatus) {
  return RAW_STATUS_TRANSLATIONS[String(rawStatus || "").trim()] || null;
}

export function translatePriorAuthorization(rawValue) {
  const normalized = String(rawValue || "").trim();
  return PRIOR_AUTH_TRANSLATIONS[normalized] || normalized || "Not yet started";
}
