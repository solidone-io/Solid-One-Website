import { readJsonFile, writeJsonFile } from "./persistent-json.js";

export type SupportRequestRecord = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  starred: boolean;
  createdAt: string;
};

const FILE = "support-requests.json";

async function readAll(): Promise<SupportRequestRecord[]> {
  const parsed = await readJsonFile<unknown[]>(FILE, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (row): row is Omit<SupportRequestRecord, "starred"> & { starred?: boolean } =>
        row !== null &&
        typeof row === "object" &&
        typeof (row as SupportRequestRecord).id === "number" &&
        typeof (row as SupportRequestRecord).name === "string" &&
        typeof (row as SupportRequestRecord).email === "string" &&
        typeof (row as SupportRequestRecord).subject === "string" &&
        typeof (row as SupportRequestRecord).message === "string" &&
        typeof (row as SupportRequestRecord).createdAt === "string",
    )
    .map((row) => ({
      ...row,
      starred: row.starred === true,
    }));
}

async function writeAll(rows: SupportRequestRecord[]): Promise<void> {
  await writeJsonFile(FILE, rows);
}

export async function listSupportRequests(): Promise<SupportRequestRecord[]> {
  return (await readAll()).sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function addSupportRequest(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<SupportRequestRecord> {
  const rows = await readAll();
  const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const record: SupportRequestRecord = {
    id: nextId,
    ...input,
    starred: false,
    createdAt: new Date().toISOString(),
  };
  rows.push(record);
  await writeAll(rows);
  return record;
}

export async function toggleSupportRequestStar(id: number): Promise<SupportRequestRecord | null> {
  const rows = await readAll();
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return null;
  rows[index] = { ...rows[index], starred: !rows[index].starred };
  await writeAll(rows);
  return rows[index];
}

export async function deleteSupportRequest(id: number): Promise<boolean> {
  const rows = await readAll();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeAll(next);
  return true;
}
