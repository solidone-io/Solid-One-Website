const API_BASE = "";

export type SupportRequestRow = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  starred: boolean;
  createdAt: string;
};

export type SupportFormInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function submitSupportRequest(
  input: SupportFormInput,
): Promise<{ ok: true; message: string }> {
  const res = await fetch(`${API_BASE}/api/support`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  let data: { error?: string; message?: string } = {};
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error("Could not reach the server. Please try again.");
    }
  }
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not send your message.");
  }
  return data as { ok: true; message: string };
}

export async function fetchSupportRequests(token: string): Promise<SupportRequestRow[]> {
  const res = await fetch(`${API_BASE}/api/admin/support`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not load support requests.");
  }
  return (data.requests ?? []) as SupportRequestRow[];
}

export async function toggleSupportRequestStar(
  token: string,
  id: number,
): Promise<SupportRequestRow> {
  const res = await fetch(`${API_BASE}/api/admin/support/${id}/star`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not update star.");
  }
  return data.request as SupportRequestRow;
}

export async function deleteSupportRequest(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/support/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not delete.");
  }
}
