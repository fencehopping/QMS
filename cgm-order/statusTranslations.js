export const ORDER_STEPS = [
  { key: "order_started", label: "Order started" },
  { key: "paperwork_reviewed", label: "Prescription & forms reviewed" },
  { key: "insurance_reviewed", label: "Insurance reviewed" },
  { key: "shipment_prepared", label: "Shipment prepared" },
  { key: "order_shipped", label: "Order shipped" },
  { key: "education_appointment", label: "Education appointment" },
  { key: "ongoing_resupply", label: "Ongoing resupply" },
];

export const RAW_STATUS_TRANSLATIONS = {
  "CREATED D.O.": {
    visible: true,
    label: "Your CGM order was started",
    explanation: "We opened your order and started gathering the prescription details needed to move it forward.",
    tone: "info",
    progressKey: "order_started",
    currentStatusLabel: "Order started",
    heroHeadline: "Your CGM order is underway",
    patientActionRequired: false,
  },
  "FAX IN QUE TO SEND": {
    visible: false,
  },
  "D.O. FILLED": {
    visible: true,
    label: "Prescription and forms were completed",
    explanation: "Your prescription and required paperwork were completed and attached to the order.",
    tone: "success",
    progressKey: "paperwork_reviewed",
    currentStatusLabel: "Paperwork complete",
    heroHeadline: "Your prescription and forms are on file",
    patientActionRequired: false,
  },
  RESERVED: {
    visible: true,
    label: "Your shipment was prepared",
    explanation: "We prepared your CGM supplies so the order could move into final shipment processing.",
    tone: "info",
    progressKey: "shipment_prepared",
    currentStatusLabel: "Shipment prepared",
    heroHeadline: "Your CGM supplies are being prepared",
    patientActionRequired: false,
  },
  "PENDING AUTHORIZATION": {
    visible: true,
    label: "Insurance review started",
    explanation: "We began checking the insurance requirements tied to your order.",
    tone: "info",
    progressKey: "insurance_reviewed",
    currentStatusLabel: "Insurance review in progress",
    heroHeadline: "We are reviewing insurance for your CGM order",
    patientActionRequired: false,
  },
  "AUTH NOT REQUIRED": {
    visible: true,
    label: "No insurance authorization was needed",
    explanation: "Your plan did not require a separate authorization before shipment.",
    tone: "success",
    progressKey: "insurance_reviewed",
    currentStatusLabel: "Authorization not required",
    heroHeadline: "No insurance authorization was needed",
    patientActionRequired: false,
  },
  "INSURANCE VERIFIED": {
    visible: true,
    label: "Insurance was verified",
    explanation: "We verified the insurance details needed to complete your first shipment.",
    tone: "success",
    progressKey: "insurance_reviewed",
    currentStatusLabel: "Insurance verified",
    heroHeadline: "Your insurance was verified",
    patientActionRequired: false,
  },
  "PRODUCT DISPENSED": {
    visible: true,
    label: "Your CGM shipment was sent",
    explanation: "Your first CGM shipment was processed and sent so you can begin setup.",
    tone: "success",
    progressKey: "order_shipped",
    currentStatusLabel: "Order shipped",
    heroHeadline: "Your CGM shipment is on the way",
    patientActionRequired: false,
  },
};

export const PRIOR_AUTH_TRANSLATIONS = {
  "Auth Started": "In progress",
  "Auth Not Required": "Not required",
  Approved: "Approved",
  Pending: "Pending review",
  Denied: "Needs follow-up",
};

export function getStatusTranslation(rawStatus) {
  return RAW_STATUS_TRANSLATIONS[String(rawStatus || "").trim()] || null;
}

export function translatePriorAuthorization(rawValue) {
  const normalized = String(rawValue || "").trim();
  return PRIOR_AUTH_TRANSLATIONS[normalized] || normalized || "Not started";
}
