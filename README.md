# 🚀 Hackathon Copilot — AI starter

> A Next.js + AI SDK template that ships a working AI chat with **tool calling** in minutes, pre-loaded with an AI mentor that helps you **scope, plan and pitch** a hackathon project.

![next](https://img.shields.io/badge/Next.js-16-black) ![ai-sdk](https://img.shields.io/badge/AI%20SDK-7-blue) ![status](https://img.shields.io/badge/status-WIP-orange) ![license](https://img.shields.io/badge/license-MIT-green)

Fork it at the start of a hackathon, replace the tools in `src/lib/` with your own domain logic, deploy, done.

## Features

- 💬 Streaming chat UI (`useChat`) with tool result cards
- 🛠 Server-side tools with Zod schemas, multi-step calls (`stopWhen: isStepCount(5)`)
- 🔀 Any model through **Vercel AI Gateway** — switch provider with one env var
- 🧪 Pure, unit-tested tool logic (Vitest)
- ⚙️ CI: lint + test + build

Built-in mentor tools:

| Tool | What it does |
| --- | --- |
| `scoreIdea` | Heuristic score on impact, technical depth, creativity, feasibility, demo + scope warnings |
| `planSprint` | Hour-by-hour plan for any event duration |
| `pitchOutline` | Timed 3-minute pitch structure |

## Quickstart

```bash
npm install
cp .env.example .env.local   # add AI_GATEWAY_API_KEY
npm run dev
```

Open http://localhost:3000.

## Deploy

```bash
npx vercel deploy
```

On Vercel the AI Gateway authenticates automatically through OIDC — no key to copy.

## Project structure

```
src/
├── app/
│   ├── api/chat/route.ts   # streamText + tools
│   └── page.tsx            # chat UI
└── lib/
    ├── hackathon.ts        # tool logic (pure functions)
    └── hackathon.test.ts
```

## Roadmap

- [x] Chat + tool calling
- [x] Idea scoring, sprint planning, pitch outline
- [ ] Persist conversations (Postgres / Supabase)
- [ ] Export plan as Markdown / calendar file
- [ ] "Devil's advocate" judge mode
- [ ] Voice input

## License

MIT
