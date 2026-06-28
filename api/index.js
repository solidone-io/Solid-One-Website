// server/app.ts
import express from "express";
import cors from "cors";
import path4 from "path";
import { mkdirSync as mkdirSync2 } from "fs";
import { fileURLToPath as fileURLToPath3 } from "url";

// server/store-notify-handler.ts
import { z } from "zod";

// server/persistent-json.ts
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// server/runtime.ts
function isVercelRuntime() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

// server/persistent-json.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var dataDir = path.resolve(__dirname, "..", "data");
function useBlobStorage() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  return isVercelRuntime() && Boolean(process.env.BLOB_STORE_ID);
}
function blobAccess() {
  const mode = process.env.BLOB_ACCESS?.trim().toLowerCase();
  return mode === "public" ? "public" : "private";
}
function ensureLocalDataDir() {
  if (useBlobStorage() || isVercelRuntime()) return;
  try {
    mkdirSync(dataDir, { recursive: true });
  } catch {
  }
}
async function readBlobJson(filename, fallback) {
  const { get, list } = await import("@vercel/blob");
  const blobPath = `solid-one/${filename}`;
  const access = blobAccess();
  try {
    const result = await get(blobPath, { access });
    if (result.statusCode === 200 && result.stream) {
      const text = await new Response(result.stream).text();
      return JSON.parse(text);
    }
  } catch {
  }
  try {
    const result = await list({ prefix: blobPath, limit: 20 });
    const exact = result.blobs.find((b) => b.pathname === blobPath);
    const blob = exact ?? result.blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
    if (!blob) return fallback;
    const blobResult = await get(blob.pathname, { access });
    if (blobResult.statusCode !== 200 || !blobResult.stream) return fallback;
    const text = await new Response(blobResult.stream).text();
    return JSON.parse(text);
  } catch {
    return fallback;
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
  return readBlobJson(filename, fallback);
}
async function writeJsonFile(filename, data) {
  const body = JSON.stringify(data, null, 2);
  if (!useBlobStorage()) {
    if (isVercelRuntime()) {
      throw new Error("Blob storage is required on Vercel to save website data.");
    }
    ensureLocalDataDir();
    writeFileSync(path.join(dataDir, filename), body, "utf8");
    return;
  }
  const { put } = await import("@vercel/blob");
  await put(`solid-one/${filename}`, body, {
    access: blobAccess(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true
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
    access: blobAccess(),
    contentType
  });
  return blob.url;
}

// server/store-notify-store.ts
var FILE = "store-notify.json";
async function readAll() {
  const rows = await readJsonFile(FILE, []);
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) => row !== null && typeof row === "object" && typeof row.id === "number" && typeof row.email === "string" && (row.platform === "apple" || row.platform === "google") && typeof row.createdAt === "string"
  );
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
  if (exists) return { ok: false, reason: "duplicate" };
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
  if (next.length === rows.length) return false;
  await writeAll(next);
  return true;
}

// server/store-notify-handler.ts
var emailSchema = z.string().trim().email().max(320);
var storePlatformSchema = z.enum(["apple", "google"]);
async function handleStoreNotifyPost(body) {
  const parsedEmail = emailSchema.safeParse(
    body && typeof body === "object" && "email" in body ? body.email : void 0
  );
  const parsedPlatform = storePlatformSchema.safeParse(
    body && typeof body === "object" && "platform" in body ? body.platform : void 0
  );
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

// server/subscribers-handler.ts
import { z as z2 } from "zod";

// server/subscribers-store.ts
var FILE2 = "subscribers.json";
async function readAll2() {
  const rows = await readJsonFile(FILE2, []);
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) => row !== null && typeof row === "object" && typeof row.id === "number" && typeof row.email === "string" && typeof row.createdAt === "string"
  );
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
  if (next.length === rows.length) return false;
  await writeAll2(next);
  return true;
}

// server/subscribers-handler.ts
var emailSchema2 = z2.string().trim().email().max(320);
async function handleSubscribePost(body) {
  const parsed = emailSchema2.safeParse(
    body && typeof body === "object" && "email" in body ? body.email : void 0
  );
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

// server/support-handler.ts
import { z as z3 } from "zod";

// server/support-store.ts
var FILE3 = "support-requests.json";
async function readAll3() {
  const parsed = await readJsonFile(FILE3, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (row) => row !== null && typeof row === "object" && typeof row.id === "number" && typeof row.name === "string" && typeof row.email === "string" && typeof row.subject === "string" && typeof row.message === "string" && typeof row.createdAt === "string"
  ).map((row) => ({
    ...row,
    starred: row.starred === true
  }));
}
async function writeAll3(rows) {
  await writeJsonFile(FILE3, rows);
}
async function listSupportRequests() {
  return (await readAll3()).sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
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
  if (index === -1) return null;
  rows[index] = { ...rows[index], starred: !rows[index].starred };
  await writeAll3(rows);
  return rows[index];
}
async function deleteSupportRequest(id) {
  const rows = await readAll3();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeAll3(next);
  return true;
}

// server/support-handler.ts
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

// server/register-blog-routes.ts
import { randomUUID } from "crypto";
import multer from "multer";
import path2 from "path";
import { z as z4 } from "zod";

// server/async-route.ts
function asyncRoute(handler2) {
  return (req, res, next) => {
    void handler2(req, res).catch((err) => next(err));
  };
}

// server/blog-store.ts
var FILE4 = "blog-posts.json";
async function readAll4() {
  const rows = await readJsonFile(FILE4, []);
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) => row !== null && typeof row === "object" && typeof row.id === "number" && typeof row.slug === "string" && typeof row.title === "string" && typeof row.excerpt === "string" && typeof row.body === "string" && typeof row.published === "boolean" && typeof row.createdAt === "string" && typeof row.updatedAt === "string" && (row.coverImage === null || typeof row.coverImage === "string")
  );
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
  if (index < 0) return void 0;
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
  if (next.length === rows.length) return false;
  await writeAll4(next);
  return true;
}

// server/blog-utils.ts
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

// server/register-blog-routes.ts
function htmlHasText(html) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;
}
var postBodySchema = z4.object({
  title: z4.string().trim().min(1).max(200),
  slug: z4.preprocess(
    (val) => {
      if (typeof val !== "string" || !val.trim()) return void 0;
      return slugify(val);
    },
    z4.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional()
  ),
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
    storage: useBlobStorage() || isVercelRuntime() ? multer.memoryStorage() : multer.diskStorage({
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
  app2.get(
    "/api/blog",
    asyncRoute(async (_req, res) => {
      res.json({ posts: (await listPublishedBlogPosts()).map(serializePost) });
    })
  );
  app2.get(
    "/api/blog/:slug",
    asyncRoute(async (req, res) => {
      const slug = typeof req.params.slug === "string" ? req.params.slug : "";
      const row = await getPublishedBlogPostBySlug(slug);
      if (!row) {
        res.status(404).json({ error: "Post not found." });
        return;
      }
      res.json({ post: serializePost(row) });
    })
  );
  app2.get(
    "/api/admin/blog",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      res.json({ posts: (await listBlogPosts()).map(serializePost) });
    })
  );
  app2.get(
    "/api/admin/blog/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
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
    })
  );
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
  app2.post(
    "/api/admin/blog",
    requireAdmin,
    asyncRoute(async (req, res) => {
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
    })
  );
  app2.put(
    "/api/admin/blog/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
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
    })
  );
  app2.delete(
    "/api/admin/blog/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
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
    })
  );
}

// server/download-handler.ts
import { z as z5 } from "zod";

// server/google-fetch.ts
import https from "node:https";
function devInsecureTls() {
  return process.env.NODE_ENV !== "production" && process.env.DOWNLOAD_DEV_INSECURE_TLS?.trim() === "1";
}
function httpsGetInsecure(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get(
      {
        hostname: u.hostname,
        path: `${u.pathname}${u.search}`,
        rejectUnauthorized: false
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode ?? 500,
              headers: {
                "content-type": String(res.headers["content-type"] ?? "application/json")
              }
            })
          );
        });
      }
    ).on("error", reject);
  });
}
function fetchGoogle(url) {
  if (devInsecureTls()) return httpsGetInsecure(url);
  return fetch(url);
}
function googleFetchSslHint(cause) {
  const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";
  if (code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" || code === "CERT_HAS_EXPIRED") {
    return "Local SSL inspection is blocking Google. Add DOWNLOAD_DEV_INSECURE_TLS=1 to .env (dev only), restart pnpm run dev, or fix antivirus HTTPS scanning.";
  }
  return null;
}

// server/download-jwt.ts
import { createHmac, timingSafeEqual } from "crypto";
function b64url(data) {
  return Buffer.from(data, "utf8").toString("base64url");
}
function fromB64url(data) {
  return Buffer.from(data, "base64url").toString("utf8");
}
function signDownloadSession(user, secret, days = 30) {
  const payload = {
    ...user,
    exp: Math.floor(Date.now() / 1e3) + days * 86400
  };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}
function verifyDownloadSession(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  let payload;
  try {
    payload = JSON.parse(fromB64url(body));
  } catch {
    return null;
  }
  if (!payload.sub || !payload.name) return null;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) return null;
  return {
    sub: payload.sub,
    name: payload.name,
    picture: payload.picture ?? "",
    email: payload.email ?? ""
  };
}

// server/download-store.ts
var FILE5 = "download-store.json";
var EMPTY = {
  nextReviewId: 1,
  installs: [],
  reviews: []
};
function normalizeInstall(raw) {
  if (typeof raw === "string" && raw.trim()) {
    return {
      googleSub: raw.trim(),
      email: "",
      name: "Unknown user",
      picture: "",
      installedAt: ""
    };
  }
  if (!raw || typeof raw !== "object") return null;
  const row = raw;
  if (typeof row.googleSub !== "string" || !row.googleSub.trim()) return null;
  return {
    googleSub: row.googleSub.trim(),
    email: typeof row.email === "string" ? row.email : "",
    name: typeof row.name === "string" && row.name.trim() ? row.name : "Unknown user",
    picture: typeof row.picture === "string" ? row.picture : "",
    installedAt: typeof row.installedAt === "string" ? row.installedAt : ""
  };
}
function isReview(row) {
  if (!row || typeof row !== "object") return false;
  const r = row;
  return typeof r.id === "number" && typeof r.googleSub === "string" && typeof r.userName === "string" && typeof r.stars === "number" && typeof r.createdAt === "string";
}
function normalizeReview(row) {
  return {
    ...row,
    userEmail: typeof row.userEmail === "string" ? row.userEmail : "",
    userPicture: typeof row.userPicture === "string" ? row.userPicture : "",
    helpfulYes: typeof row.helpfulYes === "number" ? row.helpfulYes : 0,
    helpfulNo: typeof row.helpfulNo === "number" ? row.helpfulNo : 0,
    helpfulVoters: Array.isArray(row.helpfulVoters) ? row.helpfulVoters.filter((s) => typeof s === "string") : [],
    flagged: Boolean(row.flagged),
    flagReason: typeof row.flagReason === "string" ? row.flagReason : null,
    adminReply: row.adminReply && typeof row.adminReply === "object" && typeof row.adminReply.text === "string" && typeof row.adminReply.repliedAt === "string" ? { text: row.adminReply.text, repliedAt: row.adminReply.repliedAt } : null
  };
}
async function readStore() {
  const raw = await readJsonFile(FILE5, EMPTY);
  if (!raw || typeof raw !== "object") return { ...EMPTY };
  return {
    nextReviewId: typeof raw.nextReviewId === "number" ? raw.nextReviewId : 1,
    installs: enrichInstallsFromReviews(
      Array.isArray(raw.installs) ? raw.installs.map(normalizeInstall).filter((r) => r !== null) : [],
      Array.isArray(raw.reviews) ? raw.reviews.filter(isReview).map(normalizeReview) : []
    ),
    reviews: Array.isArray(raw.reviews) ? raw.reviews.filter(isReview).map(normalizeReview) : []
  };
}
function enrichInstallsFromReviews(installs, reviews) {
  return installs.map((inst) => {
    const review = reviews.find((r) => r.googleSub === inst.googleSub);
    return {
      ...inst,
      email: inst.email || review?.userEmail || "",
      name: inst.name === "Unknown user" && review?.userName ? review.userName : inst.name,
      picture: inst.picture || review?.userPicture || ""
    };
  });
}
async function writeStore(data) {
  await writeJsonFile(FILE5, data);
}
function hasFeedbackText(text) {
  return text.trim().length > 0;
}
function sortReviewsForViewer(rows, viewerGoogleSub) {
  const sorted = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!viewerGoogleSub) return sorted;
  return sorted.sort((a, b) => {
    const aOwn = a.googleSub === viewerGoogleSub ? 1 : 0;
    const bOwn = b.googleSub === viewerGoogleSub ? 1 : 0;
    if (aOwn !== bOwn) return bOwn - aOwn;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
function computeStats(reviews, installCount) {
  const visible = reviews.filter((r) => !r.flagged);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of visible) {
    const s = Math.min(5, Math.max(1, Math.round(r.stars)));
    distribution[s]++;
  }
  const reviewCount = visible.length;
  const averageRating = reviewCount === 0 ? 0 : visible.reduce((sum, r) => sum + r.stars, 0) / reviewCount;
  return {
    downloadCount: installCount,
    reviewCount,
    averageRating: Math.round(averageRating * 10) / 10,
    distribution
  };
}
async function getDownloadStats() {
  const store = await readStore();
  return computeStats(store.reviews, store.installs.length);
}
async function listInstalls() {
  const store = await readStore();
  return [...store.installs].sort((a, b) => {
    const ta = a.installedAt ? new Date(a.installedAt).getTime() : 0;
    const tb = b.installedAt ? new Date(b.installedAt).getTime() : 0;
    return tb - ta;
  });
}
async function recordInstall(user, version) {
  const store = await readStore();
  const idx = store.installs.findIndex((i) => i.googleSub === user.sub);
  const alreadyInstalled = idx >= 0;
  if (!alreadyInstalled) {
    store.installs.unshift({
      googleSub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      installedAt: (/* @__PURE__ */ new Date()).toISOString(),
      versionCode: version?.versionCode,
      versionName: version?.versionName
    });
    await writeStore(store);
  } else {
    const row = store.installs[idx];
    if (user.email && !row.email) row.email = user.email;
    if (user.name && row.name === "Unknown user") row.name = user.name;
    if (user.picture && !row.picture) row.picture = user.picture;
    if (version?.versionCode) row.versionCode = version.versionCode;
    if (version?.versionName) row.versionName = version.versionName;
    if (!row.installedAt) row.installedAt = (/* @__PURE__ */ new Date()).toISOString();
    await writeStore(store);
  }
  return {
    alreadyInstalled,
    stats: computeStats(store.reviews, store.installs.length)
  };
}
async function getReviewByUser(googleSub) {
  const store = await readStore();
  return store.reviews.find((r) => r.googleSub === googleSub && !r.flagged) ?? null;
}
async function addReview(input) {
  const store = await readStore();
  const existing = store.reviews.find((r) => r.googleSub === input.googleSub && !r.flagged);
  if (existing) {
    return { ok: false, error: "You have already reviewed this app." };
  }
  const review = {
    id: store.nextReviewId++,
    googleSub: input.googleSub,
    userEmail: input.userEmail,
    userName: input.userName,
    userPicture: input.userPicture,
    stars: input.stars,
    text: input.text.trim(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    helpfulYes: 0,
    helpfulNo: 0,
    helpfulVoters: [],
    flagged: false,
    flagReason: null,
    adminReply: null
  };
  store.reviews.unshift(review);
  await writeStore(store);
  return { ok: true, review };
}
async function listReviews(options) {
  const store = await readStore();
  let rows = store.reviews.filter((r) => !r.flagged && hasFeedbackText(r.text));
  const q = options.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (r) => r.userName.toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q) || r.text.toLowerCase().includes(q)
    );
  }
  if (options.filter === "positive") rows = rows.filter((r) => r.stars >= 4);
  else if (options.filter === "negative") rows = rows.filter((r) => r.stars <= 2);
  else if (options.filter === "neutral") rows = rows.filter((r) => r.stars === 3);
  rows = sortReviewsForViewer(rows, options.viewerGoogleSub);
  const total = rows.length;
  const reviews = rows.slice(options.offset, options.offset + options.limit);
  return { reviews, total };
}
async function listAllReviewsAdmin() {
  const store = await readStore();
  return [...store.reviews].filter((r) => !r.flagged).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
async function setAdminReviewReply(reviewId, text) {
  const store = await readStore();
  const review = store.reviews.find((r) => r.id === reviewId && !r.flagged);
  if (!review) return { ok: false, error: "Review not found." };
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Reply cannot be empty." };
  review.adminReply = { text: trimmed.slice(0, 1e3), repliedAt: (/* @__PURE__ */ new Date()).toISOString() };
  await writeStore(store);
  return { ok: true, review };
}
async function clearAdminReviewReply(reviewId) {
  const store = await readStore();
  const review = store.reviews.find((r) => r.id === reviewId);
  if (!review) return { ok: false, error: "Review not found." };
  review.adminReply = null;
  await writeStore(store);
  return { ok: true, review };
}
async function deleteReviewByUser(googleSub) {
  const store = await readStore();
  const idx = store.reviews.findIndex((r) => r.googleSub === googleSub && !r.flagged);
  if (idx < 0) return { ok: false, error: "Review not found." };
  store.reviews.splice(idx, 1);
  await writeStore(store);
  return { ok: true, stats: computeStats(store.reviews, store.installs.length) };
}
async function setReviewHelpful(reviewId, googleSub, helpful) {
  const store = await readStore();
  const review = store.reviews.find((r) => r.id === reviewId && !r.flagged);
  if (!review) return { ok: false, error: "Review not found." };
  if (review.helpfulVoters.includes(googleSub)) {
    return { ok: false, error: "You already voted on this review." };
  }
  review.helpfulVoters.push(googleSub);
  if (helpful) review.helpfulYes++;
  else review.helpfulNo++;
  await writeStore(store);
  return { ok: true };
}
async function flagReview(reviewId, reason) {
  const store = await readStore();
  const review = store.reviews.find((r) => r.id === reviewId);
  if (!review) return { ok: false };
  review.flagged = true;
  review.flagReason = reason;
  await writeStore(store);
  return { ok: true };
}
function serializeReview(r) {
  return {
    id: r.id,
    userName: r.userName,
    userPicture: r.userPicture,
    stars: r.stars,
    text: r.text,
    createdAt: r.createdAt,
    helpfulYes: r.helpfulYes,
    helpfulNo: r.helpfulNo,
    adminReply: r.adminReply
  };
}
function serializeInstall(r) {
  return {
    googleSub: r.googleSub,
    email: r.email,
    name: r.name,
    picture: r.picture,
    installedAt: r.installedAt,
    versionCode: r.versionCode,
    versionName: r.versionName
  };
}
function serializeReviewAdmin(r) {
  return {
    id: r.id,
    googleSub: r.googleSub,
    userEmail: r.userEmail,
    userName: r.userName,
    userPicture: r.userPicture,
    stars: r.stars,
    text: r.text,
    createdAt: r.createdAt,
    helpfulYes: r.helpfulYes,
    helpfulNo: r.helpfulNo,
    adminReply: r.adminReply
  };
}

// server/apk-release.ts
import { createHash } from "crypto";
import { createReadStream, existsSync, readFileSync as readFileSync2, statSync } from "fs";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path3.dirname(fileURLToPath2(import.meta.url));
var APK_PACKAGE = "io.solidone.app";
var APK_VERSION_CODE = Number(process.env.APK_VERSION_CODE ?? "5") || 5;
var APK_VERSION_NAME = (process.env.APK_VERSION_NAME ?? "1.0.7").trim() || "1.0.7";
var APK_FILE_NAME = "solid-one.apk";
var APK_PUBLIC_PATH = `/releases/${APK_FILE_NAME}`;
var sha256Cache = null;
function resolveApkPath() {
  const fromEnv = process.env.APK_PATH?.trim();
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  return path3.resolve(__dirname2, "..", "public", "releases", APK_FILE_NAME);
}
function sha256OfFile(filePath) {
  if (sha256Cache) return sha256Cache;
  sha256Cache = createHash("sha256").update(readFileSync2(filePath)).digest("hex");
  return sha256Cache;
}
async function getApkReleaseInfo() {
  const filePath = resolveApkPath();
  if (!existsSync(filePath)) return null;
  const stat = statSync(filePath);
  return {
    packageName: APK_PACKAGE,
    versionCode: APK_VERSION_CODE,
    versionName: APK_VERSION_NAME,
    fileName: APK_FILE_NAME,
    size: stat.size,
    downloadPath: APK_PUBLIC_PATH
  };
}
function streamApkFile(res) {
  const filePath = resolveApkPath();
  if (!existsSync(filePath)) {
    res.status(404).json({ error: "APK not found on server." });
    return;
  }
  const stat = statSync(filePath);
  const sha256 = sha256OfFile(filePath);
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader("Content-Disposition", `attachment; filename="${APK_FILE_NAME}"`);
  res.setHeader("Content-Length", String(stat.size));
  res.setHeader("X-APK-Version-Code", String(APK_VERSION_CODE));
  res.setHeader("X-APK-Version-Name", APK_VERSION_NAME);
  res.setHeader("X-APK-SHA256", sha256);
  createReadStream(filePath).pipe(res);
}

// server/download-handler.ts
function jwtSecret() {
  return process.env.DOWNLOAD_JWT_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim() || "solidone-download-dev-secret";
}
function googleClientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() || process.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
}
function sessionFromAuthHeader(authHeader) {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;
  return verifyDownloadSession(token, jwtSecret());
}
function validationError2(error) {
  return error.issues[0]?.message ?? "Invalid request.";
}
function audienceMatches(payload, clientId) {
  if (!clientId) return false;
  if (payload.azp === clientId) return true;
  if (payload.aud === clientId) return true;
  if (payload.aud?.split(",").map((s) => s.trim()).includes(clientId)) return true;
  return false;
}
function decodeGoogleIdTokenPayload(idToken) {
  try {
    const part = idToken.split(".")[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
async function verifyGoogleIdToken(idToken) {
  const clientId = googleClientId();
  if (!clientId) {
    return { ok: false, error: "GOOGLE_CLIENT_ID is missing in server .env \u2014 restart pnpm run dev." };
  }
  const endpoints = [
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  ];
  let lastError = "Google could not verify the sign-in token.";
  for (const url of endpoints) {
    let res;
    try {
      res = await fetchGoogle(url);
    } catch (err) {
      const sslHint = googleFetchSslHint(err instanceof Error ? err.cause : err);
      return {
        ok: false,
        error: sslHint ?? "Server cannot reach Google. Check your internet connection and try again."
      };
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      lastError = data.error_description || data.error || `Google rejected the token (${res.status}). Sign in again from http://localhost:5173/download`;
      continue;
    }
    if (!data.sub) {
      lastError = "Google token is missing user id.";
      continue;
    }
    if (!audienceMatches(data, clientId)) {
      return {
        ok: false,
        error: `Client ID mismatch. Console has ${clientId.slice(0, 12)}\u2026 but token aud=${data.aud ?? "?"} azp=${data.azp ?? "?"}. Check .env matches Google Console exactly.`
      };
    }
    const claims = decodeGoogleIdTokenPayload(idToken);
    return {
      ok: true,
      user: {
        sub: data.sub,
        name: data.name ?? claims?.name ?? "User",
        picture: data.picture ?? claims?.picture ?? "",
        email: data.email ?? claims?.email ?? ""
      }
    };
  }
  return { ok: false, error: lastError };
}
async function handleDownloadGoogleAuth(body) {
  const parsed = z5.object({ credential: z5.string().min(10) }).safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError2(parsed.error) } };
  }
  const verified = await verifyGoogleIdToken(parsed.data.credential);
  if (!verified.ok) {
    return { status: 401, json: { error: verified.error } };
  }
  const token = signDownloadSession(verified.user, jwtSecret());
  return { status: 200, json: { ok: true, token, user: verified.user } };
}
async function handleDownloadStatsGet() {
  const stats = await getDownloadStats();
  return { status: 200, json: { ok: true, stats } };
}
async function handleDownloadInstall(session, body) {
  if (!session) return { status: 401, json: { error: "Sign in required." } };
  const parsed = z5.object({
    versionCode: z5.number().int().positive().optional(),
    versionName: z5.string().max(32).optional()
  }).safeParse(body ?? {});
  const version = parsed.success ? parsed.data : void 0;
  try {
    const result = await recordInstall(session, version);
    return {
      status: 200,
      json: { ok: true, alreadyInstalled: result.alreadyInstalled, stats: result.stats }
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save install.";
    console.error("recordInstall failed:", err);
    return {
      status: 503,
      json: {
        error: message.includes("Blob") || message.includes("BLOB") ? "Server storage error. Try again in a moment." : message
      }
    };
  }
}
async function handleDownloadReleaseGet() {
  const release = await getApkReleaseInfo();
  if (!release) {
    return { status: 404, json: { error: "APK release not configured on server." } };
  }
  return { status: 200, json: { ok: true, release } };
}
function handleDownloadApkGet(session, res) {
  if (!session) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }
  streamApkFile(res);
}
async function handleDownloadMyReviewGet(session) {
  if (!session) return { status: 401, json: { error: "Sign in required." } };
  const review = await getReviewByUser(session.sub);
  return {
    status: 200,
    json: { ok: true, review: review ? serializeReview(review) : null }
  };
}
async function handleDownloadMyReviewDelete(session) {
  if (!session) return { status: 401, json: { error: "Sign in required." } };
  try {
    const result = await deleteReviewByUser(session.sub);
    if (!result.ok) {
      return { status: 404, json: { error: result.error } };
    }
    return { status: 200, json: { ok: true, stats: result.stats } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete review.";
    console.error("deleteReviewByUser failed:", err);
    return {
      status: 503,
      json: {
        error: message.includes("Blob") || message.includes("BLOB") ? "Server storage error. Try again in a moment." : message
      }
    };
  }
}
async function handleDownloadReviewsGet(query, session = null) {
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 5));
  const offset = Math.max(0, Number(query.offset) || 0);
  const filterRaw = typeof query.filter === "string" ? query.filter : "all";
  const filter = filterRaw === "positive" || filterRaw === "negative" || filterRaw === "neutral" ? filterRaw : "all";
  const search = typeof query.search === "string" ? query.search : void 0;
  const { reviews, total } = await listReviews({
    limit,
    offset,
    filter,
    search,
    viewerGoogleSub: session?.sub
  });
  const stats = await getDownloadStats();
  return {
    status: 200,
    json: {
      ok: true,
      reviews: reviews.map(serializeReview),
      total,
      stats
    }
  };
}
async function handleDownloadReviewPost(session, body) {
  if (!session) return { status: 401, json: { error: "Sign in required." } };
  const parsed = z5.object({
    stars: z5.number().int().min(1).max(5),
    text: z5.string().trim().min(1, "Feedback text is required.").max(500)
  }).safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError2(parsed.error) } };
  }
  try {
    const result = await addReview({
      googleSub: session.sub,
      userEmail: session.email,
      userName: session.name,
      userPicture: session.picture,
      stars: parsed.data.stars,
      text: parsed.data.text
    });
    if (!result.ok) {
      return { status: 409, json: { error: "error" in result ? result.error : "Review failed." } };
    }
    const stats = await getDownloadStats();
    return {
      status: 200,
      json: { ok: true, review: serializeReview(result.review), stats }
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save review.";
    console.error("addReview failed:", err);
    return {
      status: 503,
      json: {
        error: message.includes("Blob") || message.includes("BLOB") ? "Server storage error. Try again in a moment." : message
      }
    };
  }
}
async function handleDownloadReviewHelpful(session, reviewId, body) {
  if (!session) return { status: 401, json: { error: "Sign in required." } };
  const parsed = z5.object({ helpful: z5.boolean() }).safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError2(parsed.error) } };
  }
  const result = await setReviewHelpful(reviewId, session.sub, parsed.data.helpful);
  if (!result.ok) {
    return { status: 400, json: { error: result.error ?? "Could not record vote." } };
  }
  return { status: 200, json: { ok: true } };
}
async function handleDownloadReviewFlag(reviewId, body) {
  const parsed = z5.object({ reason: z5.enum(["spam", "inappropriate"]) }).safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError2(parsed.error) } };
  }
  await flagReview(reviewId, parsed.data.reason);
  const stats = await getDownloadStats();
  return { status: 200, json: { ok: true, stats } };
}
async function handleAdminInstallsList() {
  const installs = await listInstalls();
  const stats = await getDownloadStats();
  return {
    status: 200,
    json: { ok: true, installs: installs.map(serializeInstall), stats }
  };
}
async function handleAdminReviewsList() {
  const reviews = await listAllReviewsAdmin();
  const stats = await getDownloadStats();
  return {
    status: 200,
    json: { ok: true, reviews: reviews.map(serializeReviewAdmin), stats }
  };
}
async function handleAdminReviewReply(reviewId, body) {
  const parsed = z5.object({ text: z5.string().max(1e3) }).safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError2(parsed.error) } };
  }
  const result = await setAdminReviewReply(reviewId, parsed.data.text);
  if (!result.ok) {
    return { status: 400, json: { error: result.error } };
  }
  return { status: 200, json: { ok: true, review: serializeReviewAdmin(result.review) } };
}
async function handleAdminReviewReplyDelete(reviewId) {
  const result = await clearAdminReviewReply(reviewId);
  if (!result.ok) {
    return { status: 404, json: { error: result.error } };
  }
  return { status: 200, json: { ok: true, review: serializeReviewAdmin(result.review) } };
}

// server/register-download-routes.ts
function registerDownloadRoutes(app2) {
  app2.get(
    "/api/download/stats",
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleDownloadStatsGet();
      res.status(status).json(json);
    })
  );
  app2.get(
    "/api/download/my-review",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadMyReviewGet(sessionFromAuthHeader(req.headers.authorization));
      res.status(status).json(json);
    })
  );
  app2.delete(
    "/api/download/my-review",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadMyReviewDelete(sessionFromAuthHeader(req.headers.authorization));
      res.status(status).json(json);
    })
  );
  app2.get(
    "/api/download/reviews",
    asyncRoute(async (req, res) => {
      const query = req.query;
      const { status, json } = await handleDownloadReviewsGet(
        query,
        sessionFromAuthHeader(req.headers.authorization)
      );
      res.status(status).json(json);
    })
  );
  app2.post(
    "/api/download/auth/google",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadGoogleAuth(req.body);
      res.status(status).json(json);
    })
  );
  app2.get(
    "/api/download/release",
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleDownloadReleaseGet();
      res.status(status).json(json);
    })
  );
  app2.get(
    "/api/download/apk",
    asyncRoute(async (req, res) => {
      handleDownloadApkGet(sessionFromAuthHeader(req.headers.authorization), res);
    })
  );
  app2.post(
    "/api/download/install",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadInstall(
        sessionFromAuthHeader(req.headers.authorization),
        req.body
      );
      res.status(status).json(json);
    })
  );
  app2.post(
    "/api/download/reviews",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadReviewPost(
        sessionFromAuthHeader(req.headers.authorization),
        req.body
      );
      res.status(status).json(json);
    })
  );
  app2.post(
    "/api/download/reviews/:id/helpful",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadReviewHelpful(
        sessionFromAuthHeader(req.headers.authorization),
        Number(req.params.id),
        req.body
      );
      res.status(status).json(json);
    })
  );
  app2.post(
    "/api/download/reviews/:id/flag",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleDownloadReviewFlag(Number(req.params.id), req.body);
      res.status(status).json(json);
    })
  );
}

// server/app.ts
var __dirname3 = path4.dirname(fileURLToPath3(import.meta.url));
function createApp() {
  const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD ?? "solidone-admin").trim();
  const dataDir2 = path4.resolve(__dirname3, "..", "data");
  const uploadsDir = path4.join(dataDir2, "uploads");
  if (!useBlobStorage() && !isVercelRuntime()) {
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
  app2.use(cors({ origin: true, credentials: true }));
  app2.use(express.json({ limit: "2mb" }));
  app2.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      storage: useBlobStorage() ? "blob" : isVercelRuntime() ? "none" : "local"
    });
  });
  app2.post(
    "/api/subscribe",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSubscribePost(req.body);
      res.status(status).json(json);
    })
  );
  app2.get(
    "/api/admin/subscribers",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleSubscribersList();
      res.status(status).json(json);
    })
  );
  app2.delete(
    "/api/admin/subscribers/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSubscriberDelete(Number(req.params.id));
      res.status(status).json(json);
    })
  );
  app2.post(
    "/api/store-notify",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleStoreNotifyPost(req.body);
      res.status(status).json(json);
    })
  );
  app2.post("/api/admin/login", (req, res) => {
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Invalid password." });
      return;
    }
    res.json({ ok: true, token: ADMIN_PASSWORD });
  });
  app2.get(
    "/api/admin/store-notify",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleStoreNotifyList();
      res.status(status).json(json);
    })
  );
  app2.delete(
    "/api/admin/store-notify/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleStoreNotifyDelete(Number(req.params.id));
      res.status(status).json(json);
    })
  );
  app2.post(
    "/api/support",
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSupportPost(req.body);
      res.status(status).json(json);
    })
  );
  app2.get(
    "/api/admin/support",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleSupportList();
      res.status(status).json(json);
    })
  );
  app2.patch(
    "/api/admin/support/:id/star",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSupportStarToggle(Number(req.params.id));
      res.status(status).json(json);
    })
  );
  app2.delete(
    "/api/admin/support/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleSupportDelete(Number(req.params.id));
      res.status(status).json(json);
    })
  );
  if (!useBlobStorage()) {
    app2.use("/uploads", express.static(uploadsDir));
  }
  registerBlogRoutes(app2, { requireAdmin, uploadsDir });
  registerDownloadRoutes(app2);
  app2.get(
    "/api/admin/download/installs",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleAdminInstallsList();
      res.status(status).json(json);
    })
  );
  app2.get(
    "/api/admin/download/reviews",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const { status, json } = await handleAdminReviewsList();
      res.status(status).json(json);
    })
  );
  app2.patch(
    "/api/admin/download/reviews/:id/reply",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleAdminReviewReply(Number(req.params.id), req.body);
      res.status(status).json(json);
    })
  );
  app2.delete(
    "/api/admin/download/reviews/:id/reply",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { status, json } = await handleAdminReviewReplyDelete(Number(req.params.id));
      res.status(status).json(json);
    })
  );
  return app2;
}

// api-src/index.ts
var app;
function fail(res, err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("createApp failed:", err);
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: "Server failed to start.",
      detail: message || "Unknown error"
    })
  );
}
function handler(req, res) {
  if (!app) {
    try {
      app = createApp();
    } catch (err) {
      fail(res, err);
      return;
    }
  }
  app(req, res);
}
export {
  handler as default
};
