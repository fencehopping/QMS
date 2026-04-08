const softgaitBaseUrl = process.env.SOFTGAIT_BASE_URL || "https://sandbox.softgait.com";
const softgaitEnvToken = process.env.SOFTGAIT_BEARER_TOKEN || "";
const softgaitEnvUsername = process.env.SOFTGAIT_USERNAME || "";
const softgaitEnvPassword = process.env.SOFTGAIT_PASSWORD || "";
const softgaitEndpoints = {
  patient: "/api/patientdetails/{personId}",
  insurances: "/api/patientdetails/insurances/{personId}",
  physicians: "/api/patientdetails/physicians/{personId}",
  invoices: "/api/patientdetails/invoices/{personId}",
  caregiver: "/api/patientdetails/caregiver/{personId}",
  addresses: "/api/patientdetails/addresses/{personId}",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).setHeader("Cache-Control", "no-store").json({ error: "Method not allowed" });
    return;
  }

  const personId = Number(req.body?.personId);
  if (!Number.isInteger(personId) || personId <= 0) {
    res.status(400).setHeader("Cache-Control", "no-store").json({ error: "personId must be a positive integer." });
    return;
  }

  const summary = await fetchSoftgaitPatientSummary({
    personId,
    requestedToken: normalizeBearerToken(req.body?.token),
    username: normalizeString(req.body?.username) || softgaitEnvUsername,
    password: normalizePassword(req.body?.password) || softgaitEnvPassword,
    usingDefaultSandboxCredentials: Boolean(!req.body?.username && !req.body?.password && !normalizeBearerToken(req.body?.token)),
  });

  res.status(200).setHeader("Cache-Control", "no-store").json(summary);
}

async function fetchSoftgaitPatientSummary({ personId, requestedToken = "", username = "", password = "", usingDefaultSandboxCredentials = false }) {
  const bearerTokenResult = await resolveSoftgaitBearerToken({ requestedToken, username, password });
  if (!bearerTokenResult.success) {
    return {
      success: false,
      message: bearerTokenResult.message,
      data: {
        personId,
        requestedAt: new Date().toISOString(),
        auth: {
          mode: bearerTokenResult.mode,
          baseUrl: softgaitBaseUrl,
          username: bearerTokenResult.username || username || null,
          expiry: bearerTokenResult.expiry || null,
          hasEnvBearerToken: Boolean(softgaitEnvToken),
          hasEnvCredentials: Boolean(softgaitEnvUsername && softgaitEnvPassword),
          usingDefaultSandboxCredentials,
        },
        sections: Object.fromEntries(Object.keys(softgaitEndpoints).map((key) => [key, {
          success: false,
          message: bearerTokenResult.message,
          statusCode: 401,
          data: null,
        }])),
        orderStatusAvailable: false,
        statusSignals: { insuranceStatuses: [], invoiceStatuses: [] },
      },
    };
  }

  const { bearerToken, authMode, loginPayload } = bearerTokenResult;
  const sectionEntries = await Promise.all(
    Object.entries(softgaitEndpoints).map(async ([key, endpointPath]) => ([
      key,
      await requestSoftgait(endpointPath.replace("{personId}", String(personId)), { bearerToken }),
    ])),
  );
  const sections = Object.fromEntries(sectionEntries.map(([key, result]) => [key, normalizeSoftgaitWrapper(result)]));
  const anySectionSuccess = Object.values(sections).some((section) => section.success);

  return {
    success: anySectionSuccess,
    message: anySectionSuccess
      ? "Softgait patient details loaded."
      : "Softgait did not return patient details for the requested personId.",
    data: {
      personId,
      requestedAt: new Date().toISOString(),
      auth: {
        mode: authMode,
        baseUrl: softgaitBaseUrl,
        username: loginPayload?.data?.username || username || null,
        expiry: loginPayload?.data?.expiry || null,
        hasEnvBearerToken: Boolean(softgaitEnvToken),
        hasEnvCredentials: Boolean(softgaitEnvUsername && softgaitEnvPassword),
        usingDefaultSandboxCredentials,
      },
      sections,
      orderStatusAvailable: false,
      statusSignals: collectSoftgaitStatusSignals(sections),
    },
  };
}

async function resolveSoftgaitBearerToken({ requestedToken = "", username = "", password = "" }) {
  let bearerToken = requestedToken || normalizeBearerToken(softgaitEnvToken);
  let authMode = requestedToken ? "token" : bearerToken ? "env_token" : "login";
  let loginPayload = null;

  if (!bearerToken) {
    if (!username || !password) {
      return {
        success: false,
        mode: authMode,
        message: "Provide a bearer token or username/password for Softgait.",
      };
    }

    const loginResponse = await requestSoftgait("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });

    if (!loginResponse.payload?.success || !loginResponse.payload?.data?.token) {
      return {
        success: false,
        mode: "login",
        username,
        message: loginResponse.payload?.message || loginResponse.error || "Softgait login failed.",
      };
    }

    loginPayload = loginResponse.payload;
    bearerToken = normalizeBearerToken(loginPayload.data.token);
    authMode = requestedToken ? "token" : softgaitEnvToken ? "env_token" : "login";
  }

  return {
    success: true,
    bearerToken,
    authMode,
    loginPayload,
    username,
    expiry: loginPayload?.data?.expiry || null,
  };
}

async function requestSoftgait(endpointPath, { method = "GET", bearerToken = "", body } = {}) {
  try {
    const url = new URL(endpointPath, ensureTrailingSlash(softgaitBaseUrl));
    const headers = { Accept: "application/json" };

    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    let requestBody;
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
    });
    const payload = await parseJsonResponse(response);

    return {
      ok: response.ok,
      status: response.status,
      payload,
      error: response.ok ? "" : `Softgait responded with HTTP ${response.status}.`,
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      payload: null,
      error: error instanceof Error ? error.message : "Unable to reach Softgait.",
    };
  }
}

async function parseJsonResponse(response) {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return {
      success: false,
      message: raw,
      statusCode: response.status,
      data: null,
    };
  }
}

function normalizeSoftgaitWrapper(result) {
  if (result.payload && typeof result.payload === "object") {
    return {
      success: Boolean(result.payload.success),
      message: result.payload.message || (result.ok ? "Success" : result.error || "Softgait request failed."),
      statusCode: Number(result.payload.statusCode || result.status || 500),
      data: sanitizeSensitivePayload(result.payload.data ?? null),
    };
  }

  return {
    success: false,
    message: result.error || "Softgait request failed.",
    statusCode: Number(result.status || 500),
    data: null,
  };
}

function sanitizeSensitivePayload(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeSensitivePayload(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        /password/i.test(String(key)) ? "[REDACTED]" : sanitizeSensitivePayload(nestedValue),
      ]),
    );
  }

  return value;
}

function collectSoftgaitStatusSignals(sections) {
  return {
    insuranceStatuses: uniqueStrings((sections.insurances?.data || []).map((item) => item?.status)),
    invoiceStatuses: uniqueStrings((sections.invoices?.data || []).map((item) => item?.status)),
  };
}

function uniqueStrings(values) {
  return [...new Set(values.map((value) => normalizeString(value)).filter(Boolean))];
}

function normalizeString(value) {
  return String(value ?? "").trim();
}

function normalizePassword(value) {
  return typeof value === "string" ? value : "";
}

function normalizeBearerToken(value) {
  return normalizeString(value).replace(/^Bearer\s+/i, "");
}

function ensureTrailingSlash(url) {
  return url.endsWith("/") ? url : `${url}/`;
}
