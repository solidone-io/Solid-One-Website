import { readJsonFile, writeJsonFile } from "./persistent-json.js";

export type StoreNotifyRecord = {
  id: number;
  email: string;
  platform: "apple" | "google";
  createdAt: string;
};

const FILE = "store-notify.json";

async function readAll(): Promise<StoreNotifyRecord[]> {
  const rows = await readJsonFile<unknown[]>(FILE, []);
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row): row is StoreNotifyRecord =>
      row !== null &&
      typeof row === "object" &&
      typeof (row as StoreNotifyRecord).id === "number" &&
      typeof (row as StoreNotifyRecord).email === "string" &&
      ((row as StoreNotifyRecord).platform === "apple" ||
        (row as StoreNotifyRecord).platform === "google") &&
      typeof (row as StoreNotifyRecord).createdAt === "string",
  );
}

async function writeAll(rows: StoreNotifyRecord[]): Promise<void> {
  await writeJsonFile(FILE, rows);
}

export async function listStoreNotifySignups(): Promise<StoreNotifyRecord[]> {
  return (await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addStoreNotifySignup(
  email: string,
  platform: "apple" | "google",
): Promise<{ ok: true; record: StoreNotifyRecord } | { ok: false; reason: "duplicate" }> {
  const rows = await readAll();
  const exists = rows.some((r) => r.email === email && r.platform === platform);
  if (exists) return { ok: false, reason: "duplicate" };

  const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const record: StoreNotifyRecord = {
    id: nextId,
    email,
    platform,
    createdAt: new Date().toISOString(),
  };
  rows.push(record);
  await writeAll(rows);
  return { ok: true, record };
}

export async function deleteStoreNotifySignup(id: number): Promise<boolean> {
  const rows = await readAll();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeAll(next);
  return true;
}
