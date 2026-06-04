import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isVercelRuntime } from "./runtime.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "..", "data");

export function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Local dev only — Vercel serverless has a read-only project filesystem. */
function ensureLocalDataDir(): void {
  if (useBlobStorage() || isVercelRuntime()) return;
  try {
    mkdirSync(dataDir, { recursive: true });
  } catch {
    // ignore EROFS / permission errors
  }
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  if (!useBlobStorage()) {
    try {
      const raw = readFileSync(path.join(dataDir, filename), "utf8");
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  const { list } = await import("@vercel/blob");
  const blobPath = `solid-one/${filename}`;
  const result = await list({ prefix: blobPath, limit: 1 });
  if (!result.blobs.length) return fallback;
  const httpRes = await fetch(result.blobs[0].url);
  if (!httpRes.ok) return fallback;
  return (await httpRes.json()) as T;
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const body = JSON.stringify(data, null, 2);
  if (!useBlobStorage()) {
    ensureLocalDataDir();
    writeFileSync(path.join(dataDir, filename), body, "utf8");
    return;
  }

  const { put } = await import("@vercel/blob");
  await put(`solid-one/${filename}`, body, {
    access: "public",
    contentType: "application/json",
  });
}

export async function saveUploadedImage(
  buffer: Buffer,
  filename: string,
  uploadsDir: string,
): Promise<string> {
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
    access: "public",
    contentType,
  });
  return blob.url;
}
