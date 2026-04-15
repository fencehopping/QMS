function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseTransactionDate(dateValue, timeValue) {
  const dateMatch = String(dateValue || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateMatch) return null;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  const timeMatch = String(timeValue || "").trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);

  if (timeMatch) {
    hours = Number(timeMatch[1]) % 12;
    minutes = Number(timeMatch[2]);
    seconds = Number(timeMatch[3] || 0);
    if (timeMatch[4].toUpperCase() === "PM") {
      hours += 12;
    }
  }

  return new Date(
    Number(dateMatch[3]),
    Number(dateMatch[1]) - 1,
    Number(dateMatch[2]),
    hours,
    minutes,
    seconds,
  );
}

function toTitleCase(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function normalizeName(value) {
  return toTitleCase(value).replace(/\bMc([a-z])/g, (match, letter) => `Mc${letter.toUpperCase()}`);
}

function normalizeAddress(value) {
  const parts = String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return "";

  return parts
    .map((part, index) => {
      if (index === parts.length - 1 && /^\d{5}(?:-\d{4})?$/.test(part)) return part;
      if (index === parts.length - 2 && /^[A-Za-z]{2}$/.test(part)) return part.toUpperCase();
      return toTitleCase(part);
    })
    .join(", ");
}

function normalizeFlag(value, truthy = "Yes", falsy = "No") {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "yes") return truthy;
  if (normalized === "no") return falsy;
  return String(value || "").trim();
}

function parseThinFilmStrips(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const [status, dateValue] = raw.split("-");

  if (!dateValue) return status;

  const parts = dateValue.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!parts) return raw;

  const parsed = new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]));
  if (Number.isNaN(parsed.getTime())) return raw;

  return `${status.trim()} (${parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })})`;
}

function getNextSupplyDate(items) {
  return items.reduce((closest, item) => {
    if (!(item.futureShipDate instanceof Date) || Number.isNaN(item.futureShipDate.getTime())) {
      return closest;
    }

    if (!closest) return item.futureShipDate;
    return item.futureShipDate.getTime() < closest.getTime() ? item.futureShipDate : closest;
  }, null);
}

export function normalizeCgmOrder(rawResponse) {
  const order = rawResponse?.data?.orderDetails || {};
  const doDetails = order.doDetails || {};
  const requestDetails = order.requestDetails || {};
  const itemDetails = Array.isArray(requestDetails.itemDetails) ? requestDetails.itemDetails : [];
  const transactions = Array.isArray(order.txnHistory) ? order.txnHistory : [];

  const normalizedItems = itemDetails.map((item) => ({
    item: String(item.item || "").trim(),
    quantity: Number(item.quantity || 0),
    serialNumber: String(item.serialNumber || "").trim(),
    lastShipmentDate: parseDate(item.lastShipmentDate),
    futureShipDate: parseDate(item.futureShipDate),
  }));

  return {
    success: Boolean(rawResponse?.success && rawResponse?.data?.orderDetails),
    message: String(rawResponse?.message || ""),
    product: String(order.product || "").trim(),
    requestId: String(requestDetails.request || ""),
    salesPerson: normalizeName(order.salesPerson),
    cgmEducator: normalizeName(order.cgmEducator),
    patientAdvocate: normalizeName(order.patientAdvocate),
    physician: normalizeName(order.physician),
    dateConfirmed: parseDate(order.dateConfirmed),
    appointmentDate: parseDate(order.appointmentDate),
    priorAuthorization: String(order.priorAuth || "").trim(),
    orderFollowUp: String(order.doFollowUp || "").trim(),
    patientFollowUp: String(order.patientFollowUp || "").trim(),
    details: {
      diagnosisPrimary: String(doDetails.diagnosis1 || "").trim(),
      diagnosisSecondary: String(doDetails.diagnosis2 || "").trim(),
      billingType: String(doDetails.cgmBilling || "").trim(),
      cgmModel: String(doDetails.cgmModel || requestDetails.cgmModel || "").trim(),
      shipToAddress: normalizeAddress(doDetails.shipToAddress),
      validAddress: normalizeFlag(doDetails.validAddress, "Validated", "Needs review"),
      overrideUsps: normalizeFlag(doDetails.overrideUSPS),
      status: String(doDetails.status || "").trim(),
      snfHospice: normalizeFlag(doDetails.snfHospice),
      shipmentDuration: String(doDetails.shipmentDuration || requestDetails.shipmentDuration || "").trim(),
      paymentType: String(doDetails.paymentType || "").trim(),
      thinFilmStrips: parseThinFilmStrips(doDetails.thinFilmStrips),
      effectiveDate: parseDate(doDetails.effectiveDate),
      expirationDate: parseDate(doDetails.expirationDate),
      autoClaimCreation: normalizeFlag(doDetails.autoClaimCreation),
      isReorderCancelled: normalizeFlag(doDetails.isReorderCancelled),
    },
    request: {
      isAnchorOrder: Boolean(requestDetails.isAnchorOrder),
      authorization: String(requestDetails.authorization || "").trim(),
      units: String(requestDetails.units || "").trim(),
      authDates: String(requestDetails.authDates || "").trim(),
      shipDate: parseDate(requestDetails.shipDate),
      shippedTo: normalizeAddress(requestDetails.shippedTo || doDetails.shipToAddress),
      cgmModel: String(requestDetails.cgmModel || doDetails.cgmModel || "").trim(),
      cgmType: String(requestDetails.cgmType || "").trim(),
      shipmentDuration: String(requestDetails.shipmentDuration || doDetails.shipmentDuration || "").trim(),
      items: normalizedItems,
    },
    nextSupplyDate: getNextSupplyDate(normalizedItems),
    timeline: transactions
      .map((event) => ({
        rawStatus: String(event.status || "").trim(),
        createdBy: normalizeName(event.createdBy),
        occurredAt: parseTransactionDate(event.date, event.time),
        note: String(event.misc || "").replace(/^null\b[:\s-]*/i, "").trim(),
      }))
      .sort((left, right) => {
        const leftTime = left.occurredAt ? left.occurredAt.getTime() : 0;
        const rightTime = right.occurredAt ? right.occurredAt.getTime() : 0;
        return leftTime - rightTime;
      }),
  };
}
