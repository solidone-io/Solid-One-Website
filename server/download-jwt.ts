import { createHmac, timingSafeEqual } from "crypto";

export type DownloadSession = {
  sub: string;
  name: string;
  picture: string;
  email: string;
};

function b64url(data: string): string {
  return Buffer.from(data, "utf8").toString("base64url");
}

function fromB64url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf8");
}

export function signDownloadSession(user: DownloadSession, secret: string, days = 30): string {
  const payload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + days * 86400,
  };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyDownloadSession(token: string, secret: string): DownloadSession | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  let payload: DownloadSession & { exp?: number };
  try {
    payload = JSON.parse(fromB64url(body)) as DownloadSession & { exp?: number };
  } catch {
    return null;
  }
  if (!payload.sub || !payload.name) return null;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return {
    sub: payload.sub,
    name: payload.name,
    picture: payload.picture ?? "",
    email: payload.email ?? "",
  };
}
