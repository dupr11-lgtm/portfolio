import { pagesEn } from "@/data/site";

const site = "https://duparc.studio";

export function GET() {
  const liens = pagesEn("fr").map((p) => `- [${p.titre}](${site}${p.url}): ${p.an}${p.meta ? ` - ${p.meta}` : ""}`);
  const body = `# Aliénor du Parc\n\n> Portfolio d'Aliénor du Parc, étudiante en master d'architecture à l'ULB, à Bruxelles. Le site existe en français et en anglais (préfixe /en).\n\n## Projets\n\n${liens.join("\n")}\n\n## Récit\n\n- [14 minutes et 16 heures](${site}/livre/ivresse): récit, 2021, en français\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
