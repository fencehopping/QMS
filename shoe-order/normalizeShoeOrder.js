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

function parseBackupOption(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const pattern = /(Manufacturer|Style|Color|Colour|ClosureType|Size|Width):\s*([^]+?)(?=-(?:Manufacturer|Style|Color|Colour|ClosureType|Size|Width):|$)/g;
  const record = {};
  let match = pattern.exec(raw);

  while (match) {
    record[match[1]] = match[2].trim();
    match = pattern.exec(raw);
  }

  if (!Object.keys(record).length) return null;

  return {
    manufacturer: record.Manufacturer || "",
    style: record.Style || "",
    color: record.Colour || record.Color || "",
    closureType: record.ClosureType || "",
    size: record.Size || "",
    width: record.Width || "",
  };
}

function normalizeAlternateFitter(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = raw.match(/^(.*?)\s*\/\s*By Road\s*([\d.]+)\s*Miles$/i);
  if (!match) return normalizeName(raw);
  return `${normalizeName(match[1])} (${match[2]} miles away)`;
}

export function normalizeShoeOrder(rawResponse) {
  const order = rawResponse?.data?.orderDetails || {};
  const paperwork = order.doDetails || {};
  const product = order.shoeDetails || {};
  const transactions = Array.isArray(order.txnHistory) ? order.txnHistory : [];

  return {
    success: Boolean(rawResponse?.success && rawResponse?.data?.orderDetails),
    message: String(rawResponse?.message || ""),
    requestId: String(product.request || ""),
    salesPerson: normalizeName(order.salesPerson),
    physician: normalizeName(order.physician),
    fitterInArea: normalizeName(order.fitterInArea),
    alternateFitter: normalizeAlternateFitter(order.alternateFitter),
    fittingAppointment: parseDate(order.fittingAppointmentDate),
    dispensingAppointment: parseDate(order.dispensingAppointment),
    priorAuthorization: String(order.priorAuth || "").trim(),
    orderFollowUp: String(order.doFollowUp || "").trim(),
    patientFollowUp: String(order.patientFollowUp || "").trim(),
    paperwork: {
      product: String(paperwork.product || "").trim(),
      dateDispensed: parseDate(paperwork.dateDispensed),
      insertType: String(paperwork.insertType || "").trim(),
      toeFiller: String(paperwork.toeFiller || "").trim(),
      diagnosis: String(paperwork.diagnosis1 || "").trim(),
      rxSignatureDate: parseDate(paperwork.rxSignatureDate),
      rxExpirationDate: parseDate(paperwork.rxExpirationDate),
      cmnSignatureDate: parseDate(paperwork.cmnSignatureDate),
      cmnExpirationDate: parseDate(paperwork.cmnExpirationDate),
      accommodations: String(paperwork.accommodations || "").trim(),
    },
    product: {
      barcode: String(product.barCode || "").trim(),
      manufacturer: String(product.manufacturer || "").trim(),
      dealer: String(product.dealer || "").trim(),
      gender: String(product.gender || "").trim(),
      style: String(product.style || "").trim(),
      color: String(product.colour || product.color || "").trim(),
      size: String(product.size || "").trim(),
      width: String(product.width || "").trim(),
      closureType: String(product.closureType || "").trim(),
      arrivalDate: parseDate(product.arrivalDate),
      insoles: String(product.insoles || "").trim(),
      description: String(product.description || "").trim(),
      insertType: String(paperwork.insertType || "").trim(),
      backupOption: parseBackupOption(product.secondChoice),
    },
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
