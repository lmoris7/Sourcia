import type { ReactNode } from "react";

export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 70 ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900"
    : score >= 45 ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900"
    : "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700";
  return (
    <span className={`inline-flex min-w-10 justify-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums ring-1 ring-inset ${tone}`}>
      {score}
    </span>
  );
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "positive" | "negative" | "neutral" }) {
  const cls = {
    positive: "text-emerald-700 dark:text-emerald-300",
    negative: "text-rose-700 dark:text-rose-300",
    neutral: "text-zinc-500 dark:text-zinc-400",
  }[tone];
  return <span className={`text-xs ${cls}`}>{children}</span>;
}

/** Minimal Markdown renderer (headings, bullets, paragraphs) for generated briefs. */
export function Markdown({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} className="pt-3 font-semibold">{line.slice(4)}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} className="pt-2 text-base font-semibold">{line.slice(3)}</h3>;
        if (/^[-*] /.test(line)) return <p key={i} className="pl-4 before:-ml-4 before:mr-2 before:content-['•']">{line.slice(2).replace(/\*\*/g, "")}</p>;
        if (!line.trim()) return null;
        return <p key={i}>{line.replace(/\*\*/g, "")}</p>;
      })}
    </div>
  );
}
