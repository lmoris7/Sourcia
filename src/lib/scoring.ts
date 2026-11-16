import type { Company, Dirigeant, ScoredCompany, Signal } from "./types";

const EXEC_ROLES = /(président|gérant|directeur général|pdg|dirigeant)/i;

export const isExecutive = (d: Dirigeant) => !!d.qualite && EXEC_ROLES.test(d.qualite) && !/commissaire/i.test(d.qualite);

export function oldestExecutiveAge(c: Company, now = new Date()): number | null {
  const ages = c.dirigeants
    .filter((d) => d.type === "personne physique" && isExecutive(d) && d.anneeNaissance)
    .map((d) => now.getFullYear() - (d.anneeNaissance as number));
  return ages.length ? Math.max(...ages) : null;
}

export function companyAge(c: Company, now = new Date()): number | null {
  if (!c.dateCreation) return null;
  const created = new Date(c.dateCreation);
  return Number.isNaN(created.getTime()) ? null : now.getFullYear() - created.getFullYear();
}

/**
 * Explainable "likelihood to sell" score (0-100).
 * Every point comes from a named signal so the analyst can see *why* a target ranks high.
 */
export function scoreCompany(c: Company, now = new Date()): ScoredCompany {
  const signals: Signal[] = [];
  const add = (id: string, label: string, points: number) =>
    signals.push({ id, label, points, tone: points > 0 ? "positive" : points < 0 ? "negative" : "neutral" });

  const age = oldestExecutiveAge(c, now);
  if (age !== null) {
    if (age >= 65) add("succession", `Dirigeant de ${age} ans : enjeu de succession`, 35);
    else if (age >= 58) add("succession-soon", `Dirigeant de ${age} ans : transmission à anticiper`, 20);
    else if (age < 40) add("young-founder", `Dirigeant de ${age} ans`, -5);
  }

  const execs = c.dirigeants.filter(isExecutive);
  const corporateOwner = execs.find((d) => d.type === "personne morale");
  if (corporateOwner) add("holding", `Présidée par une personne morale (${corporateOwner.denomination ?? "holding"}) : groupe ou fonds déjà en place`, -15);
  else if (execs.length > 0 && execs.length <= 2) add("founder-led", "Gouvernance resserrée (1-2 dirigeants personnes physiques)", 10);

  const years = companyAge(c, now);
  if (years !== null) {
    if (years >= 25) add("mature", `Entreprise de ${years} ans`, 12);
    else if (years >= 12) add("established", `Entreprise de ${years} ans`, 7);
    else if (years < 4) add("young", `Entreprise récente (${years} ans)`, -10);
  }

  const [last, prev] = c.financials;
  if (last?.ca && last.resultatNet != null) {
    const margin = last.resultatNet / last.ca;
    if (margin >= 0.08) add("profitable", `Marge nette ${(margin * 100).toFixed(1)} %`, 12);
    else if (margin >= 0.02) add("break-even", `Marge nette ${(margin * 100).toFixed(1)} %`, 4);
    else if (margin < 0) add("loss", `Résultat négatif (${(margin * 100).toFixed(1)} %) : situation à analyser`, -8);
  } else {
    add("no-financials", "Comptes non publiés", 0);
  }
  if (last?.ca && prev?.ca) {
    const growth = last.ca / prev.ca - 1;
    if (growth >= 0.1) add("growth", `Croissance CA +${(growth * 100).toFixed(0)} %`, 8);
    else if (growth <= -0.1) add("decline", `CA en baisse ${(growth * 100).toFixed(0)} %`, -6);
  }

  if (c.categorie === "PME") add("pme", "PME : cœur du marché small/mid-cap", 5);
  if (c.oppositionProspection) add("opposition", "Opposition à la prospection commerciale : ne pas démarcher", 0);

  const raw = 30 + signals.reduce((s, x) => s + x.points, 0);
  return { ...c, score: Math.max(0, Math.min(100, raw)), signals };
}

export const rank = (companies: Company[], now = new Date()) =>
  companies.map((c) => scoreCompany(c, now)).sort((a, b) => b.score - a.score);
