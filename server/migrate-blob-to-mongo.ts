import { blobAccess } from "./persistent-json.js";
import { writeMongoJson, saveMongoImage, useMongoStorage } from "./mongo-store.js";

const JSON_FILES = [
  "download-store.json",
  "subscribers.json",
  "blog-posts.json",
  "support-requests.json",
  "store-notify.json",
] as const;

export type BlobMigrationResult = {
  ok: boolean;
  files: Array<{ name: string; status: string; detail?: string }>;
  uploads: Array<{ name: string; status: string; detail?: string }>;
};

function contentTypeForFilename(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function filenameFromBlobUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop();
    return base ? decodeURIComponent(base) : null;
  } catch {
    return null;
  }
}

function rewriteBlogCoverImages(posts: unknown): unknown {
  if (!Array.isArray(posts)) return posts;
  for (const post of posts) {
    if (!post || typeof post !== "object") continue;
    const row = post as { coverImage?: string | null };
    const name = row.coverImage ? filenameFromBlobUrl(row.coverImage) : null;
    if (name && row.coverImage?.includes("blob.vercel-storage.com")) {
      row.coverImage = `/api/uploads/${encodeURIComponent(name)}`;
    }
  }
  return posts;
}

async function readBlobJson(filename: string): Promise<unknown | null> {
  const { get, list } = await import("@vercel/blob");
  const blobPath = `solid-one/${filename}`;
  const access = blobAccess();
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;

  try {
    const result = await get(blobPath, { access, token });
    if (result.statusCode === 200 && result.stream) {
      const text = await new Response(result.stream).text();
      return JSON.parse(text) as unknown;
    }
  } catch {
    // fall through
  }

  const listed = await list({ prefix: blobPath, limit: 20, token });
  const exact = listed.blobs.find((b) => b.pathname === blobPath);
  const blob =
    exact ??
    listed.blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
  if (!blob) return null;

  const blobResult = await get(blob.pathname, { access, token });
  if (blobResult.statusCode !== 200 || !blobResult.stream) return null;
  const text = await new Response(blobResult.stream).text();
  return JSON.parse(text) as unknown;
}

function summarizeJson(filename: string, data: unknown): string {
  if (filename === "download-store.json" && data && typeof data === "object") {
    const row = data as { installs?: unknown[]; reviews?: unknown[] };
    return `${row.installs?.length ?? 0} installs, ${row.reviews?.length ?? 0} reviews`;
  }
  if (Array.isArray(data)) return `${data.length} rows`;
  return "ok";
}

export async function runBlobToMongoMigration(opts?: {
  force?: boolean;
  skipExisting?: boolean;
}): Promise<BlobMigrationResult> {
  const force = opts?.force ?? false;
  const skipExisting = opts?.skipExisting ?? !force;

  if (!useMongoStorage()) {
    return { ok: false, files: [{ name: "*", status: "error", detail: "MONGODB_URI not set" }], uploads: [] };
  }

  const hasBlob =
    Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()) ||
    Boolean(process.env.BLOB_STORE_ID?.trim());
  if (!hasBlob) {
    return {
      ok: false,
      files: [{ name: "*", status: "error", detail: "No Blob credentials (BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN)" }],
      uploads: [],
    };
  }

  const { readMongoJson } = await import("./mongo-store.js");
  const files: BlobMigrationResult["files"] = [];
  const uploads: BlobMigrationResult["uploads"] = [];

  for (const filename of JSON_FILES) {
    try {
      if (skipExisting) {
        const existing = await readMongoJson(filename, null);
        if (existing !== null) {
          files.push({ name: filename, status: "skipped", detail: "already in Mongo" });
          continue;
        }
      }

      let data = await readBlobJson(filename);
      if (data === null || data === undefined) {
        files.push({ name: filename, status: "missing", detail: "not found in Blob" });
        continue;
      }

      if (filename === "blog-posts.json") {
        data = rewriteBlogCoverImages(data);
      }

      await writeMongoJson(filename, data);
      files.push({ name: filename, status: "imported", detail: summarizeJson(filename, data) });
    } catch (err) {
      files.push({
        name: filename,
        status: "error",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  try {
    const { get, list } = await import("@vercel/blob");
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
    const access = blobAccess();
    const listed = await list({ prefix: "solid-one/uploads/", limit: 1000, token });
    const blobs = listed.blobs.filter((b) => !b.pathname.endsWith("/"));

    for (const blob of blobs) {
      const filename = blob.pathname.replace(/^solid-one\/uploads\//, "");
      if (!filename) continue;

      try {
        if (skipExisting) {
          const { readMongoImage } = await import("./mongo-store.js");
          const existing = await readMongoImage(filename);
          if (existing) {
            uploads.push({ name: filename, status: "skipped", detail: "already in Mongo" });
            continue;
          }
        }

        const result = await get(blob.pathname, { access, token });
        if (result.statusCode !== 200 || !result.stream) {
          uploads.push({ name: filename, status: "error", detail: "read failed" });
          continue;
        }
        const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
        await saveMongoImage(buffer, filename, contentTypeForFilename(filename));
        uploads.push({ name: filename, status: "imported", detail: `${buffer.length} bytes` });
      } catch (err) {
        uploads.push({
          name: filename,
          status: "error",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } catch (err) {
    uploads.push({
      name: "*",
      status: "error",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  const ok = files.some((f) => f.status === "imported") || uploads.some((u) => u.status === "imported");
  return { ok, files, uploads };
}
