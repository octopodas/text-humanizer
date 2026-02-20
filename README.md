# Text Humanizer

Paste AI-generated or stiff-sounding text, get back natural, human-sounding output — split into copyable chunks.

Supports **Anthropic** (Claude) and **Google** (Gemini) models, with output in 12 languages.

## Quick start

**1. Clone and install**

```bash
git clone <repo-url>
cd text-humanizer
npm install
```

**2. Add API keys**

Create a `.env` file in the root:

```
ANTHROPIC_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

You only need the key(s) for the provider(s) you want to use.

- Anthropic keys: https://console.anthropic.com
- Gemini keys: https://aistudio.google.com/apikey

**3. Run**

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. Paste your text into the input box
2. Select an AI model from the dropdown
3. Optionally select an output language (top right)
4. Click **Humanize**
5. Copy the output chunks individually

## Models available

| Provider | Models |
|----------|--------|
| Anthropic | Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku |
| Google | Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 2.0 Flash (Exp) |

## Build for production

```bash
npm run build
```

Output goes to `dist/`. The Express server serves the built frontend in production.
