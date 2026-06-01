import { build } from "esbuild";
import { rmSync } from "fs";

for (const file of ["server/app.js", "server/persistent-json.js"]) {
  try {
    rmSync(file);
  } catch {
    /* ignore */
  }
}

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
