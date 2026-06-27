import { apiUrl } from "@/lib/api-base";
import type { DownloadStats } from "@/lib/download-api";

export type InstallRecord = {
  googleSub: string;
  email: string;
  name: string;
  picture: string;
  installedAt: string;
};

export type AdminReviewReply = {
  text: string;
  repliedAt: string;
};

export type AdminDownloadReview = {
  id: number;
  googleSub: string;
  userEmail: string;
  userName: string;
  userPicture: string;
  stars: number;
  text: string;
  createdAt: string;
  helpfulYes: number;
  helpfulNo: number;
  adminReply: AdminReviewReply | null;
};

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, Accept: "application/json" };
}

async function parseError(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  throw new Error(typeof data.error === "string" ? data.error : fallback);
}

export async function fetchAdminInstalls(token: string): Promise<{
  installs: InstallRecord[];
  stats: DownloadStats;
}> {
  const res = await fetch(apiUrl("/api/admin/download/installs"), { headers: authHeaders(token) });
  if (!res.ok) await parseError(res, "Could not load installs.");
  const data = await res.json();
  return { installs: data.installs ?? [], stats: data.stats };
}

export async function fetchAdminDownloadReviews(token: string): Promise<{
  reviews: AdminDownloadReview[];
  stats: DownloadStats;
}> {
  const res = await fetch(apiUrl("/api/admin/download/reviews"), { headers: authHeaders(token) });
  if (!res.ok) await parseError(res, "Could not load reviews.");
  const data = await res.json();
  return { reviews: data.reviews ?? [], stats: data.stats };
}

export async function postAdminReviewReply(
  token: string,
  reviewId: number,
  text: string,
): Promise<AdminDownloadReview> {
  const res = await fetch(apiUrl(`/api/admin/download/reviews/${reviewId}/reply`), {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) await parseError(res, "Could not post reply.");
  const data = await res.json();
  return data.review as AdminDownloadReview;
}

export async function deleteAdminReviewReply(token: string, reviewId: number): Promise<AdminDownloadReview> {
  const res = await fetch(apiUrl(`/api/admin/download/reviews/${reviewId}/reply`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) await parseError(res, "Could not remove reply.");
  const data = await res.json();
  return data.review as AdminDownloadReview;
}
