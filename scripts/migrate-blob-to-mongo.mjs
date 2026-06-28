/**
 * One-time import: Vercel Blob → MongoDB (website_json + website_uploads).
 *
 * Usage (from repo root, with .env containing BLOB_READ_WRITE_TOKEN + MONGODB_URI):
 *   node scripts/migrate-blob-to-mongo.mjs
 *   node scripts/migrate-blob-to-mongo.mjs --force   # overwrite existing Mongo docs
 */
import "dotenv/config";
import { Binary, MongoClient } from "mongodb";
import { get, list } from "@vercel/blob";

const JSON_FILES = [
  "download-store.json",
  "subscribers.json",
  "blog-posts.json",
  "support-requests.json",
  "store-notify.json",
];

const force = process.argv.includes("--force");
const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
const mongoUri =
  process.env.MONGODB_URI_STANDARD?.trim() ||
  process.env.MONGODB_URI?.trim() ||
  "";
const dbName = process.env.MONGODB_DB?.trim() || "solidone";

if (!blobToken) {
  console.error("Missing BLOB_READ_WRITE_TOKEN in .env (copy from Vercel env vars).");
  process.exit(1);
}
if (!mongoUri) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

function blobAccess() {
  const mode = process.env.BLOB_ACCESS?.trim().toLowerCase();
  return mode === "public" ? "public" : "private";
}

async function readBlobJson(filename) {
  const blobPath = `solid-one/${filename}`;
  const access = blobAccess();
  const opts = { access, token: blobToken };

  try {
    const result = await get(blobPath, opts);
    if (result.statusCode === 200 && result.stream) {
      const text = await new Response(result.stream).text();
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn(`  get(${blobPath}) failed:`, err.message || err);
  }

  const listed = await list({ prefix: blobPath, limit: 20, token: blobToken });
  const exact = listed.blobs.find((b) => b.pathname === blobPath);
  const blob =
    exact ??
    listed.blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
  if (!blob) return null;

  const blobResult = await get(blob.pathname, opts);
  if (blobResult.statusCode !== 200 || !blobResult.stream) return null;
  const text = await new Response(blobResult.stream).text();
  return JSON.parse(text);
}

function contentTypeForFilename(filename) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function filenameFromBlobUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop();
    return base ? decodeURIComponent(base) : null;
  } catch {
    return null;
  }
}

function rewriteBlogCoverImages(posts) {
  if (!Array.isArray(posts)) return posts;
  let changed = 0;
  for (const post of posts) {
    if (!post || typeof post !== "object") continue;
    const name = filenameFromBlobUrl(post.coverImage);
    if (name && post.coverImage.includes("blob.vercel-storage.com")) {
      post.coverImage = `/api/uploads/${encodeURIComponent(name)}`;
      changed++;
    }
  }
  if (changed) console.log(`  Rewrote ${changed} blog coverImage URL(s) for Mongo serving.`);
  return posts;
}

async function main() {
  const client = await MongoClient.connect(mongoUri, { maxPoolSize: 5 });
  const db = client.db(dbName);
  const jsonCol = db.collection("website_json");
  const uploadsCol = db.collection("website_uploads");

  console.log(`MongoDB: ${dbName}`);
  console.log(`Force overwrite: ${force}\n`);

  // --- JSON files ---
  for (const filename of JSON_FILES) {
    process.stdout.write(`JSON ${filename} ... `);
    const existing = await jsonCol.findOne({ _id: filename });
    if (existing?.data !== undefined && !force) {
      console.log("skip (already in Mongo; use --force to overwrite)");
      continue;
    }

    let data;
    try {
      data = await readBlobJson(filename);
    } catch (err) {
      console.log(`ERROR reading blob: ${err.message || err}`);
      continue;
    }
    if (data === null || data === undefined) {
      console.log("not found in Blob");
      continue;
    }

    if (filename === "blog-posts.json") {
      data = rewriteBlogCoverImages(data);
    }

    await jsonCol.updateOne(
      { _id: filename },
      { $set: { data, updatedAt: new Date(), migratedFrom: "blob" } },
      { upsert: true },
    );
    const size =
      filename === "download-store.json" && data?.installs
        ? `${data.installs.length} installs, ${data.reviews?.length ?? 0} reviews`
        : Array.isArray(data)
          ? `${data.length} rows`
          : "ok";
    console.log(`imported (${size})`);
  }

  // --- Upload images ---
  console.log("\nBlob uploads (solid-one/uploads/) ...");
  let cursor;
  try {
    cursor = await list({ prefix: "solid-one/uploads/", limit: 1000, token: blobToken });
  } catch (err) {
    console.error("Failed to list uploads:", err.message || err);
    await client.close();
    process.exit(1);
  }

  const blobs = cursor.blobs.filter((b) => !b.pathname.endsWith("/"));
  if (!blobs.length) {
    console.log("  No upload blobs found.");
  }

  for (const blob of blobs) {
    const filename = blob.pathname.replace(/^solid-one\/uploads\//, "");
    if (!filename) continue;

    const exists = await uploadsCol.findOne({ _id: filename });
    if (exists?.data && !force) {
      console.log(`  skip ${filename} (already in Mongo)`);
      continue;
    }

    process.stdout.write(`  ${filename} ... `);
    try {
      const result = await get(blob.pathname, { access: blobAccess(), token: blobToken });
      if (result.statusCode !== 200 || !result.stream) {
        console.log("read failed");
        continue;
      }
      const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
      await uploadsCol.updateOne(
        { _id: filename },
        {
          $set: {
            data: new Binary(buffer),
            contentType: contentTypeForFilename(filename),
            updatedAt: new Date(),
            migratedFrom: "blob",
          },
        },
        { upsert: true },
      );
      console.log(`${buffer.length} bytes`);
    } catch (err) {
      console.log(`ERROR: ${err.message || err}`);
    }
  }

  await client.close();
  console.log("\nDone. Refresh https://www.solidone.io/admin1855 to verify.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
