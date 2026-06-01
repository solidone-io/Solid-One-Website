import { readJsonFile, writeJsonFile } from "./persistent-json.js";
const FILE = "store-notify.json";
async function readAll() {
    const rows = await readJsonFile(FILE, []);
    if (!Array.isArray(rows))
        return [];
    return rows.filter((row) => row !== null &&
        typeof row === "object" &&
        typeof row.id === "number" &&
        typeof row.email === "string" &&
        (row.platform === "apple" ||
            row.platform === "google") &&
        typeof row.createdAt === "string");
}
async function writeAll(rows) {
    await writeJsonFile(FILE, rows);
}
export async function listStoreNotifySignups() {
    return (await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function addStoreNotifySignup(email, platform) {
    const rows = await readAll();
    const exists = rows.some((r) => r.email === email && r.platform === platform);
    if (exists)
        return { ok: false, reason: "duplicate" };
    const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const record = {
        id: nextId,
        email,
        platform,
        createdAt: new Date().toISOString(),
    };
    rows.push(record);
    await writeAll(rows);
    return { ok: true, record };
}
export async function deleteStoreNotifySignup(id) {
    const rows = await readAll();
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length)
        return false;
    await writeAll(next);
    return true;
}
