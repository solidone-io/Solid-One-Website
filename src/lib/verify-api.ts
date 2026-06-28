import { apiUrl } from "@/lib/api-base";

export type VerifiedChannel = {
  id: string;
  kind: "x" | "telegram" | "email" | "domain";
  role: "official" | "founding-team";
  displayName: string;
  handle: string;
  url: string;
  subtitle: string | null;
  avatarUrl: string | null;
  verified: boolean;
};

export type VerifyResult =
  | { verified: true; query: string; channel: VerifiedChannel }
  | { verified: false; query: string; message: string };

export async function verifyChannel(query: string): Promise<VerifyResult> {
  const q = encodeURIComponent(query.trim());
  const res = await fetch(apiUrl(`/api/verify?q=${q}`));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Verification failed.");
  }
  if (data.verified && data.channel) {
    return { verified: true, query: data.query ?? query, channel: data.channel as VerifiedChannel };
  }
  return {
    verified: false,
    query: data.query ?? query,
    message: data.message ?? "Not an official Solid One channel.",
  };
}

export async function fetchOfficialChannelLists(): Promise<{
  official: VerifiedChannel[];
  foundingTeam: VerifiedChannel[];
}> {
  const res = await fetch(apiUrl("/api/verify/channels"));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not load channels.");
  }
  return {
    official: (data.official ?? []) as VerifiedChannel[],
    foundingTeam: (data.foundingTeam ?? []) as VerifiedChannel[],
  };
}
