import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isVercelRuntime } from "./runtime.js";
import {
  readMongoJson,
  saveMongoImage,
  useMongoStorage,
  writeMongoJson,
} from "./mongo-store.js";

export { useMongoStorage } from "./mongo-store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "..", "data");

/** Blob SDK auth: BLOB_READ_WRITE_TOKEN, or on Vercel OIDC via BLOB_STORE_ID. */
export function useBlobStorage(): boolean {
  if (useMongoStorage()) return false;
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  return isVercelRuntime() && Boolean(process.env.BLOB_STORE_ID);
}

/** Private stores (default on this project) require private access + SDK reads. */
export function blobAccess(): "public" | "private" {
  const mode = process.env.BLOB_ACCESS?.trim().toLowerCase();
  return mode === "public" ? "public" : "private";
}

/** Local dev only — Vercel serverless has a read-only project filesystem. */
function ensureLocalDataDir(): void {
  if (useMongoStorage() || useBlobStorage() || isVercelRuntime()) return;
  try {
    mkdirSync(dataDir, { recursive: true });
  } catch {
    // ignore EROFS / permission errors
  }
}

async function readBlobJson<T>(filename: string, fallback: T): Promise<T> {
  const { get, list } = await import("@vercel/blob");
  const blobPath = `solid-one/${filename}`;
  const access = blobAccess();

  try {
    const result = await get(blobPath, { access });
    if (result.statusCode === 200 && result.stream) {
      const text = await new Response(result.stream).text();
      return JSON.parse(text) as T;
    }
  } catch {
    // fall through to list lookup
  }

  try {
    const result = await list({ prefix: blobPath, limit: 20 });
    const exact = result.blobs.find((b) => b.pathname === blobPath);
    const blob = exact ?? result.blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
    if (!blob) return fallback;

    const blobResult = await get(blob.pathname, { access });
    if (blobResult.statusCode !== 200 || !blobResult.stream) return fallback;
    const text = await new Response(blobResult.stream).text();
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  if (useMongoStorage()) {
    return readMongoJson(filename, fallback);
  }
  if (!useBlobStorage()) {
    try {
      const raw = readFileSync(path.join(dataDir, filename), "utf8");
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  return readBlobJson(filename, fallback);
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const body = JSON.stringify(data, null, 2);
  if (useMongoStorage()) {
    await writeMongoJson(filename, data);
    return;
  }
  if (!useBlobStorage()) {
    if (isVercelRuntime()) {
      throw new Error(
        "Set MONGODB_URI on Vercel to save website data (same cluster as auth-api).",
      );
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
    allowOverwrite: true,
  });
}

export async function saveUploadedImage(
  buffer: Buffer,
  filename: string,
  uploadsDir: string,
): Promise<string> {
  if (useMongoStorage()) {
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
            ? "image/gif"
            : "image/jpeg";
    return saveMongoImage(buffer, filename, contentType);
  }
  if (!useBlobStorage()) {
    mkdirSync(uploadsDir, { recursive: true });
    const dest = path.join(uploadsDir, filename);
    writeFileSync(dest, buffer);
    return `/uploads/${filename}`;
  }

  const { put } = await import("@vercel/blob");
  const ext = path.extname(filename).toLowerCase();
  const contentType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
  const blob = await put(`solid-one/uploads/${filename}`, buffer, {
    access: blobAccess(),
    contentType,
  });
  return blob.url;
}

export function storageBackendLabel(): "mongo" | "blob" | "local" | "none" {
  if (useMongoStorage()) return "mongo";
  if (useBlobStorage()) return "blob";
  if (isVercelRuntime()) return "none";
  return "local";
}
