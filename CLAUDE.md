# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start both backend (port 3001) and frontend (port 5173) concurrently
npm run dev

# Start individually
npm run dev:server   # Express backend via nodemon
npm run dev:client   # Vite frontend

# Build
npm run build        # tsc + vite build

# Lint
npm run lint
```

There are no tests in this project.

## Environment

Create a `.env` file in the root with:
```
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
```

## Architecture

This is a two-process app: a Vite React frontend and an Express backend.

**Frontend** (`src/`):
- `Humanizer.tsx` — the single page component; all UI and state live here
- `system-prompt.md` — imported as raw text and sent with every API request; editing this file changes the AI behavior
- `src/components/ui/` — shadcn/ui components (currently only `select.tsx`)
- `@/` alias resolves to `src/`

**Backend** (`server.js`):
- Single Express route: `POST /api/humanize`
- Supports two AI providers: `anthropic` (direct fetch to Anthropic REST API) and `gemini` (`@google/genai` SDK)
- Both return the same response shape: `{ content: [{ text: "..." }] }`
- The frontend parses the response as JSON (the AI returns raw JSON per the system prompt)

**Data flow:**
1. User pastes text → selects provider/model/language → clicks Humanize
2. Frontend POSTs `{ input, systemPrompt, provider, model, language }` to `/api/humanize`
3. Vite dev server proxies `/api/*` to `localhost:3001`
4. Backend appends a language instruction to the system prompt, calls the AI, returns the response
5. Frontend parses the AI's JSON response into `chunks[]` and `changes[]`

**AI response schema** (defined in `system-prompt.md`):
```json
{ "chunks": ["..."], "changes": ["..."] }
```
The frontend strips markdown fences before parsing.
