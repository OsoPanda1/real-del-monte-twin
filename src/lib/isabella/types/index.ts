/**
 * @tamv/isabella-core — Realito AI Isabella Core™
 * Type system for the federated cognitive engine.
 */

export type Emotion = "amor" | "tristeza" | "miedo" | "odio" | "asombro" | "neutral";

export type FlowSpeed = "lento" | "medio" | "rapido";

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
  channel: "web" | "mobile" | "xr" | "api";
  metadata?: Record<string, unknown>;
}

export interface CleanResult {
  cleanedText: string;
  noiseScore: number;
  piiMasked: boolean;
  tokensEstimated: number;
}

export interface IntentResult {
  intent: string;
  confidence: number;
  subIntents?: string[];
}

export interface EmotionResult {
  dominant: Emotion;
  scores: Record<Emotion, number>;
  arousal: number; // 0-1
  valence: number; // -1 to 1
}

export interface RoutePlan {
  miniAIs: MiniAIName[];
  flowSpeed: FlowSpeed;
  priority: number;
}

export interface MiniAIResponse {
  miniAI: MiniAIName;
  payload: unknown;
  latencyMs: number;
  confidence: number;
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

export interface BookPIRecord {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  rawHash: string;
  cleanText: string;
  intent: string;
  emotion: Emotion;
  routePlan: RoutePlan;
  agentTrace: AgentTraceEntry[];
  decisionSummary: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system" | "agent-trace";
  text: string;
  timestamp: string;
  emotion?: Emotion;
  miniAI?: MiniAIName;
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
