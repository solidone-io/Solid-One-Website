import type { IncomingMessage, ServerResponse } from "http";
import type express from "express";
import { createApp } from "../server/app.js";

let app: express.Express | undefined;

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (!app) {
    try {
      app = createApp();
    } catch (err) {
      console.error("createApp failed:", err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Server failed to start." }));
      return;
    }
  }
  app(req, res);
}
