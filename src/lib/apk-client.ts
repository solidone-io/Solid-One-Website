import { DOWNLOAD_APP } from "@/content/download-app";

export type ApkRelease = {
  packageName: string;
  versionCode: number;
  versionName: string;
  fileName: string;
  size: number;
  downloadPath: string;
};

export type LocalInstallState = {
  versionCode: number;
  versionName: string;
  status: "installed";
  updatedAt: string;
};

const LOCAL_KEY = "solid_one_apk_install";

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function getLocalInstallState(): LocalInstallState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalInstallState;
    if (parsed?.status !== "installed" || !parsed.versionCode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setLocalInstallState(release: Pick<ApkRelease, "versionCode" | "versionName">): void {
  localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify({
      versionCode: release.versionCode,
      versionName: release.versionName,
      status: "installed",
      updatedAt: new Date().toISOString(),
    } satisfies LocalInstallState),
  );
}

export function clearLocalInstallState(): void {
  localStorage.removeItem(LOCAL_KEY);
}

export function openAndroidApp(packageName = DOWNLOAD_APP.androidPackage): void {
  window.location.href = `intent://#Intent;package=${packageName};action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`;
}

export function openAndroidUninstall(packageName = DOWNLOAD_APP.androidPackage): void {
  window.location.href = `intent://#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;data=package:${packageName};end`;
}

export async function probeAndroidAppInstalled(packageName = DOWNLOAD_APP.androidPackage): Promise<boolean> {
  if (!isAndroidDevice()) return false;

  if ("getInstalledRelatedApps" in navigator) {
    try {
      const apps = await (
        navigator as Navigator & {
          getInstalledRelatedApps: () => Promise<Array<{ id?: string; platform?: string }>>;
        }
      ).getInstalledRelatedApps();
      if (apps.some((a) => a.id === packageName || a.platform === "play")) return true;
    } catch {
      /* ignore */
    }
  }

  return Boolean(getLocalInstallState());
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

export async function downloadApkWithProgress(
  url: string,
  onProgress: (percent: number, loaded: number, total: number) => void,
  fallback?: { versionCode: number; versionName: string },
): Promise<{ blob: Blob; versionCode: number; versionName: string }> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Download failed. Try again in a moment.");
  }

  const total = Number(res.headers.get("content-length") ?? 0);
  const versionCode = Number(res.headers.get("x-apk-version-code") ?? 0) || fallback?.versionCode || 0;
  const versionName = res.headers.get("x-apk-version-name") ?? fallback?.versionName ?? "";

  if (!res.body) throw new Error("Download stream unavailable.");

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
    onProgress(percent, loaded, total);
  }

  onProgress(100, loaded, total || loaded);
  const blob = new Blob(chunks as BlobPart[], { type: "application/vnd.android.package-archive" });
  return { blob, versionCode, versionName };
}

export function triggerApkSave(blob: Blob, fileName: string): void {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
}
