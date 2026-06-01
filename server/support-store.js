import { readJsonFile, writeJsonFile } from "./persistent-json.js";
const FILE = "support-requests.json";
async function readAll() {
    const parsed = await readJsonFile(FILE, []);
    if (!Array.isArray(parsed))
        return [];
    return parsed
        .filter((row) => row !== null &&
        typeof row === "object" &&
        typeof row.id === "number" &&
        typeof row.name === "string" &&
        typeof row.email === "string" &&
        typeof row.subject === "string" &&
        typeof row.message === "string" &&
        typeof row.createdAt === "string")
        .map((row) => ({
        ...row,
        starred: row.starred === true,
    }));
}
async function writeAll(rows) {
    await writeJsonFile(FILE, rows);
}
export async function listSupportRequests() {
    return (await readAll()).sort((a, b) => {
        if (a.starred !== b.starred)
            return a.starred ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
    });
}
export async function addSupportRequest(input) {
    const rows = await readAll();
    const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const record = {
        id: nextId,
        ...input,
        starred: false,
        createdAt: new Date().toISOString(),
    };
    rows.push(record);
    await writeAll(rows);
    return record;
}
export async function toggleSupportRequestStar(id) {
    const rows = await readAll();
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1)
        return null;
    rows[index] = { ...rows[index], starred: !rows[index].starred };
    await writeAll(rows);
    return rows[index];
}
export async function deleteSupportRequest(id) {
    const rows = await readAll();
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length)
        return false;
    await writeAll(next);
    return true;
}
