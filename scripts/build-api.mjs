import { build } from "esbuild";

await build({
  entryPoints: ["api-src/index.ts"],
  bundle: true,
  outfile: "api/index.js",
  platform: "node",
  target: "node20",
  format: "esm",
  packages: "external",
  logLevel: "info",
});
