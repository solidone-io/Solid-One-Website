import { randomUUID } from "crypto";
import type express from "express";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { asyncRoute } from "./async-route.js";
import {
  createBlogPost,
  deleteBlogPost,
  findBlogPostBySlug,
  getBlogPostById,
  getPublishedBlogPostBySlug,
  listBlogPosts,
  listPublishedBlogPosts,
  updateBlogPost,
} from "./blog-store.js";
import { serializePost, slugify, uniqueSlug } from "./blog-utils.js";
import { saveUploadedImage, useBlobStorage } from "./persistent-json.js";

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

function postValidationError(error: z.ZodError) {
  return error.issues.map((i) => i.message).join(" ") || "Invalid post data.";
}

type RegisterOptions = {
  requireAdmin: express.RequestHandler;
  uploadsDir: string;
};

export function registerBlogRoutes(app: express.Express, { requireAdmin, uploadsDir }: RegisterOptions) {
  const upload = multer({
    storage: useBlobStorage() || process.env.VERCEL
      ? multer.memoryStorage()
      : multer.diskStorage({
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

  app.get(
    "/api/blog",
    asyncRoute(async (_req, res) => {
      res.json({ posts: (await listPublishedBlogPosts()).map(serializePost) });
    }),
  );

  app.get(
    "/api/blog/:slug",
    asyncRoute(async (req, res) => {
      const slug = typeof req.params.slug === "string" ? req.params.slug : "";
      const row = await getPublishedBlogPostBySlug(slug);
      if (!row) {
        res.status(404).json({ error: "Post not found." });
        return;
      }
      res.json({ post: serializePost(row) });
    }),
  );

  app.get(
    "/api/admin/blog",
    requireAdmin,
    asyncRoute(async (_req, res) => {
      res.json({ posts: (await listBlogPosts()).map(serializePost) });
    }),
  );

  app.get(
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
    }),
  );

  app.post("/api/admin/blog/upload", requireAdmin, (req, res) => {
    upload.single("image")(req, res, (err: unknown) => {
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
        const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
        const filename = `${Date.now()}-${randomUUID()}${ext}`;
        const url = useBlobStorage()
          ? await saveUploadedImage(req.file.buffer, filename, uploadsDir)
          : `/uploads/${req.file.filename}`;
        res.json({ ok: true, url });
      })().catch((e) => {
        res.status(500).json({ error: e instanceof Error ? e.message : "Upload failed." });
      });
    });
  });

  app.post(
    "/api/admin/blog",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const parsed = postBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: postValidationError(parsed.error) });
        return;
      }
      const data = parsed.data;
      const slug = data.slug ?? (await uniqueSlug(data.title));
      const inserted = await createBlogPost({
        slug,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        coverImage: data.coverImage ?? null,
        published: data.published ?? false,
      });
      res.status(201).json({ post: serializePost(inserted) });
    }),
  );

  app.put(
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
        published: data.published ?? existing.published,
      });
      res.json({ post: serializePost(updated!) });
    }),
  );

  app.delete(
    "/api/admin/blog/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({ error: "Invalid id." });
        return;
      }
      if (!(await deleteBlogPost(id))) {
        res.status(404).json({ error: "Not found." });
        return;
      }
      res.json({ ok: true });
    }),
  );
}
