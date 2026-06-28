import type express from "express";
import { asyncRoute } from "./async-route.js";
import { handleVerifyChannelGet, handleVerifyChannelsListGet } from "./verify-handler.js";

export function registerVerifyRoutes(app: express.Express) {
  app.get(
    "/api/verify",
    asyncRoute(async (req, res) => {
      const query = req.query as Record<string, string | string[] | undefined>;
      const { status, json } = await handleVerifyChannelGet(query);
      res.status(status).json(json);
    }),
  );

  app.get(
    "/api/verify/channels",
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleVerifyChannelsListGet();
      res.status(status).json(json);
    }),
  );
}
