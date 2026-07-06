"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Which blocks need attention today?",
  "Summarize this week's alerts",
  "How is Farm 2's plant health trending?",
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  // Escape closes; lock body scroll while open (same convention as the map/plant editor overlay)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Floating launcher — persists across every dashboard page, above content but out of its way */}
      <Button
        onClick={() => setOpen(true)}
        aria-label="Open farm assistant"
        className={cn(
          "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full p-0 shadow-lg",
          "bg-sage-deep hover:bg-sage-deep/90 transition-transform hover:scale-105",
          open && "hidden",
        )}
      >
        <Bot className="!h-6 !w-6" />
      </Button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end justify-end p-4 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex w-full max-w-[420px] h-[min(80vh,720px)] flex-col rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/60 bg-background"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-deep/10 text-sage-deep">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-semibold truncate">Farm Assistant</h2>
                  <p className="text-[11px] text-muted-foreground truncate">Ask anything about your farm</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-deep/10 text-sage-deep mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]">
                  Hi! I can help answer questions about your farms, plant health, alerts, and workforce. Ask me anything to get started.
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5 pt-1">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setDraft(s)}
                    className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    <Sparkles className="h-3 w-3 shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-border/60 px-3 py-3">
              <div className="flex items-end gap-2">
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Ask about your farm…"
                  className="flex-1 h-10 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full bg-sage-deep hover:bg-sage-deep/90"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
                Farm Assistant is coming soon.
              </p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
