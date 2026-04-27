import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Layers, Database, Mountain, Building2, Church, Eye, Navigation, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const RDM_CENTER: [number, number] = [-98.6740, 20.1430];

interface PlaceNode {
  id: string; name: string; description: string | null;
  category: string; lat: number; lng: number; elevation: number | null; status: string;
}

const CAT_COLOR: Record<string, string> = {
  heritage: "#d4af37", commerce: "#3aa0ff", culture: "#a78bfa",
  gastronomy: "#f59e0b", service: "#10b981",
};

const ExplorerView = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [places, setPlaces] = useState<PlaceNode[]>([]);
  const [selected, setSelected] = useState<PlaceNode | null>(null);
  const [search, setSearch] = useState("");
  const [layers, setLayers] = useState({ heritage: true, commerce: true, culture: true, gastronomy: true, service: true });

  useEffect(() => {
    supabase.from("places").select("*").eq("status", "public").then(({ data }) => {
      if (data) setPlaces(data as PlaceNode[]);
    });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256, attribution: "© OpenStreetMap",
          },
          terrain: {
            type: "raster-dem",
            tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
            tileSize: 256, encoding: "terrarium", maxzoom: 15,
          },
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" },
          { id: "hillshade", type: "hillshade", source: "terrain", paint: { "hillshade-exaggeration": 0.6 } },
        ],
        terrain: { source: "terrain", exaggeration: 1.4 },
      },
      center: RDM_CENTER, zoom: 14, pitch: 55, bearing: -20,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Markers
  const markersRef = useRef<maplibregl.Marker[]>([]);
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const filtered = places.filter((p) =>
      (layers as any)[p.category] !== false &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()))
    );
    filtered.forEach((p) => {
      const el = document.createElement("div");
      el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${CAT_COLOR[p.category] || "#888"};box-shadow:0 0 0 2px rgba(0,0,0,0.6),0 0 12px ${CAT_COLOR[p.category] || "#888"};cursor:pointer;border:2px solid #fff;`;
      el.onclick = () => setSelected(p);
      const m = new maplibregl.Marker({ element: el })
        .setLngLat([Number(p.lng), Number(p.lat)])
        .addTo(map);
      markersRef.current.push(m);
    });
  }, [places, layers, search]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="glass-panel-strong border-sovereign p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="glass-panel-strong border-sovereign px-4 py-2">
            <h1 className="heritage-text text-lg">
              <span className="text-gradient-gold">RDM-X</span><span className="text-foreground"> Explorer · MapLibre 3D</span>
            </h1>
          </div>
        </div>
        <div className="glass-panel-strong border-sovereign px-3 py-2 flex items-center gap-2">
          <Search className="w-3 h-3 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="bg-transparent text-xs text-foreground outline-none w-32 placeholder:text-muted-foreground" />
        </div>
      </div>

      {/* Layers panel */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute left-4 top-20 z-10 glass-panel-strong border-sovereign p-4 w-56">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-3 h-3 text-primary" />
          <h3 className="font-sans font-semibold text-xs text-muted-foreground uppercase tracking-wider">Capas Soberanas</h3>
        </div>
        {[
          { key: "heritage", name: "Patrimonio", icon: Church },
          { key: "commerce", name: "Comercios", icon: Building2 },
          { key: "culture", name: "Cultura", icon: Eye },
          { key: "gastronomy", name: "Gastronomía", icon: Mountain },
          { key: "service", name: "Servicios", icon: Navigation },
        ].map((l) => (
          <button key={l.key} onClick={() => setLayers((p) => ({ ...p, [l.key]: !(p as any)[l.key] }))} className="flex items-center gap-2 py-1.5 w-full text-left">
            <div className="w-2 h-2 rounded-full" style={{ background: (layers as any)[l.key] ? CAT_COLOR[l.key] : "rgba(255,255,255,0.2)" }} />
            <l.icon className="w-3 h-3 text-muted-foreground" />
            <span className={`text-xs ${(layers as any)[l.key] ? "text-foreground" : "text-muted-foreground"}`}>{l.name}</span>
          </button>
        ))}
        <div className="mt-3 pt-3 border-t border-border/20 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Database className="w-3 h-3 text-primary" />
          <span>{places.length} lugares · MapLibre+OSM</span>
        </div>
      </motion.div>

      {/* Selected */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-20 z-20 glass-panel-strong border-sovereign p-5 w-72">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-sans font-semibold text-sm">{selected.name}</h4>
              <button onClick={() => setSelected(null)} className="text-muted-foreground text-xs">✕</button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{selected.description}</p>
            <div className="space-y-1 text-[10px] tabular-data">
              <div className="flex justify-between"><span className="text-muted-foreground">Categoría</span><span className="text-primary">{selected.category}</span></div>
              {selected.elevation && <div className="flex justify-between"><span className="text-muted-foreground">Elevación</span><span>{selected.elevation} msnm</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Coords</span><span>{Number(selected.lat).toFixed(4)}, {Number(selected.lng).toFixed(4)}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 z-10 glass-panel-strong border-sovereign px-4 py-2 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-gold" />
        <span className="tabular-data text-[10px] text-muted-foreground">GEMELO 3D · TERRENO REAL · {places.length} NODOS</span>
      </div>
    </div>
  );
};

export default ExplorerView;
