"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
}

const STARTER_PROMPTS = [
  "Which deals are still Pending right now?",
  "Total closed agency commission and net payouts?",
  "Top 3 creators by deal value",
  "Draft a payment follow-up for Confirmed deals",
];

export function ManagerChatDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const msgCounterRef = useRef(0);

  useEffect(() => {
    if (open) {
      scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, sending]);

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    setError("");
    if (!textOverride) setInput("");

    msgCounterRef.current += 1;
    const userMsg: ChatMessage = {
      id: `u-${msgCounterRef.current}`,
      role: "user",
      content: text,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const json = (await res.json()) as {
        reply?: string;
        provider?: string;
        model?: string;
        error?: string;
      };
      if (!res.ok || !json.reply) {
        throw new Error(json.error || "Failed to get assistant response");
      }

      msgCounterRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${msgCounterRef.current}`,
          role: "assistant",
          content: json.reply!,
          meta:
            json.provider === "cloudflare-workers-ai"
              ? "Melly · Live AI"
              : "Melly · Live DB",
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reach Melly right now"
      );
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cm-btn-primary fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 no-print"
        title="Chat with Melly"
        aria-label="Open Melly Assistant"
      >
        <Bot className="h-5 w-5" />
      </button>
    );
  }

  return (
    <aside
      aria-label="Melly Talent Assistant"
      className="cm-card fixed bottom-5 right-5 z-50 flex h-[540px] max-h-[82vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl shadow-2xl sm:w-[400px] no-print"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-subtle)]/80 px-4 py-3.5 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] shadow-xs">
            <Bot className="h-4.5 w-4.5" />
            <span
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)]"
              style={{ backgroundColor: "var(--status-paid-bg)" }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-[var(--text)]">Melly</h2>
              <span className="cm-pill-brand rounded-full px-2 py-0.5 text-[10px] font-semibold">
                AI
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              CreatorsMela Talent Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setError("");
              }}
              className="rounded-full p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-chip)] hover:text-[var(--text)]"
              title="New conversation"
              aria-label="New conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-chip)] hover:text-[var(--text)]"
            title="Minimize Melly"
            aria-label="Minimize Melly"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="space-y-3.5">
            <div className="cm-card-subtle rounded-2xl p-3.5 text-xs leading-relaxed text-[var(--text-muted)]">
              <div className="mb-1.5 flex items-center gap-1.5 font-bold text-[var(--text)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                <span>Hi, I&apos;m Melly</span>
              </div>
              Ask me anything about your live roster, brand deals, monthly
              trends, agency commissions, TDS, or payment follow-ups.
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                Suggested Questions
              </p>
              <div className="flex flex-col gap-1.5">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {msg.role === "user" ? (
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--accent)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--on-accent)] shadow-xs">
                  {msg.content}
                </div>
              ) : (
                <div className="flex max-w-[92%] items-start gap-2">
                  <div className="cm-pill-brand mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="cm-card-subtle whitespace-pre-wrap rounded-2xl rounded-tl-md px-3.5 py-2.5 text-xs leading-relaxed text-[var(--text)]">
                      {msg.content}
                    </div>
                    {msg.meta && (
                      <span className="block px-1 text-[10px] text-[var(--text-faint)]">
                        {msg.meta}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {sending && (
          <div className="flex items-start gap-2">
            <div className="cm-pill-brand mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="cm-card-subtle inline-flex items-center gap-1 rounded-2xl rounded-tl-md px-3.5 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]" />
            </div>
          </div>
        )}

        {error && (
          <p
            className="rounded-xl px-3 py-2 text-[11px] font-medium"
            style={{
              backgroundColor: "var(--error-bg)",
              color: "var(--error-text)",
            }}
          >
            {error}
          </p>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface)] p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Melly anything..."
          disabled={sending}
          className="cm-input flex-1 rounded-full px-4 py-2 text-xs"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="cm-btn-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
          aria-label="Send message to Melly"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </aside>
  );
}
