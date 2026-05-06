import { getCollection } from "astro:content";

const site = "https://duparc.studio";

const toAbsolute = (pathname: string) => `${site}${pathname}`;

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export async function GET() {
  const posts = await getCollection("posts");

  const postUrls = posts
    .map((post) => post.slug)
    .filter((slug) => !slug.endsWith(".md"))
    .map((slug) => toAbsolute(`/post/${slug}`));

  const urls = [
    toAbsolute("/"),
    toAbsolute("/livre/ivresse"),
    ...postUrls,
  ];

  const uniqueUrls = Array.from(new Set(urls));

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniqueUrls
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join("\n")}\n</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
