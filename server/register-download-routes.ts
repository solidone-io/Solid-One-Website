import type express from "express";
import { asyncRoute } from "./async-route.js";
import {
  handleDownloadGoogleAuth,
  handleDownloadInstall,
  handleDownloadApkGet,
  handleDownloadMyReviewDelete,
  handleDownloadMyReviewGet,
  handleDownloadReleaseGet,
  handleDownloadReviewFlag,
  handleDownloadReviewHelpful,
  handleDownloadReviewPost,
  handleDownloadReviewsGet,
  handleDownloadStatsGet,
  sessionFromAuthHeader,
} from "./download-handler.js";

export function registerDownloadRoutes(app: express.Express) {
  app.get(
    "/api/download/stats",
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleDownloadStatsGet();
      res.status(status).json(json);
    }),
  );

  app.get(
    "/api/download/my-review",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadMyReviewGet(sessionFromAuthHeader(req.headers.authorization));
      res.status(status).json(json);
    }),
  );

  app.delete(
    "/api/download/my-review",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadMyReviewDelete(sessionFromAuthHeader(req.headers.authorization));
      res.status(status).json(json);
    }),
  );

  app.get(
    "/api/download/reviews",
    asyncRoute(async (req, res) => {
      const query = req.query as Record<string, string | string[] | undefined>;
      const { status, json } = await handleDownloadReviewsGet(query);
      res.status(status).json(json);
    }),
  );

  app.post(
    "/api/download/auth/google",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadGoogleAuth(req.body);
      res.status(status).json(json);
    }),
  );

  app.get(
    "/api/download/release",
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleDownloadReleaseGet();
      res.status(status).json(json);
    }),
  );

  app.get(
    "/api/download/apk",
    asyncRoute(async (req, res) => {
      handleDownloadApkGet(sessionFromAuthHeader(req.headers.authorization), res);
    }),
  );

  app.post(
    "/api/download/install",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadInstall(
        sessionFromAuthHeader(req.headers.authorization),
        req.body,
      );
      res.status(status).json(json);
    }),
  );

  app.post(
    "/api/download/reviews",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadReviewPost(
        sessionFromAuthHeader(req.headers.authorization),
        req.body,
      );
      res.status(status).json(json);
    }),
  );

  app.post(
    "/api/download/reviews/:id/helpful",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadReviewHelpful(
        sessionFromAuthHeader(req.headers.authorization),
        Number(req.params.id),
        req.body,
      );
      res.status(status).json(json);
    }),
  );

  app.post(
    "/api/download/reviews/:id/flag",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadReviewFlag(Number(req.params.id), req.body);
      res.status(status).json(json);
    }),
  );
}
