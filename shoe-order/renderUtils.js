export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function formatDate(value, fallback = "Not available") {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return fallback;
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value, fallback = "Not scheduled yet") {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return fallback;
  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatOptionalText(value, fallback = "Not available") {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

export function renderRows(rows, className = "shoe-status-list") {
  return `
    <div class="${className}">
      ${rows
        .map(
          (row) => `
            <div class="shoe-status-row">
              <span class="shoe-status-row__label">${escapeHtml(row.label)}</span>
              <span class="shoe-status-row__value">${escapeHtml(row.value)}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

export function renderChip(label, tone = "neutral") {
  return `<span class="shoe-status-chip shoe-status-chip--${tone}">${escapeHtml(label)}</span>`;
}

export function toPhoneHref(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}
