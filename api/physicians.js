const cmsApiBase = "https://npiregistry.cms.hhs.gov/api/";
const cmsPageSize = 50;
const cmsMaxPages = 20;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

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
      const value = req.query[key];
      if (typeof value === "string" && value) {
        baseParams.set(key, value);
      }
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
        res.status(cmsResponse.status).setHeader("Cache-Control", "no-store");
        try {
          res.json(JSON.parse(body));
        } catch {
          res.send(body);
        }
        return;
      }

      const payload = await cmsResponse.json();
      if (Array.isArray(payload.Errors) && payload.Errors.length) {
        res.status(502).setHeader("Cache-Control", "no-store").json({
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

    res.status(200).setHeader("Cache-Control", "no-store").json({
      result_count: aggregatedResults.length,
      results: aggregatedResults,
    });
  } catch (error) {
    res.status(502).setHeader("Cache-Control", "no-store").json({
      error: error instanceof Error ? error.message : "Unable to reach CMS physician directory",
    });
  }
}
