import { app, ensureReady } from "../app.js";

export default async function handler(req, res) {
  try {
    await ensureReady();
    return app(req, res);
  } catch (err) {
    console.error("Vercel API handler failed:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        error: err?.message || "Server failed to start.",
        hint: "Check Vercel env vars: DATABASE_URL, JWT_SECRET, PASSWORD_PEPPER, ADMIN_EMAIL, ADMIN_PASSWORD",
      }));
    }
  }
}
