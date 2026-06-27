import { apiUrl, mediaUrl } from "@/lib/api-base";

export type StorePlatform = "apple" | "google";

export type StoreNotifyRow = {
  id: number;
  email: string;
  platform: StorePlatform;
  createdAt: string;
};

export async function submitStoreNotify(
  email: string,
  platform: StorePlatform,
): Promise<{ ok: true; message: string }> {
  const res = await fetch(apiUrl("/api/store-notify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, platform }),
  });
  let data: { error?: string; message?: string } = {};
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(
        res.status === 502 || res.status === 504
          ? "Server is unavailable. Restart dev (pnpm run dev) and try again."
          : "Could not reach the server. Please try again.",
      );
    }
  }
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not save your request.");
  }
  return data as { ok: true; message: string };
}

export async function fetchStoreNotifySignups(token: string): Promise<StoreNotifyRow[]> {
  const res = await fetch(apiUrl("/api/admin/store-notify"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not load signups.");
  }
  return (data.signups ?? []) as StoreNotifyRow[];
}

export async function deleteStoreNotifySignup(token: string, id: number): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/store-notify/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not delete.");
  }
}

export function storePlatformLabel(platform: StorePlatform): string {
  return platform === "apple" ? "App Store" : "Google Play";
}
