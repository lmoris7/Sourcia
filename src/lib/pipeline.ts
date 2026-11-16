"use client";

import { useCallback, useEffect, useState } from "react";
import type { ScoredCompany } from "./types";

export const STAGES = ["À qualifier", "À contacter", "Contacté", "Rendez-vous", "NDA signé", "Écarté"] as const;
export type Stage = (typeof STAGES)[number];

export interface PipelineItem {
  company: ScoredCompany;
  stage: Stage;
  note: string;
  addedAt: string;
}

const KEY = "ma-sourcing:pipeline:v1";

function read(): PipelineItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: PipelineItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable (private mode): keep in memory only */
  }
}

/** Shortlist persisted in the browser. Swap for a database when going multi-user. */
export function usePipeline() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  // Hydrate after mount: localStorage is not available during server rendering.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setItems(read()), []);

  const update = useCallback((fn: (prev: PipelineItem[]) => PipelineItem[]) => {
    setItems((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  return {
    items,
    has: (siren: string) => items.some((i) => i.company.siren === siren),
    add: (company: ScoredCompany) =>
      update((prev) =>
        prev.some((i) => i.company.siren === company.siren)
          ? prev
          : [...prev, { company, stage: "À qualifier", note: "", addedAt: new Date().toISOString() }],
      ),
    remove: (siren: string) => update((prev) => prev.filter((i) => i.company.siren !== siren)),
    move: (siren: string, stage: Stage) => update((prev) => prev.map((i) => (i.company.siren === siren ? { ...i, stage } : i))),
    setNote: (siren: string, note: string) => update((prev) => prev.map((i) => (i.company.siren === siren ? { ...i, note } : i))),
  };
}
