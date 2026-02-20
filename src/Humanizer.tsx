import { useState } from "react";
import SYSTEM_PROMPT from "./system-prompt.md?raw";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Humanizer() {
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [language, setLanguage] = useState("English");
  const [chunks, setChunks] = useState([]);
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showChanges, setShowChanges] = useState(false);
  const [copiedSet, setCopiedSet] = useState(new Set());

  async function humanize() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setChunks([]);
    setChanges([]);
    setShowChanges(false);

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          systemPrompt: SYSTEM_PROMPT,
          provider,
          model,
          language
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = typeof data.error === 'string' ? data.error : data.error?.message;
        throw new Error(msg || "Something went wrong.");
      }

      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setChunks(parsed.chunks || []);
      setChanges(parsed.changes || []);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyChunk(idx, text) {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;opacity:0;top:0;left:0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopiedSet(prev => new Set(prev).add(idx));
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f8", color: "#1a1a1a" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#fff", borderBottom: "1px solid #ebebeb",
        padding: "0 24px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px", color: "#1a1a1a" }}>Text Humanizer</span>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="h-8 rounded-full border-transparent bg-muted px-3 text-[13px] font-medium text-muted-foreground shadow-none hover:bg-muted/80 focus:ring-0 gap-1.5 [&>svg]:size-3.5 [&>svg]:opacity-50">
            <span className="text-sm leading-none">🌐</span>
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Spanish">Spanish</SelectItem>
            <SelectItem value="French">French</SelectItem>
            <SelectItem value="German">German</SelectItem>
            <SelectItem value="Italian">Italian</SelectItem>
            <SelectItem value="Portuguese">Portuguese</SelectItem>
            <SelectItem value="Russian">Russian</SelectItem>
            <SelectItem value="Chinese">Chinese</SelectItem>
            <SelectItem value="Japanese">Japanese</SelectItem>
            <SelectItem value="Korean">Korean</SelectItem>
            <SelectItem value="Arabic">Arabic</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
          </SelectContent>
        </Select>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        {/* AI Provider & Model */}
        <div className="mb-4 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">AI Model</label>
          <Select
            value={`${provider}:${model}`}
            onValueChange={val => {
              const [p, m] = val.split(':');
              setProvider(p);
              setModel(m);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="w-[--radix-select-trigger-width]">
              <SelectGroup>
                <SelectLabel>Anthropic</SelectLabel>
                <SelectItem value="anthropic:claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</SelectItem>
                <SelectItem value="anthropic:claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="anthropic:claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Google</SelectLabel>
                <SelectItem value="gemini:gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                <SelectItem value="gemini:gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                <SelectItem value="gemini:gemini-2.0-flash-exp">Gemini 2.0 Flash (Exp)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>


        {/* Input */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 8 }}>Input</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your text here..."
            style={{
              width: "100%", height: 220, padding: 16, boxSizing: "border-box",
              border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 14,
              lineHeight: 1.65, resize: "vertical", background: "#fff",
              outline: "none", color: "#1a1a1a", fontFamily: "inherit",
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 28 }}>
          <button
            onClick={humanize}
            disabled={loading || !input.trim()}
            style={{
              padding: "10px 22px",
              background: loading || !input.trim() ? "#ccc" : "#1a1a1a",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              cursor: loading || !input.trim() ? "default" : "pointer",
            }}
          >
            {loading ? "Processing…" : "Humanize"}
          </button>

          {changes.length > 0 && (
            <button
              onClick={() => setShowChanges(v => !v)}
              style={{
                padding: "10px 18px", background: "transparent",
                color: "#555", border: "1px solid #ddd", borderRadius: 8,
                fontSize: 14, cursor: "pointer",
              }}
            >
              {showChanges ? "Hide changes" : `What changed (${changes.length})`}
            </button>
          )}
        </div>

        {/* Changes */}
        {showChanges && changes.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#444" }}>Changes made</p>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
              {changes.map((c, i) => (
                <li key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#888", marginBottom: 24 }}>
            <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #ccc", borderTopColor: "#555", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            Humanizing and chunking…
          </div>
        )}

        {/* Chunks */}
        {chunks.length > 0 && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 12 }}>
              {chunks.length} Chunks
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {chunks.map((chunk, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 10,
                    overflow: "hidden",
                    transition: "background 0.3s",
                    background: copiedSet.has(i) ? "#e6f4ea" : "#fff",
                  }}
                >
                  {/* Chunk header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 14px",
                    borderBottom: "1px solid #f0f0f0",
                    background: copiedSet.has(i) ? "#d4edda" : "#fafafa",
                  }}>
                    <span style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>
                      #{i + 1} · {chunk.length} chars
                    </span>
                    <button
                      onClick={() => copyChunk(i, chunk)}
                      style={{
                        padding: "4px 12px",
                        background: copiedSet.has(i) ? "#2d7a3a" : "#1a1a1a",
                        color: "#fff", border: "none", borderRadius: 6,
                        fontSize: 12, fontWeight: 500, cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                    >
                      {copiedSet.has(i) ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  {/* Chunk body */}
                  <div style={{
                    padding: "14px 16px",
                    fontSize: 14, lineHeight: 1.65,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                  }}>
                    {chunk}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
