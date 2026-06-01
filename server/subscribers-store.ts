import { readJsonFile, writeJsonFile } from "./persistent-json.js";

export type SubscriberRecord = {
  id: number;
  email: string;
  createdAt: string;
};

const FILE = "subscribers.json";

async function readAll(): Promise<SubscriberRecord[]> {
  const rows = await readJsonFile<unknown[]>(FILE, []);
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row): row is SubscriberRecord =>
      row !== null &&
      typeof row === "object" &&
      typeof (row as SubscriberRecord).id === "number" &&
      typeof (row as SubscriberRecord).email === "string" &&
      typeof (row as SubscriberRecord).createdAt === "string",
  );
}

async function writeAll(rows: SubscriberRecord[]): Promise<void> {
  await writeJsonFile(FILE, rows);
}

export async function listSubscribers(): Promise<SubscriberRecord[]> {
  return (await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addSubscriber(
  email: string,
): Promise<{ ok: true; record: SubscriberRecord } | { ok: false; reason: "duplicate" }> {
  const rows = await readAll();
  if (rows.some((r) => r.email === email)) {
    return { ok: false, reason: "duplicate" };
  }
  const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const record: SubscriberRecord = {
    id: nextId,
    email,
    createdAt: new Date().toISOString(),
  };
  rows.push(record);
  await writeAll(rows);
  return { ok: true, record };
}

export async function deleteSubscriber(id: number): Promise<boolean> {
  const rows = await readAll();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeAll(next);
  return true;
}
