import { findBlogPostBySlug } from "./blog-store.js";
export function slugify(text) {
    return (text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "post");
}
export async function uniqueSlug(base, excludeId) {
    const root = slugify(base);
    let n = 0;
    while (true) {
        const candidate = n === 0 ? root : `${root}-${n}`;
        const existing = await findBlogPostBySlug(candidate);
        if (!existing || (excludeId !== undefined && existing.id === excludeId)) {
            return candidate;
        }
        n += 1;
    }
}
export function serializePost(row) {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        body: row.body,
        coverImage: row.coverImage,
        published: row.published,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
