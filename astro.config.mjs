import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://alienor.fr",
  integrations: [mdx(), tailwind()],
  trailingSlash: "never",
  output: "hybrid",
  adapter: cloudflare()
});