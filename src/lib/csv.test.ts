import { describe, expect, it } from "vitest";
import { toCSV } from "./csv";

describe("toCSV", () => {
  it("escapes separators and quotes", () => {
    const csv = toCSV([
      {
        siren: "1", nom: 'ACME; "Le Groupe"', naf: null, categorie: "PME", dateCreation: null, trancheEffectif: null,
        adresse: null, codePostal: "75001", commune: "PARIS", departement: "75", dirigeants: [], financials: [],
        oppositionProspection: false, score: 80, signals: [], stage: "Contacté",
      },
    ]);
    const [, row] = csv.split("\n");
    expect(row).toContain('"ACME; ""Le Groupe"""');
    expect(row.endsWith("Contacté;")).toBe(true);
  });
});
