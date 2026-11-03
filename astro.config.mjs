import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://duparc.studio",
  integrations: [mdx()],
  devToolbar: { enabled: false },
  trailingSlash: "never",
  vite: {
    server: {
      // Dev server only: accept any Host header (e.g. Tailscale hostnames).
      allowedHosts: true,
    },
  },
});
