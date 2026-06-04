/** True on Vercel serverless (VERCEL may be unset in some runtimes; VERCEL_ENV is always set there). */
export function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}
