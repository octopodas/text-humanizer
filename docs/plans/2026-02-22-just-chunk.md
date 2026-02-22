# Just Chunk Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Just Chunk" button that splits text into platform chunks without applying humanization rules.

**Architecture:** A new `src/system-prompt-chunk.md` file provides a chunk-only system prompt. `Humanizer.tsx` imports it and passes it to the existing `/api/humanize` endpoint when the user clicks "Just Chunk" instead of "Humanize". No backend changes needed.

**Tech Stack:** React, TypeScript, Vite (`?raw` imports for markdown files)

---

### Task 1: Create the chunk-only system prompt

**Files:**
- Create: `src/system-prompt-chunk.md`

**Step 1: Create the file**

```markdown
You are a text formatting assistant. Your job is to split text into chunks suitable for the target platform.

## Rules
- Preserve the original text exactly. Do NOT rewrite, rephrase, or change wording.
- Minor formatting edits are allowed only where necessary for clean presentation: fixing capitalization at a split boundary, removing a trailing/leading space, or adding punctuation where a sentence was cut.
- Do NOT humanize, add voice, or alter tone.

## Output format
Respond ONLY with valid JSON, no markdown, no preamble:
{
  "chunks": ["chunk 1 text", "chunk 2 text", ...],
  "changes": []
}
```

**Step 2: Verify Vite can import it**

The file uses the same `?raw` import mechanism as `system-prompt.md`. No config changes needed — Vite supports `?raw` for any file type out of the box.

**Step 3: Commit**

```bash
git add src/system-prompt-chunk.md
git commit -m "feat: add chunk-only system prompt"
```

---

### Task 2: Wire up the new prompt and button in Humanizer.tsx

**Files:**
- Modify: `src/Humanizer.tsx`

**Step 1: Add the import at the top of the file (after the existing STYLE_PROMPT import)**

Current imports (lines 2-3):
```tsx
import STYLE_PROMPT from "./system-prompt.md?raw";
import THREADS_PROMPT from "./prompts/threads.md?raw";
```

Add after them:
```tsx
import CHUNK_PROMPT from "./system-prompt-chunk.md?raw";
```

**Step 2: Parameterize the `humanize` function**

Current signature (line 34):
```tsx
async function humanize() {
```

Replace with:
```tsx
async function humanize(mode: "humanize" | "chunk" = "humanize") {
```

**Step 3: Select the system prompt based on mode**

Inside `humanize()`, the fetch body currently sends:
```tsx
systemPrompt: STYLE_PROMPT + "\n\n" + (PLATFORM_PROMPTS[platform] ?? ""),
```

Replace that line with:
```tsx
systemPrompt: (mode === "chunk" ? CHUNK_PROMPT : STYLE_PROMPT) + "\n\n" + (PLATFORM_PROMPTS[platform] ?? ""),
```

**Step 4: Add the "Just Chunk" button**

The actions `<div>` currently contains one button (the "Humanize" button). Add a second button immediately after it, before the closing `</div>` of the actions row:

```tsx
<button
  onClick={() => humanize("chunk")}
  disabled={loading || !input.trim()}
  style={{
    padding: "10px 22px",
    background: loading || !input.trim() ? "#ccc" : "#fff",
    color: loading || !input.trim() ? "#fff" : "#1a1a1a",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: loading || !input.trim() ? "default" : "pointer",
  }}
>
  Just Chunk
</button>
```

Also update the existing "Humanize" button's `onClick` to be explicit:
```tsx
onClick={() => humanize("humanize")}
```

**Step 5: Verify in the browser**

Run `npm run dev`, paste some text, click "Just Chunk". Confirm:
- Chunks appear without any rewording of the original text
- "What changed" button either doesn't appear (empty `changes` array) or shows only minor formatting notes

**Step 6: Commit**

```bash
git add src/Humanizer.tsx
git commit -m "feat: add Just Chunk button"
```
