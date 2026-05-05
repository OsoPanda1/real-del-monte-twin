import { useState, useRef, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Sparkles, Brain,
  Zap, Activity, ChevronDown, RotateCcw
} from "lucide-react";
import { useAutoAgent } from "@/lib/isabella/hooks/useAutoAgent";
import type { ConversationMessage, AgentTraceEntry, MiniAIName } from "@/lib/isabella/types";

const ease = [0.2, 0, 0, 1] as const;

const AGENT_COLORS: Record<string, string> = {
  "MiniAI_Explorer": "bg-accent/20 text-accent",
  "MiniAI_Realito": "bg-primary/20 text-primary",
  "MiniAI_Emocional": "bg-pink-500/20 text-pink-400",
  "MiniAI_Arquitectura": "bg-amber-500/20 text-amber-400",
  "MiniAI_Economia": "bg-emerald-500/20 text-emerald-400",
  "MiniAI_XR": "bg-violet-500/20 text-violet-400",
  "FilterService": "bg-muted text-muted-foreground",
  "IsabellaEngine": "bg-primary/10 text-primary",
  "Pipeline": "bg-secondary text-secondary-foreground",
};

const EMOTION_ICONS: Record<string, string> = {
  amor: "💛", tristeza: "🌧️", miedo: "⚡", odio: "🔥",
  asombro: "✨", neutral: "○",
};

function AgentTraceBadge({ entry }: { entry: AgentTraceEntry }) {
  const colorClass = AGENT_COLORS[entry.agent] || "bg-muted text-muted-foreground";
  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-mono ${colorClass}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Zap className="w-2 h-2" />
      <span className="font-semibold">{entry.agent}</span>
      <span className="opacity-60">{entry.durationMs}ms</span>
    </motion.div>
  );
}

function MessageBubble({ msg, index }: { msg: ConversationMessage; index: number }) {
  const isUser = msg.role === "user";
  const [showTrace, setShowTrace] = useState(false);

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease, delay: index * 0.05 }}
    >
      <div className="max-w-[85%] space-y-1">
        {/* Emotion indicator for user messages */}
        {isUser && msg.emotion && msg.emotion !== "neutral" && (
          <div className="flex justify-end">
            <span className="text-[10px] tabular-data text-muted-foreground">
              {EMOTION_ICONS[msg.emotion]} {msg.emotion}
            </span>
          </div>
        )}

        <div
          className={`rounded-lg px-4 py-2.5 text-xs leading-relaxed ${
            isUser
              ? "bg-primary/15 border border-primary/20 text-foreground"
              : "bg-muted/80 border border-border/30 text-foreground"
          }`}
        >
          {/* Render with basic markdown-like formatting */}
          {msg.text.split("\n").map((line, i) => {
            if (line.startsWith("• ")) {
              return <div key={i} className="pl-1 py-0.5">{line}</div>;
            }
            // Bold
            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Italic
            const formatted2 = formatted.replace(/_(.*?)_/g, '<em class="text-muted-foreground">$1</em>');
            return (
              <span key={i} dangerouslySetInnerHTML={{ __html: formatted2 + (i < msg.text.split("\n").length - 1 ? "<br/>" : "") }} />
            );
          })}
        </div>

        {/* Agent trace (expandable) */}
        {!isUser && msg.agentTrace && msg.agentTrace.length > 0 && (
          <div>
            <button
              onClick={() => setShowTrace(!showTrace)}
              className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors tabular-data"
            >
              <Activity className="w-2.5 h-2.5" />
              <span>{msg.agentTrace.length} agents · {msg.agentTrace[msg.agentTrace.length - 1]?.durationMs}ms total</span>
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showTrace ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showTrace && (
                <motion.div
                  className="flex flex-wrap gap-1 mt-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.agentTrace.map((t, i) => (
                    <AgentTraceBadge key={i} entry={t} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProcessingIndicator({ agents }: { agents: MiniAIName[] }) {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-muted/60 border border-border/20 rounded-lg px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-3 h-3 text-primary" />
          </motion.div>
          <span className="text-[10px] tabular-data text-muted-foreground">
            Isabella Core™ procesando...
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {agents.length > 0 ? agents.map((a, i) => (
            <motion.span
              key={a}
              className={`text-[8px] px-1.5 py-0.5 rounded ${AGENT_COLORS[a] || "bg-muted text-muted-foreground"}`}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: [0.4, 1, 0.4], x: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            >
              {a.replace("MiniAI_", "")}
            </motion.span>
          )) : (
            <motion.span
              className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              Analizando...
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const RealitoChat = forwardRef<HTMLDivElement>((_props, _ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages, send, loading, activeAgents,
    currentEmotion, bookpiCount, reset, model, setModel,
  } = useAutoAgent();

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input;
    setInput("");
    await send(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Launcher */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-glow-gold transition-transform hover:scale-105 group"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.93 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] glass-panel-strong border-sovereign overflow-hidden flex flex-col"
            style={{ height: "520px" }}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ duration: 0.35, ease }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/40 flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-sans font-semibold text-sm text-foreground leading-tight">
                  Realito <span className="text-[9px] font-normal text-muted-foreground">Isabella Core™</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="tabular-data text-[9px] text-muted-foreground">
                    {activeAgents.length > 0
                      ? `${activeAgents.length} agentes activos`
                      : "Asistente Cognitivo"}
                  </span>
                  {currentEmotion && currentEmotion.dominant !== "neutral" && (
                    <span className="text-[9px]">{EMOTION_ICONS[currentEmotion.dominant]}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {bookpiCount > 0 && (
                  <span className="tabular-data text-[8px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    BookPI:{bookpiCount}
                  </span>
                )}
                <button
                  onClick={reset}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                  title="Nueva sesión"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Active agents bar */}
            <AnimatePresence>
              {activeAgents.length > 0 && !loading && (
                <motion.div
                  className="px-4 py-1.5 border-b border-border/20 flex items-center gap-1 overflow-x-auto"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <Brain className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                  {activeAgents.map((a) => (
                    <span
                      key={a}
                      className={`text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap ${AGENT_COLORS[a] || "bg-muted text-muted-foreground"}`}
                    >
                      {a.replace("MiniAI_", "")}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
              {messages.map((msg, i) => (
                <MessageBubble key={msg.id} msg={msg} index={i} />
              ))}

              <AnimatePresence>
                {loading && <ProcessingIndicator agents={activeAgents} />}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/40">
              <div className="flex items-center gap-2 bg-muted/60 border border-border/30 rounded-lg px-3 py-2 focus-within:border-primary/30 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pregunta sobre Real del Monte..."
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-7 h-7 rounded-md bg-primary flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Send className="w-3 h-3 text-primary-foreground" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1 gap-2">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-transparent text-[8px] text-muted-foreground/80 outline-none border border-border/30 rounded px-1 py-0.5"
                  title="Modelo IA"
                >
                  <option value="google/gemini-3-flash-preview">Gemini 3 Flash</option>
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="openai/gpt-5-mini">GPT-5 Mini</option>
                  <option value="openai/gpt-5-nano">GPT-5 Nano</option>
                </select>
                <span className="tabular-data text-[8px] text-muted-foreground/60">
                  TAMVAI · RDM-X
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

RealitoChat.displayName = "RealitoChat";

export default RealitoChat;
