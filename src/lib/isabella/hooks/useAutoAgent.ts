/**
 * useAutoAgent — Conecta cualquier MFE al SovereignEngine TAMV MD-X4
 * Llama a la edge function `sovereign-engine` (Lovable AI + skills + guardian).
 */
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  IsabellaSessionState,
  ConversationMessage,
  AgentTraceEntry,
  Emotion,
  MiniAIName,
} from "../types";

function newSession(): IsabellaSessionState {
  return {
    sessionId: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    messages: [{
      id: `msg-welcome-${Date.now()}`,
      role: "assistant",
      text: "¡Hola! Soy **Realito**, tu agente cognitivo soberano de RDM-X v2 conectado al **SovereignEngine TAMV MD-X4**. 🏔️\n\nPregúntame sobre lugares, comercios, eventos, rutas o el patrimonio de Real del Monte.",
      timestamp: new Date().toISOString(),
    }],
    currentEmotion: null,
    activeAgents: [],
    bookpiCount: 0,
    isProcessing: false,
  };
}

export function useAutoAgent() {
  const [session, setSession] = useState<IsabellaSessionState>(newSession);
  const [loading, setLoading] = useState(false);
  const processingRef = useRef(false);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || processingRef.current) return null;
    processingRef.current = true;
    setLoading(true);

    const userMsg: ConversationMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setSession((prev) => ({ ...prev, messages: [...prev.messages, userMsg], isProcessing: true }));

    try {
      const { data, error } = await supabase.functions.invoke("sovereign-engine", {
        body: { text, sessionId: session.sessionId, channel: "realito" },
      });

      if (error || !data?.ok) {
        const fallbackMsg: ConversationMessage = {
          id: `msg-${Date.now()}-a`,
          role: "assistant",
          text: "El nodo cognitivo no respondió. Inténtalo de nuevo en un momento. 🛠️",
          timestamp: new Date().toISOString(),
        };
        setSession((prev) => ({ ...prev, messages: [...prev.messages, fallbackMsg], isProcessing: false }));
        return null;
      }

      const trace: AgentTraceEntry[] = (data.agentTrace || []).map((t: any) => ({
        agent: t.agent,
        action: t.action,
        durationMs: t.durationMs,
        timestamp: new Date().toISOString(),
      }));

      const emotion = data.emotion as Emotion;
      const agentsInvoked: MiniAIName[] = (data.agentsInvoked || [])
        .filter((a: string) => a.startsWith("MiniAI_"))
        .concat(["MiniAI_Realito" as MiniAIName]);

      const assistantMsg: ConversationMessage = {
        id: `msg-${Date.now()}-a`,
        role: "assistant",
        text: data.responseText,
        timestamp: new Date().toISOString(),
        agentTrace: trace,
      };

      const userMsgWithEmotion = { ...userMsg, emotion };

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages.slice(0, -1), userMsgWithEmotion, assistantMsg],
        currentEmotion: { dominant: emotion, scores: { amor: 0, tristeza: 0, miedo: 0, odio: 0, asombro: 0, neutral: 1 } },
        activeAgents: agentsInvoked as MiniAIName[],
        bookpiCount: prev.bookpiCount + 1,
        isProcessing: false,
      }));
      return data;
    } catch (e) {
      console.error("[SovereignEngine]", e);
      return null;
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  }, [session.sessionId]);

  const reset = useCallback(() => setSession(newSession()), []);

  return {
    session,
    send,
    loading,
    reset,
    messages: session.messages,
    activeAgents: session.activeAgents,
    currentEmotion: session.currentEmotion,
    bookpiCount: session.bookpiCount,
  };
}
