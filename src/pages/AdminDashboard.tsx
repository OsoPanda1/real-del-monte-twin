import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Building2, Calendar, FileText, BarChart3,
  Users, Settings, ArrowLeft, Brain, Database, Shield,
  Activity, Globe, Eye, Radar, Crown, Pyramid, Flame,
  AlertTriangle, CheckCircle2, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import realitoCollage from "@/assets/realito-collage.png";

const ease = [0.2, 0, 0, 1] as const;

interface Counts {
  places: number; businesses: number; events: number; routes: number;
  bookpi: number; users: number; identities: number; aiLogs: number;
  securityEvents: number; kaosSignals: number;
}

interface AztekMetrics {
  anubis: { total: number; criticals: number; resolved: number };
  horus: { total: number; avgLatency: number; fallbacks: number };
  tenochtitlan: { totalIdentities: number; trustAvg: number; topHandles: { handle: string; trust_level: number }[] };
  eoct: { twins: number; metricsToday: number; lastMetric: string };
  kaos: { total: number; toxic: number; noise: number; highSignal: number };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "isabella" | "aztek">("overview");
  const [counts, setCounts] = useState<Counts>({
    places: 0, businesses: 0, events: 0, routes: 0, bookpi: 0,
    users: 0, identities: 0, aiLogs: 0, securityEvents: 0, kaosSignals: 0,
  });
  const [metrics, setMetrics] = useState<AztekMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadAll = async () => {
    try {
      const [places, biz, ev, rt, bp, prof, ident, ai, sec, kaos, lastLogs, twinsCount, metricsToday, topId] = await Promise.all([
        supabase.from("places").select("id", { count: "exact", head: true }),
        supabase.from("businesses").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("routes").select("id", { count: "exact", head: true }),
        supabase.from("bookpi_records").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("sovereign_identity").select("id", { count: "exact", head: true }),
        supabase.from("ai_interaction_log").select("id, latency_ms, fallback_used", { count: "exact" }).limit(500),
        supabase.from("security_events").select("id, severity, resolved", { count: "exact" }).limit(500),
        supabase.from("kaos_signals").select("id, classification, signal_score", { count: "exact" }).limit(500),
        supabase.from("ai_interaction_log").select("prompt, response, intent, emotion, latency_ms, created_at, fallback_used").order("created_at", { ascending: false }).limit(8),
        supabase.from("digital_twins").select("id", { count: "exact", head: true }),
        supabase.from("system_metrics").select("metric_key, metric_value, created_at").order("created_at", { ascending: false }).limit(20),
        supabase.from("sovereign_identity").select("handle, trust_level").order("trust_level", { ascending: false }).limit(5),
      ]);

      setCounts({
        places: places.count || 0,
        businesses: biz.count || 0,
        events: ev.count || 0,
        routes: rt.count || 0,
        bookpi: bp.count || 0,
        users: prof.count || 0,
        identities: ident.count || 0,
        aiLogs: ai.count || 0,
        securityEvents: sec.count || 0,
        kaosSignals: kaos.count || 0,
      });

      // Aztek metrics
      const aiData = ai.data || [];
      const secData = sec.data || [];
      const kaosData = kaos.data || [];
      const idData = topId.data || [];
      const trustAvg = idData.length ? idData.reduce((a, b) => a + (b.trust_level || 0), 0) / idData.length : 0;

      setMetrics({
        anubis: {
          total: secData.length,
          criticals: secData.filter((s: any) => s.severity === "critical" || s.severity === "warning").length,
          resolved: secData.filter((s: any) => s.resolved).length,
        },
        horus: {
          total: aiData.length,
          avgLatency: aiData.length ? Math.round(aiData.reduce((a: number, b: any) => a + (b.latency_ms || 0), 0) / aiData.length) : 0,
          fallbacks: aiData.filter((a: any) => a.fallback_used).length,
        },
        tenochtitlan: {
          totalIdentities: ident.count || 0,
          trustAvg: Math.round(trustAvg * 100) / 100,
          topHandles: idData,
        },
        eoct: {
          twins: twinsCount.count || 0,
          metricsToday: metricsToday.data?.length || 0,
          lastMetric: metricsToday.data?.[0]?.metric_key || "—",
        },
        kaos: {
          total: kaosData.length,
          toxic: kaosData.filter((k: any) => k.classification === "toxic").length,
          noise: kaosData.filter((k: any) => k.classification === "noise").length,
          highSignal: kaosData.filter((k: any) => k.classification === "high_signal").length,
        },
      });

      setRecentLogs(lastLogs.data || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-panel-strong border-sovereign p-8 max-w-md text-center">
          <Shield className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h2 className="font-sans font-semibold text-lg mb-2">Acceso restringido</h2>
          <p className="text-xs text-muted-foreground mb-4">Necesitas rol <strong>admin</strong> para entrar al Panel Soberano.</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-primary text-primary-foreground rounded text-xs">Volver al inicio</button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Lugares", value: counts.places, icon: MapPin },
    { label: "Negocios", value: counts.businesses, icon: Building2 },
    { label: "Eventos", value: counts.events, icon: Calendar },
    { label: "BookPI", value: counts.bookpi, icon: Database },
    { label: "Usuarios", value: counts.users, icon: Users },
    { label: "Logs IA", value: counts.aiLogs, icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="heritage-text text-xl">
                <span className="text-gradient-gold">RDM‑X</span><span className="text-foreground"> Panel Soberano</span>
              </h1>
              <span className="tabular-data text-[10px] text-muted-foreground">
                TAMV MD-X4 · Nodo Cero · {user?.email}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-primary" /><span className="tabular-data text-xs text-muted-foreground">Admin</span></div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${loading ? "bg-amber-400" : "bg-emerald-500"} animate-pulse`} />
              <span className="tabular-data text-xs text-muted-foreground">{loading ? "Sincronizando" : "Online"}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto">
          {[
            { id: "overview", label: "Ecosistema", icon: Globe },
            { id: "isabella", label: "Isabella Core™", icon: Brain },
            { id: "aztek", label: "Aztek Gods System", icon: Pyramid },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`tabular-data text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === t.id ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-3 h-3 inline mr-2" />{t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} className="glass-panel border-sovereign p-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: i * 0.06 }}>
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="tabular-data text-[10px] text-emerald-400">live</span>
              </div>
              <div className="tabular-data text-xl font-semibold text-foreground">{stat.value.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { title: "Lugares", desc: "Patrimonio del gemelo digital", icon: MapPin, count: counts.places },
                { title: "Negocios", desc: "Comercios y servicios", icon: Building2, count: counts.businesses },
                { title: "Eventos", desc: "Calendario cultural", icon: Calendar, count: counts.events },
                { title: "Rutas", desc: "Recorridos turísticos", icon: FileText, count: counts.routes },
                { title: "BookPI", desc: "Memoria inmutable Isabella", icon: Database, count: counts.bookpi },
                { title: "Identidades", desc: "ID-NVIDA Tenochtitlan", icon: Crown, count: counts.identities },
                { title: "Eventos seguridad", desc: "Anubis monitor", icon: Shield, count: counts.securityEvents },
                { title: "Señales KAOS", desc: "Radar Quetzalcóatl", icon: Radar, count: counts.kaosSignals },
              ].map((s, i) => (
                <motion.div key={s.title} className="glass-panel border-sovereign p-6 group transition-all duration-300 hover:glow-gold"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.3 + i * 0.06 }}>
                  <div className="flex items-center justify-between mb-4">
                    <s.icon className="w-5 h-5 text-primary" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  </div>
                  <h3 className="font-sans font-semibold text-sm text-foreground mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                  <span className="tabular-data text-xs text-primary">{s.count.toLocaleString()} registros</span>
                </motion.div>
              ))}
            </div>

            <motion.div className="glass-panel border-sovereign overflow-hidden"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.5 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8">
                  <h3 className="heritage-text text-2xl text-foreground mb-3">
                    <span className="text-gradient-gold">Realito</span> en acción
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Tu agente cognitivo soberano, conectado a Lovable AI con guardian cultural y skills territoriales.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><Activity className="w-3 h-3 text-primary" /><span className="tabular-data text-xs text-muted-foreground">{counts.aiLogs} interacciones</span></div>
                    <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-accent" /><span className="tabular-data text-xs text-muted-foreground">SovereignEngine activo</span></div>
                  </div>
                </div>
                <div className="relative overflow-hidden">
                  <img src={realitoCollage} alt="Realito" className="w-full h-full object-cover min-h-[250px]" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card/80 lg:block hidden" />
                </div>
              </div>
            </motion.div>
          </>
        )}

        {activeTab === "isabella" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Interacciones IA" value={metrics?.horus.total || 0} accent="primary" />
              <StatCard label="Latencia promedio" value={`${metrics?.horus.avgLatency || 0}ms`} accent="accent" />
              <StatCard label="BookPI registros" value={counts.bookpi} accent="primary" />
              <StatCard label="Fallbacks" value={metrics?.horus.fallbacks || 0} accent="amber" />
            </div>

            <div className="glass-panel border-sovereign p-6 mb-6">
              <h3 className="font-sans font-semibold text-sm text-foreground mb-4">Pipeline Cognitivo SovereignEngine</h3>
              <div className="flex flex-wrap items-center gap-2">
                {["Anonymizer", "Radar Quetzalcóatl", "Intent", "Emotion", "Planner+Skills", "Lovable AI", "Cultural Guardian", "BookPI"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="glass-panel border-sovereign px-3 py-2">
                      <span className="tabular-data text-[10px] text-foreground">{step}</span>
                    </div>
                    {i < 7 && <span className="text-muted-foreground/40 text-xs">→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel border-sovereign p-6">
              <h3 className="font-sans font-semibold text-sm text-foreground mb-4">Últimas interacciones</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Sin registros aún. Habla con Realito desde el chat.</p>
                ) : recentLogs.map((l, i) => (
                  <div key={i} className="border-l-2 border-primary/30 pl-3 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="tabular-data text-[9px] text-muted-foreground">{new Date(l.created_at).toLocaleTimeString()}</span>
                      {l.intent && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{l.intent}</span>}
                      {l.emotion && <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{l.emotion}</span>}
                      {l.fallback_used && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">fallback</span>}
                      <span className="text-[9px] text-muted-foreground">{l.latency_ms}ms</span>
                    </div>
                    <p className="text-xs text-foreground/80 line-clamp-1">📥 {l.prompt}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">📤 {l.response}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "aztek" && metrics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 glass-panel border-sovereign p-5 bg-gradient-to-br from-amber-950/20 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <Pyramid className="w-5 h-5 text-amber-400" />
                <h3 className="heritage-text text-xl text-gradient-gold">Aztek Gods System</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Panel divino: cinco deidades vigilan el Nodo Cero TAMV MD-X4. Métricas reales en tiempo casi real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* ANUBIS - Security */}
              <DeityCard
                name="Anubis"
                title="Guardián de Seguridad"
                icon={Shield}
                color="from-violet-900/40 to-violet-700/10 border-violet-500/30"
                accent="text-violet-300"
                stats={[
                  { label: "Eventos totales", value: metrics.anubis.total },
                  { label: "Críticos / Warning", value: metrics.anubis.criticals, alert: metrics.anubis.criticals > 0 },
                  { label: "Resueltos", value: metrics.anubis.resolved, ok: true },
                ]}
              />

              {/* HORUS - Observability */}
              <DeityCard
                name="Horus"
                title="Ojo Observador IA"
                icon={Eye}
                color="from-sky-900/40 to-sky-700/10 border-sky-500/30"
                accent="text-sky-300"
                stats={[
                  { label: "Interacciones", value: metrics.horus.total },
                  { label: "Latencia avg", value: `${metrics.horus.avgLatency}ms` },
                  { label: "Fallbacks", value: metrics.horus.fallbacks, alert: metrics.horus.fallbacks > metrics.horus.total * 0.3 },
                ]}
              />

              {/* TENOCHTITLAN - Identity */}
              <DeityCard
                name="Tenochtitlan"
                title="Capital Identitaria"
                icon={Crown}
                color="from-amber-900/40 to-amber-700/10 border-amber-500/30"
                accent="text-amber-300"
                stats={[
                  { label: "Identidades ID-NVIDA", value: metrics.tenochtitlan.totalIdentities },
                  { label: "Trust avg", value: metrics.tenochtitlan.trustAvg },
                  { label: "Top handles", value: metrics.tenochtitlan.topHandles.length },
                ]}
                extra={
                  <div className="mt-3 pt-3 border-t border-border/20 space-y-1">
                    {metrics.tenochtitlan.topHandles.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex justify-between text-[9px]">
                        <span className="text-muted-foreground">{h.handle}</span>
                        <span className="text-amber-300">★ {h.trust_level}</span>
                      </div>
                    ))}
                  </div>
                }
              />

              {/* EOCT - Twin Engine / Dekateotl */}
              <DeityCard
                name="EOCT (Dekateotl)"
                title="Motor del Gemelo"
                icon={Brain}
                color="from-emerald-900/40 to-emerald-700/10 border-emerald-500/30"
                accent="text-emerald-300"
                stats={[
                  { label: "Gemelos digitales", value: metrics.eoct.twins },
                  { label: "Métricas día", value: metrics.eoct.metricsToday },
                  { label: "Última métrica", value: metrics.eoct.lastMetric },
                ]}
              />

              {/* KAOS - Quetzalcoatl */}
              <DeityCard
                name="KAOS / Quetzalcóatl"
                title="Radar Federal"
                icon={Radar}
                color="from-pink-900/40 to-pink-700/10 border-pink-500/30"
                accent="text-pink-300"
                stats={[
                  { label: "Señales totales", value: metrics.kaos.total },
                  { label: "Tóxicas", value: metrics.kaos.toxic, alert: metrics.kaos.toxic > 0 },
                  { label: "High signal", value: metrics.kaos.highSignal, ok: true },
                ]}
                extra={
                  <div className="mt-3 pt-3 border-t border-border/20">
                    <div className="flex items-center gap-2 text-[9px]">
                      <Flame className="w-2.5 h-2.5 text-pink-400" />
                      <span className="text-muted-foreground">Routing activo: kaos_quarantine + main_feed</span>
                    </div>
                  </div>
                }
              />

              {/* Combined health */}
              <DeityCard
                name="Pulso Soberano"
                title="Salud del Nodo Cero"
                icon={Activity}
                color="from-primary/20 to-transparent border-primary/30"
                accent="text-primary"
                stats={[
                  { label: "Sistemas online", value: "5/5", ok: true },
                  { label: "Auto-refresh", value: "30s" },
                  { label: "Última sync", value: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) },
                ]}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, accent }: { label: string; value: any; accent: string }) => {
  const colorClass = accent === "primary" ? "text-primary" : accent === "accent" ? "text-accent" : "text-amber-400";
  return (
    <div className="glass-panel border-sovereign p-5">
      <div className={`tabular-data text-xl font-semibold mb-1 ${colorClass}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
};

const DeityCard = ({ name, title, icon: Icon, color, accent, stats, extra }: {
  name: string; title: string; icon: any; color: string; accent: string;
  stats: { label: string; value: any; alert?: boolean; ok?: boolean }[];
  extra?: React.ReactNode;
}) => (
  <motion.div
    className={`glass-panel border-sovereign p-5 bg-gradient-to-br ${color}`}
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg bg-card/40 ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h4 className={`font-sans font-semibold text-sm ${accent}`}>{name}</h4>
        <p className="text-[10px] text-muted-foreground">{title}</p>
      </div>
    </div>
    <div className="space-y-2">
      {stats.map((s, i) => (
        <div key={i} className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground">{s.label}</span>
          <span className={`tabular-data font-semibold ${s.alert ? "text-amber-300" : s.ok ? "text-emerald-300" : "text-foreground"}`}>
            {s.alert && <AlertTriangle className="inline w-2.5 h-2.5 mr-1" />}
            {s.ok && <CheckCircle2 className="inline w-2.5 h-2.5 mr-1" />}
            {s.value}
          </span>
        </div>
      ))}
    </div>
    {extra}
  </motion.div>
);

export default AdminDashboard;
