"use client";

import { useEffect, useRef, useState } from "react";
import { formatEuro, TRANCHES } from "@/lib/referentials";
import { companyAge, isExecutive } from "@/lib/scoring";
import type { ScoredCompany } from "@/lib/types";
import { Chip, Markdown, ScoreBadge } from "./ui";

interface Props {
  company: ScoredCompany | null;
  onClose: () => void;
  inPipeline: boolean;
  onAdd: (c: ScoredCompany) => void;
}

export function CompanyDrawer({ company, onClose, inPipeline, onAdd }: Props) {
  const [brief, setBrief] = useState<{ siren: string; text: string; source: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!company) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [company, onClose]);

  if (!company) return null;
  const currentBrief = brief?.siren === company.siren ? brief : null;

  const generate = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/brief", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(company) });
      const data = await r.json();
      setBrief({ siren: company.siren, text: data.brief ?? data.error, source: data.source });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end" role="dialog" aria-modal="true" aria-label={company.nom}>
      <button aria-label="Fermer" className="absolute inset-0 bg-zinc-950/30" onClick={onClose} tabIndex={-1} />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{company.nom}</h2>
            <p className="text-sm text-zinc-500">
              SIREN {company.siren} · NAF {company.naf} · {company.commune} ({company.codePostal})
            </p>
          </div>
          <button ref={closeRef} onClick={onClose} className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-zinc-800" aria-label="Fermer le panneau">
            ✕
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <ScoreBadge score={company.score} />
          <span className="text-sm text-zinc-500">score de cessibilité</span>
          <button
            onClick={() => onAdd(company)}
            disabled={inPipeline}
            className="ml-auto rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
          >
            {inPipeline ? "Dans le pipeline" : "Ajouter au pipeline"}
          </button>
        </div>
        {company.oppositionProspection && (
          <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
            Cette société s&apos;est opposée à la prospection commerciale (registre INSEE). Ne pas démarcher.
          </p>
        )}

        <section className="mt-6">
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Signaux</h3>
          <ul className="mt-2 space-y-1.5">
            {company.signals.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{s.label}</span>
                <Chip tone={s.tone}>{s.points > 0 ? `+${s.points}` : s.points}</Chip>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Profil</h3>
            <dl className="mt-2 space-y-1">
              <div>Catégorie : {company.categorie ?? "—"}</div>
              <div>Effectif : {TRANCHES[company.trancheEffectif ?? ""] ?? "—"}</div>
              <div>Création : {company.dateCreation ?? "—"} ({companyAge(company) ?? "?"} ans)</div>
            </dl>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Financiers</h3>
            <table className="mt-2 w-full tabular-nums">
              <tbody>
                {company.financials.length === 0 && <tr><td className="text-zinc-500">Non publiés</td></tr>}
                {company.financials.map((f) => (
                  <tr key={f.year}>
                    <td className="pr-2 text-zinc-500">{f.year}</td>
                    <td>CA {formatEuro(f.ca)}</td>
                    <td className="pl-2">RN {formatEuro(f.resultatNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 text-sm">
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Dirigeants</h3>
          <ul className="mt-2 space-y-1">
            {company.dirigeants.filter(isExecutive).map((d, i) => (
              <li key={i}>
                {d.type === "personne morale" ? d.denomination : `${d.prenoms ?? ""} ${d.nom ?? ""}`} <span className="text-zinc-500">· {d.qualite}{d.anneeNaissance ? ` · né(e) en ${d.anneeNaissance}` : ""}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Fiche cible & approche</h3>
            <button onClick={generate} disabled={loading} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
              {loading ? "Rédaction…" : currentBrief ? "Régénérer" : "Générer la fiche"}
            </button>
          </div>
          {currentBrief && (
            <div className="mt-4">
              <Markdown text={currentBrief.text} />
              <p className="mt-3 text-xs text-zinc-400">{currentBrief.source === "ai" ? "Rédigé par IA à partir des données publiques — à vérifier." : "Modèle standard (configurez AI_GATEWAY_API_KEY pour une rédaction IA)."}</p>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
