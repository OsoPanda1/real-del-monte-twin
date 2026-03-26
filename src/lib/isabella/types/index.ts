/**
 * Isabella Core™ — Type definitions for the cognitive pipeline
 * TAMVAI API NextGen types
 */

export type Emotion = "amor" | "tristeza" | "miedo" | "odio" | "asombro" | "neutral";

export type MiniAIName =
  | "MiniAI_Explorer"
  | "MiniAI_Realito"
  | "MiniAI_Emocional"
  | "MiniAI_Arquitectura"
  | "MiniAI_Economia"
  | "MiniAI_XR";

export interface RawMessagePayload {
  userId: string;
  text: string;
  channel?: "web" | "mobile" | "xr";
  audioBuffer?: ArrayBuffer;
  metadata?: Record<string, unknown>;
}

export interface CleanResult {
  cleanedText: string;
  noiseScore: number;
  piiMasked: boolean;
}

export interface IntentResult {
  intent: string;
  confidence: number;
}

export interface EmotionResult {
  dominant: Emotion;
  scores: Record<Emotion, number>;
}

export interface RoutePlan {
  miniAIs: MiniAIName[];
  flowSpeed: "lento" | "medio" | "rapido";
}

export interface MiniAIResponse {
  miniAI: MiniAIName;
  payload: unknown;
  confidence: number;
  latencyMs: number;
}

export interface IsabellaInput {
  userId: string;
  cleanText: string;
  intent: string;
  intentConfidence: number;
  emotion: EmotionResult;
  miniResults: MiniAIResponse[];
  routePlan: RoutePlan;
  metadata?: Record<string, unknown>;
}

export interface IsabellaResponse {
  ok: boolean;
  responseText: string;
  isabellaInput: IsabellaInput;
  agentTrace: AgentTraceEntry[];
  sessionId: string;
}

export interface AgentTraceEntry {
  agent: string;
  action: string;
  durationMs: number;
  timestamp: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  emotion?: Emotion;
  agentTrace?: AgentTraceEntry[];
}

export interface IsabellaSessionState {
  sessionId: string;
  messages: ConversationMessage[];
  currentEmotion: EmotionResult | null;
  activeAgents: MiniAIName[];
  bookpiCount: number;
  isProcessing: boolean;
}

export interface BookPIRecord {
  id: string;
  userId: string;
  timestamp: string;
  rawHash: string;
  cleanText: string;
  intent: string;
  emotion: Emotion;
  routePlan: RoutePlan;
  decisionSummary?: string;
}
