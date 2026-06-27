import { createHash } from "crypto";
import { createReadStream, existsSync, readFileSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Response } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const APK_PACKAGE = "io.solidone.app";
export const APK_VERSION_CODE = Number(process.env.APK_VERSION_CODE ?? "4") || 4;
export const APK_VERSION_NAME = (process.env.APK_VERSION_NAME ?? "1.0.6").trim() || "1.0.6";
export const APK_FILE_NAME = "solid-one.apk";
/** Served as a static asset (Vercel CDN) — avoids the 4.5 MB serverless response limit. */
export const APK_PUBLIC_PATH = `/releases/${APK_FILE_NAME}`;

export type ApkReleaseInfo = {
  packageName: string;
  versionCode: number;
  versionName: string;
  fileName: string;
  size: number;
  downloadPath: string;
};

let sha256Cache: string | null = null;

export function resolveApkPath(): string {
  const fromEnv = process.env.APK_PATH?.trim();
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  return path.resolve(__dirname, "..", "public", "releases", APK_FILE_NAME);
}

function sha256OfFile(filePath: string): string {
  if (sha256Cache) return sha256Cache;
  sha256Cache = createHash("sha256").update(readFileSync(filePath)).digest("hex");
  return sha256Cache;
}

export async function getApkReleaseInfo(): Promise<ApkReleaseInfo | null> {
  const filePath = resolveApkPath();
  if (!existsSync(filePath)) return null;

  const stat = statSync(filePath);

  return {
    packageName: APK_PACKAGE,
    versionCode: APK_VERSION_CODE,
    versionName: APK_VERSION_NAME,
    fileName: APK_FILE_NAME,
    size: stat.size,
    downloadPath: APK_PUBLIC_PATH,
  };
}

export function streamApkFile(res: Response): void {
  const filePath = resolveApkPath();
  if (!existsSync(filePath)) {
    res.status(404).json({ error: "APK not found on server." });
    return;
  }

  const stat = statSync(filePath);
  const sha256 = sha256OfFile(filePath);

  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader("Content-Disposition", `attachment; filename="${APK_FILE_NAME}"`);
  res.setHeader("Content-Length", String(stat.size));
  res.setHeader("X-APK-Version-Code", String(APK_VERSION_CODE));
  res.setHeader("X-APK-Version-Name", APK_VERSION_NAME);
  res.setHeader("X-APK-SHA256", sha256);

  createReadStream(filePath).pipe(res);
}
