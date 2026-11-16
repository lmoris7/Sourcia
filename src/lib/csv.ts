import type { ScoredCompany } from "./types";

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Semicolon-separated CSV (opens natively in French Excel). */
export function toCSV(rows: (ScoredCompany & { stage?: string; note?: string })[]): string {
  const header = ["SIREN", "Nom", "NAF", "Catégorie", "Code postal", "Commune", "Création", "CA", "Résultat net", "Score", "Signaux", "Étape", "Note"];
  const lines = rows.map((c) =>
    [
      c.siren, c.nom, c.naf, c.categorie, c.codePostal, c.commune, c.dateCreation,
      c.financials[0]?.ca, c.financials[0]?.resultatNet, c.score,
      c.signals.filter((s) => s.points !== 0).map((s) => s.label).join(" | "),
      c.stage ?? "", c.note ?? "",
    ].map(esc).join(";"),
  );
  return "﻿" + [header.join(";"), ...lines].join("\n");
}

export function downloadCSV(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}
