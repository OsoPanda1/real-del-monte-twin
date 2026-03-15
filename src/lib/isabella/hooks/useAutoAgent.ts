/**
 * useAutoAgent — Hook to connect any MFE to Isabella Core™
 */
import { useState, useCallback, useRef } from "react";
import type { IsabellaSessionState, IsabellaResponse } from "../types";
import { isabellaEngine } from "../core/isabellaEngine";

export function useAutoAgent() {
  const [session, setSession] = useState<IsabellaSessionState>(() =>
    isabellaEngine.createSession()
  );
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<IsabellaResponse | null>(null);
  const processingRef = useRef(false);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || processingRef.current) return null;

    processingRef.current = true;
    setLoading(true);
    setSession((prev) => ({ ...prev, isProcessing: true }));

    try {
      // Simulate slight network latency for UX
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

      const { response, updatedSession } = await isabellaEngine.processMessage(
        text,
        session
      );

      setSession({ ...updatedSession, isProcessing: false });
      setLastResponse(response);
      return response;
    } finally {
      setLoading(false);
      processingRef.current = false;
      setSession((prev) => ({ ...prev, isProcessing: false }));
    }
  }, [session]);

  const reset = useCallback(() => {
    setSession(isabellaEngine.createSession());
    setLastResponse(null);
  }, []);

  return {
    session,
    send,
    loading,
    lastResponse,
    reset,
    messages: session.messages,
    activeAgents: session.activeAgents,
    currentEmotion: session.currentEmotion,
    bookpiCount: session.bookpiCount,
  };
}
