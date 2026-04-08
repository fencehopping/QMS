const softgaitBaseUrl = process.env.SOFTGAIT_BASE_URL || "https://sandbox.softgait.com";
const softgaitEnvToken = process.env.SOFTGAIT_BEARER_TOKEN || "";
const softgaitEnvUsername = process.env.SOFTGAIT_USERNAME || "";
const softgaitEnvPassword = process.env.SOFTGAIT_PASSWORD || "";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).setHeader("Cache-Control", "no-store").json({ error: "Method not allowed" });
    return;
  }

  res.status(200).setHeader("Cache-Control", "no-store").json({
    baseUrl: softgaitBaseUrl,
    hasEnvBearerToken: Boolean(softgaitEnvToken),
    hasEnvCredentials: Boolean(softgaitEnvUsername && softgaitEnvPassword),
    hasDefaultSandboxCredentials: Boolean(softgaitEnvUsername && softgaitEnvPassword),
    defaultUsername: softgaitEnvUsername || "",
  });
}
