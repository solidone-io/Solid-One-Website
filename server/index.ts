import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".env") });
import { createApp } from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.API_PORT ?? 3001);
const isProd = process.env.NODE_ENV === "production" && !process.env.VERCEL;

const app = createApp();
console.log("API routes enabled (file storage).");

if (isProd) {
  const publicDir = path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server listening on http://0.0.0.0:${PORT}`);
});
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.warn(
      `Port ${PORT} is in use. Stop the other process or set API_PORT in .env.`,
    );
    return;
  }
  console.error(err);
  process.exit(1);
});
