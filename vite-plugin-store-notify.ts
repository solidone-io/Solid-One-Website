import type { IncomingMessage, ServerResponse } from "http";
import type { Plugin } from "vite";
import { config as loadEnv } from "dotenv";
import {
  handleStoreNotifyDelete,
  handleStoreNotifyList,
  handleStoreNotifyPost,
  isAdminAuthorized,
} from "./server/store-notify-handler";
import {
  handleSubscribePost,
  handleSubscriberDelete,
  handleSubscribersList,
} from "./server/subscribers-handler";
import {
  handleSupportDelete,
  handleSupportList,
  handleSupportPost,
  handleSupportStarToggle,
} from "./server/support-handler";

loadEnv();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "solidone-admin";

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, json: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(json));
}

export function storeNotifyDevPlugin(): Plugin {
  return {
    name: "store-notify-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";

        if (pathname === "/api/admin/login" && req.method === "POST") {
          try {
            const body = (await readJsonBody(req)) as { password?: string };
            const password = typeof body.password === "string" ? body.password : "";
            if (password !== ADMIN_PASSWORD) {
              sendJson(res, 401, { error: "Invalid password." });
              return;
            }
            sendJson(res, 200, { ok: true, token: ADMIN_PASSWORD });
          } catch {
            sendJson(res, 400, { error: "Invalid request body." });
          }
          return;
        }

        if (pathname === "/api/subscribe" && req.method === "POST") {
          try {
            const body = await readJsonBody(req);
            const { status, json } = await handleSubscribePost(body);
            sendJson(res, status, json);
          } catch {
            sendJson(res, 400, { error: "Invalid request body." });
          }
          return;
        }

        if (pathname === "/api/admin/subscribers" && req.method === "GET") {
          if (!isAdminAuthorized(req.headers.authorization, ADMIN_PASSWORD)) {
            sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const { status, json } = await handleSubscribersList();
          sendJson(res, status, json);
          return;
        }

        const deleteSubscriberMatch = pathname.match(/^\/api\/admin\/subscribers\/(\d+)$/);
        if (deleteSubscriberMatch && req.method === "DELETE") {
          if (!isAdminAuthorized(req.headers.authorization, ADMIN_PASSWORD)) {
            sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const { status, json } = await handleSubscriberDelete(Number(deleteSubscriberMatch[1]));
          sendJson(res, status, json);
          return;
        }

        if (pathname === "/api/store-notify" && req.method === "POST") {
          try {
            const body = await readJsonBody(req);
            const { status, json } = await handleStoreNotifyPost(body);
            sendJson(res, status, json);
          } catch {
            sendJson(res, 400, { error: "Invalid request body." });
          }
          return;
        }

        if (pathname === "/api/admin/store-notify" && req.method === "GET") {
          if (!isAdminAuthorized(req.headers.authorization, ADMIN_PASSWORD)) {
            sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const { status, json } = await handleStoreNotifyList();
          sendJson(res, status, json);
          return;
        }

        const deleteStoreMatch = pathname.match(/^\/api\/admin\/store-notify\/(\d+)$/);
        if (deleteStoreMatch && req.method === "DELETE") {
          if (!isAdminAuthorized(req.headers.authorization, ADMIN_PASSWORD)) {
            sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const { status, json } = await handleStoreNotifyDelete(Number(deleteStoreMatch[1]));
          sendJson(res, status, json);
          return;
        }

        if (pathname === "/api/support" && req.method === "POST") {
          try {
            const body = await readJsonBody(req);
            const { status, json } = await handleSupportPost(body);
            sendJson(res, status, json);
          } catch {
            sendJson(res, 400, { error: "Invalid request body." });
          }
          return;
        }

        if (pathname === "/api/admin/support" && req.method === "GET") {
          if (!isAdminAuthorized(req.headers.authorization, ADMIN_PASSWORD)) {
            sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const { status, json } = await handleSupportList();
          sendJson(res, status, json);
          return;
        }

        const starSupportMatch = pathname.match(/^\/api\/admin\/support\/(\d+)\/star$/);
        if (starSupportMatch && req.method === "PATCH") {
          if (!isAdminAuthorized(req.headers.authorization, ADMIN_PASSWORD)) {
            sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const { status, json } = await handleSupportStarToggle(Number(starSupportMatch[1]));
          sendJson(res, status, json);
          return;
        }

        const deleteSupportMatch = pathname.match(/^\/api\/admin\/support\/(\d+)$/);
        if (deleteSupportMatch && req.method === "DELETE") {
          if (!isAdminAuthorized(req.headers.authorization, ADMIN_PASSWORD)) {
            sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
          const { status, json } = await handleSupportDelete(Number(deleteSupportMatch[1]));
          sendJson(res, status, json);
          return;
        }

        next();
      });
    },
  };
}
