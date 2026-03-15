/**
 * FilterService — Client-side cognitive pipeline
 * Cleans, classifies intent/emotion, routes to mini-agents.
 * In production this runs server-side; here we simulate locally.
 */
import type {
  RawMessagePayload,
  CleanResult,
  IntentResult,
  EmotionResult,
  RoutePlan,
  MiniAIResponse,
  IsabellaInput,
  MiniAIName,
  AgentTraceEntry,
} from "../types";

const INTENT_PATTERNS: [RegExp, string, number][] = [
  [/mapa|ruta|camino|explorar|dónde|ubicaci/i, "consulta_mapa", 0.92],
  [/paste[s]?|comer|restaurante|negocio|tienda/i, "consulta_comercio", 0.88],
  [/histori|patrimon|mina|museo|iglesia|panteón/i, "consulta_patrimonio", 0.90],
  [/evento|festival|feria|celebraci/i, "consulta_eventos", 0.85],
  [/ayuda|cómo|qué es|explica/i, "solicitud_ayuda", 0.80],
  [/hola|buenos|buenas|saludos/i, "saludo", 0.95],
  [/gracias|adiós|hasta luego/i, "despedida", 0.93],
  [/admin|dashboard|gestión|panel/i, "admin_acceso", 0.87],
];

const EMOTION_KEYWORDS: Record<string, [string, number][]> = {
  amor: [["hermoso", 0.7], ["increíble", 0.6], ["encanta", 0.9], ["bello", 0.7], ["maravill", 0.8]],
  tristeza: [["triste", 0.9], ["abandonad", 0.7], ["perdid", 0.6], ["solo", 0.5]],
  miedo: [["peligro", 0.8], ["miedo", 0.9], ["insegur", 0.7], ["oscur", 0.5]],
  asombro: [["wow", 0.9], ["impresionante", 0.85], ["increíble", 0.8], ["genial", 0.7]],
};

export class FilterService {
  cleanNoise(text: string): CleanResult {
    const t0 = performance.now();
    let clean = text.replace(/<[^>]*>/g, "");
    clean = clean.replace(/\s+/g, " ").trim();
    clean = clean.replace(/(.)(\1{3,})/g, "$1$1");
    // PII masking (emails, phones)
    const piiMasked = /[\w.-]+@[\w.-]+|(\+?\d{10,})/g.test(clean);
    clean = clean.replace(/[\w.-]+@[\w.-]+/g, "[EMAIL]");
    clean = clean.replace(/(\+?\d{10,})/g, "[PHONE]");
    const tokens = clean.split(/\s+/).length;
    return { cleanedText: clean, noiseScore: Math.max(0, 1 - tokens / 50), piiMasked, tokensEstimated: tokens };
  }

  classifyIntent(clean: CleanResult): IntentResult {
    const text = clean.cleanedText.toLowerCase();
    const matches: IntentResult[] = [];

    for (const [pattern, intent, conf] of INTENT_PATTERNS) {
      if (pattern.test(text)) {
        matches.push({ intent, confidence: conf });
      }
    }

    if (matches.length === 0) {
      return { intent: "general", confidence: 0.5 };
    }

    matches.sort((a, b) => b.confidence - a.confidence);
    return {
      intent: matches[0].intent,
      confidence: matches[0].confidence,
      subIntents: matches.slice(1).map((m) => m.intent),
    };
  }

  classifyEmotion(clean: CleanResult): EmotionResult {
    const text = clean.cleanedText.toLowerCase();
    const scores: Record<string, number> = {
      amor: 0, tristeza: 0, miedo: 0, odio: 0, asombro: 0, neutral: 0.3,
    };

    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      for (const [kw, weight] of keywords) {
        if (text.includes(kw)) {
          scores[emotion] = Math.min(1, (scores[emotion] || 0) + weight);
        }
      }
    }

    const entries = Object.entries(scores);
    entries.sort((a, b) => b[1] - a[1]);
    const dominant = entries[0][0] as any;
    const maxScore = entries[0][1];

    return {
      dominant: maxScore > 0.3 ? dominant : "neutral",
      scores: scores as any,
      arousal: Math.min(1, maxScore),
      valence: dominant === "amor" || dominant === "asombro" ? maxScore : -maxScore * 0.5,
    };
  }

  computeRoutePlan(intent: IntentResult, emotion: EmotionResult): RoutePlan {
    const miniAIs: MiniAIName[] = ["MiniAI_Realito"];

    if (intent.intent.includes("mapa") || intent.intent.includes("ruta")) {
      miniAIs.push("MiniAI_Explorer");
    }
    if (intent.intent.includes("patrimonio") || intent.intent.includes("evento")) {
      miniAIs.push("MiniAI_Arquitectura");
    }
    if (intent.intent.includes("comercio")) {
      miniAIs.push("MiniAI_Economia");
    }
    if (emotion.dominant === "tristeza" || emotion.dominant === "miedo") {
      miniAIs.push("MiniAI_Emocional");
    }

    const flowSpeed = emotion.arousal > 0.7 ? "rapido" : emotion.arousal > 0.3 ? "medio" : "lento";
    const priority = intent.confidence > 0.85 ? 1 : intent.confidence > 0.6 ? 2 : 3;

    return { miniAIs, flowSpeed, priority };
  }

  async runMiniAIs(plan: RoutePlan, text: string): Promise<MiniAIResponse[]> {
    const responses: MiniAIResponse[] = [];

    for (const agent of plan.miniAIs) {
      const t0 = performance.now();
      const payload = this.getMiniAIPayload(agent, text);
      const latencyMs = performance.now() - t0 + Math.random() * 30;

      responses.push({
        miniAI: agent,
        payload,
        latencyMs: Math.round(latencyMs),
        confidence: 0.7 + Math.random() * 0.25,
      });
    }

    return responses;
  }

  private getMiniAIPayload(agent: MiniAIName, text: string): unknown {
    switch (agent) {
      case "MiniAI_Explorer":
        return {
          suggestion: "Consulta el mapa interactivo en /explorer para ver rutas y puntos de interés",
          dataHints: ["markers", "routes", "events"],
        };
      case "MiniAI_Realito":
        return {
          persona: "Realito",
          style: "cercano y conocedor",
          context: "Real del Monte, Hidalgo — Pueblo Mágico con herencia minera cornish",
        };
      case "MiniAI_Emocional":
        return {
          tone: "empático y cálido",
          strategy: "validar emociones antes de informar",
        };
      case "MiniAI_Arquitectura":
        return {
          focus: "patrimonio arquitectónico y minero",
          sources: ["minas", "panteón inglés", "museo de medicina"],
        };
      case "MiniAI_Economia":
        return {
          focus: "comercios locales y pastes",
          recommendation: "apoyar economía local",
        };
      case "MiniAI_XR":
        return { mode: "inmersivo", renderEngine: "LSMRenderEngine" };
      default:
        return null;
    }
  }

  async process(payload: RawMessagePayload): Promise<IsabellaInput> {
    const cleaned = this.cleanNoise(payload.text);
    const intent = this.classifyIntent(cleaned);
    const emotion = this.classifyEmotion(cleaned);
    const routePlan = this.computeRoutePlan(intent, emotion);
    const miniResults = await this.runMiniAIs(routePlan, cleaned.cleanedText);

    return {
      userId: payload.userId,
      cleanText: cleaned.cleanedText,
      intent: intent.intent,
      intentConfidence: intent.confidence,
      emotion,
      miniResults,
      routePlan,
      metadata: payload.metadata,
    };
  }
}
