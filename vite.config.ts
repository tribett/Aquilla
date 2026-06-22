import { defineConfig } from "vite";

const pagesBase = process.env.GITHUB_PAGES === "true" ? "/Aquilla/" : "/";

export default defineConfig({
  base: process.env.ELECTRON === "true" ? "./" : pagesBase,
  server: {
    host: true,
    port: 5173,
    open: "/",
  },
});
