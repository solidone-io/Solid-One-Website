/** Same-origin /api — one Vercel project serves the site and API together. */
export const API_BASE = "";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

/** Turn /uploads/... paths from the API into absolute URLs when needed. */
export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/")) {
    return apiUrl(url);
  }
  return url;
}
