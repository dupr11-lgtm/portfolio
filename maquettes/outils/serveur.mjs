// Sert les maquettes telles quelles, sans Astro : node maquettes/outils/serveur.mjs [port]
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

const RACINE = resolve(import.meta.dirname, "../..");
const PORT = +process.argv[2] || 4000;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg", ".pdf": "application/pdf", ".ico": "image/x-icon",
};

createServer((req, res) => {
  const fin = (code) => { res.writeHead(code).end(); };
  let chemin;
  try { chemin = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch { return fin(400); }
  if (chemin === "/") { res.writeHead(302, { Location: "/maquettes/l-nuit.html" }); return res.end(); }

  // Seuls ces deux dossiers sont servis
  const fichier = join(RACINE, chemin);
  if (!fichier.startsWith(join(RACINE, "maquettes") + "/") && !fichier.startsWith(join(RACINE, "public") + "/")) return fin(404);
  let infos;
  try { infos = statSync(fichier); } catch { return fin(404); }
  if (!infos.isFile()) return fin(404);

  const etag = `"${infos.size}-${infos.mtimeMs}"`;
  const entetes = { "Content-Type": TYPES[extname(fichier).toLowerCase()] || "application/octet-stream", "Accept-Ranges": "bytes", "Cache-Control": "no-cache", ETag: etag };
  if (req.headers["if-none-match"] === etag) { res.writeHead(304, entetes); return res.end(); }

  // Les plages d'octets permettent d'avancer dans le podcast
  const plage = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if (plage && (plage[1] || plage[2])) {
    const debut = plage[1] ? +plage[1] : Math.max(0, infos.size - +plage[2]);
    const dernier = plage[1] && plage[2] ? Math.min(+plage[2], infos.size - 1) : infos.size - 1;
    if (debut > dernier) { res.writeHead(416, { "Content-Range": `bytes */${infos.size}` }); return res.end(); }
    res.writeHead(206, { ...entetes, "Content-Length": dernier - debut + 1, "Content-Range": `bytes ${debut}-${dernier}/${infos.size}` });
    return req.method === "HEAD" ? res.end() : createReadStream(fichier, { start: debut, end: dernier }).pipe(res);
  }
  res.writeHead(200, { ...entetes, "Content-Length": infos.size });
  return req.method === "HEAD" ? res.end() : createReadStream(fichier).pipe(res);
}).listen(PORT, "127.0.0.1", () => console.log(`Maquettes : http://127.0.0.1:${PORT}/`));
