/**
 * FilterService — Production-grade cognitive pipeline
 * Noise cleaning → PII masking → Intent classification → Emotion detection → Route planning
 */
import type {
  RawMessagePayload,
  CleanResult,
  IntentResult,
  EmotionResult,
  RoutePlan,
  IsabellaInput,
  MiniAIResponse,
  MiniAIName,
} from "../types";

const INTENT_PATTERNS: { intent: string; patterns: RegExp[]; confidence: number }[] = [
  { intent: "saludo", patterns: [/^hola$/i, /buenas?\s*(tardes|noches|días|dias)/i, /^hey$/i, /^qué\s*tal/i, /^saludos/i], confidence: 0.95 },
  { intent: "despedida", patterns: [/^adiós$/i, /^adios$/i, /^bye$/i, /hasta\s*(luego|pronto)/i, /nos\s*vemos/i, /^chao$/i], confidence: 0.95 },
  { intent: "consulta_mapa", patterns: [/mapa/i, /dónde\s*(está|queda)/i, /ubicaci[oó]n/i, /c[oó]mo\s*llego/i, /direcci[oó]n/i, /coordenadas/i, /gemelo\s*digital/i, /3d/i], confidence: 0.9 },
  { intent: "consulta_comercio", patterns: [/paste[s]?/i, /comer/i, /comida/i, /restaurante/i, /tienda/i, /negocio/i, /platería/i, /artesanía/i, /comprar/i, /comercio/i, /michelada/i], confidence: 0.88 },
  { intent: "consulta_patrimonio", patterns: [/mina/i, /pante[oó]n/i, /inglés/i, /historia/i, /patrimonio/i, /museo/i, /iglesia/i, /colonial/i, /cornish/i, /minero/i, /acosta/i], confidence: 0.9 },
  { intent: "consulta_eventos", patterns: [/evento/i, /festival/i, /feria/i, /fiesta/i, /celebra/i, /qu[eé]\s*hay/i], confidence: 0.85 },
  { intent: "consulta_rutas", patterns: [/ruta/i, /sendero/i, /caminar/i, /recorrido/i, /paseo/i, /trail/i, /senderismo/i], confidence: 0.87 },
  { intent: "solicitud_ayuda", patterns: [/ayuda/i, /ayúdame/i, /qu[eé]\s*puedes/i, /opciones/i, /qué\s*haces/i, /funciones/i], confidence: 0.85 },
  { intent: "admin_acceso", patterns: [/admin/i, /panel/i, /dashboard/i, /gestionar/i, /configurar/i, /backoffice/i], confidence: 0.82 },
  { intent: "consulta_sanitarios", patterns: [/ba[nñ]o/i, /sanitario/i, /wc/i, /toilet/i, /servicio/i], confidence: 0.85 },
];

const EMOTION_KEYWORDS: Record<string, string[]> = {
  amor: ["hermoso", "bello", "increíble", "maravilloso", "fantástico", "amo", "encanta", "precioso", "genial", "perfecto", "love", "bonito"],
  tristeza: ["triste", "mal", "difícil", "extraño", "melancolía", "nostálgico", "solo", "problema"],
  miedo: ["miedo", "peligro", "inseguro", "asustado", "preocupo", "riesgo"],
  asombro: ["wow", "sorprendente", "impresionante", "asombroso", "increíble", "guau", "órale", "espectacular"],
  odio: ["odio", "horrible", "terrible", "pésimo", "basura", "peor"],
};

export class FilterService {
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

  cleanNoise(text: string): CleanResult {
    let processed = text
      .replace(/<[^>]*>/g, "")
      .replace(/https?:\/\/\S+/g, "[link]")
      .replace(/\s+/g, " ")
      .trim();
    processed = processed.replace(/(.)\1{3,}/g, "$1$1");
    let piiMasked = false;
    if (/\b\d{10,}\b/.test(processed)) {
      processed = processed.replace(/\b\d{10,}\b/g, "[PHONE]");
      piiMasked = true;
    }
    if (/\b[\w.-]+@[\w.-]+\.\w+\b/.test(processed)) {
      processed = processed.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[EMAIL]");
      piiMasked = true;
    }
    const noiseScore = 1 - processed.length / Math.max(text.length, 1);
    return { cleanedText: processed, noiseScore: Math.max(0, noiseScore), piiMasked };
  }

  classifyIntent(clean: CleanResult): IntentResult {
    const text = clean.cleanedText.toLowerCase();
    for (const { intent, patterns, confidence } of INTENT_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return { intent, confidence };
        }
      }
    }
    return { intent: "general", confidence: 0.5 };
  }

  classifyEmotion(clean: CleanResult): EmotionResult {
    const text = clean.cleanedText.toLowerCase();
    const scores: Record<string, number> = {
      amor: 0, tristeza: 0, miedo: 0, odio: 0, asombro: 0, neutral: 0.3,
    };
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      for (const kw of keywords) {
        if (text.includes(kw)) {
          scores[emotion] += 0.35;
        }
      }
    }
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations > 0) scores.asombro += exclamations * 0.1;

    let dominant = "neutral" as string;
    let maxScore = scores.neutral;
    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        dominant = emotion;
        maxScore = score;
      }
    }
    return { dominant: dominant as any, scores: scores as any };
  }

  computeRoutePlan(intent: IntentResult, emotion: EmotionResult): RoutePlan {
    const miniAIs: MiniAIName[] = [];
    if (intent.intent.includes("mapa") || intent.intent.includes("ruta")) miniAIs.push("MiniAI_Explorer");
    if (intent.intent.includes("comercio") || intent.intent.includes("sanitario")) miniAIs.push("MiniAI_Economia");
    if (intent.intent.includes("patrimonio") || intent.intent.includes("evento")) miniAIs.push("MiniAI_Arquitectura");
    if (emotion.dominant === "tristeza" || emotion.dominant === "miedo") miniAIs.push("MiniAI_Emocional");
    if (!miniAIs.includes("MiniAI_Realito")) miniAIs.push("MiniAI_Realito");

    const flowSpeed: RoutePlan["flowSpeed"] =
      emotion.dominant === "tristeza" ? "lento" :
      emotion.dominant === "asombro" || emotion.dominant === "amor" ? "rapido" : "medio";

    return { miniAIs, flowSpeed };
  }

  async runMiniAIs(plan: RoutePlan, text: string): Promise<MiniAIResponse[]> {
    const tasks = plan.miniAIs.map(async (name): Promise<MiniAIResponse> => {
      const t0 = performance.now();
      await new Promise((r) => setTimeout(r, 5 + Math.random() * 15));
      let payload: unknown;
      switch (name) {
        case "MiniAI_Explorer":
          payload = { hint: "datos geoespaciales, marcadores, terreno 3D", layers: ["terrain", "commerce", "heritage"] };
          break;
        case "MiniAI_Realito":
          payload = { persona: "Realito", style: "cercano", knowledge: "pastes, minas, platerías" };
          break;
        case "MiniAI_Emocional":
          payload = { tone: "calmo y empático", suggestion: "validar emociones" };
          break;
        case "MiniAI_Arquitectura":
          payload = { focus: "patrimonio histórico, minas, herencia británica" };
          break;
        case "MiniAI_Economia":
          payload = { focus: "comercios locales, precios, horarios" };
          break;
        case "MiniAI_XR":
          payload = { mode: "3D immersive" };
          break;
        default:
          payload = null;
      }
      return { miniAI: name, payload, confidence: 0.7 + Math.random() * 0.25, latencyMs: Math.round(performance.now() - t0) };
    });
    return Promise.all(tasks);
  }
}
