import https from "node:https";

function devInsecureTls(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DOWNLOAD_DEV_INSECURE_TLS?.trim() === "1"
  );
}

function httpsGetInsecure(url: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https
      .get(
        {
          hostname: u.hostname,
          path: `${u.pathname}${u.search}`,
          rejectUnauthorized: false,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          res.on("end", () => {
            resolve(
              new Response(Buffer.concat(chunks), {
                status: res.statusCode ?? 500,
                headers: {
                  "content-type": String(res.headers["content-type"] ?? "application/json"),
                },
              }),
            );
          });
        },
      )
      .on("error", reject);
  });
}

/** Fetch Google APIs; optional dev bypass when local SSL inspection breaks certificate chain. */
export function fetchGoogle(url: string): Promise<Response> {
  if (devInsecureTls()) return httpsGetInsecure(url);
  return fetch(url);
}

export function googleFetchSslHint(cause: unknown): string | null {
  const code =
    cause && typeof cause === "object" && "code" in cause
      ? String((cause as { code: string }).code)
      : "";
  if (code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" || code === "CERT_HAS_EXPIRED") {
    return "Local SSL inspection is blocking Google. Add DOWNLOAD_DEV_INSECURE_TLS=1 to .env (dev only), restart pnpm run dev, or fix antivirus HTTPS scanning.";
  }
  return null;
}
