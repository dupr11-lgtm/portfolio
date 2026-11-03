import { slugs } from "@/data/site";

const site = "https://duparc.studio";

export function GET() {
  const chemins = ["/", "/en", "/livre/ivresse", "/en/livre/ivresse", ...slugs().flatMap((s) => [`/post/${s}`, `/en/post/${s}`])];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chemins.map((c) => `  <url><loc>${site}${c}</loc></url>`).join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
