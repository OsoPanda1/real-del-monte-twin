import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Layers, Map, Navigation, Search,
  ZoomIn, ZoomOut, Crosshair, Mountain
} from "lucide-react";
import topoPattern from "@/assets/topo-pattern.jpg";

const ease = [0.2, 0, 0, 1];

const mockNodes = [
  { id: 1, name: "Mina de Acosta", type: "heritage", lat: 20.229, lng: -98.674, status: "active" },
  { id: 2, name: "Panteón Inglés", type: "heritage", lat: 20.231, lng: -98.671, status: "active" },
  { id: 3, name: "Plaza Principal", type: "commerce", lat: 20.228, lng: -98.672, status: "active" },
  { id: 4, name: "Museo de Medicina", type: "culture", lat: 20.230, lng: -98.670, status: "idle" },
  { id: 5, name: "Pastes El Portal", type: "commerce", lat: 20.227, lng: -98.673, status: "active" },
  { id: 6, name: "Iglesia de la Asunción", type: "heritage", lat: 20.229, lng: -98.671, status: "active" },
];

const ExplorerView = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0">
        <img src={topoPattern} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-background/60" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating nodes on "map" */}
      <div className="absolute inset-0 z-[1]">
        {mockNodes.map((node, i) => (
          <motion.div
            key={node.id}
            className="absolute group cursor-pointer"
            style={{
              left: `${15 + (i % 3) * 28 + Math.random() * 10}%`,
              top: `${20 + Math.floor(i / 3) * 35 + Math.random() * 10}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease, delay: 0.5 + i * 0.1 }}
          >
            <div className={`w-3 h-3 rounded-full ${
              node.status === "active" ? "bg-primary shadow-glow-gold" : "bg-muted-foreground/40"
            } transition-all duration-300 group-hover:scale-[1.8] group-hover:shadow-glow-gold`} />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 glass-panel border-sovereign px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              <span className="text-xs font-sans font-medium text-foreground">{node.name}</span>
              <span className="block tabular-data text-[10px] text-muted-foreground capitalize">{node.type}</span>
            </div>
          </motion.div>
        ))}
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
          Capas
        </h3>
        {[
          { name: "Terreno 3D", icon: Mountain, active: true },
          { name: "Comercios", icon: Map, active: true },
          { name: "Rutas", icon: Navigation, active: false },
          { name: "Patrimonio", icon: Layers, active: true },
        ].map((layer) => (
          <div
            key={layer.name}
            className="flex items-center gap-2 py-1.5 cursor-pointer group"
          >
            <div className={`w-2 h-2 rounded-full ${layer.active ? "bg-primary" : "bg-muted-foreground/30"}`} />
            <layer.icon className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {layer.name}
            </span>
          </div>
        ))}
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
            {mockNodes.filter(n => n.status === "active").length} nodos en línea
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
          <div className="text-center">
            <span className="tabular-data text-[10px] text-muted-foreground block">Zoom</span>
            <span className="tabular-data text-xs text-foreground">15.2x</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExplorerView;
