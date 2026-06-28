import { readJsonFile, writeJsonFile } from "./persistent-json.js";
import type { DownloadSession } from "./download-jwt.js";

export type InstallRecord = {
  googleSub: string;
  email: string;
  name: string;
  picture: string;
  installedAt: string;
  versionCode?: number;
  versionName?: string;
};

export type AdminReviewReply = {
  text: string;
  repliedAt: string;
};

export type DownloadReviewRecord = {
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
  helpfulVoters: string[];
  flagged: boolean;
  flagReason: string | null;
  adminReply: AdminReviewReply | null;
};

export type DownloadStoreData = {
  nextReviewId: number;
  installs: InstallRecord[];
  reviews: DownloadReviewRecord[];
};

const FILE = "download-store.json";

const EMPTY: DownloadStoreData = {
  nextReviewId: 1,
  installs: [],
  reviews: [],
};

function normalizeInstall(raw: unknown): InstallRecord | null {
  if (typeof raw === "string" && raw.trim()) {
    return {
      googleSub: raw.trim(),
      email: "",
      name: "Unknown user",
      picture: "",
      installedAt: "",
    };
  }
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<InstallRecord>;
  if (typeof row.googleSub !== "string" || !row.googleSub.trim()) return null;
  return {
    googleSub: row.googleSub.trim(),
    email: typeof row.email === "string" ? row.email : "",
    name: typeof row.name === "string" && row.name.trim() ? row.name : "Unknown user",
    picture: typeof row.picture === "string" ? row.picture : "",
    installedAt: typeof row.installedAt === "string" ? row.installedAt : "",
  };
}

function isReview(row: unknown): row is DownloadReviewRecord {
  if (!row || typeof row !== "object") return false;
  const r = row as DownloadReviewRecord;
  return (
    typeof r.id === "number" &&
    typeof r.googleSub === "string" &&
    typeof r.userName === "string" &&
    typeof r.stars === "number" &&
    typeof r.createdAt === "string"
  );
}

function normalizeReview(row: DownloadReviewRecord): DownloadReviewRecord {
  return {
    ...row,
    userEmail: typeof row.userEmail === "string" ? row.userEmail : "",
    userPicture: typeof row.userPicture === "string" ? row.userPicture : "",
    helpfulYes: typeof row.helpfulYes === "number" ? row.helpfulYes : 0,
    helpfulNo: typeof row.helpfulNo === "number" ? row.helpfulNo : 0,
    helpfulVoters: Array.isArray(row.helpfulVoters) ? row.helpfulVoters.filter((s) => typeof s === "string") : [],
    flagged: Boolean(row.flagged),
    flagReason: typeof row.flagReason === "string" ? row.flagReason : null,
    adminReply:
      row.adminReply &&
      typeof row.adminReply === "object" &&
      typeof row.adminReply.text === "string" &&
      typeof row.adminReply.repliedAt === "string"
        ? { text: row.adminReply.text, repliedAt: row.adminReply.repliedAt }
        : null,
  };
}

async function readStore(): Promise<DownloadStoreData> {
  const raw = await readJsonFile<DownloadStoreData>(FILE, EMPTY);
  if (!raw || typeof raw !== "object") return { ...EMPTY };
  return {
    nextReviewId: typeof raw.nextReviewId === "number" ? raw.nextReviewId : 1,
    installs: enrichInstallsFromReviews(
      Array.isArray(raw.installs)
        ? raw.installs.map(normalizeInstall).filter((r): r is InstallRecord => r !== null)
        : [],
      Array.isArray(raw.reviews) ? raw.reviews.filter(isReview).map(normalizeReview) : [],
    ),
    reviews: Array.isArray(raw.reviews) ? raw.reviews.filter(isReview).map(normalizeReview) : [],
  };
}

function enrichInstallsFromReviews(
  installs: InstallRecord[],
  reviews: DownloadReviewRecord[],
): InstallRecord[] {
  return installs.map((inst) => {
    const review = reviews.find((r) => r.googleSub === inst.googleSub);
    return {
      ...inst,
      email: inst.email || review?.userEmail || "",
      name: inst.name === "Unknown user" && review?.userName ? review.userName : inst.name,
      picture: inst.picture || review?.userPicture || "",
    };
  });
}

async function writeStore(data: DownloadStoreData): Promise<void> {
  await writeJsonFile(FILE, data);
}

export type DownloadStats = {
  downloadCount: number;
  reviewCount: number;
  averageRating: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export function hasFeedbackText(text: string): boolean {
  return text.trim().length > 0;
}

function sortReviewsForViewer(
  rows: DownloadReviewRecord[],
  viewerGoogleSub?: string,
): DownloadReviewRecord[] {
  const sorted = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!viewerGoogleSub) return sorted;
  return sorted.sort((a, b) => {
    const aOwn = a.googleSub === viewerGoogleSub ? 1 : 0;
    const bOwn = b.googleSub === viewerGoogleSub ? 1 : 0;
    if (aOwn !== bOwn) return bOwn - aOwn;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function computeStats(reviews: DownloadReviewRecord[], installCount: number): DownloadStats {
  const visible = reviews.filter((r) => !r.flagged);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  for (const r of visible) {
    const s = Math.min(5, Math.max(1, Math.round(r.stars))) as 1 | 2 | 3 | 4 | 5;
    distribution[s]++;
  }
  const reviewCount = visible.length;
  const averageRating =
    reviewCount === 0 ? 0 : visible.reduce((sum, r) => sum + r.stars, 0) / reviewCount;

  return {
    downloadCount: installCount,
    reviewCount,
    averageRating: Math.round(averageRating * 10) / 10,
    distribution,
  };
}

export async function getDownloadStats(): Promise<DownloadStats> {
  const store = await readStore();
  return computeStats(store.reviews, store.installs.length);
}

export async function listInstalls(): Promise<InstallRecord[]> {
  const store = await readStore();
  return [...store.installs].sort((a, b) => {
    const ta = a.installedAt ? new Date(a.installedAt).getTime() : 0;
    const tb = b.installedAt ? new Date(b.installedAt).getTime() : 0;
    return tb - ta;
  });
}

export async function recordInstall(
  user: DownloadSession,
  version?: { versionCode?: number; versionName?: string },
): Promise<{ alreadyInstalled: boolean; stats: DownloadStats }> {
  const store = await readStore();
  const idx = store.installs.findIndex((i) => i.googleSub === user.sub);
  const alreadyInstalled = idx >= 0;
  if (!alreadyInstalled) {
    store.installs.unshift({
      googleSub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      installedAt: new Date().toISOString(),
      versionCode: version?.versionCode,
      versionName: version?.versionName,
    });
    await writeStore(store);
  } else {
    const row = store.installs[idx];
    if (user.email && !row.email) row.email = user.email;
    if (user.name && row.name === "Unknown user") row.name = user.name;
    if (user.picture && !row.picture) row.picture = user.picture;
    if (version?.versionCode) row.versionCode = version.versionCode;
    if (version?.versionName) row.versionName = version.versionName;
    if (!row.installedAt) row.installedAt = new Date().toISOString();
    await writeStore(store);
  }
  return {
    alreadyInstalled,
    stats: computeStats(store.reviews, store.installs.length),
  };
}

export async function resetDownloadStore(): Promise<void> {
  await writeStore({ ...EMPTY });
}

export async function getReviewByUser(googleSub: string): Promise<DownloadReviewRecord | null> {
  const store = await readStore();
  return store.reviews.find((r) => r.googleSub === googleSub && !r.flagged) ?? null;
}

export async function addReview(input: {
  googleSub: string;
  userEmail: string;
  userName: string;
  userPicture: string;
  stars: number;
  text: string;
}): Promise<{ ok: true; review: DownloadReviewRecord } | { ok: false; error: string }> {
  const store = await readStore();
  const existing = store.reviews.find((r) => r.googleSub === input.googleSub && !r.flagged);
  if (existing) {
    return { ok: false, error: "You have already reviewed this app." };
  }

  const review: DownloadReviewRecord = {
    id: store.nextReviewId++,
    googleSub: input.googleSub,
    userEmail: input.userEmail,
    userName: input.userName,
    userPicture: input.userPicture,
    stars: input.stars,
    text: input.text.trim(),
    createdAt: new Date().toISOString(),
    helpfulYes: 0,
    helpfulNo: 0,
    helpfulVoters: [],
    flagged: false,
    flagReason: null,
    adminReply: null,
  };
  store.reviews.unshift(review);
  await writeStore(store);
  return { ok: true, review };
}

export async function listReviews(options: {
  limit: number;
  offset: number;
  filter?: "all" | "positive" | "negative" | "neutral";
  search?: string;
  /** When set, the viewer's written feedback is pinned first; everyone else is newest-first. */
  viewerGoogleSub?: string;
}): Promise<{ reviews: DownloadReviewRecord[]; total: number }> {
  const store = await readStore();
  let rows = store.reviews.filter((r) => !r.flagged && hasFeedbackText(r.text));

  const q = options.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q),
    );
  }

  if (options.filter === "positive") rows = rows.filter((r) => r.stars >= 4);
  else if (options.filter === "negative") rows = rows.filter((r) => r.stars <= 2);
  else if (options.filter === "neutral") rows = rows.filter((r) => r.stars === 3);

  rows = sortReviewsForViewer(rows, options.viewerGoogleSub);

  const total = rows.length;
  const reviews = rows.slice(options.offset, options.offset + options.limit);
  return { reviews, total };
}

export async function listAllReviewsAdmin(): Promise<DownloadReviewRecord[]> {
  const store = await readStore();
  return [...store.reviews]
    .filter((r) => !r.flagged)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setAdminReviewReply(
  reviewId: number,
  text: string,
): Promise<{ ok: true; review: DownloadReviewRecord } | { ok: false; error: string }> {
  const store = await readStore();
  const review = store.reviews.find((r) => r.id === reviewId && !r.flagged);
  if (!review) return { ok: false, error: "Review not found." };
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Reply cannot be empty." };
  review.adminReply = { text: trimmed.slice(0, 1000), repliedAt: new Date().toISOString() };
  await writeStore(store);
  return { ok: true, review };
}

export async function clearAdminReviewReply(
  reviewId: number,
): Promise<{ ok: true; review: DownloadReviewRecord } | { ok: false; error: string }> {
  const store = await readStore();
  const review = store.reviews.find((r) => r.id === reviewId);
  if (!review) return { ok: false, error: "Review not found." };
  review.adminReply = null;
  await writeStore(store);
  return { ok: true, review };
}

export async function deleteReviewByUser(
  googleSub: string,
): Promise<{ ok: true; stats: DownloadStats } | { ok: false; error: string }> {
  const store = await readStore();
  const idx = store.reviews.findIndex((r) => r.googleSub === googleSub && !r.flagged);
  if (idx < 0) return { ok: false, error: "Review not found." };
  store.reviews.splice(idx, 1);
  await writeStore(store);
  return { ok: true, stats: computeStats(store.reviews, store.installs.length) };
}

export async function setReviewHelpful(
  reviewId: number,
  googleSub: string,
  helpful: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const store = await readStore();
  const review = store.reviews.find((r) => r.id === reviewId && !r.flagged);
  if (!review) return { ok: false, error: "Review not found." };
  if (review.helpfulVoters.includes(googleSub)) {
    return { ok: false, error: "You already voted on this review." };
  }
  review.helpfulVoters.push(googleSub);
  if (helpful) review.helpfulYes++;
  else review.helpfulNo++;
  await writeStore(store);
  return { ok: true };
}

export async function flagReview(
  reviewId: number,
  reason: "spam" | "inappropriate",
): Promise<{ ok: boolean }> {
  const store = await readStore();
  const review = store.reviews.find((r) => r.id === reviewId);
  if (!review) return { ok: false };
  review.flagged = true;
  review.flagReason = reason;
  await writeStore(store);
  return { ok: true };
}

export function serializeReview(r: DownloadReviewRecord) {
  return {
    id: r.id,
    userName: r.userName,
    userPicture: r.userPicture,
    stars: r.stars,
    text: r.text,
    createdAt: r.createdAt,
    helpfulYes: r.helpfulYes,
    helpfulNo: r.helpfulNo,
    adminReply: r.adminReply,
  };
}

export function serializeInstall(r: InstallRecord) {
  return {
    googleSub: r.googleSub,
    email: r.email,
    name: r.name,
    picture: r.picture,
    installedAt: r.installedAt,
    versionCode: r.versionCode,
    versionName: r.versionName,
  };
}

export function serializeReviewAdmin(r: DownloadReviewRecord) {
  return {
    id: r.id,
    googleSub: r.googleSub,
    userEmail: r.userEmail,
    userName: r.userName,
    userPicture: r.userPicture,
    stars: r.stars,
    text: r.text,
    createdAt: r.createdAt,
    helpfulYes: r.helpfulYes,
    helpfulNo: r.helpfulNo,
    adminReply: r.adminReply,
  };
}
