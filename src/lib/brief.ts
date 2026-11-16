import { formatEuro, TRANCHES } from "./referentials";
import { companyAge, isExecutive, oldestExecutiveAge } from "./scoring";
import type { ScoredCompany } from "./types";

export function factSheet(c: ScoredCompany): string {
  const execs = c.dirigeants.filter(isExecutive).map((d) => `${d.prenoms ?? ""} ${d.nom ?? d.denomination ?? ""} (${d.qualite})`.trim());
  const fin = c.financials.map((f) => `${f.year}: CA ${formatEuro(f.ca)}, RN ${formatEuro(f.resultatNet)}`).join(" | ");
  return [
    `Société: ${c.nom} (SIREN ${c.siren})`,
    `Activité NAF: ${c.naf ?? "?"} — Catégorie: ${c.categorie ?? "?"} — Effectif: ${TRANCHES[c.trancheEffectif ?? ""] ?? "?"}`,
    `Siège: ${c.adresse ?? "?"}`,
    `Âge de l'entreprise: ${companyAge(c) ?? "?"} ans — Âge du dirigeant le plus âgé: ${oldestExecutiveAge(c) ?? "?"} ans`,
    `Dirigeants: ${execs.join(", ") || "?"}`,
    `Financiers: ${fin || "non publiés"}`,
    `Score de cessibilité: ${c.score}/100 — Signaux: ${c.signals.map((s) => s.label).join("; ")}`,
  ].join("\n");
}

/** Deterministic fallback used when no LLM is configured, so the app always works. */
export function templateBrief(c: ScoredCompany): string {
  const age = oldestExecutiveAge(c);
  const exec = c.dirigeants.find((d) => isExecutive(d) && d.type === "personne physique");
  const civil = exec?.nom ? `Madame, Monsieur ${exec.nom.split(" ")[0]}` : "Madame, Monsieur";
  return `## Fiche cible — ${c.nom}

${factSheet(c)}

### Thèse
${c.signals.filter((s) => s.points > 0).map((s) => `- ${s.label}`).join("\n") || "- À qualifier"}

### Points de vigilance
${c.signals.filter((s) => s.points < 0).map((s) => `- ${s.label}`).join("\n") || "- Aucun signal négatif détecté sur les données publiques"}

### Email d'approche
Objet : ${c.nom} — échange confidentiel

${civil},

J'accompagne des dirigeants de PME dans leurs réflexions stratégiques (ouverture du capital, transmission, croissance externe). Le parcours de ${c.nom}${companyAge(c) ? `, depuis plus de ${companyAge(c)} ans,` : ""} a retenu notre attention.
${age && age >= 58 ? "Beaucoup de dirigeants dans votre situation souhaitent anticiper la transmission plusieurs années à l'avance, à leur rythme." : "Nous échangeons régulièrement avec des investisseurs et industriels intéressés par votre secteur."}

Seriez-vous ouvert à un échange de 20 minutes, en toute confidentialité ?

Bien cordialement,`;
}
