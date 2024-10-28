import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const port = parseInt(process.env.PORT || "3000", 10);

const AUTH_AUTHORITY = process.env.AUTH_AUTHORITY;
const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID;

export default defineConfig({
  appType: "spa",
  define: {
    "window.ENV": {
      AUTH_AUTHORITY,
      AUTH_CLIENT_ID,
    },
  },
  plugins: [
    remix({
      ssr: false,
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    port,
    hmr: {
      port: 24678,
    },
    proxy: {
      "/api": {
        target: "http://backend:8081",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/auth": {
        target: "http://backend:8080/auth",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, ""),
      },
    },
  },
});
