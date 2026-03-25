import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 4173);
const cmsApiBase = "https://npiregistry.cms.hhs.gov/api/";
const cmsPageSize = 50;
const cmsMaxPages = 20;

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

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    if (requestUrl.pathname === "/api/physicians") {
      await proxyPhysicianSearch(requestUrl, res);
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
