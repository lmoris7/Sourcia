import { NextResponse } from "next/server";
import { z } from "zod";
import { rank } from "@/lib/scoring";
import { searchCompanies } from "@/lib/sirene";

const Filters = z.object({
  q: z.string().max(100).optional(),
  naf: z.array(z.string().regex(/^\d{2}\.\d{2}[A-Z]$/)).max(20).optional(),
  departements: z.array(z.string().regex(/^(\d{2,3}|2A|2B)$/)).max(20).optional(),
  tranches: z.array(z.string().regex(/^\d{2}$/)).max(15).optional(),
  caMin: z.number().nonnegative().optional(),
  caMax: z.number().nonnegative().optional(),
  categorie: z.enum(["PME", "ETI", "GE"]).optional(),
});

export async function POST(req: Request) {
  const parsed = Filters.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Filtres invalides", details: parsed.error.issues }, { status: 400 });
  }
  try {
    const { total, companies } = await searchCompanies(parsed.data);
    return NextResponse.json({ total, results: rank(companies) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
