# Just Chunk — Design

## Overview

Add a "Just Chunk" button that splits the original text into platform-appropriate chunks without applying humanization rules.

## Approach

Use a separate system prompt file (`src/system-prompt-chunk.md`) that instructs the AI to preserve content and only split. The existing `{ "chunks": [...], "changes": [...] }` response shape is reused unchanged, so all frontend parsing and display logic stays the same.

## Files

- **New:** `src/system-prompt-chunk.md` — chunk-only system prompt (preserve text, minor formatting edits only, same JSON output schema)
- **Modified:** `src/Humanizer.tsx` — import new prompt, add "Just Chunk" button, parameterize `humanize()` by mode

## UI

The "Just Chunk" button sits next to "Humanize" in the actions row. Both share the same disabled state (`loading || !input.trim()`).

## Data Flow

1. User clicks "Just Chunk"
2. Frontend calls `humanize("chunk")`, which sends `CHUNK_PROMPT + platform prompt` as `systemPrompt`
3. Everything downstream (backend, response parsing, display) is identical to the humanize flow

No backend changes required. Mode selection is purely a frontend concern.
