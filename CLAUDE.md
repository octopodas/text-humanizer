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
- `src/system-prompt.md` — base humanization rules, imported as raw text (`?raw`)
- `src/prompts/<platform>.md` — platform-specific chunking rules (e.g. `threads.md`); one file per platform
- `src/components/ui/` — shadcn/ui components (currently only `select.tsx`)
- `@/` alias resolves to `src/`

**Backend** (`server.js`):
- Single Express route: `POST /api/humanize`
- `anthropic` provider: direct `fetch` to Anthropic REST API (`max_tokens: 4000`)
- `gemini` provider: `@google/genai` SDK; response is normalized to `{ content: [{ text: "..." }] }` to match Anthropic's shape
- Backend appends a language instruction to the system prompt before calling the AI

**Data flow:**
1. User pastes text → selects provider/model/language/platform → clicks Humanize
2. Frontend sends `systemPrompt = STYLE_PROMPT + "\n\n" + platform prompt` in the POST body
3. Vite dev server proxies `/api/*` to `localhost:3001`
4. Frontend parses the AI's JSON response into `chunks[]` and `changes[]`

**AI response schema** (defined in `system-prompt.md`):
```json
{ "chunks": ["..."], "changes": ["..."] }
```
The frontend strips markdown fences before parsing.

**Adding a new platform:**
1. Create `src/prompts/<name>.md` with chunking rules
2. Import it in `Humanizer.tsx` with `?raw` and add to `PLATFORM_PROMPTS`
3. Add a `<SelectItem>` to the platform selector in the nav

**Model selector:** Uses a composite `provider:model` string (e.g. `"gemini:gemini-2.5-flash"`) as the Select value, split on change to update both `provider` and `model` state.
