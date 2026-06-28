import {
  lookupOfficialChannel,
  OFFICIAL_CHANNELS,
  serializeChannel,
  type OfficialChannel,
} from "./official-channels.js";

async function fetchXProfileName(handle: string): Promise<string | null> {
  try {
    const url = `https://publish.twitter.com/oembed?url=${encodeURIComponent(`https://x.com/${handle}`)}&omit_script=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { author_name?: string };
    return typeof data.author_name === "string" ? data.author_name.trim() : null;
  } catch {
    return null;
  }
}

async function enrichChannel(channel: OfficialChannel) {
  if (channel.kind !== "x") {
    return serializeChannel(channel);
  }
  const liveName = await fetchXProfileName(channel.handle);
  return serializeChannel(channel, liveName ? { displayName: liveName } : undefined);
}

export async function handleVerifyChannelGet(
  query: Record<string, string | string[] | undefined>,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const raw = typeof query.q === "string" ? query.q : typeof query.query === "string" ? query.query : "";
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      status: 200,
      json: {
        ok: true,
        verified: false,
        query: "",
        message: "Enter an X handle, Telegram username, email, or domain to verify.",
      },
    };
  }

  const match = lookupOfficialChannel(trimmed);
  if (!match) {
    return {
      status: 200,
      json: {
        ok: true,
        verified: false,
        query: trimmed,
        message: "This channel is not listed as an official Solid One account. Do not share keys, seed phrases, or payments.",
      },
    };
  }

  const channel = await enrichChannel(match);
  return {
    status: 200,
    json: {
      ok: true,
      verified: true,
      query: trimmed,
      channel,
    },
  };
}

export async function handleVerifyChannelsListGet(): Promise<{ status: number; json: Record<string, unknown> }> {
  const official = OFFICIAL_CHANNELS.filter((c) => c.role === "official").map((c) => serializeChannel(c));
  const foundingTeam = OFFICIAL_CHANNELS.filter((c) => c.role === "founding-team").map((c) => serializeChannel(c));
  return {
    status: 200,
    json: { ok: true, official, foundingTeam },
  };
}
