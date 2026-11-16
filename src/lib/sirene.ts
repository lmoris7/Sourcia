import type { Company, Dirigeant, Financials, SearchFilters } from "./types";

/** Official French company register search (free, no key): https://recherche-entreprises.api.gouv.fr */
export const API_URL = "https://recherche-entreprises.api.gouv.fr/search";
const PER_PAGE = 25;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapCompany(raw: any): Company {
  const siege = raw.siege ?? {};
  const dirigeants: Dirigeant[] = (raw.dirigeants ?? []).map((d: any) => ({
    nom: d.nom ?? undefined,
    prenoms: d.prenoms ?? undefined,
    denomination: d.denomination ?? undefined,
    anneeNaissance: d.annee_de_naissance ? Number(d.annee_de_naissance) : undefined,
    qualite: d.qualite ?? undefined,
    type: d.type_dirigeant === "personne morale" ? "personne morale" : "personne physique",
  }));
  const financials: Financials[] = Object.entries(raw.finances ?? {})
    .map(([year, f]: [string, any]) => ({ year: Number(year), ca: f?.ca ?? null, resultatNet: f?.resultat_net ?? null }))
    .sort((a, b) => b.year - a.year);
  return {
    siren: raw.siren,
    nom: raw.nom_complet ?? raw.nom_raison_sociale ?? raw.siren,
    naf: raw.activite_principale ?? null,
    categorie: raw.categorie_entreprise ?? null,
    dateCreation: raw.date_creation ?? null,
    trancheEffectif: raw.tranche_effectif_salarie ?? null,
    adresse: siege.adresse ?? null,
    codePostal: siege.code_postal ?? null,
    commune: siege.libelle_commune ?? null,
    departement: siege.departement ?? null,
    dirigeants,
    financials,
    oppositionProspection: raw.opposition_diffusion_commerciale === true,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function buildQuery(f: SearchFilters, page = 1): URLSearchParams {
  const p = new URLSearchParams({ per_page: String(PER_PAGE), page: String(page), etat_administratif: "A" });
  if (f.q) p.set("q", f.q);
  if (f.naf?.length) p.set("activite_principale", f.naf.join(","));
  if (f.departements?.length) p.set("departement", f.departements.join(","));
  if (f.tranches?.length) p.set("tranche_effectif_salarie", f.tranches.join(","));
  if (f.caMin) p.set("ca_min", String(f.caMin));
  if (f.caMax) p.set("ca_max", String(f.caMax));
  if (f.categorie) p.set("categorie_entreprise", f.categorie);
  // The API requires at least one criterion; default to "has a NAF code" style broad search.
  if (![...p.keys()].some((k) => !["per_page", "page", "etat_administratif"].includes(k))) {
    p.set("categorie_entreprise", "PME");
  }
  return p;
}

/** Fetch several pages in parallel so ranking happens over a wider pool. */
export async function searchCompanies(f: SearchFilters, pages = 3): Promise<{ total: number; companies: Company[] }> {
  const responses = await Promise.all(
    Array.from({ length: pages }, (_, i) =>
      fetch(`${API_URL}?${buildQuery(f, i + 1)}`, { headers: { accept: "application/json" } }).then(async (r) => {
        if (r.status === 429) throw new Error("Limite de requêtes de l'API atteinte, réessayez dans quelques secondes.");
        if (!r.ok) return { total_results: 0, results: [] };
        return r.json();
      }),
    ),
  );
  const seen = new Set<string>();
  const companies: Company[] = [];
  for (const res of responses) {
    for (const raw of res.results ?? []) {
      if (seen.has(raw.siren)) continue;
      seen.add(raw.siren);
      companies.push(mapCompany(raw));
    }
  }
  return { total: responses[0]?.total_results ?? 0, companies };
}
