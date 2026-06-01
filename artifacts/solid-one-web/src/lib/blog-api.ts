const API_BASE = "";

export type BlogPost = {
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

export type BlogPostInput = {
  title: string;
  slug?: string;
  excerpt: string;
  body: string;
  coverImage?: string | null;
  published?: boolean;
};

function authHeaders(token: string, json = true): HeadersInit {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function parseError(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  throw new Error(typeof data.error === "string" ? data.error : fallback);
}

export async function fetchPublicPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}/api/blog`);
  if (!res.ok) await parseError(res, "Could not load posts.");
  const data = await res.json();
  return (data.posts ?? []) as BlogPost[];
}

export async function fetchPublicPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/api/blog/${encodeURIComponent(slug)}`);
  if (!res.ok) await parseError(res, "Post not found.");
  const data = await res.json();
  return data.post as BlogPost;
}

export async function fetchAdminPosts(token: string): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}/api/admin/blog`, { headers: authHeaders(token) });
  if (!res.ok) await parseError(res, "Could not load posts.");
  const data = await res.json();
  return (data.posts ?? []) as BlogPost[];
}

export async function fetchAdminPost(token: string, id: number): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/api/admin/blog/${id}`, { headers: authHeaders(token) });
  if (!res.ok) await parseError(res, "Could not load post.");
  const data = await res.json();
  return data.post as BlogPost;
}

export async function createPost(token: string, input: BlogPostInput): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/api/admin/blog`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res, "Could not create post.");
  const data = await res.json();
  return data.post as BlogPost;
}

export async function updatePost(token: string, id: number, input: BlogPostInput): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/api/admin/blog/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res, "Could not update post.");
  const data = await res.json();
  return data.post as BlogPost;
}

export async function deletePost(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/blog/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) await parseError(res, "Could not delete post.");
}

export async function uploadBlogImage(token: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_BASE}/api/admin/blog/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) await parseError(res, "Image upload failed.");
  const data = await res.json();
  return data.url as string;
}

export function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "post"
  );
}
