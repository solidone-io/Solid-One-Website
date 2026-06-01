import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../server/app.js";

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  app(req, res);
}
