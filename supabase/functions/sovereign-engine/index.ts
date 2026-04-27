// SovereignEngine — Núcleo cognitivo soberano TAMV MD-X4 / RDM-X v2
// Adaptación serverless del Nodo Cero: planner + skills + cultural guardian + Lovable AI fallback
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// ============================================================
// In-memory cache (per-isolate). LRU-ish.
// ============================================================
const cache = new Map<string, { value: any; expiresAt: number }>();
const CACHE_MAX = 200;
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheGet(key: string) {
  const e = cache.get(key);
  if (e && Date.now() < e.expiresAt) return e.value;
  if (e) cache.delete(key);
  return null;
}
function cacheSet(key: string, value: any) {
  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ============================================================
// Anonymizer (PII mask)
// ============================================================
function anonymize(text: string): { clean: string; masked: boolean } {
  let masked = false;
  let out = text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, () => {
      masked = true;
      return "[EMAIL]";
    })
    .replace(/\b(?:\+?52[\s-]?)?(?:\d{2,3}[\s-]?){2}\d{4}\b/g, (m) => {
      if (m.replace(/\D/g, "").length >= 8) {
        masked = true;
        return "[TEL]";
      }
      return m;
    });
  return { clean: out.replace(/\s+/g, " ").trim(), masked };
}

// ============================================================
// Radar Quetzalcóatl + Ojo de Ra (toxicidad + ruido)
// ============================================================
const TOXIC_PATTERNS = [
  /\b(idiota|estúpido|estupido|pendejo|mierda|carajo)\b/i,
  /\b(matar|muere|asesinar|odio extremo)\b/i,
];
const NOISE_PATTERNS = [
  /(.)\1{6,}/, // aaaaaaa
  /[A-Z]{15,}/, // GRITOS LARGOS
  /(http[s]?:\/\/\S+\s*){3,}/, // 3+ urls = spam
];

function radarScan(text: string) {
  const t = text || "";
  const toxic = TOXIC_PATTERNS.reduce(
    (acc, r) => acc + (r.test(t) ? 0.4 : 0),
    0,
  );
  const noise = NOISE_PATTERNS.reduce(
    (acc, r) => acc + (r.test(t) ? 0.3 : 0),
    0,
  );
  const toxicity = Math.min(1, toxic);
  const noiseScore = Math.min(1, noise);
  let classification: "high_signal" | "neutral" | "noise" | "toxic" = "neutral";
  let routedTo = "main_feed";
  if (toxicity >= 0.8) {
    classification = "toxic";
    routedTo = "kaos_quarantine";
  } else if (noiseScore >= 0.6) {
    classification = "noise";
    routedTo = "kaos_federation";
  } else if (t.length > 40 && /\?|cómo|qué|cuál|dónde/i.test(t)) {
    classification = "high_signal";
  }
  return {
    toxicity,
    noise: noiseScore,
    classification,
    routedTo,
    signalScore: 1 - (toxicity + noiseScore) / 2,
  };
}

// ============================================================
// Intent + Emotion (regex/lexicón ligero — soberano, sin LLM)
// ============================================================
const INTENTS: { intent: string; patterns: RegExp[]; confidence: number }[] = [
  {
    intent: "saludo",
    patterns: [/^(hola|buenas|buenos d[ií]as|qué tal|saludos)/i],
    confidence: 0.95,
  },
  {
    intent: "despedida",
    patterns: [/(adi[oó]s|hasta luego|bye|nos vemos|chao)/i],
    confidence: 0.9,
  },
  {
    intent: "consulta_mapa",
    patterns: [/(mapa|d[oó]nde|ubicaci[oó]n|c[oó]mo llegar|navegar)/i],
    confidence: 0.88,
  },
  {
    intent: "consulta_comercio",
    patterns: [/(paste[s]?|comer|restaurante|plater[ií]a|artesan[ií]a|tienda|comercio)/i],
    confidence: 0.92,
  },
  {
    intent: "consulta_patrimonio",
    patterns: [/(mina|panteón|panteon|acosta|historia|patrimonio|iglesia|museo)/i],
    confidence: 0.93,
  },
  {
    intent: "consulta_eventos",
    patterns: [/(feria|festival|evento|fiesta|celebraci[oó]n)/i],
    confidence: 0.9,
  },
  {
    intent: "consulta_rutas",
    patterns: [/(ruta|recorrido|itinerario|tour|sendero|caminar)/i],
    confidence: 0.88,
  },
  {
    intent: "consulta_horario",
    patterns: [/(horario|abre|cierra|abierto|cerrado|qué hora)/i],
    confidence: 0.94,
  },
  {
    intent: "consulta_sanitarios",
    patterns: [/(sanitario|baño|bano|wc|toilet)/i],
    confidence: 0.95,
  },
  {
    intent: "solicitud_ayuda",
    patterns: [/(ayuda|ayúdame|ayudame|necesito|c[oó]mo)/i],
    confidence: 0.85,
  },
  {
    intent: "admin_acceso",
    patterns: [/(admin|panel|dashboard|administr)/i],
    confidence: 0.82,
  },
];

function classifyIntent(text: string) {
  for (const i of INTENTS) {
    for (const p of i.patterns) {
      if (p.test(text)) return { intent: i.intent, confidence: i.confidence };
    }
  }
  return { intent: "general", confidence: 0.4 };
}

const EMOTION_LEX: Record<string, string[]> = {
  amor: ["amo", "encanta", "adoro", "hermoso", "precioso", "❤️", "💛"],
  tristeza: ["triste", "melanc", "extraño", "perdido", "solo", "vacío"],
  miedo: ["miedo", "asustad", "preocup", "ansie", "nervios"],
  odio: ["odio", "harto", "molest", "asco", "horrible"],
  asombro: ["wow", "increíble", "asombr", "impresion", "fascin", "✨"],
};
function detectEmotion(text: string) {
  const t = text.toLowerCase();
  const scores: Record<string, number> = {
    amor: 0, tristeza: 0, miedo: 0, odio: 0, asombro: 0, neutral: 0.3,
  };
  for (const [emo, words] of Object.entries(EMOTION_LEX)) {
    for (const w of words) if (t.includes(w)) scores[emo] += 0.4;
  }
  let dominant = "neutral";
  let max = scores.neutral;
  for (const [k, v] of Object.entries(scores)) {
    if (v > max) { max = v; dominant = k; }
  }
  return { dominant, scores };
}

// ============================================================
// Skills — consultan datos territoriales reales (Supabase)
// ============================================================
type Ctx = {
  userId: string | null;
  channel: string;
  sessionId: string;
  supabase: ReturnType<typeof createClient>;
};

async function skillPlaces(query: string, ctx: Ctx) {
  const q = query.toLowerCase();
  const { data } = await ctx.supabase
    .from("places")
    .select("name, description, category, lat, lng, elevation")
    .eq("status", "public")
    .limit(80);
  if (!data || data.length === 0) return null;
  const matches = data.filter((p: any) =>
    (p.name || "").toLowerCase().includes(q) ||
    (p.description || "").toLowerCase().includes(q) ||
    q.includes((p.name || "").toLowerCase().split(" ")[0] || "___"),
  );
  const list = (matches.length ? matches : data.slice(0, 4)).slice(0, 4);
  return list
    .map((p: any) => `• **${p.name}** — ${p.description || p.category}${p.elevation ? ` (${p.elevation} msnm)` : ""}`)
    .join("\n");
}

async function skillBusinesses(query: string, ctx: Ctx) {
  const q = query.toLowerCase();
  const { data } = await ctx.supabase
    .from("businesses")
    .select("name, description, category, hours, phone")
    .eq("status", "public")
    .limit(40);
  if (!data || data.length === 0) return null;
  const matches = data.filter((b: any) =>
    (b.name || "").toLowerCase().includes(q) ||
    (b.description || "").toLowerCase().includes(q) ||
    (b.category || "").toLowerCase().includes(q),
  );
  const list = (matches.length ? matches : data.slice(0, 4)).slice(0, 4);
  return list
    .map((b: any) => `• **${b.name}** — ${b.description || b.category}${b.hours ? ` · 🕐 ${b.hours}` : ""}${b.phone ? ` · 📞 ${b.phone}` : ""}`)
    .join("\n");
}

async function skillEvents(_q: string, ctx: Ctx) {
  const { data } = await ctx.supabase
    .from("events")
    .select("title, description, category, location, event_date")
    .order("event_date", { ascending: true })
    .limit(5);
  if (!data || data.length === 0) return null;
  return data
    .map((e: any) => {
      const date = e.event_date
        ? new Date(e.event_date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })
        : "";
      return `• **${e.title}** ${date ? `(${date})` : ""}${e.location ? ` — 📍 ${e.location}` : ""}`;
    })
    .join("\n");
}

async function skillRoutes(_q: string, ctx: Ctx) {
  const { data } = await ctx.supabase
    .from("routes")
    .select("name, description, duration_minutes, difficulty")
    .limit(5);
  if (!data || data.length === 0) return null;
  return data
    .map((r: any) => `• **${r.name}** — ${r.description || ""} ${r.duration_minutes ? `· ⏱ ${r.duration_minutes}min` : ""} ${r.difficulty ? `· ${r.difficulty}` : ""}`)
    .join("\n");
}

// ============================================================
// Planner — decide skill-only vs LLM
// ============================================================
type Plan =
  | { kind: "skill_only"; skill: string; data: string; preface: string }
  | { kind: "llm"; promptForModel: string; skillContext?: string };

async function planAndExecute(
  prompt: string,
  intent: string,
  ctx: Ctx,
): Promise<Plan> {
  let skillContext = "";

  switch (intent) {
    case "consulta_horario":
    case "consulta_comercio": {
      const biz = await skillBusinesses(prompt, ctx);
      if (biz) skillContext = `Comercios disponibles:\n${biz}`;
      break;
    }
    case "consulta_patrimonio":
    case "consulta_mapa":
    case "consulta_sanitarios": {
      const places = await skillPlaces(prompt, ctx);
      if (places) skillContext = `Lugares de Real del Monte:\n${places}`;
      break;
    }
    case "consulta_eventos": {
      const ev = await skillEvents(prompt, ctx);
      if (ev) skillContext = `Próximos eventos:\n${ev}`;
      break;
    }
    case "consulta_rutas": {
      const rt = await skillRoutes(prompt, ctx);
      if (rt) skillContext = `Rutas turísticas:\n${rt}`;
      break;
    }
  }

  return { kind: "llm", promptForModel: prompt, skillContext };
}

// ============================================================
// Cultural Guardian — corrige clichés + inyecta horarios
// ============================================================
async function culturalGuardian(text: string, ctx: Ctx) {
  let out = text;
  const corrections: { type: string; before: string; after: string }[] = [];

  const replacements: [RegExp, string, string][] = [
    [/\bt[íi]pico\b/gi, "auténtico", "cliche_typical"],
    [/\bpintoresco\b/gi, "territorial", "cliche_picturesque"],
    [/\bencantador\b/gi, "magnético", "cliche_charming"],
    [/\bmágico pueblo\b/gi, "Pueblo Mágico (denominación oficial SECTUR)", "factual_pueblo_magico"],
  ];
  for (const [re, sub, type] of replacements) {
    if (re.test(out)) {
      const before = out.match(re)?.[0] || "";
      out = out.replace(re, sub);
      corrections.push({ type, before, after: sub });
    }
  }

  // Inyectar horarios de comercios mencionados
  try {
    const { data } = await ctx.supabase
      .from("businesses")
      .select("name, hours")
      .eq("status", "public")
      .not("hours", "is", null)
      .limit(40);
    for (const b of data || []) {
      if (b.name && b.hours && out.includes(b.name) && !out.includes(b.hours)) {
        out = out.replace(b.name, `${b.name} (🕐 ${b.hours})`);
        corrections.push({ type: "inject_hours", before: b.name, after: b.hours });
      }
    }
  } catch (_) { /* skill-graceful */ }

  return { text: out, corrections };
}

// ============================================================
// Lovable AI Gateway call
// ============================================================
async function callLovableAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<{ text: string; ok: boolean; status: number }> {
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!r.ok) {
      const errTxt = await r.text();
      console.error("Lovable AI error", r.status, errTxt);
      return { text: "", ok: false, status: r.status };
    }
    const j = await r.json();
    return {
      text: j?.choices?.[0]?.message?.content || "",
      ok: true,
      status: 200,
    };
  } catch (e) {
    console.error("Lovable AI fetch failed", e);
    return { text: "", ok: false, status: 500 };
  }
}

function buildSystemPrompt(skillContext: string, channel: string) {
  return [
    "Eres **Realito**, agente cognitivo soberano de RDM-X v2 (gemelo digital de Real del Monte, Hidalgo, México).",
    "Operas bajo el protocolo TAMV MD-X4 con principios: precisión territorial, anti-clichés, anti-alucinación.",
    "Real del Monte es Pueblo Mágico minero, herencia cornish-mexicana, 2,660 msnm, conocido por pastes, platería y minas.",
    skillContext ? `\n📚 Datos verificados desde la base soberana:\n${skillContext}\n` : "",
    "Reglas:",
    "1. Si los datos verificados arriba responden la pregunta, ÚSALOS textualmente — no inventes.",
    "2. Si no tienes datos, responde corto y honesto: \"No tengo ese dato verificado.\"",
    "3. Evita clichés turísticos (típico, pintoresco, encantador).",
    "4. Máximo 3 párrafos. Usa **negritas** y emojis territoriales (🏔️🥟⛏️🗺️) con moderación.",
    `Canal actual: ${channel}.`,
  ].filter(Boolean).join("\n");
}

// ============================================================
// Fallback respuestas locales (si LLM falla)
// ============================================================
const LOCAL_FALLBACK: Record<string, string> = {
  saludo: "¡Hola! Soy **Realito**, tu guía soberano de Real del Monte. 🏔️ ¿En qué puedo ayudarte hoy?",
  despedida: "¡Hasta pronto! Real del Monte siempre te espera. 🌄",
  general: "Estoy aquí para ayudarte con información sobre Real del Monte: lugares, comercios, eventos, rutas y patrimonio. ¿Qué te interesa?",
};

// ============================================================
// MAIN HANDLER
// ============================================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const start = Date.now();
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const text: string = (body?.text || "").toString().slice(0, 2000).trim();
  const sessionId: string = body?.sessionId || `sess-${crypto.randomUUID()}`;
  const channel: string = body?.channel || "realito";

  if (!text) {
    return new Response(JSON.stringify({ error: "empty_text" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Auth (optional)
  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { data } = await supabase.auth.getUser(authHeader.slice(7));
      userId = data?.user?.id ?? null;
    } catch (_) { userId = null; }
  }

  const ctx: Ctx = { userId, channel, sessionId, supabase };
  const trace: { agent: string; action: string; durationMs: number }[] = [];

  // 1. Anonymize + radar Quetzalcóatl
  let t0 = Date.now();
  const { clean, masked } = anonymize(text);
  const radar = radarScan(clean);
  trace.push({
    agent: "FilterService",
    action: `clean ${masked ? "(PII masked)" : ""} · radar:${radar.classification}`,
    durationMs: Date.now() - t0,
  });

  // Bloqueo Anubis si tóxico extremo
  if (radar.classification === "toxic") {
    await supabase.from("security_events").insert({
      user_id: userId,
      event_type: "toxic_input",
      severity: "warning",
      source: "anubis",
      payload: { excerpt: clean.slice(0, 80), toxicity: radar.toxicity },
    });
    await supabase.from("kaos_signals").insert({
      user_id: userId,
      signal_type: "message",
      content_excerpt: clean.slice(0, 120),
      signal_score: radar.signalScore,
      noise_score: radar.noise,
      toxicity_score: radar.toxicity,
      classification: radar.classification,
      routed_to: radar.routedTo,
    });
    return new Response(
      JSON.stringify({
        ok: true,
        responseText: "He detectado un tono que prefiero no procesar. ¿Reformulamos? Estoy aquí para ayudarte con Real del Monte. 🏔️",
        agentTrace: trace,
        sessionId,
        blocked: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // 2. Cache
  const cacheKey = await sha256(`${userId || "anon"}|${channel}|${clean}`);
  const cached = cacheGet(cacheKey);
  if (cached) {
    trace.push({ agent: "Cache", action: "HIT", durationMs: Date.now() - start });
    return new Response(JSON.stringify({ ...cached, cached: true, agentTrace: trace }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3. Intent + Emotion
  t0 = Date.now();
  const intentRes = classifyIntent(clean);
  const emotion = detectEmotion(clean);
  trace.push({
    agent: "Classifier",
    action: `intent:${intentRes.intent}(${(intentRes.confidence * 100).toFixed(0)}%) emotion:${emotion.dominant}`,
    durationMs: Date.now() - t0,
  });

  // 4. Planner + Skills
  t0 = Date.now();
  const plan = await planAndExecute(clean, intentRes.intent, ctx);
  const agentsInvoked: string[] = [];
  if (plan.kind === "llm" && plan.skillContext) {
    agentsInvoked.push("MiniAI_Skills");
    trace.push({
      agent: "Planner",
      action: `skill_context_loaded (${plan.skillContext.split("\n").length} items)`,
      durationMs: Date.now() - t0,
    });
  }

  // 5. LLM call (Lovable AI Gateway)
  t0 = Date.now();
  let responseText = "";
  let sourceModel: "gateway" | "skill_only" | "fallback_local" = "gateway";
  let fallbackUsed = false;
  let llmStatus = 200;

  const sys = buildSystemPrompt((plan as any).skillContext || "", channel);
  const llm = await callLovableAI(sys, clean);
  llmStatus = llm.status;

  if (llm.ok && llm.text) {
    responseText = llm.text;
    agentsInvoked.push("LovableAI_Gateway");
  } else {
    fallbackUsed = true;
    sourceModel = "fallback_local";
    responseText = LOCAL_FALLBACK[intentRes.intent] || LOCAL_FALLBACK.general;
    if ((plan as any).skillContext) {
      responseText += "\n\n" + (plan as any).skillContext;
    }
    if (llmStatus === 429) {
      responseText = "El motor cognitivo está saturado momentáneamente. Aquí lo que sé del territorio:\n\n" + responseText;
    } else if (llmStatus === 402) {
      responseText = "El nodo cognitivo necesita recarga de créditos. Aquí lo verificable:\n\n" + responseText;
    }
  }
  trace.push({
    agent: fallbackUsed ? "Fallback" : "LovableAI",
    action: fallbackUsed ? `local fallback (status:${llmStatus})` : "gemini-3-flash response",
    durationMs: Date.now() - t0,
  });

  // 6. Cultural Guardian
  t0 = Date.now();
  const guarded = await culturalGuardian(responseText, ctx);
  responseText = guarded.text;
  trace.push({
    agent: "CulturalGuardian",
    action: `${guarded.corrections.length} corrections`,
    durationMs: Date.now() - t0,
  });

  const totalMs = Date.now() - start;
  trace.push({ agent: "Pipeline", action: `total ${totalMs}ms`, durationMs: totalMs });

  // 7. Persist BookPI (hash chain) + ai_log + conversations + kaos_signal
  try {
    // Find prev_hash
    const { data: prevRows } = await supabase
      .from("bookpi_records")
      .select("record_hash")
      .order("created_at", { ascending: false })
      .limit(1);
    const prev = prevRows?.[0]?.record_hash || "GENESIS";
    const recordPayload = JSON.stringify({
      sessionId, userId, clean, intent: intentRes.intent,
      emotion: emotion.dominant, t: Date.now(),
    });
    const recordHash = await sha256(prev + recordPayload);

    await supabase.from("bookpi_records").insert({
      session_id: sessionId,
      user_id: userId,
      clean_text: clean,
      intent: intentRes.intent,
      emotion: emotion.dominant,
      route_plan: { agentsInvoked, plan: plan.kind },
      agent_trace: trace,
      prev_hash: prev,
      record_hash: recordHash,
    });

    await supabase.from("ai_interaction_log").insert({
      user_id: userId,
      session_id: sessionId,
      channel,
      source_model: sourceModel,
      prompt: clean,
      response: responseText,
      intent: intentRes.intent,
      emotion: emotion.dominant,
      agents_invoked: agentsInvoked,
      cultural_corrections: guarded.corrections,
      latency_ms: totalMs,
      fallback_used: fallbackUsed,
      status: fallbackUsed ? "fallback" : "ok",
    });

    if (userId) {
      await supabase.from("conversations").insert([
        { session_id: sessionId, user_id: userId, role: "user", text: clean, emotion: emotion.dominant },
        { session_id: sessionId, user_id: userId, role: "assistant", text: responseText, agent_trace: trace },
      ]);
    }

    await supabase.from("kaos_signals").insert({
      user_id: userId,
      signal_type: "message",
      content_excerpt: clean.slice(0, 120),
      signal_score: radar.signalScore,
      noise_score: radar.noise,
      toxicity_score: radar.toxicity,
      classification: radar.classification,
      routed_to: radar.routedTo,
    });

    await supabase.from("system_metrics").insert({
      metric_key: "sovereign.latency_ms",
      metric_value: totalMs,
      dimensions: { channel, intent: intentRes.intent, fallback: fallbackUsed },
      bucket: "realtime",
    });
  } catch (e) {
    console.error("Persist error", e);
  }

  const result = {
    ok: true,
    responseText,
    intent: intentRes.intent,
    emotion: emotion.dominant,
    sourceModel,
    fallbackUsed,
    radar,
    agentTrace: trace,
    agentsInvoked,
    sessionId,
    latencyMs: totalMs,
  };
  cacheSet(cacheKey, result);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
