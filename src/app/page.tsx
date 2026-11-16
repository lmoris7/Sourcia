"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

const SUGGESTIONS = [
  "We have 24h, 3 people, and want to build a voice agent for elderly people. Score this idea.",
  "Plan our 36-hour hackathon hour by hour.",
  "Write a pitch outline for 'DocuChat': chat with your course PDFs.",
];

function ToolCard({ name, output }: { name: string; output: unknown }) {
  return (
    <details className="my-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <summary className="cursor-pointer font-mono text-zinc-600 dark:text-zinc-400">🛠 {name}</summary>
      <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(output, null, 2)}</pre>
    </details>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Hackathon Copilot</h1>
        <p className="text-sm text-zinc-500">Scope the idea, plan the sprint, nail the pitch.</p>
      </header>

      <section className="flex-1 space-y-6">
        {messages.length === 0 && (
          <div className="grid gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => (
          <article key={m.id} className={m.role === "user" ? "text-right" : ""}>
            <span className="text-xs uppercase tracking-wide text-zinc-400">{m.role === "user" ? "You" : "Copilot"}</span>
            {m.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <p key={i} className="whitespace-pre-wrap leading-relaxed">
                    {part.text}
                  </p>
                );
              }
              if (part.type.startsWith("tool-") && "output" in part && part.output !== undefined) {
                return <ToolCard key={i} name={part.type.slice(5)} output={part.output} />;
              }
              return null;
            })}
          </article>
        ))}
        {busy && <p className="text-sm text-zinc-400">Thinking…</p>}
      </section>

      <form
        className="sticky bottom-4 mt-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="prompt" className="sr-only">Message</label>
        <input
          id="prompt"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Describe your idea…"
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          disabled={busy}
          className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          Send message
        </button>
      </form>
    </main>
  );
}
