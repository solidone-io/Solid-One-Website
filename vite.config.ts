import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { storeNotifyDevPlugin } from "./vite-plugin-store-notify";

function whitepaperPdfPlugin() {
  return {
    name: "whitepaper-pdf",
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void } }) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split("?")[0];
        if (path === "/whitepaper" || path === "/whitepaper/") {
          req.url = `/whitepaper.pdf${req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
        }
        next();
      });
    },
    configurePreviewServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void } }) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split("?")[0];
        if (path === "/whitepaper" || path === "/whitepaper/") {
          req.url = `/whitepaper.pdf${req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
        }
        next();
      });
    },
  };
}

const rawPort = process.env.PORT ?? "5173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), storeNotifyDevPlugin(), whitepaperPdfPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: `http://127.0.0.1:${process.env.API_PORT ?? "3001"}`,
        changeOrigin: true,
        bypass(req) {
          const url = req.url ?? "";
          if (
            url.startsWith("/api/subscribe") ||
            url.startsWith("/api/admin/subscribers") ||
            url.startsWith("/api/store-notify") ||
            url.startsWith("/api/admin/store-notify") ||
            url.startsWith("/api/support") ||
            url.startsWith("/api/admin/support") ||
            url === "/api/admin/login"
          ) {
            return false;
          }
        },
      },
      "/uploads": {
        target: `http://127.0.0.1:${process.env.API_PORT ?? "3001"}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
