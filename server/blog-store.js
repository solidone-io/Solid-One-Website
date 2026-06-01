import { readJsonFile, writeJsonFile } from "./persistent-json.js";
const FILE = "blog-posts.json";
async function readAll() {
    const rows = await readJsonFile(FILE, []);
    if (!Array.isArray(rows))
        return [];
    return rows.filter((row) => row !== null &&
        typeof row === "object" &&
        typeof row.id === "number" &&
        typeof row.slug === "string" &&
        typeof row.title === "string" &&
        typeof row.excerpt === "string" &&
        typeof row.body === "string" &&
        typeof row.published === "boolean" &&
        typeof row.createdAt === "string" &&
        typeof row.updatedAt === "string" &&
        (row.coverImage === null || typeof row.coverImage === "string"));
}
async function writeAll(rows) {
    await writeJsonFile(FILE, rows);
}
export async function listBlogPosts() {
    const rows = await readAll();
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function listPublishedBlogPosts() {
    return (await listBlogPosts()).filter((p) => p.published);
}
export async function getBlogPostById(id) {
    return (await readAll()).find((p) => p.id === id);
}
export async function getPublishedBlogPostBySlug(slug) {
    return (await readAll()).find((p) => p.slug === slug && p.published);
}
export async function findBlogPostBySlug(slug) {
    return (await readAll()).find((p) => p.slug === slug);
}
export async function createBlogPost(input) {
    const rows = await readAll();
    const now = new Date().toISOString();
    const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    const post = { ...input, id: nextId, createdAt: now, updatedAt: now };
    rows.push(post);
    await writeAll(rows);
    return post;
}
export async function updateBlogPost(id, input) {
    const rows = await readAll();
    const index = rows.findIndex((p) => p.id === id);
    if (index < 0)
        return undefined;
    const updated = {
        ...rows[index],
        ...input,
        updatedAt: new Date().toISOString(),
    };
    rows[index] = updated;
    await writeAll(rows);
    return updated;
}
export async function deleteBlogPost(id) {
    const rows = await readAll();
    const next = rows.filter((p) => p.id !== id);
    if (next.length === rows.length)
        return false;
    await writeAll(next);
    return true;
}
