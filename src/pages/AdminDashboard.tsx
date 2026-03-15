import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Building2, Calendar, FileText, BarChart3,
  Users, Settings, TrendingUp, Mountain, ArrowLeft
} from "lucide-react";

const ease = [0.2, 0, 0, 1] as const;

const stats = [
  { label: "Lugares", value: "847", icon: MapPin, change: "+12" },
  { label: "Negocios", value: "234", icon: Building2, change: "+5" },
  { label: "Eventos", value: "18", icon: Calendar, change: "+3" },
  { label: "Publicaciones", value: "1,024", icon: FileText, change: "+89" },
];

const adminSections = [
  { title: "Lugares", desc: "Gestionar puntos de interés", icon: MapPin, count: 847 },
  { title: "Negocios", desc: "Comercios y servicios", icon: Building2, count: 234 },
  { title: "Eventos", desc: "Calendario y actividades", icon: Calendar, count: 18 },
  { title: "Rutas", desc: "Recorridos turísticos", icon: TrendingUp, count: 12 },
  { title: "Cultura", desc: "Relatos y patrimonio", icon: Mountain, count: 156 },
  { title: "Usuarios", desc: "Comunidad digital", icon: Users, count: 3420 },
  { title: "Métricas", desc: "Analítica del ecosistema", icon: BarChart3, count: null },
  { title: "Configuración", desc: "Sistema y deploy", icon: Settings, count: null },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

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
                Administración del Ecosistema Digital
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="tabular-data text-xs text-muted-foreground">Sistema Operativo</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-panel border-sovereign p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="tabular-data text-[10px] text-primary">
                  {stat.change}
                </span>
              </div>
              <div className="tabular-data text-2xl font-semibold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Admin Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminSections.map((section, i) => (
            <motion.div
              key={section.title}
              className="glass-panel border-sovereign p-6 cursor-pointer group transition-all duration-300 hover:glow-gold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.3 + i * 0.06 }}
            >
              <section.icon className="w-5 h-5 text-primary mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="font-sans font-semibold text-sm text-foreground mb-1">
                {section.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">{section.desc}</p>
              {section.count !== null && (
                <span className="tabular-data text-xs text-primary">
                  {section.count.toLocaleString()} registros
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
