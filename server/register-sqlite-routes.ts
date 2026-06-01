import { randomUUID } from "crypto";
import type express from "express";
import multer from "multer";
import path from "path";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db.js";
import { blogPosts } from "./schema.js";
import { serializePost, slugify, uniqueSlug } from "./blog-utils.js";

function htmlHasText(html: string): boolean {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;
}

const postBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.preprocess(
    (val) => {
      if (typeof val !== "string" || !val.trim()) return undefined;
      return slugify(val);
    },
    z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
  ),
  excerpt: z.string().trim().min(1).max(500),
  body: z
    .string()
    .min(1)
    .max(50000)
    .refine(htmlHasText, { message: "Body cannot be empty" }),
  coverImage: z.union([z.string().trim().max(500), z.null()]).optional(),
  published: z.boolean().optional(),
});

function postValidationError(parsed: z.SafeParseError<unknown>) {
  return parsed.error.issues.map((i) => i.message).join(" ") || "Invalid post data.";
}

type RegisterOptions = {
  requireAdmin: express.RequestHandler;
  uploadsDir: string;
};

export function registerSqliteRoutes(app: express.Express, { requireAdmin, uploadsDir }: RegisterOptions) {
  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadsDir,
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        cb(null, `${Date.now()}-${randomUUID()}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image files are allowed."));
        return;
      }
      cb(null, true);
    },
  });

  app.get("/api/blog", (_req, res) => {
    const rows = db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.createdAt))
      .all();
    res.json({ posts: rows.map(serializePost) });
  });

  app.get("/api/blog/:slug", (req, res) => {
    const slug = typeof req.params.slug === "string" ? req.params.slug : "";
    const row = db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
      .get();
    if (!row) {
      res.status(404).json({ error: "Post not found." });
      return;
    }
    res.json({ post: serializePost(row) });
  });

  app.get("/api/admin/blog", requireAdmin, (_req, res) => {
    const rows = db.select().from(blogPosts).orderBy(desc(blogPosts.updatedAt)).all();
    res.json({ posts: rows.map(serializePost) });
  });

  app.get("/api/admin/blog/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid id." });
      return;
    }
    const row = db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
    if (!row) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    res.json({ post: serializePost(row) });
  });

  app.post("/api/admin/blog/upload", requireAdmin, (req, res) => {
    upload.single("image")(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : "Upload failed.";
        res.status(400).json({ error: message });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: "No image provided." });
        return;
      }
      res.json({ ok: true, url: `/uploads/${req.file.filename}` });
    });
  });

  app.post("/api/admin/blog", requireAdmin, (req, res) => {
    const parsed = postBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: postValidationError(parsed) });
      return;
    }
    const data = parsed.data;
    const slug = data.slug ?? uniqueSlug(data.title);
    const clash = db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug)).get();
    if (clash) {
      res.status(409).json({ error: "Slug already exists." });
      return;
    }
    const now = new Date();
    const inserted = db
      .insert(blogPosts)
      .values({
        slug,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        coverImage: data.coverImage ?? null,
        published: data.published ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
    res.status(201).json({ post: serializePost(inserted) });
  });

  app.put("/api/admin/blog/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid id." });
      return;
    }
    const existing = db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
    if (!existing) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    const parsed = postBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: postValidationError(parsed) });
      return;
    }
    const data = parsed.data;
    const slug = data.slug ?? existing.slug;
    const clash = db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug)).get();
    if (clash && clash.id !== id) {
      res.status(409).json({ error: "Slug already exists." });
      return;
    }
    const updated = db
      .update(blogPosts)
      .set({
        slug,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        coverImage: data.coverImage ?? null,
        published: data.published ?? existing.published,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning()
      .get();
    res.json({ post: serializePost(updated) });
  });

  app.delete("/api/admin/blog/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "Invalid id." });
      return;
    }
    const result = db.delete(blogPosts).where(eq(blogPosts.id, id)).run();
    if (result.changes === 0) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    res.json({ ok: true });
  });
}
