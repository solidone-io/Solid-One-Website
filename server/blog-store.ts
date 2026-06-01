import { readJsonFile, writeJsonFile } from "./persistent-json.js";

export type BlogPostRecord = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const FILE = "blog-posts.json";

async function readAll(): Promise<BlogPostRecord[]> {
  const rows = await readJsonFile<unknown[]>(FILE, []);
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row): row is BlogPostRecord =>
      row !== null &&
      typeof row === "object" &&
      typeof (row as BlogPostRecord).id === "number" &&
      typeof (row as BlogPostRecord).slug === "string" &&
      typeof (row as BlogPostRecord).title === "string" &&
      typeof (row as BlogPostRecord).excerpt === "string" &&
      typeof (row as BlogPostRecord).body === "string" &&
      typeof (row as BlogPostRecord).published === "boolean" &&
      typeof (row as BlogPostRecord).createdAt === "string" &&
      typeof (row as BlogPostRecord).updatedAt === "string" &&
      ((row as BlogPostRecord).coverImage === null || typeof (row as BlogPostRecord).coverImage === "string"),
  );
}

async function writeAll(rows: BlogPostRecord[]): Promise<void> {
  await writeJsonFile(FILE, rows);
}

export async function listBlogPosts(): Promise<BlogPostRecord[]> {
  const rows = await readAll();
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listPublishedBlogPosts(): Promise<BlogPostRecord[]> {
  return (await listBlogPosts()).filter((p) => p.published);
}

export async function getBlogPostById(id: number): Promise<BlogPostRecord | undefined> {
  return (await readAll()).find((p) => p.id === id);
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPostRecord | undefined> {
  return (await readAll()).find((p) => p.slug === slug && p.published);
}

export async function findBlogPostBySlug(slug: string): Promise<BlogPostRecord | undefined> {
  return (await readAll()).find((p) => p.slug === slug);
}

export async function createBlogPost(
  input: Omit<BlogPostRecord, "id" | "createdAt" | "updatedAt">,
): Promise<BlogPostRecord> {
  const rows = await readAll();
  const now = new Date().toISOString();
  const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  const post: BlogPostRecord = { ...input, id: nextId, createdAt: now, updatedAt: now };
  rows.push(post);
  await writeAll(rows);
  return post;
}

export async function updateBlogPost(
  id: number,
  input: Partial<Omit<BlogPostRecord, "id" | "createdAt">>,
): Promise<BlogPostRecord | undefined> {
  const rows = await readAll();
  const index = rows.findIndex((p) => p.id === id);
  if (index < 0) return undefined;
  const updated: BlogPostRecord = {
    ...rows[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  rows[index] = updated;
  await writeAll(rows);
  return updated;
}

export async function deleteBlogPost(id: number): Promise<boolean> {
  const rows = await readAll();
  const next = rows.filter((p) => p.id !== id);
  if (next.length === rows.length) return false;
  await writeAll(next);
  return true;
}
