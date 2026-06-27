import { getDownloadAuthToken } from "@/lib/download-auth";
import { apiUrl } from "@/lib/api-base";

export type DownloadStats = {
  downloadCount: number;
  reviewCount: number;
  averageRating: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type DownloadReview = {
  id: number;
  userName: string;
  userPicture: string;
  stars: number;
  text: string;
  createdAt: string;
  helpfulYes: number;
  helpfulNo: number;
  adminReply: { text: string; repliedAt: string } | null;
};

export type DownloadUser = {
  sub: string;
  name: string;
  picture: string;
  email: string;
};

export type ApkRelease = {
  packageName: string;
  versionCode: number;
  versionName: string;
  fileName: string;
  size: number;
  downloadPath: string;
};

async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (options.auth) {
    const token = getDownloadAuthToken();
    if (!token) throw new Error("Sign in required.");
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(apiUrl(path), { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Request failed.");
  }
  return data as T;
}

export async function fetchDownloadStats(): Promise<DownloadStats> {
  const data = await api<{ stats: DownloadStats }>("/api/download/stats");
  return data.stats;
}

export async function googleAuthDownload(credential: string): Promise<{ token: string; user: DownloadUser }> {
  const data = await api<{ ok: true; token: string; user: DownloadUser }>("/api/download/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  return { token: data.token, user: data.user };
}

export async function fetchDownloadRelease(): Promise<ApkRelease> {
  const data = await api<{ release: ApkRelease }>("/api/download/release");
  return data.release;
}

export async function recordDownloadInstall(version?: {
  versionCode?: number;
  versionName?: string;
}): Promise<{
  alreadyInstalled: boolean;
  stats: DownloadStats;
}> {
  const data = await api<{ alreadyInstalled: boolean; stats: DownloadStats }>("/api/download/install", {
    method: "POST",
    auth: true,
    body: JSON.stringify(version ?? {}),
  });
  return { alreadyInstalled: data.alreadyInstalled, stats: data.stats };
}

export async function fetchMyDownloadReview(): Promise<DownloadReview | null> {
  const data = await api<{ review: DownloadReview | null }>("/api/download/my-review", { auth: true });
  return data.review;
}

export async function fetchDownloadReviews(params: {
  limit?: number;
  offset?: number;
  filter?: "all" | "positive" | "negative" | "neutral";
  search?: string;
}): Promise<{ reviews: DownloadReview[]; total: number; stats: DownloadStats }> {
  const q = new URLSearchParams();
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.offset != null) q.set("offset", String(params.offset));
  if (params.filter && params.filter !== "all") q.set("filter", params.filter);
  if (params.search?.trim()) q.set("search", params.search.trim());
  return api(`/api/download/reviews?${q}`);
}

export async function postDownloadReview(stars: number, text: string): Promise<{
  review: DownloadReview;
  stats: DownloadStats;
}> {
  const data = await api<{ review: DownloadReview; stats: DownloadStats }>("/api/download/reviews", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ stars, text }),
  });
  return { review: data.review, stats: data.stats };
}

export async function voteReviewHelpful(reviewId: number, helpful: boolean): Promise<void> {
  await api(`/api/download/reviews/${reviewId}/helpful`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ helpful }),
  });
}

export async function flagDownloadReview(reviewId: number, reason: "spam" | "inappropriate"): Promise<DownloadStats> {
  const data = await api<{ stats: DownloadStats }>(`/api/download/reviews/${reviewId}/flag`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return data.stats;
}
