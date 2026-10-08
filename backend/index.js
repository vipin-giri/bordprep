import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Prefer backend/.env; fall back to repo-root .env for local convenience.
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { app, ensureReady } from "./app.js";

const port = Number(process.env.PORT) || 3001;

async function start() {
  await ensureReady();
  app.listen(port, () => {
    console.log(`ParikshaCrack API listening on http://localhost:${port}`);
  });
}

// Local / traditional Node host only. On Vercel, api/index.js exports the app.
if (!process.env.VERCEL) {
  start().catch((err) => {
    console.error("Failed to start API:", err);
    process.exit(1);
  });
}
