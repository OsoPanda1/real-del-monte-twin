import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Building2, Calendar, FileText, BarChart3,
  Users, Settings, TrendingUp, Mountain, ArrowLeft,
  Brain, Database, Shield, Zap, Activity, Globe
} from "lucide-react";
import realitoCollage from "@/assets/realito-collage.png";

const ease = [0.2, 0, 0, 1] as const;

const stats = [
  { label: "Lugares", value: "847", icon: MapPin, change: "+12", trend: "up" },
  { label: "Negocios", value: "234", icon: Building2, change: "+5", trend: "up" },
  { label: "Eventos Activos", value: "18", icon: Calendar, change: "+3", trend: "up" },
  { label: "Publicaciones", value: "1,024", icon: FileText, change: "+89", trend: "up" },
  { label: "Usuarios", value: "3,420", icon: Users, change: "+147", trend: "up" },
  { label: "BookPI Records", value: "8,912", icon: Database, change: "+342", trend: "up" },
];

const adminSections = [
  { title: "Lugares", desc: "Gestionar puntos de interés del gemelo digital", icon: MapPin, count: 847, status: "active" },
  { title: "Negocios", desc: "Comercios, servicios y suscripciones", icon: Building2, count: 234, status: "active" },
  { title: "Eventos", desc: "Calendario, festivales y actividades", icon: Calendar, count: 18, status: "active" },
  { title: "Rutas", desc: "Recorridos turísticos y senderos", icon: TrendingUp, count: 12, status: "active" },
  { title: "Patrimonio", desc: "Relatos, minas e historia", icon: Mountain, count: 156, status: "active" },
  { title: "Isabella Core™", desc: "Monitor de agentes e intenciones IA", icon: Brain, count: null, status: "online" },
  { title: "Métricas", desc: "Analítica del ecosistema digital", icon: BarChart3, count: null, status: "active" },
  { title: "Configuración", desc: "Sistema, deploy y seguridad", icon: Settings, count: null, status: "active" },
];

const isabellaStats = [
  { label: "Intenciones procesadas", value: "12,847" },
  { label: "Emociones detectadas", value: "8,234" },
  { label: "Mini-agentes activos", value: "6/6" },
  { label: "Latencia promedio", value: "23ms" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "isabella">("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="heritage-text text-xl">
                <span className="text-gradient-gold">RDM‑X</span>
                <span className="text-foreground"> Panel Soberano</span>
              </h1>
              <span className="tabular-data text-[10px] text-muted-foreground">
                Administración del Ecosistema Digital · TAMV OS Kernel
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-primary" />
              <span className="tabular-data text-xs text-muted-foreground">Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="tabular-data text-xs text-muted-foreground">Sistema Operativo</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`tabular-data text-xs px-4 py-2 rounded-lg transition-colors ${activeTab === "overview" ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Globe className="w-3 h-3 inline mr-2" />
            Ecosistema
          </button>
          <button
            onClick={() => setActiveTab("isabella")}
            className={`tabular-data text-xs px-4 py-2 rounded-lg transition-colors ${activeTab === "isabella" ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Brain className="w-3 h-3 inline mr-2" />
            Isabella Core™
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-panel border-sovereign p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: i * 0.06 }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="tabular-data text-[10px] text-emerald-400">{stat.change}</span>
              </div>
              <div className="tabular-data text-xl font-semibold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* Admin Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {adminSections.map((section, i) => (
                <motion.div
                  key={section.title}
                  className="glass-panel border-sovereign p-6 cursor-pointer group transition-all duration-300 hover:glow-gold relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.3 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <section.icon className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                    <div className={`w-2 h-2 rounded-full ${section.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-emerald-500/50"}`} />
                  </div>
                  <h3 className="font-sans font-semibold text-sm text-foreground mb-1">{section.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{section.desc}</p>
                  {section.count !== null && (
                    <span className="tabular-data text-xs text-primary">{section.count.toLocaleString()} registros</span>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary/5 to-transparent" />
                </motion.div>
              ))}
            </div>

            {/* Realito showcase */}
            <motion.div
              className="glass-panel border-sovereign overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8">
                  <h3 className="heritage-text text-2xl text-foreground mb-3">
                    <span className="text-gradient-gold">Realito</span> en acción
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Tu asistente IA recorre Real del Monte guiando turistas por platerías,
                    pasterías, sanitarios públicos y artesanías. Cada interacción alimenta
                    el BookPI para mejorar el ecosistema.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-primary" />
                      <span className="tabular-data text-xs text-muted-foreground">Pipeline activo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-accent" />
                      <span className="tabular-data text-xs text-muted-foreground">6 mini-agentes</span>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden">
                  <img
                    src={realitoCollage}
                    alt="Realito en acción por Real del Monte"
                    className="w-full h-full object-cover min-h-[250px]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card/80 lg:block hidden" />
                </div>
              </div>
            </motion.div>
          </>
        )}

        {activeTab === "isabella" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Isabella Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {isabellaStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="glass-panel border-sovereign p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                >
                  <div className="tabular-data text-xl font-semibold text-primary mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Pipeline diagram */}
            <div className="glass-panel border-sovereign p-8">
              <h3 className="font-sans font-semibold text-sm text-foreground mb-6">Pipeline Cognitivo Isabella Core™</h3>
              <div className="flex flex-wrap items-center gap-3">
                {["Noise Cleaner", "PII Masker", "Intent Classifier", "Emotion Detector", "Route Planner", "Mini-AIs", "Response Generator", "BookPI"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="glass-panel border-sovereign px-3 py-2">
                      <span className="tabular-data text-[10px] text-foreground">{step}</span>
                    </div>
                    {i < 7 && <span className="text-muted-foreground/40 text-xs">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
