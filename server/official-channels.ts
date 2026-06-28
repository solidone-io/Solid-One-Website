export type ChannelKind = "x" | "telegram" | "email" | "domain";

export type ChannelRole = "official" | "founding-team";

export type OfficialChannel = {
  id: string;
  kind: ChannelKind;
  role: ChannelRole;
  /** Primary display name */
  displayName: string;
  /** @handle, email, domain, or invite slug */
  handle: string;
  url: string;
  subtitle?: string;
  avatarUrl?: string;
  /** Normalized strings that match this channel in search */
  aliases: string[];
};

function xAvatar(handle: string): string {
  return `https://unavatar.io/x/${encodeURIComponent(handle)}`;
}

function tgAvatar(username: string): string {
  return `https://unavatar.io/telegram/${encodeURIComponent(username)}`;
}

export const OFFICIAL_CHANNELS: OfficialChannel[] = [
  {
    id: "x-solidone",
    kind: "x",
    role: "official",
    displayName: "Solid One",
    handle: "solidone_co",
    url: "https://x.com/solidone_co",
    subtitle: "Official X account",
    avatarUrl: xAvatar("solidone_co"),
    aliases: [
      "solidone_co",
      "@solidone_co",
      "x.com/solidone_co",
      "twitter.com/solidone_co",
      "https://x.com/solidone_co",
      "https://twitter.com/solidone_co",
    ],
  },
  {
    id: "email-operations",
    kind: "email",
    role: "official",
    displayName: "Solid One Operations",
    handle: "operations@solidone.io",
    url: "mailto:operations@solidone.io",
    subtitle: "Official support & operations email",
    aliases: [
      "operations@solidone.io",
      "mailto:operations@solidone.io",
      "operations",
    ],
  },
  {
    id: "domain-solidone",
    kind: "domain",
    role: "official",
    displayName: "solidone.io",
    handle: "solidone.io",
    url: "https://solidone.io",
    subtitle: "Official website & app download",
    aliases: [
      "solidone.io",
      "www.solidone.io",
      "https://solidone.io",
      "https://www.solidone.io",
      "api.solidone.io",
      "https://api.solidone.io",
    ],
  },
  {
    id: "telegram-community",
    kind: "telegram",
    role: "official",
    displayName: "Solid One Community",
    handle: "Solid One Telegram",
    url: "https://t.me/+U3mdhWkbNcFmYTI8",
    subtitle: "Official Telegram community group",
    aliases: [
      "t.me/+u3mdhwkbncfmyti8",
      "https://t.me/+u3mdhwkbncfmyti8",
      "+u3mdhwkbncfmyti8",
      "solid one telegram",
      "solidone telegram",
      "telegram group",
    ],
  },
  {
    id: "x-soubhagya",
    kind: "x",
    role: "founding-team",
    displayName: "Soubhagya",
    handle: "soubhagya_earth",
    url: "https://x.com/soubhagya_earth",
    subtitle: "Founding team · Driving web3 adoption with Solana",
    avatarUrl: xAvatar("soubhagya_earth"),
    aliases: [
      "soubhagya_earth",
      "@soubhagya_earth",
      "x.com/soubhagya_earth",
      "https://x.com/soubhagya_earth",
      "soubhagya",
    ],
  },
  {
    id: "tg-soubhagya",
    kind: "telegram",
    role: "founding-team",
    displayName: "Soubhagya",
    handle: "Soubhagyaweb3",
    url: "https://t.me/Soubhagyaweb3",
    subtitle: "Founding team · Telegram",
    avatarUrl: tgAvatar("Soubhagyaweb3"),
    aliases: [
      "soubhagyaweb3",
      "@soubhagyaweb3",
      "t.me/soubhagyaweb3",
      "https://t.me/soubhagyaweb3",
    ],
  },
  {
    id: "tg-ashutosh",
    kind: "telegram",
    role: "founding-team",
    displayName: "Ashutosh",
    handle: "Ashutoshweb3",
    url: "https://t.me/Ashutoshweb3",
    subtitle: "Founding team · Telegram",
    avatarUrl: tgAvatar("Ashutoshweb3"),
    aliases: [
      "ashutoshweb3",
      "@ashutoshweb3",
      "t.me/ashutoshweb3",
      "https://t.me/ashutoshweb3",
      "ashutosh",
    ],
  },
  {
    id: "tg-gourishankar",
    kind: "telegram",
    role: "founding-team",
    displayName: "Gourishankar",
    handle: "Gourishankar_web3",
    url: "https://t.me/Gourishankar_web3",
    subtitle: "Founding team · Telegram",
    avatarUrl: tgAvatar("Gourishankar_web3"),
    aliases: [
      "gourishankar_web3",
      "@gourishankar_web3",
      "t.me/gourishankar_web3",
      "https://t.me/gourishankar_web3",
      "gourishankar",
    ],
  },
];

export function normalizeVerifyQuery(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const candidates = new Set<string>();
  const lower = trimmed.toLowerCase();
  candidates.add(lower);
  candidates.add(lower.replace(/^@/, ""));

  if (lower.startsWith("mailto:")) {
    candidates.add(lower.slice(7));
  }

  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProto);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    candidates.add(host);
    candidates.add(`${host}${url.pathname === "/" ? "" : url.pathname.toLowerCase()}`);

    if (host === "x.com" || host === "twitter.com") {
      const seg = url.pathname.split("/").filter(Boolean);
      const handle = seg[0] === "i" ? seg[1] : seg[0];
      if (handle) {
        candidates.add(handle.toLowerCase());
        candidates.add(`@${handle.toLowerCase()}`);
      }
    }

    if (host === "t.me" || host === "telegram.me") {
      const path = url.pathname.replace(/^\//, "").toLowerCase();
      if (path) {
        candidates.add(path);
        candidates.add(`t.me/${path}`);
        candidates.add(`https://t.me/${path}`);
        if (!path.startsWith("+")) {
          candidates.add(path.replace(/^@/, ""));
        }
      }
    }
  } catch {
    /* not a URL */
  }

  return [...candidates].filter(Boolean);
}

export function lookupOfficialChannel(query: string): OfficialChannel | null {
  const keys = normalizeVerifyQuery(query);
  if (!keys.length) return null;

  for (const channel of OFFICIAL_CHANNELS) {
    const aliasSet = new Set(
      channel.aliases.flatMap((a) => normalizeVerifyQuery(a).map((k) => k.toLowerCase())),
    );
    aliasSet.add(channel.handle.toLowerCase());
    aliasSet.add(channel.id.toLowerCase());
    if (channel.kind === "x") {
      aliasSet.add(`@${channel.handle.toLowerCase()}`);
    }

    for (const key of keys) {
      if (aliasSet.has(key.toLowerCase())) return channel;
    }
  }

  return null;
}

export function serializeChannel(channel: OfficialChannel, extras?: { displayName?: string }) {
  return {
    id: channel.id,
    kind: channel.kind,
    role: channel.role,
    displayName: extras?.displayName ?? channel.displayName,
    handle: channel.handle,
    url: channel.url,
    subtitle: channel.subtitle ?? null,
    avatarUrl: channel.avatarUrl ?? null,
    verified: true,
  };
}
