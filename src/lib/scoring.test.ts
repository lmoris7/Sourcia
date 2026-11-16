import { describe, expect, it } from "vitest";
import { buildQuery, mapCompany } from "./sirene";
import { rank, scoreCompany } from "./scoring";
import type { Company } from "./types";

const NOW = new Date("2026-06-01");

const base: Company = {
  siren: "123456789",
  nom: "ACME",
  naf: "62.01Z",
  categorie: "PME",
  dateCreation: "1995-03-01",
  trancheEffectif: "12",
  adresse: null,
  codePostal: "69003",
  commune: "LYON",
  departement: "69",
  dirigeants: [{ nom: "DUPONT", anneeNaissance: 1958, qualite: "Président", type: "personne physique" }],
  financials: [
    { year: 2025, ca: 8_000_000, resultatNet: 900_000 },
    { year: 2024, ca: 7_000_000, resultatNet: 700_000 },
  ],
  oppositionProspection: false,
};

describe("scoreCompany", () => {
  it("ranks an old founder-led profitable SME very high", () => {
    const s = scoreCompany(base, NOW);
    const ids = s.signals.map((x) => x.id);
    expect(ids).toEqual(expect.arrayContaining(["succession", "founder-led", "mature", "profitable", "growth"]));
    expect(s.score).toBeGreaterThanOrEqual(90);
  });

  it("penalises companies already owned by a holding or fund", () => {
    const s = scoreCompany(
      { ...base, dirigeants: [{ denomination: "XYZ CAPITAL", qualite: "Président de SAS", type: "personne morale" }] },
      NOW,
    );
    expect(s.signals.some((x) => x.id === "holding")).toBe(true);
    expect(s.score).toBeLessThan(scoreCompany(base, NOW).score);
  });

  it("ignores statutory auditors when computing executive age", () => {
    const s = scoreCompany(
      { ...base, dirigeants: [{ nom: "AUDIT", anneeNaissance: 1940, qualite: "Commissaire aux comptes titulaire", type: "personne physique" }] },
      NOW,
    );
    expect(s.signals.some((x) => x.id === "succession")).toBe(false);
  });

  it("keeps scores within 0..100 and sorts descending", () => {
    const young: Company = { ...base, siren: "2", dateCreation: "2025-01-01", dirigeants: [{ anneeNaissance: 1995, qualite: "Président", type: "personne physique" }], financials: [{ year: 2025, ca: 100_000, resultatNet: -50_000 }] };
    const ranked = rank([young, base], NOW);
    expect(ranked[0].siren).toBe(base.siren);
    for (const c of ranked) expect(c.score).toBeGreaterThanOrEqual(0);
  });
});

describe("sirene mapping", () => {
  it("maps the public API payload", () => {
    const c = mapCompany({
      siren: "1",
      nom_complet: "TEST",
      finances: { "2023": { ca: 10, resultat_net: 1 }, "2024": { ca: 20, resultat_net: 2 } },
      dirigeants: [{ nom: "A", annee_de_naissance: "1960", qualite: "Gérant", type_dirigeant: "personne physique" }],
      siege: { code_postal: "75001", libelle_commune: "PARIS" },
      opposition_diffusion_commerciale: true,
    });
    expect(c.financials[0].year).toBe(2024);
    expect(c.dirigeants[0].anneeNaissance).toBe(1960);
    expect(c.oppositionProspection).toBe(true);
  });

  it("builds query params from filters", () => {
    const p = buildQuery({ naf: ["62.01Z", "62.02A"], departements: ["69"], caMin: 2_000_000 });
    expect(p.get("activite_principale")).toBe("62.01Z,62.02A");
    expect(p.get("ca_min")).toBe("2000000");
    expect(p.get("etat_administratif")).toBe("A");
  });
});

import { templateBrief } from "./brief";

describe("templateBrief", () => {
  it("produces a usable brief without any LLM", () => {
    const md = templateBrief(scoreCompany(base, NOW));
    expect(md).toContain("Fiche cible — ACME");
    expect(md).toContain("Email d'approche");
  });
});

import { searchCompanies } from "./sirene";
import { vi } from "vitest";

describe("searchCompanies", () => {
  it("keeps only companies headquartered in the requested départements and dedupes pages", async () => {
    const page = {
      total_results: 2,
      results: [
        { siren: "1", nom_complet: "LYON CO", siege: { departement: "69" } },
        { siren: "2", nom_complet: "PARIS CO", siege: { departement: "75" } },
      ],
    };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(page))));
    const { companies } = await searchCompanies({ departements: ["69"] }, 2);
    expect(companies.map((c) => c.nom)).toEqual(["LYON CO"]);
    vi.unstubAllGlobals();
  });
});
