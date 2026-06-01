import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "..", "data");
mkdirSync(dataDir, { recursive: true });
export function useBlobStorage() {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
export async function readJsonFile(filename, fallback) {
    if (!useBlobStorage()) {
        try {
            const raw = readFileSync(path.join(dataDir, filename), "utf8");
            return JSON.parse(raw);
        }
        catch {
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
    return (await res.json());
}
export async function writeJsonFile(filename, data) {
    const body = JSON.stringify(data, null, 2);
    if (!useBlobStorage()) {
        writeFileSync(path.join(dataDir, filename), body, "utf8");
        return;
    }
    const { put } = await import("@vercel/blob");
    await put(`solid-one/${filename}`, body, {
        access: "public",
        contentType: "application/json",
    });
}
export async function saveUploadedImage(buffer, filename, uploadsDir) {
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
        contentType,
    });
    return blob.url;
}
