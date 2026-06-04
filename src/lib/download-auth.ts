import type { DownloadUser } from "@/lib/download-api";

export const DOWNLOAD_AUTH_KEY = "solid_one_download_auth";

export type StoredDownloadAuth = {
  token: string;
  user: DownloadUser;
};

export function getDownloadAuth(): StoredDownloadAuth | null {
  try {
    const raw = sessionStorage.getItem(DOWNLOAD_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDownloadAuth;
    if (!parsed?.token || !parsed?.user?.sub) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getDownloadAuthToken(): string | null {
  return getDownloadAuth()?.token ?? null;
}

export function setDownloadAuth(auth: StoredDownloadAuth): void {
  sessionStorage.setItem(DOWNLOAD_AUTH_KEY, JSON.stringify(auth));
  window.dispatchEvent(new CustomEvent("solid-one-download-auth"));
}

export function clearDownloadAuth(): void {
  sessionStorage.removeItem(DOWNLOAD_AUTH_KEY);
  window.dispatchEvent(new CustomEvent("solid-one-download-auth"));
}
