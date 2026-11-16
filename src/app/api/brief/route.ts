import { generateText } from "ai";
import { NextResponse } from "next/server";
import { factSheet, templateBrief } from "@/lib/brief";
import type { ScoredCompany } from "@/lib/types";

export const maxDuration = 60;

const hasLLM = () => Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

export async function POST(req: Request) {
  const company = (await req.json()) as ScoredCompany;
  if (!company?.siren) return NextResponse.json({ error: "Société manquante" }, { status: 400 });

  if (!hasLLM()) return NextResponse.json({ brief: templateBrief(company), source: "template" });

  try {
    const { text } = await generateText({
      model: process.env.AI_MODEL ?? "anthropic/claude-sonnet-5-5",
      system:
        "Tu es analyste M&A sell-side/buy-side dans une boutique française small & mid-cap. " +
        "Tu rédiges en français, de façon factuelle et concise, uniquement à partir des données fournies. " +
        "N'invente aucun chiffre. Signale clairement les hypothèses.",
      prompt: `Données publiques (registre INSEE/RNE) :\n${factSheet(company)}\n\n` +
        "Rédige en Markdown :\n1. ## Fiche cible (5 lignes max)\n2. ### Thèse d'investissement (3 puces)\n" +
        "3. ### Points de vigilance (3 puces)\n4. ### Questions pour le premier call (4 puces)\n" +
        "5. ### Email d'approche au dirigeant (120 mots max, ton discret et respectueux, pas de mention de son âge).",
    });
    return NextResponse.json({ brief: text, source: "ai" });
  } catch {
    return NextResponse.json({ brief: templateBrief(company), source: "template" });
  }
}
