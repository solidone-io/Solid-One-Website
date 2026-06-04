import express from "express";
import cors from "cors";
import path from "path";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import {
  handleStoreNotifyDelete,
  handleStoreNotifyList,
  handleStoreNotifyPost,
  isAdminAuthorized,
} from "./store-notify-handler.js";
import {
  handleSubscribePost,
  handleSubscriberDelete,
  handleSubscribersList,
} from "./subscribers-handler.js";
import {
  handleSupportDelete,
  handleSupportList,
  handleSupportPost,
  handleSupportStarToggle,
} from "./support-handler.js";
import { registerBlogRoutes } from "./register-blog-routes.js";
import { registerDownloadRoutes } from "./register-download-routes.js";
import { asyncRoute } from "./async-route.js";
import { useBlobStorage } from "./persistent-json.js";
import { isVercelRuntime } from "./runtime.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD ?? "solidone-admin").trim();
  const dataDir = path.resolve(__dirname, "..", "data");
  const uploadsDir = path.join(dataDir, "uploads");
  if (!useBlobStorage() && !isVercelRuntime()) {
    try {
      mkdirSync(uploadsDir, { recursive: true });
    } catch {
      // ignore on read-only filesystems
    }
  }

  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!isAdminAuthorized(req.headers.authorization, ADMIN_PASSWORD)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  }

  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post(
    "/api/subscribe",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSubscribePost(req.body);
      res.status(status).json(json);
    }),
  );

  app.get(
    "/api/admin/subscribers",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleSubscribersList();
      res.status(status).json(json);
    }),
  );

  app.delete(
    "/api/admin/subscribers/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSubscriberDelete(Number(req.params.id));
      res.status(status).json(json);
    }),
  );

  app.post(
    "/api/store-notify",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleStoreNotifyPost(req.body);
      res.status(status).json(json);
    }),
  );

  app.post("/api/admin/login", (req, res) => {
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Invalid password." });
      return;
    }
    res.json({ ok: true, token: ADMIN_PASSWORD });
  });

  app.get(
    "/api/admin/store-notify",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleStoreNotifyList();
      res.status(status).json(json);
    }),
  );

  app.delete(
    "/api/admin/store-notify/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleStoreNotifyDelete(Number(req.params.id));
      res.status(status).json(json);
    }),
  );

  app.post(
    "/api/support",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSupportPost(req.body);
      res.status(status).json(json);
    }),
  );

  app.get(
    "/api/admin/support",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleSupportList();
      res.status(status).json(json);
    }),
  );

  app.patch(
    "/api/admin/support/:id/star",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSupportStarToggle(Number(req.params.id));
      res.status(status).json(json);
    }),
  );

  app.delete(
    "/api/admin/support/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSupportDelete(Number(req.params.id));
      res.status(status).json(json);
    }),
  );

  if (!useBlobStorage()) {
    app.use("/uploads", express.static(uploadsDir));
  }

  registerBlogRoutes(app, { requireAdmin, uploadsDir });
  registerDownloadRoutes(app);

  return app;
}
