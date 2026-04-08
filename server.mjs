import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  process.loadEnvFile(path.join(__dirname, ".env.local"));
} catch {
  // Local env file is optional in development.
}

const port = Number(process.env.PORT || 4173);
const cmsApiBase = "https://npiregistry.cms.hhs.gov/api/";
const cmsPageSize = 50;
const cmsMaxPages = 20;
const softgaitBaseUrl = process.env.SOFTGAIT_BASE_URL || "https://sandbox.softgait.com";
const softgaitEnvToken = process.env.SOFTGAIT_BEARER_TOKEN || "";
const softgaitEnvUsername = process.env.SOFTGAIT_USERNAME || "";
const softgaitEnvPassword = process.env.SOFTGAIT_PASSWORD || "";
const softgaitDefaultUsername = softgaitEnvUsername;
const softgaitDefaultPassword = softgaitEnvPassword;
const softgaitEndpoints = {
  patient: "/api/patientdetails/{personId}",
  insurances: "/api/patientdetails/insurances/{personId}",
  physicians: "/api/patientdetails/physicians/{personId}",
  invoices: "/api/patientdetails/invoices/{personId}",
  caregiver: "/api/patientdetails/caregiver/{personId}",
  addresses: "/api/patientdetails/addresses/{personId}",
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (requestUrl.pathname === "/api/physicians" && req.method === "GET") {
      await proxyPhysicianSearch(requestUrl, res);
      return;
    }

    if (requestUrl.pathname === "/api/softgait/config" && req.method === "GET") {
      sendJson(res, 200, {
        baseUrl: softgaitBaseUrl,
        hasEnvBearerToken: Boolean(softgaitEnvToken),
        hasEnvCredentials: Boolean(softgaitEnvUsername && softgaitEnvPassword),
        hasDefaultSandboxCredentials: Boolean(softgaitDefaultUsername && softgaitDefaultPassword),
        defaultUsername: softgaitDefaultUsername || "",
      });
      return;
    }

    if (requestUrl.pathname === "/api/softgait/patient-summary" && req.method === "POST") {
      await proxySoftgaitPatientSummary(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/softgait/random-patient" && req.method === "POST") {
      await proxySoftgaitRandomPatient(req, res);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    await serveStaticAsset(requestUrl.pathname, req.method === "HEAD", res);
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error",
    });
  }
});

server.listen(port, () => {
  console.log(`QMS dev server running at http://localhost:${port}`);
});

async function proxyPhysicianSearch(requestUrl, res) {
  const allowedParams = [
    "version",
    "enumeration_type",
    "state",
    "city",
    "first_name",
    "last_name",
    "use_first_name_alias",
  ];

  try {
    const baseParams = new URLSearchParams();
    for (const key of allowedParams) {
      const value = requestUrl.searchParams.get(key);
      if (value) baseParams.set(key, value);
    }
    baseParams.set("version", baseParams.get("version") || "2.1");
    baseParams.set("limit", String(cmsPageSize));

    const aggregatedResults = [];

    for (let pageIndex = 0; pageIndex < cmsMaxPages; pageIndex += 1) {
      const cmsUrl = new URL(cmsApiBase);
      cmsUrl.search = baseParams.toString();
      cmsUrl.searchParams.set("skip", String(pageIndex * cmsPageSize));

      const cmsResponse = await fetch(cmsUrl, {
        headers: { Accept: "application/json" },
      });
      if (!cmsResponse.ok) {
        const body = await cmsResponse.text();
        res.writeHead(cmsResponse.status, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        });
        res.end(body);
        return;
      }

      const payload = await cmsResponse.json();
      if (Array.isArray(payload.Errors) && payload.Errors.length) {
        sendJson(res, 502, {
          error: payload.Errors[0].description || "The CMS lookup did not return physician results.",
        });
        return;
      }

      const pageResults = Array.isArray(payload.results) ? payload.results : [];
      aggregatedResults.push(...pageResults);

      if (pageResults.length < cmsPageSize) {
        break;
      }
    }

    sendJson(res, 200, {
      result_count: aggregatedResults.length,
      results: aggregatedResults,
    });
  } catch (error) {
    sendJson(res, 502, {
      error: error instanceof Error ? error.message : "Unable to reach CMS physician directory",
    });
  }
}

async function proxySoftgaitPatientSummary(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : "Invalid request body.",
    });
    return;
  }

  const personId = Number(body?.personId);
  if (!Number.isInteger(personId) || personId <= 0) {
    sendJson(res, 400, { error: "personId must be a positive integer." });
    return;
  }

  const summary = await fetchSoftgaitPatientSummary({
    personId,
    requestedToken: normalizeBearerToken(body?.token),
    username: normalizeString(body?.username) || softgaitDefaultUsername,
    password: normalizePassword(body?.password) || softgaitDefaultPassword,
    usingDefaultSandboxCredentials: Boolean(!body?.username && !body?.password && !softgaitEnvUsername && !softgaitEnvPassword && !normalizeBearerToken(body?.token)),
  });

  sendJson(res, 200, summary);
}

async function proxySoftgaitRandomPatient(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : "Invalid request body.",
    });
    return;
  }

  const minPersonId = Number.isInteger(Number(body?.minPersonId)) ? Number(body.minPersonId) : 100000;
  const maxPersonId = Number.isInteger(Number(body?.maxPersonId)) ? Number(body.maxPersonId) : 999999;
  const attempts = Number.isInteger(Number(body?.attempts))
    ? Math.min(Math.max(Number(body.attempts), 1), 20)
    : 8;

  if (minPersonId <= 0 || maxPersonId < minPersonId) {
    sendJson(res, 400, { error: "Invalid random patient range." });
    return;
  }

  const requestedToken = normalizeBearerToken(body?.token);
  const username = normalizeString(body?.username) || softgaitDefaultUsername;
  const password = normalizePassword(body?.password) || softgaitDefaultPassword;
  const sampledPersonIds = createRandomPersonIds(minPersonId, maxPersonId, attempts);
  const attemptResults = [];

  for (const personId of sampledPersonIds) {
    const summary = await fetchSoftgaitPatientSummary({
      personId,
      requestedToken,
      username,
      password,
      usingDefaultSandboxCredentials: Boolean(!body?.username && !body?.password && !softgaitEnvUsername && !softgaitEnvPassword && !requestedToken),
    });
    attemptResults.push({
      personId,
      success: summary.success,
      message: summary.message,
      auth: summary.data?.auth || null,
      sections: summarizeSectionStatuses(summary.data?.sections || {}),
    });

    if (summary.success) {
      sendJson(res, 200, {
        success: true,
        message: "Found a patient record.",
        sampledPersonIds,
        data: summary.data,
        attempts: attemptResults,
      });
      return;
    }
  }

  sendJson(res, 200, {
    success: false,
    message: "No accessible patient record was found in the sampled range.",
    sampledPersonIds,
    attempts: attemptResults,
    blocker: detectSoftgaitBlocker(attemptResults),
    data: null,
  });
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

function createRandomPersonIds(minPersonId, maxPersonId, attempts) {
  const seen = new Set();
  while (seen.size < attempts) {
    const personId = Math.floor(minPersonId + (Math.random() * ((maxPersonId - minPersonId) + 1)));
    seen.add(personId);
  }
  return [...seen];
}

function summarizeSectionStatuses(sections) {
  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, value?.statusCode || null]),
  );
}

function detectSoftgaitBlocker(attemptResults) {
  const allStatusCodes = attemptResults.flatMap((attempt) => Object.values(attempt.sections || {})).filter(Boolean);
  if (allStatusCodes.length && allStatusCodes.every((statusCode) => statusCode === 403)) {
    return "login_token_forbidden";
  }
  if (attemptResults.some((attempt) => /Provide a bearer token or username\/password/i.test(attempt.message))) {
    return "missing_credentials";
  }
  return "no_accessible_patient_found";
}

async function requestSoftgait(endpointPath, { method = "GET", bearerToken = "", body } = {}) {
  try {
    const url = new URL(endpointPath, ensureTrailingSlash(softgaitBaseUrl));
    const headers = {
      Accept: "application/json",
    };

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
        isSensitiveField(key) ? "[REDACTED]" : sanitizeSensitivePayload(nestedValue),
      ]),
    );
  }

  return value;
}

function isSensitiveField(key) {
  return /password/i.test(String(key));
}

function collectSoftgaitStatusSignals(sections) {
  return {
    insuranceStatuses: uniqueStrings((sections.insurances?.data || []).map((item) => item?.status)),
    invoiceStatuses: uniqueStrings((sections.invoices?.data || []).map((item) => item?.status)),
  };
}

function uniqueStrings(values) {
  return [...new Set(
    values
      .map((value) => normalizeString(value))
      .filter(Boolean),
  )];
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

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 100_000) {
      throw new Error("Request body too large.");
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

async function serveStaticAsset(requestPath, isHeadRequest, res) {
  const normalizedPath = requestPath === "/" ? "/index.html" : decodeURIComponent(requestPath);
  const candidatePath = path.normalize(path.join(__dirname, normalizedPath));

  if (!candidatePath.startsWith(__dirname)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  let filePath = candidatePath;
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch {
    filePath = path.join(__dirname, "index.html");
  }

  try {
    await access(filePath);
  } catch {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });

  if (isHeadRequest) {
    res.end();
    return;
  }

  createReadStream(filePath).pipe(res);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}
