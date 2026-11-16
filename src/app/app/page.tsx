"use client";

import { useState } from "react";
import { CompanyDrawer } from "@/components/CompanyDrawer";
import { Chip, ScoreBadge } from "@/components/ui";
import { downloadCSV, toCSV } from "@/lib/csv";
import { usePipeline } from "@/lib/pipeline";
import { CATEGORIES, formatEuro, SECTORS, TRANCHES } from "@/lib/referentials";
import type { ScoredCompany, SearchFilters } from "@/lib/types";

const TRANCHE_PRESETS = [
  { label: "10-49", codes: ["11", "12"] },
  { label: "50-199", codes: ["21", "22"] },
  { label: "200-499", codes: ["31", "32"] },
];

const field = "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default function SourcingPage() {
  const [sector, setSector] = useState("software");
  const [q, setQ] = useState("");
  const [deps, setDeps] = useState("69, 38, 42");
  const [tranches, setTranches] = useState<string[]>(["11", "12", "21", "22"]);
  const [caMin, setCaMin] = useState("2");
  const [caMax, setCaMax] = useState("50");
  const [categorie, setCategorie] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [results, setResults] = useState<ScoredCompany[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ScoredCompany | null>(null);
  const pipeline = usePipeline();

  const search = async () => {
    const filters: SearchFilters = {
      q: q.trim() || undefined,
      naf: SECTORS.find((s) => s.id === sector)?.naf,
      departements: deps.split(/[\s,;]+/).filter(Boolean),
      tranches: tranches.length ? tranches : undefined,
      caMin: caMin ? Number(caMin) * 1e6 : undefined,
      caMax: caMax ? Number(caMax) * 1e6 : undefined,
      categorie: categorie || undefined,
    };
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(filters) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "La recherche a échoué.");
      setResults(data.results);
      setTotal(data.total);
    } catch (e) {
      setError(`${(e as Error).message} Vérifiez les filtres puis relancez la recherche.`);
    } finally {
      setLoading(false);
    }
  };

  const visible = (results ?? []).filter((c) => c.score >= minScore);
  const toggleTranches = (codes: string[]) =>
    setTranches((t) => (codes.every((c) => t.includes(c)) ? t.filter((x) => !codes.includes(x)) : [...new Set([...t, ...codes])]));

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <form
        className="h-fit space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <h1 className="font-semibold">Mandat de recherche</h1>
        <div>
          <label htmlFor="sector" className="mb-1 block text-sm font-medium">Secteur</label>
          <select id="sector" value={sector} onChange={(e) => setSector(e.target.value)} className={field}>
            {SECTORS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="q" className="mb-1 block text-sm font-medium">Mot-clé</label>
          <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ex. cybersécurité" className={field} />
        </div>
        <div>
          <label htmlFor="deps" className="mb-1 block text-sm font-medium">Départements</label>
          <input id="deps" value={deps} onChange={(e) => setDeps(e.target.value)} className={field} />
          <p className="mt-1 text-xs text-zinc-500">Séparés par des virgules, ex. 75, 92</p>
        </div>
        <fieldset>
          <legend className="mb-1 text-sm font-medium">Effectif</legend>
          <div className="flex flex-wrap gap-2">
            {TRANCHE_PRESETS.map((p) => {
              const on = p.codes.every((c) => tranches.includes(c));
              return (
                <button type="button" key={p.label} onClick={() => toggleTranches(p.codes)} aria-pressed={on}
                  className={`rounded-md border px-2.5 py-1 text-sm ${on ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "border-zinc-300 dark:border-zinc-700"}`}>
                  {p.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="camin" className="mb-1 block text-sm font-medium">CA min (M€)</label>
            <input id="camin" inputMode="decimal" value={caMin} onChange={(e) => setCaMin(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="camax" className="mb-1 block text-sm font-medium">CA max (M€)</label>
            <input id="camax" inputMode="decimal" value={caMax} onChange={(e) => setCaMax(e.target.value)} className={field} />
          </div>
        </div>
        <div>
          <label htmlFor="cat" className="mb-1 block text-sm font-medium">Catégorie</label>
          <select id="cat" value={categorie} onChange={(e) => setCategorie(e.target.value)} className={field}>
            <option value="">Toutes</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button disabled={loading} className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {loading ? "Recherche…" : "Lancer le sourcing"}
        </button>
      </form>

      <section className="min-w-0">
        {error && <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">{error}</p>}

        {!results && !loading && (
          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <h2 className="font-medium">Définissez votre mandat</h2>
            <p className="mt-1 text-sm text-zinc-500">Secteur, zone et taille : Sourcia interroge le registre national des entreprises et classe les cibles selon leur probabilité de cession.</p>
            <button onClick={search} className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Lancer avec le mandat exemple</button>
          </div>
        )}

        {loading && !results && (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-200/70 dark:bg-zinc-800" />)}
          </div>
        )}

        {results && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <p className="text-sm text-zinc-500">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{visible.length}</span> cibles classées sur {total.toLocaleString("fr-FR")} correspondances
              </p>
              <label className="ml-auto flex items-center gap-2 text-sm">
                Score min
                <input type="range" min={0} max={90} step={5} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} />
                <span className="w-6 tabular-nums">{minScore}</span>
              </label>
              <button onClick={() => downloadCSV("cibles.csv", toCSV(visible))} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900">
                Exporter en CSV
              </button>
            </div>

            {visible.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm dark:border-zinc-700">
                Aucune cible au-dessus de ce score.{" "}
                <button className="font-medium text-indigo-600 underline" onClick={() => setMinScore(0)}>Réinitialiser le score minimum</button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Société</th>
                      <th className="hidden px-4 py-3 md:table-cell">Effectif</th>
                      <th className="px-4 py-3 text-right">CA</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Signal principal</th>
                      <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((c) => {
                      const top = [...c.signals].sort((a, b) => b.points - a.points)[0];
                      return (
                        <tr key={c.siren} className="cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50" onClick={() => setSelected(c)}>
                          <td className="px-4 py-3"><ScoreBadge score={c.score} /></td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{c.nom}</div>
                            <div className="text-xs text-zinc-500">{c.commune} · {c.naf}{c.oppositionProspection ? " · ne pas démarcher" : ""}</div>
                          </td>
                          <td className="hidden px-4 py-3 md:table-cell">{TRANCHES[c.trancheEffectif ?? ""] ?? "—"}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{formatEuro(c.financials[0]?.ca)}</td>
                          <td className="hidden px-4 py-3 lg:table-cell">{top && <Chip tone={top.tone}>{top.label}</Chip>}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                pipeline.add(c);
                              }}
                              disabled={pipeline.has(c.siren)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:text-zinc-400 dark:hover:bg-indigo-950"
                            >
                              {pipeline.has(c.siren) ? "Ajoutée" : "Ajouter"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <CompanyDrawer company={selected} onClose={() => setSelected(null)} inPipeline={!!selected && pipeline.has(selected.siren)} onAdd={pipeline.add} />
    </div>
  );
}
