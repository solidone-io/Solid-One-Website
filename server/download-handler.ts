import { z } from "zod";
import { fetchGoogle, googleFetchSslHint } from "./google-fetch.js";
import { signDownloadSession, verifyDownloadSession, type DownloadSession } from "./download-jwt.js";
import {
  addReview,
  clearAdminReviewReply,
  flagReview,
  getDownloadStats,
  getReviewByUser,
  listAllReviewsAdmin,
  listInstalls,
  listReviews,
  recordInstall,
  serializeInstall,
  serializeReview,
  serializeReviewAdmin,
  setAdminReviewReply,
  setReviewHelpful,
} from "./download-store.js";
import { getApkReleaseInfo, streamApkFile } from "./apk-release.js";

function jwtSecret(): string {
  return (
    process.env.DOWNLOAD_JWT_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "solidone-download-dev-secret"
  );
}

function googleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID?.trim() || process.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
}

export function sessionFromAuthHeader(authHeader: string | undefined): DownloadSession | null {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;
  return verifyDownloadSession(token, jwtSecret());
}

function validationError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request.";
}

function audienceMatches(payload: { aud?: string; azp?: string }, clientId: string): boolean {
  if (!clientId) return false;
  if (payload.azp === clientId) return true;
  if (payload.aud === clientId) return true;
  if (payload.aud?.split(",").map((s) => s.trim()).includes(clientId)) return true;
  return false;
}

type VerifyResult =
  | { ok: true; user: DownloadSession }
  | { ok: false; error: string };

function decodeGoogleIdTokenPayload(idToken: string): {
  sub?: string;
  name?: string;
  picture?: string;
  email?: string;
} | null {
  try {
    const part = idToken.split(".")[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as {
      sub?: string;
      name?: string;
      picture?: string;
      email?: string;
    };
  } catch {
    return null;
  }
}

export async function verifyGoogleIdToken(idToken: string): Promise<VerifyResult> {
  const clientId = googleClientId();
  if (!clientId) {
    return { ok: false, error: "GOOGLE_CLIENT_ID is missing in server .env — restart pnpm run dev." };
  }

  const endpoints = [
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  ];

  let lastError = "Google could not verify the sign-in token.";

  for (const url of endpoints) {
    let res: Response;
    try {
      res = await fetchGoogle(url);
    } catch (err) {
      const sslHint = googleFetchSslHint(err instanceof Error ? err.cause : err);
      return {
        ok: false,
        error: sslHint ?? "Server cannot reach Google. Check your internet connection and try again.",
      };
    }

    const data = (await res.json().catch(() => ({}))) as {
      aud?: string;
      azp?: string;
      sub?: string;
      name?: string;
      picture?: string;
      email?: string;
      error_description?: string;
      error?: string;
    };

    if (!res.ok) {
      lastError =
        data.error_description ||
        data.error ||
        `Google rejected the token (${res.status}). Sign in again from http://localhost:5173/download`;
      continue;
    }

    if (!data.sub) {
      lastError = "Google token is missing user id.";
      continue;
    }

    if (!audienceMatches(data, clientId)) {
      return {
        ok: false,
        error: `Client ID mismatch. Console has ${clientId.slice(0, 12)}… but token aud=${data.aud ?? "?"} azp=${data.azp ?? "?"}. Check .env matches Google Console exactly.`,
      };
    }

    const claims = decodeGoogleIdTokenPayload(idToken);
    return {
      ok: true,
      user: {
        sub: data.sub,
        name: data.name ?? claims?.name ?? "User",
        picture: data.picture ?? claims?.picture ?? "",
        email: data.email ?? claims?.email ?? "",
      },
    };
  }

  return { ok: false, error: lastError };
}

export async function handleDownloadGoogleAuth(
  body: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const parsed = z.object({ credential: z.string().min(10) }).safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError(parsed.error) } };
  }

  const verified = await verifyGoogleIdToken(parsed.data.credential);
  if (!verified.ok) {
    return { status: 401, json: { error: verified.error } };
  }

  const token = signDownloadSession(verified.user, jwtSecret());
  return { status: 200, json: { ok: true, token, user: verified.user } };
}

export async function handleDownloadStatsGet(): Promise<{ status: number; json: Record<string, unknown> }> {
  const stats = await getDownloadStats();
  return { status: 200, json: { ok: true, stats } };
}

export async function handleDownloadInstall(
  session: DownloadSession | null,
  body?: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  if (!session) return { status: 401, json: { error: "Sign in required." } };
  const parsed = z
    .object({
      versionCode: z.number().int().positive().optional(),
      versionName: z.string().max(32).optional(),
    })
    .safeParse(body ?? {});
  const version = parsed.success ? parsed.data : undefined;
  try {
    const result = await recordInstall(session, version);
    return {
      status: 200,
      json: { ok: true, alreadyInstalled: result.alreadyInstalled, stats: result.stats },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save install.";
    console.error("recordInstall failed:", err);
    return {
      status: 503,
      json: {
        error: message.includes("Blob") || message.includes("BLOB")
          ? "Server storage error. Try again in a moment."
          : message,
      },
    };
  }
}

export async function handleDownloadReleaseGet(): Promise<{ status: number; json: Record<string, unknown> }> {
  const release = await getApkReleaseInfo();
  if (!release) {
    return { status: 404, json: { error: "APK release not configured on server." } };
  }
  return { status: 200, json: { ok: true, release } };
}

export function handleDownloadApkGet(
  session: DownloadSession | null,
  res: import("express").Response,
): void {
  if (!session) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }
  streamApkFile(res);
}

export async function handleDownloadMyReviewGet(
  session: DownloadSession | null,
): Promise<{ status: number; json: Record<string, unknown> }> {
  if (!session) return { status: 401, json: { error: "Sign in required." } };
  const review = await getReviewByUser(session.sub);
  return {
    status: 200,
    json: { ok: true, review: review ? serializeReview(review) : null },
  };
}

export async function handleDownloadReviewsGet(
  query: Record<string, string | string[] | undefined>,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 5));
  const offset = Math.max(0, Number(query.offset) || 0);
  const filterRaw = typeof query.filter === "string" ? query.filter : "all";
  const filter =
    filterRaw === "positive" || filterRaw === "negative" || filterRaw === "neutral"
      ? filterRaw
      : "all";
  const search = typeof query.search === "string" ? query.search : undefined;

  const { reviews, total } = await listReviews({ limit, offset, filter, search });
  const stats = await getDownloadStats();
  return {
    status: 200,
    json: {
      ok: true,
      reviews: reviews.map(serializeReview),
      total,
      stats,
    },
  };
}

export async function handleDownloadReviewPost(
  session: DownloadSession | null,
  body: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  if (!session) return { status: 401, json: { error: "Sign in required." } };
  const parsed = z
    .object({
      stars: z.number().int().min(1).max(5),
      text: z.string().max(500).optional().default(""),
    })
    .safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError(parsed.error) } };
  }

  try {
    const result = await addReview({
      googleSub: session.sub,
      userEmail: session.email,
      userName: session.name,
      userPicture: session.picture,
      stars: parsed.data.stars,
      text: parsed.data.text,
    });
    if (!result.ok) {
      return { status: 409, json: { error: "error" in result ? result.error : "Review failed." } };
    }
    const stats = await getDownloadStats();
    return {
      status: 200,
      json: { ok: true, review: serializeReview(result.review), stats },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save review.";
    console.error("addReview failed:", err);
    return {
      status: 503,
      json: {
        error: message.includes("Blob") || message.includes("BLOB")
          ? "Server storage error. Try again in a moment."
          : message,
      },
    };
  }
}

export async function handleDownloadReviewHelpful(
  session: DownloadSession | null,
  reviewId: number,
  body: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  if (!session) return { status: 401, json: { error: "Sign in required." } };
  const parsed = z.object({ helpful: z.boolean() }).safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError(parsed.error) } };
  }
  const result = await setReviewHelpful(reviewId, session.sub, parsed.data.helpful);
  if (!result.ok) {
    return { status: 400, json: { error: result.error ?? "Could not record vote." } };
  }
  return { status: 200, json: { ok: true } };
}

export async function handleDownloadReviewFlag(
  reviewId: number,
  body: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const parsed = z.object({ reason: z.enum(["spam", "inappropriate"]) }).safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError(parsed.error) } };
  }
  await flagReview(reviewId, parsed.data.reason);
  const stats = await getDownloadStats();
  return { status: 200, json: { ok: true, stats } };
}

export async function handleAdminInstallsList(): Promise<{ status: number; json: Record<string, unknown> }> {
  const installs = await listInstalls();
  const stats = await getDownloadStats();
  return {
    status: 200,
    json: { ok: true, installs: installs.map(serializeInstall), stats },
  };
}

export async function handleAdminReviewsList(): Promise<{ status: number; json: Record<string, unknown> }> {
  const reviews = await listAllReviewsAdmin();
  const stats = await getDownloadStats();
  return {
    status: 200,
    json: { ok: true, reviews: reviews.map(serializeReviewAdmin), stats },
  };
}

export async function handleAdminReviewReply(
  reviewId: number,
  body: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const parsed = z.object({ text: z.string().max(1000) }).safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: validationError(parsed.error) } };
  }
  const result = await setAdminReviewReply(reviewId, parsed.data.text);
  if (!result.ok) {
    return { status: 400, json: { error: result.error } };
  }
  return { status: 200, json: { ok: true, review: serializeReviewAdmin(result.review) } };
}

export async function handleAdminReviewReplyDelete(
  reviewId: number,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const result = await clearAdminReviewReply(reviewId);
  if (!result.ok) {
    return { status: 404, json: { error: result.error } };
  }
  return { status: 200, json: { ok: true, review: serializeReviewAdmin(result.review) } };
}
