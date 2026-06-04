import { readJsonFile, writeJsonFile } from "./persistent-json.js";

export type DownloadReviewRecord = {
  id: number;
  googleSub: string;
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
};

export type DownloadStoreData = {
  nextReviewId: number;
  installs: string[];
  reviews: DownloadReviewRecord[];
};

const FILE = "download-store.json";

const EMPTY: DownloadStoreData = {
  nextReviewId: 1,
  installs: [],
  reviews: [],
};

async function readStore(): Promise<DownloadStoreData> {
  const raw = await readJsonFile<DownloadStoreData>(FILE, EMPTY);
  if (!raw || typeof raw !== "object") return { ...EMPTY };
  return {
    nextReviewId: typeof raw.nextReviewId === "number" ? raw.nextReviewId : 1,
    installs: Array.isArray(raw.installs) ? raw.installs.filter((s) => typeof s === "string") : [],
    reviews: Array.isArray(raw.reviews) ? raw.reviews.filter(isReview) : [],
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

async function writeStore(data: DownloadStoreData): Promise<void> {
  await writeJsonFile(FILE, data);
}

export type DownloadStats = {
  downloadCount: number;
  reviewCount: number;
  averageRating: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

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

export async function recordInstall(googleSub: string): Promise<{ alreadyInstalled: boolean; stats: DownloadStats }> {
  const store = await readStore();
  const alreadyInstalled = store.installs.includes(googleSub);
  if (!alreadyInstalled) {
    store.installs.push(googleSub);
    await writeStore(store);
  }
  return {
    alreadyInstalled,
    stats: computeStats(store.reviews, store.installs.length),
  };
}

export async function getReviewByUser(googleSub: string): Promise<DownloadReviewRecord | null> {
  const store = await readStore();
  return store.reviews.find((r) => r.googleSub === googleSub && !r.flagged) ?? null;
}

export async function addReview(input: {
  googleSub: string;
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
}): Promise<{ reviews: DownloadReviewRecord[]; total: number }> {
  const store = await readStore();
  let rows = store.reviews.filter((r) => !r.flagged);

  const q = options.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (r) => r.userName.toLowerCase().includes(q) || r.text.toLowerCase().includes(q),
    );
  }

  if (options.filter === "positive") rows = rows.filter((r) => r.stars >= 4);
  else if (options.filter === "negative") rows = rows.filter((r) => r.stars <= 2);
  else if (options.filter === "neutral") rows = rows.filter((r) => r.stars === 3);

  const total = rows.length;
  const reviews = rows.slice(options.offset, options.offset + options.limit);
  return { reviews, total };
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
  };
}
