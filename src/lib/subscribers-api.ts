import { apiUrl } from "@/lib/api-base";

export type SubscriberRow = {
  id: number;
  email: string;
  createdAt: string;
};

export async function subscribeEmail(email: string): Promise<{ ok: true; message: string }> {
  const res = await fetch(apiUrl("/api/subscribe"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Subscription failed.");
  }
  return data as { ok: true; message: string };
}

export async function adminLogin(password: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/api/admin/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
  } catch {
    throw new Error("Cannot reach API. Run pnpm dev (web + api) or pnpm start, then try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Login failed.");
  }
  return data.token as string;
}

export async function fetchSubscribers(token: string): Promise<SubscriberRow[]> {
  const res = await fetch(apiUrl("/api/admin/subscribers"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not load subscribers.");
  }
  return (data.subscribers ?? []) as SubscriberRow[];
}

export async function deleteSubscriber(token: string, id: number): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/subscribers/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not delete.");
  }
}

export const ADMIN_TOKEN_KEY = "solid_one_admin_token";
