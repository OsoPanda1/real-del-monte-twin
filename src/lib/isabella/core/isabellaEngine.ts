/**
 * IsabellaEngine — The cognitive core of Realito AI Isabella Core™
 * Orchestrates FilterService → MiniAIs → Response Generation → BookPI
 */
import type {
  RawMessagePayload,
  IsabellaResponse,
  ConversationMessage,
  AgentTraceEntry,
  IsabellaSessionState,
  MiniAIResponse,
} from "../types";
import { FilterService } from "./filterService";

const REALITO_RESPONSES: Record<string, string[]> = {
  saludo: [
    "¡Hola! Soy Realito, tu guía digital de Real del Monte. 🏔️ ¿Qué te gustaría descubrir hoy?",
    "¡Bienvenido al gemelo digital de Real del Monte! ¿Te cuento sobre nuestras minas, pastes o rutas?",
    "¡Qué gusto saludarte! Real del Monte tiene mucho que ofrecer. ¿Por dónde empezamos?",
  ],
  despedida: [
    "¡Hasta pronto! Real del Monte siempre te espera. 🌄",
    "¡Nos vemos! No olvides probar los pastes cuando vengas. 🥟",
  ],
  consulta_mapa: [
    "¡Excelente pregunta! Puedes explorar el mapa interactivo con todos los puntos de interés, rutas históricas y negocios activos. Te recomiendo visitar la Mina de Acosta y el Panteón Inglés.",
    "El gemelo digital de RDM tiene capas de terreno 3D, comercios, rutas y patrimonio. ¿Quieres que te guíe a algún lugar específico?",
  ],
  consulta_comercio: [
    "Real del Monte es famoso por sus pastes — herencia de los mineros cornish del siglo XIX. Te recomiendo Pastes El Portal y los puestos de la plaza principal. 🥟",
    "Hay varios comercios locales activos en el gemelo digital. Desde pastelerías tradicionales hasta tiendas de artesanías. ¿Buscas algo específico?",
  ],
  consulta_patrimonio: [
    "El patrimonio de Real del Monte es extraordinario: la Mina de Acosta (siglo XVI), el Panteón Inglés con tumbas de mineros cornish, el Museo de Medicina Laboral y la Iglesia de la Asunción. ¿Cuál te interesa?",
    "Como Pueblo Mágico, Real del Monte conserva su herencia minera británica única en México. Las calles empedradas, las fachadas coloniales y las minas son testigos de más de 400 años de historia.",
  ],
  consulta_eventos: [
    "Real del Monte celebra la Feria del Paste cada octubre, el Festival Cultural Minero y diversas fiestas patronales. ¿Te gustaría ver los eventos activos en el gemelo digital?",
  ],
  solicitud_ayuda: [
    "¡Con gusto te ayudo! Puedo informarte sobre:\n• 🗺️ Rutas y lugares de interés\n• 🏛️ Patrimonio histórico\n• 🥟 Gastronomía y comercios\n• 📊 El gemelo digital RDM-X\n¿Qué necesitas?",
  ],
  admin_acceso: [
    "El panel de administración RDM-X está disponible en /admin. Desde ahí puedes gestionar lugares, negocios, eventos y el ecosistema digital.",
  ],
  general: [
    "Interesante pregunta. Real del Monte es un pueblo con alma de dos continentes — México y Cornwall. ¿Puedo ayudarte con algo más específico?",
    "Soy Realito, experto en todo lo que hace especial a Real del Monte. Pregúntame sobre historia, gastronomía, rutas o el gemelo digital.",
  ],
};

export class IsabellaEngine {
  private filter: FilterService;
  private sessionCounter = 0;

  constructor() {
    this.filter = new FilterService();
  }

  createSession(): IsabellaSessionState {
    this.sessionCounter++;
    return {
      sessionId: `isa-${Date.now()}-${this.sessionCounter}`,
      messages: [{
        id: `msg-welcome-${Date.now()}`,
        role: "assistant",
        text: "¡Hola! Soy **Realito**, tu asistente cognitivo de Real del Monte. Estoy conectado al gemelo digital RDM-X y puedo ayudarte a explorar este Pueblo Mágico. 🏔️\n\n¿Qué te gustaría descubrir?",
        timestamp: new Date().toISOString(),
      }],
      currentEmotion: null,
      activeAgents: [],
      bookpiCount: 0,
      isProcessing: false,
    };
  }

  async processMessage(
    text: string,
    session: IsabellaSessionState
  ): Promise<{ response: IsabellaResponse; updatedSession: IsabellaSessionState }> {
    const traceStart = performance.now();
    const trace: AgentTraceEntry[] = [];

    // Step 1: Filter pipeline
    const t0 = performance.now();
    const isabellaInput = await this.filter.process({
      userId: "user-local",
      text,
      channel: "web",
    });
    trace.push({
      agent: "FilterService",
      action: `cleaned → intent:${isabellaInput.intent}(${(isabellaInput.intentConfidence * 100).toFixed(0)}%) emotion:${isabellaInput.emotion.dominant}`,
      durationMs: Math.round(performance.now() - t0),
      timestamp: new Date().toISOString(),
    });

    // Step 2: Log mini-agent traces
    for (const mini of isabellaInput.miniResults) {
      trace.push({
        agent: mini.miniAI,
        action: `processed with ${(mini.confidence * 100).toFixed(0)}% confidence`,
        durationMs: mini.latencyMs,
        timestamp: new Date().toISOString(),
      });
    }

    // Step 3: Generate response
    const t1 = performance.now();
    const responseText = this.generateResponse(isabellaInput.intent, isabellaInput.emotion.dominant, isabellaInput.miniResults);
    trace.push({
      agent: "IsabellaEngine",
      action: "response generated",
      durationMs: Math.round(performance.now() - t1),
      timestamp: new Date().toISOString(),
    });

    const totalMs = Math.round(performance.now() - traceStart);
    trace.push({
      agent: "Pipeline",
      action: `total ${totalMs}ms · ${isabellaInput.routePlan.miniAIs.length} agents · flow:${isabellaInput.routePlan.flowSpeed}`,
      durationMs: totalMs,
      timestamp: new Date().toISOString(),
    });

    const response: IsabellaResponse = {
      ok: true,
      responseText,
      isabellaInput,
      agentTrace: trace,
      sessionId: session.sessionId,
    };

    // Update session
    const userMsg: ConversationMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
      emotion: isabellaInput.emotion.dominant,
    };

    const assistantMsg: ConversationMessage = {
      id: `msg-${Date.now()}-a`,
      role: "assistant",
      text: responseText,
      timestamp: new Date().toISOString(),
      agentTrace: trace,
    };

    const updatedSession: IsabellaSessionState = {
      ...session,
      messages: [...session.messages, userMsg, assistantMsg],
      currentEmotion: isabellaInput.emotion,
      activeAgents: isabellaInput.routePlan.miniAIs,
      bookpiCount: session.bookpiCount + 1,
    };

    return { response, updatedSession };
  }

  private generateResponse(intent: string, emotion: string, miniResults: MiniAIResponse[]): string {
    const pool = REALITO_RESPONSES[intent] || REALITO_RESPONSES.general;
    const base = pool[Math.floor(Math.random() * pool.length)];

    // Enrich with emotional context
    let enrichment = "";
    if (emotion === "tristeza") {
      enrichment = "\n\n_Noto algo de melancolía en tus palabras. Real del Monte tiene esa magia de reconfortar el alma._";
    } else if (emotion === "asombro") {
      enrichment = "\n\n_¡Me encanta tu entusiasmo! Real del Monte tiene mucho más por descubrir._";
    } else if (emotion === "amor") {
      enrichment = "\n\n_Se nota tu cariño por este lugar. Real del Monte deja huella en quien lo visita._";
    }

    return base + enrichment;
  }
}

// Singleton
export const isabellaEngine = new IsabellaEngine();
