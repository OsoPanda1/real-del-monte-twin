import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Layers, Map, Navigation, Search,
  ZoomIn, ZoomOut, Crosshair, Mountain, Eye,
  Building2, Calendar, MapPin, Utensils, Church
} from "lucide-react";
import realitoCommercios from "@/assets/realito-comercios.png";

const ease = [0.2, 0, 0, 1] as const;

interface GemeloNode {
  id: number;
  name: string;
  type: "heritage" | "commerce" | "culture" | "gastronomy" | "service";
  lat: number;
  lng: number;
  status: "active" | "idle" | "event";
  desc: string;
  elevation: number;
}

const gemeloNodes: GemeloNode[] = [
  { id: 1, name: "Mina de Acosta", type: "heritage", lat: 20.229, lng: -98.674, status: "active", desc: "Mina del siglo XVI, patrimonio histórico", elevation: 2700 },
  { id: 2, name: "Panteón Inglés", type: "heritage", lat: 20.231, lng: -98.671, status: "active", desc: "Tumbas de mineros cornish, herencia británica", elevation: 2680 },
  { id: 3, name: "Plaza Principal", type: "commerce", lat: 20.228, lng: -98.672, status: "active", desc: "Centro neurálgico del Pueblo Mágico", elevation: 2660 },
  { id: 4, name: "Museo de Medicina", type: "culture", lat: 20.230, lng: -98.670, status: "idle", desc: "Museo de Medicina Laboral, hospital minero", elevation: 2690 },
  { id: 5, name: "Pastes El Portal", type: "gastronomy", lat: 20.227, lng: -98.673, status: "active", desc: "Los mejores pastes de la región", elevation: 2655 },
  { id: 6, name: "Iglesia de la Asunción", type: "heritage", lat: 20.229, lng: -98.671, status: "active", desc: "Iglesia parroquial, siglo XVIII", elevation: 2665 },
  { id: 7, name: "Platería del Monte", type: "commerce", lat: 20.228, lng: -98.675, status: "active", desc: "Joyería artesanal en plata fina", elevation: 2670 },
  { id: 8, name: "Sanitarios Públicos", type: "service", lat: 20.229, lng: -98.673, status: "active", desc: "Servicio público, zona centro", elevation: 2658 },
  { id: 9, name: "Artesanías Don Lorenzo", type: "commerce", lat: 20.227, lng: -98.670, status: "event", desc: "Micheladas y artesanías tradicionales", elevation: 2662 },
  { id: 10, name: "Mirador del Hiloche", type: "heritage", lat: 20.232, lng: -98.668, status: "active", desc: "Vista panorámica de la sierra", elevation: 2750 },
];

const TYPE_CONFIG: Record<string, { icon: typeof MapPin; color: string; label: string }> = {
  heritage: { icon: Church, color: "bg-primary text-primary-foreground", label: "Patrimonio" },
  commerce: { icon: Building2, color: "bg-accent text-accent-foreground", label: "Comercio" },
  culture: { icon: Eye, color: "bg-violet-500 text-white", label: "Cultura" },
  gastronomy: { icon: Utensils, color: "bg-amber-600 text-white", label: "Gastronomía" },
  service: { icon: MapPin, color: "bg-emerald-600 text-white", label: "Servicios" },
};

const STATUS_COLORS = {
  active: "bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.4)]",
  idle: "bg-muted-foreground/40",
  event: "bg-amber-500 shadow-[0_0_8px_2px_rgba(245,158,11,0.4)]",
};

const ExplorerView = () => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<GemeloNode | null>(null);
  const [activeLayers, setActiveLayers] = useState({ terrain: true, commerce: true, routes: false, heritage: true, gastronomy: true });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNodes = gemeloNodes.filter((n) => {
    if (!activeLayers.commerce && n.type === "commerce") return false;
    if (!activeLayers.heritage && n.type === "heritage") return false;
    if (!activeLayers.gastronomy && n.type === "gastronomy") return false;
    if (searchQuery && !n.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Map Background with gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rdm-carbon via-card to-rdm-carbon" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        {/* Topographic contour lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 1000">
          {[200, 300, 400, 500, 600].map((r) => (
            <ellipse key={r} cx="500" cy="500" rx={r} ry={r * 0.7} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
          ))}
        </svg>
      </div>

      {/* Floating nodes */}
      <div className="absolute inset-0 z-[1]">
        {filteredNodes.map((node, i) => {
          const TypeIcon = TYPE_CONFIG[node.type]?.icon || MapPin;
          return (
            <motion.div
              key={node.id}
              className="absolute group cursor-pointer"
              style={{
                left: `${12 + ((node.lng + 98.676) * -800 + i * 3) % 70}%`,
                top: `${15 + ((node.lat - 20.226) * 600 + i * 5) % 60}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease, delay: 0.3 + i * 0.08 }}
              onClick={() => setSelectedNode(node)}
            >
              <div className="relative">
                <motion.div
                  className={`w-4 h-4 rounded-full ${STATUS_COLORS[node.status]} transition-all duration-300 group-hover:scale-[2]`}
                  animate={node.status === "event" ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Hover card */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 glass-panel-strong border-sovereign px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none min-w-[200px] z-20">
                  <div className="flex items-center gap-2 mb-1">
                    <TypeIcon className="w-3 h-3 text-primary" />
                    <span className="text-xs font-sans font-semibold text-foreground">{node.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1">{node.desc}</p>
                  <div className="flex items-center gap-3">
                    <span className="tabular-data text-[9px] text-primary">{node.elevation}m</span>
                    <span className="tabular-data text-[9px] text-muted-foreground capitalize">{TYPE_CONFIG[node.type]?.label}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="glass-panel border-sovereign p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="glass-panel border-sovereign px-4 py-2">
              <h1 className="heritage-text text-lg">
                <span className="text-gradient-gold">RDM‑X</span>
                <span className="text-foreground"> Explorer</span>
              </h1>
            </div>
          </div>

          <div className="glass-panel border-sovereign px-3 py-2 flex items-center gap-2">
            <Search className="w-3 h-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar nodo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-32"
            />
          </div>
        </div>
      </div>

      {/* Left panel - Layer controls */}
      <motion.div
        className="absolute left-4 top-20 z-10 glass-panel border-sovereign p-4 w-56"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.3 }}
      >
        <h3 className="font-sans font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Capas del Gemelo
        </h3>
        {[
          { key: "terrain" as const, name: "Terreno 3D", icon: Mountain },
          { key: "commerce" as const, name: "Comercios", icon: Building2 },
          { key: "routes" as const, name: "Rutas", icon: Navigation },
          { key: "heritage" as const, name: "Patrimonio", icon: Church },
          { key: "gastronomy" as const, name: "Gastronomía", icon: Utensils },
        ].map((layer) => (
          <button
            key={layer.key}
            onClick={() => toggleLayer(layer.key)}
            className="flex items-center gap-2 py-1.5 w-full group text-left"
          >
            <div className={`w-2 h-2 rounded-full transition-colors ${activeLayers[layer.key] ? "bg-primary" : "bg-muted-foreground/30"}`} />
            <layer.icon className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className={`text-xs transition-colors ${activeLayers[layer.key] ? "text-foreground" : "text-muted-foreground"} group-hover:text-foreground`}>
              {layer.name}
            </span>
          </button>
        ))}

        {/* Realito showcase image */}
        <div className="mt-4 rounded-lg overflow-hidden border-sovereign">
          <img src={realitoCommercios} alt="Realito en comercios" className="w-full h-auto" loading="lazy" />
        </div>
      </motion.div>

      {/* Right controls */}
      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.4 }}
      >
        {[ZoomIn, ZoomOut, Crosshair].map((Icon, i) => (
          <button
            key={i}
            className="glass-panel border-sovereign p-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </motion.div>

      {/* Selected node detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="absolute right-4 top-20 z-20 glass-panel-strong border-sovereign p-5 w-72"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-sans font-semibold text-sm text-foreground">{selectedNode.name}</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{selectedNode.desc}</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="tabular-data text-[10px] text-muted-foreground">Tipo</span>
                <span className="tabular-data text-[10px] text-primary">{TYPE_CONFIG[selectedNode.type]?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="tabular-data text-[10px] text-muted-foreground">Elevación</span>
                <span className="tabular-data text-[10px] text-foreground">{selectedNode.elevation} msnm</span>
              </div>
              <div className="flex justify-between">
                <span className="tabular-data text-[10px] text-muted-foreground">Estado</span>
                <span className={`tabular-data text-[10px] ${selectedNode.status === "active" ? "text-emerald-400" : selectedNode.status === "event" ? "text-amber-400" : "text-muted-foreground"}`}>
                  {selectedNode.status === "active" ? "En línea" : selectedNode.status === "event" ? "Evento activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="tabular-data text-[10px] text-muted-foreground">Coordenadas</span>
                <span className="tabular-data text-[10px] text-foreground">{selectedNode.lat.toFixed(4)}°N, {Math.abs(selectedNode.lng).toFixed(4)}°W</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom status */}
      <motion.div
        className="absolute bottom-4 left-4 right-4 z-10 glass-panel-strong border-sovereign px-5 py-3 flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-gold" />
            <span className="tabular-data text-[10px] text-muted-foreground">GEMELO ACTIVO</span>
          </div>
          <span className="tabular-data text-xs text-foreground">
            {filteredNodes.filter(n => n.status === "active").length}/{filteredNodes.length} nodos
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="tabular-data text-[10px] text-muted-foreground block">Lat</span>
            <span className="tabular-data text-xs text-foreground">20.2290°N</span>
          </div>
          <div className="text-center">
            <span className="tabular-data text-[10px] text-muted-foreground block">Lng</span>
            <span className="tabular-data text-xs text-foreground">98.6740°W</span>
          </div>
          <div className="text-center hidden sm:block">
            <span className="tabular-data text-[10px] text-muted-foreground block">Alt</span>
            <span className="tabular-data text-xs text-foreground">2,660m</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExplorerView;
