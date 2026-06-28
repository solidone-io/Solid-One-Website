import { Binary, MongoClient } from "mongodb";

const JSON_COLLECTION = "website_json";
const UPLOADS_COLLECTION = "website_uploads";

let clientPromise: Promise<MongoClient> | null = null;

function mongoUri(): string {
  return (
    process.env.MONGODB_URI_STANDARD?.trim() ||
    process.env.MONGODB_URI?.trim() ||
    ""
  );
}

export function useMongoStorage(): boolean {
  return Boolean(mongoUri());
}

function dbName(): string {
  return process.env.MONGODB_DB?.trim() || "solidone";
}

async function getClient(): Promise<MongoClient> {
  const uri = mongoUri();
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 20_000,
    });
  }
  return clientPromise;
}

async function jsonCol() {
  const client = await getClient();
  return client.db(dbName()).collection(JSON_COLLECTION);
}

async function uploadsCol() {
  const client = await getClient();
  return client.db(dbName()).collection(UPLOADS_COLLECTION);
}

export async function readMongoJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const col = await jsonCol();
    const doc = await col.findOne({ _id: filename });
    if (!doc || doc.data === undefined) return fallback;
    return doc.data as T;
  } catch (err) {
    console.error("readMongoJson", filename, err);
    return fallback;
  }
}

export async function writeMongoJson<T>(filename: string, data: T): Promise<void> {
  const col = await jsonCol();
  await col.updateOne(
    { _id: filename },
    { $set: { data, updatedAt: new Date() } },
    { upsert: true },
  );
}

export async function saveMongoImage(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const col = await uploadsCol();
  await col.updateOne(
    { _id: filename },
    {
      $set: {
        data: new Binary(buffer),
        contentType,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
  return `/api/uploads/${encodeURIComponent(filename)}`;
}

export async function readMongoImage(
  filename: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const col = await uploadsCol();
  const doc = await col.findOne({ _id: filename });
  if (!doc?.data) return null;
  const raw = doc.data as Binary | Buffer;
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw.buffer);
  const contentType = typeof doc.contentType === "string" ? doc.contentType : "application/octet-stream";
  return { buffer, contentType };
}

export async function ensureMongoIndexes(): Promise<void> {
  if (!useMongoStorage()) return;
  try {
    const col = await jsonCol();
    await col.createIndex({ updatedAt: -1 });
    const uploads = await uploadsCol();
    await uploads.createIndex({ updatedAt: -1 });
  } catch (err) {
    console.error("ensureMongoIndexes", err);
  }
}
