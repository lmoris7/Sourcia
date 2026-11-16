"use client";

import Link from "next/link";
import { ScoreBadge } from "@/components/ui";
import { downloadCSV, toCSV } from "@/lib/csv";
import { STAGES, usePipeline, type Stage } from "@/lib/pipeline";
import { formatEuro } from "@/lib/referentials";

export default function PipelinePage() {
  const { items, move, remove, setNote } = usePipeline();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
        <h1 className="font-medium">Votre pipeline est vide</h1>
        <p className="mt-1 text-sm text-zinc-500">Ajoutez des cibles depuis le sourcing pour suivre vos approches.</p>
        <Link href="/app" className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Sourcer des cibles</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Pipeline <span className="text-zinc-500">({items.length})</span></h1>
        <button
          onClick={() => downloadCSV("pipeline.csv", toCSV(items.map((i) => ({ ...i.company, stage: i.stage, note: i.note }))))}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Exporter en CSV
        </button>
      </div>
      <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => {
          const col = items.filter((i) => i.stage === stage);
          return (
            <section key={stage} className="min-w-56 rounded-xl bg-zinc-100 p-3 dark:bg-zinc-900">
              <h2 className="mb-3 flex justify-between text-xs font-medium uppercase tracking-wide text-zinc-500">
                {stage} <span>{col.length}</span>
              </h2>
              <div className="space-y-2">
                {col.map(({ company: c, note }) => (
                  <article key={c.siren} className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium leading-tight">{c.nom}</div>
                      <ScoreBadge score={c.score} />
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">{c.commune} · CA {formatEuro(c.financials[0]?.ca)}</div>
                    <label className="sr-only" htmlFor={`stage-${c.siren}`}>Étape</label>
                    <select id={`stage-${c.siren}`} value={stage} onChange={(e) => move(c.siren, e.target.value as Stage)} className="mt-2 w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-xs dark:border-zinc-700">
                      {STAGES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <label className="sr-only" htmlFor={`note-${c.siren}`}>Note</label>
                    <textarea id={`note-${c.siren}`} defaultValue={note} onBlur={(e) => setNote(c.siren, e.target.value)} placeholder="Note…" rows={2} className="mt-2 w-full resize-none rounded border border-zinc-200 bg-transparent px-2 py-1 text-xs dark:border-zinc-800" />
                    <button onClick={() => remove(c.siren)} className="mt-1 text-xs text-zinc-400 hover:text-rose-600">Retirer {c.nom.length > 18 ? "" : c.nom}</button>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
