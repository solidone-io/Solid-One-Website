// api/src/index.ts
import "dotenv/config";

// server/app.js
import express from "express";
import cors from "cors";
import path3 from "path";
import { mkdirSync as mkdirSync2 } from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/store-notify-handler.js
import { z } from "zod";

// server/persistent-json.js
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var dataDir = path.resolve(__dirname, "..", "data");
function useBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
function ensureLocalDataDir() {
  if (useBlobStorage() || process.env.VERCEL)
    return;
  try {
    mkdirSync(dataDir, { recursive: true });
  } catch {
  }
}
async function readJsonFile(filename, fallback) {
  if (!useBlobStorage()) {
    try {
      const raw = readFileSync(path.join(dataDir, filename), "utf8");
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  const { list } = await import("@vercel/blob");
  const blobPath = `solid-one/${filename}`;
  const result = await list({ prefix: blobPath, limit: 1 });
  if (!result.blobs.length)
    return fallback;
  const res = await fetch(result.blobs[0].url);
  if (!res.ok)
    return fallback;
  return await res.json();
}
async function writeJsonFile(filename, data) {
  const body = JSON.stringify(data, null, 2);
  if (!useBlobStorage()) {
    ensureLocalDataDir();
    writeFileSync(path.join(dataDir, filename), body, "utf8");
    return;
  }
  const { put } = await import("@vercel/blob");
  await put(`solid-one/${filename}`, body, {
    access: "public",
    contentType: "application/json"
  });
}
async function saveUploadedImage(buffer, filename, uploadsDir) {
  if (!useBlobStorage()) {
    mkdirSync(uploadsDir, { recursive: true });
    const dest = path.join(uploadsDir, filename);
    writeFileSync(dest, buffer);
    return `/uploads/${filename}`;
  }
  const { put } = await import("@vercel/blob");
  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
  const blob = await put(`solid-one/uploads/${filename}`, buffer, {
    access: "public",
    contentType
  });
  return blob.url;
}

// server/store-notify-store.js
var FILE = "store-notify.json";
async function readAll() {
  const rows = await readJsonFile(FILE, []);
  if (!Array.isArray(rows))
    return [];
  return rows.filter((row) => row !== null && typeof row === "object" && typeof row.id === "number" && typeof row.email === "string" && (row.platform === "apple" || row.platform === "google") && typeof row.createdAt === "string");
}
async function writeAll(rows) {
  await writeJsonFile(FILE, rows);
}
async function listStoreNotifySignups() {
  return (await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
async function addStoreNotifySignup(email, platform) {
  const rows = await readAll();
  const exists = rows.some((r) => r.email === email && r.platform === platform);
  if (exists)
    return { ok: false, reason: "duplicate" };
  const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const record = {
    id: nextId,
    email,
    platform,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  rows.push(record);
  await writeAll(rows);
  return { ok: true, record };
}
async function deleteStoreNotifySignup(id) {
  const rows = await readAll();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length)
    return false;
  await writeAll(next);
  return true;
}

// server/store-notify-handler.js
var emailSchema = z.string().trim().email().max(320);
var storePlatformSchema = z.enum(["apple", "google"]);
async function handleStoreNotifyPost(body) {
  const parsedEmail = emailSchema.safeParse(body && typeof body === "object" && "email" in body ? body.email : void 0);
  const parsedPlatform = storePlatformSchema.safeParse(body && typeof body === "object" && "platform" in body ? body.platform : void 0);
  if (!parsedEmail.success) {
    return { status: 400, json: { error: "Please enter a valid email address." } };
  }
  if (!parsedPlatform.success) {
    return { status: 400, json: { error: "Invalid store." } };
  }
  const result = await addStoreNotifySignup(parsedEmail.data.toLowerCase(), parsedPlatform.data);
  if (!result.ok) {
    return { status: 409, json: { error: "This email is already on the notify list for this store." } };
  }
  return { status: 200, json: { ok: true, message: "We will notify you when the app is available." } };
}
async function handleStoreNotifyList() {
  return { status: 200, json: { signups: await listStoreNotifySignups() } };
}
async function handleStoreNotifyDelete(id) {
  if (!Number.isInteger(id) || id < 1) {
    return { status: 400, json: { error: "Invalid id." } };
  }
  if (!await deleteStoreNotifySignup(id)) {
    return { status: 404, json: { error: "Not found." } };
  }
  return { status: 200, json: { ok: true } };
}
function isAdminAuthorized(authHeader, adminPassword) {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return token === adminPassword && adminPassword.length > 0;
}

// server/subscribers-handler.js
import { z as z2 } from "zod";

// server/subscribers-store.js
var FILE2 = "subscribers.json";
async function readAll2() {
  const rows = await readJsonFile(FILE2, []);
  if (!Array.isArray(rows))
    return [];
  return rows.filter((row) => row !== null && typeof row === "object" && typeof row.id === "number" && typeof row.email === "string" && typeof row.createdAt === "string");
}
async function writeAll2(rows) {
  await writeJsonFile(FILE2, rows);
}
async function listSubscribers() {
  return (await readAll2()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
async function addSubscriber(email) {
  const rows = await readAll2();
  if (rows.some((r) => r.email === email)) {
    return { ok: false, reason: "duplicate" };
  }
  const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const record = {
    id: nextId,
    email,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  rows.push(record);
  await writeAll2(rows);
  return { ok: true, record };
}
async function deleteSubscriber(id) {
  const rows = await readAll2();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length)
    return false;
  await writeAll2(next);
  return true;
}

// server/subscribers-handler.js
var emailSchema2 = z2.string().trim().email().max(320);
async function handleSubscribePost(body) {
  const parsed = emailSchema2.safeParse(body && typeof body === "object" && "email" in body ? body.email : void 0);
  if (!parsed.success) {
    return { status: 400, json: { error: "Please enter a valid email address." } };
  }
  const result = await addSubscriber(parsed.data.toLowerCase());
  if (!result.ok) {
    return { status: 409, json: { error: "This email is already subscribed." } };
  }
  return { status: 200, json: { ok: true, message: "You are subscribed." } };
}
async function handleSubscribersList() {
  const subscribers = await listSubscribers();
  return {
    status: 200,
    json: {
      subscribers: subscribers.map((row) => ({
        id: row.id,
        email: row.email,
        createdAt: row.createdAt
      }))
    }
  };
}
async function handleSubscriberDelete(id) {
  if (!Number.isInteger(id) || id < 1) {
    return { status: 400, json: { error: "Invalid id." } };
  }
  if (!await deleteSubscriber(id)) {
    return { status: 404, json: { error: "Not found." } };
  }
  return { status: 200, json: { ok: true } };
}

// server/support-handler.js
import { z as z3 } from "zod";

// server/support-store.js
var FILE3 = "support-requests.json";
async function readAll3() {
  const parsed = await readJsonFile(FILE3, []);
  if (!Array.isArray(parsed))
    return [];
  return parsed.filter((row) => row !== null && typeof row === "object" && typeof row.id === "number" && typeof row.name === "string" && typeof row.email === "string" && typeof row.subject === "string" && typeof row.message === "string" && typeof row.createdAt === "string").map((row) => ({
    ...row,
    starred: row.starred === true
  }));
}
async function writeAll3(rows) {
  await writeJsonFile(FILE3, rows);
}
async function listSupportRequests() {
  return (await readAll3()).sort((a, b) => {
    if (a.starred !== b.starred)
      return a.starred ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
async function addSupportRequest(input) {
  const rows = await readAll3();
  const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const record = {
    id: nextId,
    ...input,
    starred: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  rows.push(record);
  await writeAll3(rows);
  return record;
}
async function toggleSupportRequestStar(id) {
  const rows = await readAll3();
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1)
    return null;
  rows[index] = { ...rows[index], starred: !rows[index].starred };
  await writeAll3(rows);
  return rows[index];
}
async function deleteSupportRequest(id) {
  const rows = await readAll3();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length)
    return false;
  await writeAll3(next);
  return true;
}

// server/support-handler.js
var supportBodySchema = z3.object({
  name: z3.string().trim().min(1, "Name is required.").max(120),
  email: z3.string().trim().email("Please enter a valid email address.").max(320),
  subject: z3.string().trim().max(200).optional().default(""),
  message: z3.string().trim().min(1, "Message is required.").max(5e3)
});
function validationError(error) {
  return error.issues[0]?.message ?? "Invalid form data.";
}
async function handleSupportPost(body) {
  const parsed = supportBodySchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError(parsed.error) } };
  }
  const data = parsed.data;
  await addSupportRequest({
    name: data.name,
    email: data.email.toLowerCase(),
    subject: data.subject,
    message: data.message
  });
  return {
    status: 200,
    json: { ok: true, message: "Your message has been sent. We will get back to you soon." }
  };
}
async function handleSupportList() {
  return { status: 200, json: { requests: await listSupportRequests() } };
}
async function handleSupportStarToggle(id) {
  if (!Number.isInteger(id) || id < 1) {
    return { status: 400, json: { error: "Invalid id." } };
  }
  const updated = await toggleSupportRequestStar(id);
  if (!updated) {
    return { status: 404, json: { error: "Not found." } };
  }
  return { status: 200, json: { ok: true, request: updated } };
}
async function handleSupportDelete(id) {
  if (!Number.isInteger(id) || id < 1) {
    return { status: 400, json: { error: "Invalid id." } };
  }
  if (!await deleteSupportRequest(id)) {
    return { status: 404, json: { error: "Not found." } };
  }
  return { status: 200, json: { ok: true } };
}

// server/register-blog-routes.js
import { randomUUID } from "crypto";
import multer from "multer";
import path2 from "path";
import { z as z4 } from "zod";

// server/async-route.js
function asyncRoute(handler2) {
  return (req, res, next) => {
    void handler2(req, res).catch(next);
  };
}

// server/blog-store.js
var FILE4 = "blog-posts.json";
async function readAll4() {
  const rows = await readJsonFile(FILE4, []);
  if (!Array.isArray(rows))
    return [];
  return rows.filter((row) => row !== null && typeof row === "object" && typeof row.id === "number" && typeof row.slug === "string" && typeof row.title === "string" && typeof row.excerpt === "string" && typeof row.body === "string" && typeof row.published === "boolean" && typeof row.createdAt === "string" && typeof row.updatedAt === "string" && (row.coverImage === null || typeof row.coverImage === "string"));
}
async function writeAll4(rows) {
  await writeJsonFile(FILE4, rows);
}
async function listBlogPosts() {
  const rows = await readAll4();
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
async function listPublishedBlogPosts() {
  return (await listBlogPosts()).filter((p) => p.published);
}
async function getBlogPostById(id) {
  return (await readAll4()).find((p) => p.id === id);
}
async function getPublishedBlogPostBySlug(slug) {
  return (await readAll4()).find((p) => p.slug === slug && p.published);
}
async function findBlogPostBySlug(slug) {
  return (await readAll4()).find((p) => p.slug === slug);
}
async function createBlogPost(input) {
  const rows = await readAll4();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  const post = { ...input, id: nextId, createdAt: now, updatedAt: now };
  rows.push(post);
  await writeAll4(rows);
  return post;
}
async function updateBlogPost(id, input) {
  const rows = await readAll4();
  const index = rows.findIndex((p) => p.id === id);
  if (index < 0)
    return void 0;
  const updated = {
    ...rows[index],
    ...input,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  rows[index] = updated;
  await writeAll4(rows);
  return updated;
}
async function deleteBlogPost(id) {
  const rows = await readAll4();
  const next = rows.filter((p) => p.id !== id);
  if (next.length === rows.length)
    return false;
  await writeAll4(next);
  return true;
}

// server/blog-utils.js
function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "post";
}
async function uniqueSlug(base, excludeId) {
  const root = slugify(base);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? root : `${root}-${n}`;
    const existing = await findBlogPostBySlug(candidate);
    if (!existing || excludeId !== void 0 && existing.id === excludeId) {
      return candidate;
    }
    n += 1;
  }
}
function serializePost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverImage: row.coverImage,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

// server/register-blog-routes.js
function htmlHasText(html) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;
}
var postBodySchema = z4.object({
  title: z4.string().trim().min(1).max(200),
  slug: z4.preprocess((val) => {
    if (typeof val !== "string" || !val.trim())
      return void 0;
    return slugify(val);
  }, z4.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional()),
  excerpt: z4.string().trim().min(1).max(500),
  body: z4.string().min(1).max(5e4).refine(htmlHasText, { message: "Body cannot be empty" }),
  coverImage: z4.union([z4.string().trim().max(500), z4.null()]).optional(),
  published: z4.boolean().optional()
});
function postValidationError(error) {
  return error.issues.map((i) => i.message).join(" ") || "Invalid post data.";
}
function registerBlogRoutes(app2, { requireAdmin, uploadsDir }) {
  const upload = multer({
    storage: useBlobStorage() ? multer.memoryStorage() : multer.diskStorage({
      destination: uploadsDir,
      filename: (_req, file, cb) => {
        const ext = path2.extname(file.originalname).toLowerCase() || ".jpg";
        cb(null, `${Date.now()}-${randomUUID()}${ext}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image files are allowed."));
        return;
      }
      cb(null, true);
    }
  });
  app2.get("/api/blog", asyncRoute(async (_req, res) => {
    res.json({ posts: (await listPublishedBlogPosts()).map(serializePost) });
  }));
  app2.get("/api/blog/:slug", asyncRoute(async (req, res) => {
    const slug = typeof req.params.slug === "string" ? req.params.slug : "";
    const row = await getPublishedBlogPostBySlug(slug);
    if (!row) {
      res.status(404).json({ error: "Post not found." });
      return;
    }
    res.json({ post: serializePost(row) });
  }));
  app2.get("/api/admin/blog", requireAdmin, asyncRoute(async (_req, res) => {
    res.json({ posts: (await listBlogPosts()).map(serializePost) });
  }));
  app2.get("/api/admin/blog/:id", requireAdmin, asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid id." });
      return;
    }
    const row = await getBlogPostById(id);
    if (!row) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    res.json({ post: serializePost(row) });
  }));
  app2.post("/api/admin/blog/upload", requireAdmin, (req, res) => {
    upload.single("image")(req, res, (err) => {
      void (async () => {
        if (err) {
          const message = err instanceof Error ? err.message : "Upload failed.";
          res.status(400).json({ error: message });
          return;
        }
        if (!req.file) {
          res.status(400).json({ error: "No image provided." });
          return;
        }
        const ext = path2.extname(req.file.originalname).toLowerCase() || ".jpg";
        const filename = `${Date.now()}-${randomUUID()}${ext}`;
        const url = useBlobStorage() ? await saveUploadedImage(req.file.buffer, filename, uploadsDir) : `/uploads/${req.file.filename}`;
        res.json({ ok: true, url });
      })().catch((e) => {
        res.status(500).json({ error: e instanceof Error ? e.message : "Upload failed." });
      });
    });
  });
  app2.post("/api/admin/blog", requireAdmin, asyncRoute(async (req, res) => {
    const parsed = postBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: postValidationError(parsed.error) });
      return;
    }
    const data = parsed.data;
    const slug = data.slug ?? await uniqueSlug(data.title);
    const inserted = await createBlogPost({
      slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      coverImage: data.coverImage ?? null,
      published: data.published ?? false
    });
    res.status(201).json({ post: serializePost(inserted) });
  }));
  app2.put("/api/admin/blog/:id", requireAdmin, asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid id." });
      return;
    }
    const existing = await getBlogPostById(id);
    if (!existing) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    const parsed = postBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: postValidationError(parsed.error) });
      return;
    }
    const data = parsed.data;
    const slug = data.slug ?? existing.slug;
    const other = await findBlogPostBySlug(slug);
    if (other && other.id !== id) {
      res.status(409).json({ error: "Slug already exists." });
      return;
    }
    const updated = await updateBlogPost(id, {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      coverImage: data.coverImage ?? null,
      published: data.published ?? existing.published
    });
    res.json({ post: serializePost(updated) });
  }));
  app2.delete("/api/admin/blog/:id", requireAdmin, asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid id." });
      return;
    }
    if (!await deleteBlogPost(id)) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    res.json({ ok: true });
  }));
}

// server/app.js
var __dirname2 = path3.dirname(fileURLToPath2(import.meta.url));
function createApp() {
  const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD ?? "solidone-admin").trim();
  const dataDir2 = path3.resolve(__dirname2, "..", "data");
  const uploadsDir = path3.join(dataDir2, "uploads");
  if (!useBlobStorage() && !process.env.VERCEL) {
    try {
      mkdirSync2(uploadsDir, { recursive: true });
    } catch {
    }
  }
  function requireAdmin(req, res, next) {
    if (!isAdminAuthorized(req.headers.authorization, ADMIN_PASSWORD)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  }
  const app2 = express();
  app2.use(cors({ origin: true }));
  app2.use(express.json({ limit: "2mb" }));
  app2.post("/api/subscribe", asyncRoute(async (req, res) => {
    const { status, json } = await handleSubscribePost(req.body);
    res.status(status).json(json);
  }));
  app2.get("/api/admin/subscribers", requireAdmin, asyncRoute(async (_req, res) => {
    const { status, json } = await handleSubscribersList();
    res.status(status).json(json);
  }));
  app2.delete("/api/admin/subscribers/:id", requireAdmin, asyncRoute(async (req, res) => {
    const { status, json } = await handleSubscriberDelete(Number(req.params.id));
    res.status(status).json(json);
  }));
  app2.post("/api/store-notify", asyncRoute(async (req, res) => {
    const { status, json } = await handleStoreNotifyPost(req.body);
    res.status(status).json(json);
  }));
  app2.post("/api/admin/login", (req, res) => {
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Invalid password." });
      return;
    }
    res.json({ ok: true, token: ADMIN_PASSWORD });
  });
  app2.get("/api/admin/store-notify", requireAdmin, asyncRoute(async (_req, res) => {
    const { status, json } = await handleStoreNotifyList();
    res.status(status).json(json);
  }));
  app2.delete("/api/admin/store-notify/:id", requireAdmin, asyncRoute(async (req, res) => {
    const { status, json } = await handleStoreNotifyDelete(Number(req.params.id));
    res.status(status).json(json);
  }));
  app2.post("/api/support", asyncRoute(async (req, res) => {
    const { status, json } = await handleSupportPost(req.body);
    res.status(status).json(json);
  }));
  app2.get("/api/admin/support", requireAdmin, asyncRoute(async (_req, res) => {
    const { status, json } = await handleSupportList();
    res.status(status).json(json);
  }));
  app2.patch("/api/admin/support/:id/star", requireAdmin, asyncRoute(async (req, res) => {
    const { status, json } = await handleSupportStarToggle(Number(req.params.id));
    res.status(status).json(json);
  }));
  app2.delete("/api/admin/support/:id", requireAdmin, asyncRoute(async (req, res) => {
    const { status, json } = await handleSupportDelete(Number(req.params.id));
    res.status(status).json(json);
  }));
  if (!useBlobStorage()) {
    app2.use("/uploads", express.static(uploadsDir));
  }
  registerBlogRoutes(app2, { requireAdmin, uploadsDir });
  return app2;
}

// api/src/index.ts
var app = createApp();
function handler(req, res) {
  app(req, res);
}
export {
  handler as default
};
