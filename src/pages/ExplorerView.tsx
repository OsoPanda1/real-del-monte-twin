import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Layers, Database, Mountain, Building2, Church, Eye, Navigation,
  Search, Plus, Edit3, Trash2, Save, X, Radio, Crosshair, AlertTriangle,
  Calendar, MapPin, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import QRCheckIn from "@/components/QRCheckIn";

const RDM_CENTER: [number, number] = [-98.6740, 20.1430];

interface GeoZone {
  id: string; name: string; zone_type: string; description: string | null;
  polygon: any; center_lat: number | null; center_lng: number | null;
  alert_level: string; fill_color: string; fill_opacity: number; active: boolean;
}
interface PlaceNode {
  id: string; name: string; description: string | null;
  category: string; lat: number; lng: number; elevation: number | null; status: string;
}
interface BusinessNode {
  id: string; name: string; description: string | null; category: string;
  lat: number; lng: number; phone: string | null; hours: string | null; status: string;
  owner_id?: string | null;
}
interface EventNode {
  id: string; title: string; description: string | null; category: string;
  location: string | null; event_date: string | null; organizer_id?: string | null;
}
interface KaosSignal {
  id: string; classification: string; toxicity_score: number;
  noise_score: number; signal_score: number; content_excerpt: string | null;
  created_at: string;
}

const CAT_COLOR: Record<string, string> = {
  heritage: "#d4af37", commerce: "#3aa0ff", culture: "#a78bfa",
  gastronomy: "#f59e0b", service: "#10b981",
};

type EntityType = "place" | "business" | "event";

const ExplorerView = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isComerciante } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [places, setPlaces] = useState<PlaceNode[]>([]);
  const [businesses, setBusinesses] = useState<BusinessNode[]>([]);
  const [events, setEvents] = useState<EventNode[]>([]);
  const [kaos, setKaos] = useState<KaosSignal[]>([]);
  const [zones, setZones] = useState<GeoZone[]>([]);
  const [showZones, setShowZones] = useState(true);

  const [selected, setSelected] = useState<{ type: EntityType; data: any } | null>(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState<EntityType | null>(null);
  const [search, setSearch] = useState("");
  const [showRadar, setShowRadar] = useState(true);
  const [layers, setLayers] = useState({
    heritage: true, commerce: true, culture: true,
    gastronomy: true, service: true, businesses: true, events: true,
  });

  // Form state
  const [form, setForm] = useState<any>({});

  const canEdit = (entity: any, type: EntityType) => {
    if (!user) return false;
    if (isAdmin) return true;
    if (type === "business" && isComerciante && entity?.owner_id === user.id) return true;
    if (type === "event" && (isAdmin || isComerciante) && entity?.organizer_id === user.id) return true;
    return false;
  };

  const canCreate = (type: EntityType) => {
    if (!user) return false;
    if (type === "place") return isAdmin;
    return isAdmin || isComerciante;
  };

  // Load data
  const loadAll = useCallback(async () => {
    const [p, b, e, k, z] = await Promise.all([
      supabase.from("places").select("*").eq("status", "public"),
      supabase.from("businesses").select("*").eq("status", "public"),
      supabase.from("events").select("*").order("event_date", { ascending: true }),
      supabase.from("kaos_signals").select("id, classification, toxicity_score, noise_score, signal_score, content_excerpt, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("geo_zones").select("*").eq("active", true),
    ]);
    if (p.data) setPlaces(p.data as PlaceNode[]);
    if (b.data) setBusinesses(b.data as BusinessNode[]);
    if (e.data) setEvents(e.data as EventNode[]);
    if (k.data) setKaos(k.data as KaosSignal[]);
    if (z.data) setZones(z.data as GeoZone[]);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("explorer-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "places" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "businesses" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, loadAll)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "kaos_signals" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "geo_zones" }, loadAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadAll]);

  // Map init
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
    map.on("load", () => setMapLoaded(true));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Click-to-place when creating
  useEffect(() => {
    const map = mapRef.current; if (!map || !creating) return;
    const handler = (e: maplibregl.MapMouseEvent) => {
      setForm((f: any) => ({ ...f, lat: e.lngLat.lat, lng: e.lngLat.lng }));
      toast.success(`Coordenadas fijadas: ${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}`);
    };
    map.on("click", handler);
    map.getCanvas().style.cursor = "crosshair";
    return () => {
      map.off("click", handler);
      map.getCanvas().style.cursor = "";
    };
  }, [creating]);

  // Markers
  const markersRef = useRef<maplibregl.Marker[]>([]);
  useEffect(() => {
    const map = mapRef.current; if (!map || !mapLoaded) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const addMarker = (lng: number, lat: number, color: string, ring: string, onClick: () => void, glyph?: string) => {
      const el = document.createElement("div");
      el.style.cssText = `width:16px;height:16px;border-radius:50%;background:${color};box-shadow:0 0 0 2px ${ring},0 0 14px ${color};cursor:pointer;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:9px;color:#000;font-weight:700;`;
      if (glyph) el.textContent = glyph;
      el.onclick = onClick;
      const m = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
      markersRef.current.push(m);
    };

    places
      .filter((p) => (layers as any)[p.category] !== false)
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
      .forEach((p) => addMarker(Number(p.lng), Number(p.lat), CAT_COLOR[p.category] || "#888", "rgba(0,0,0,0.6)", () => { setSelected({ type: "place", data: p }); setEditing(false); }));

    if (layers.businesses) {
      businesses
        .filter((b) => !search || b.name.toLowerCase().includes(search.toLowerCase()))
        .forEach((b) => addMarker(Number(b.lng), Number(b.lat), "#3aa0ff", "rgba(0,30,80,0.7)", () => { setSelected({ type: "business", data: b }); setEditing(false); }, "$"));
    }
  }, [places, businesses, layers, search, mapLoaded]);

  // GEO ZONES polygons (geofencing)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    if (map.getLayer("geo-zones-fill")) map.removeLayer("geo-zones-fill");
    if (map.getLayer("geo-zones-outline")) map.removeLayer("geo-zones-outline");
    if (map.getSource("geo-zones")) map.removeSource("geo-zones");
    if (!showZones || zones.length === 0) return;
    const features = zones
      .filter((z) => Array.isArray(z.polygon) && z.polygon.length >= 3)
      .map((z) => ({
        type: "Feature" as const,
        geometry: { type: "Polygon" as const, coordinates: [z.polygon as [number, number][]] },
        properties: { name: z.name, fill: z.fill_color, opacity: z.fill_opacity, alert: z.alert_level },
      }));
    if (features.length === 0) return;
    map.addSource("geo-zones", { type: "geojson", data: { type: "FeatureCollection", features } });
    map.addLayer({
      id: "geo-zones-fill", type: "fill", source: "geo-zones",
      paint: { "fill-color": ["get", "fill"], "fill-opacity": ["get", "opacity"] },
    });
    map.addLayer({
      id: "geo-zones-outline", type: "line", source: "geo-zones",
      paint: { "line-color": ["get", "fill"], "line-width": 1.5, "line-opacity": 0.85 },
    });
  }, [zones, showZones, mapLoaded]);

  // RADAR Quetzalcóatl overlay (kaos signals zones)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (map.getLayer("radar-pulse")) map.removeLayer("radar-pulse");
    if (map.getLayer("radar-fill")) map.removeLayer("radar-fill");
    if (map.getSource("radar-zones")) map.removeSource("radar-zones");

    if (!showRadar) return;

    // Activity zones derived from kaos signals (synthetic positions distributed around center)
    const zones = kaos.slice(0, 12).map((s, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 0.005 + (1 - s.signal_score) * 0.012;
      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [
            RDM_CENTER[0] + Math.cos(angle) * radius,
            RDM_CENTER[1] + Math.sin(angle) * radius,
          ],
        },
        properties: {
          classification: s.classification,
          toxicity: s.toxicity_score,
          noise: s.noise_score,
          signal: s.signal_score,
        },
      };
    });

    map.addSource("radar-zones", {
      type: "geojson",
      data: { type: "FeatureCollection", features: zones },
    });

    map.addLayer({
      id: "radar-fill",
      type: "circle",
      source: "radar-zones",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 30, 16, 80],
        "circle-color": [
          "match", ["get", "classification"],
          "toxic", "#ef4444",
          "noise", "#f59e0b",
          "high_signal", "#10b981",
          "#3aa0ff",
        ],
        "circle-opacity": 0.18,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": [
          "match", ["get", "classification"],
          "toxic", "#ef4444",
          "noise", "#f59e0b",
          "high_signal", "#10b981",
          "#3aa0ff",
        ],
        "circle-stroke-opacity": 0.7,
      },
    });

    map.addLayer({
      id: "radar-pulse",
      type: "circle",
      source: "radar-zones",
      paint: {
        "circle-radius": 4,
        "circle-color": [
          "match", ["get", "classification"],
          "toxic", "#ef4444", "noise", "#f59e0b",
          "high_signal", "#10b981", "#3aa0ff",
        ],
      },
    });
  }, [kaos, showRadar, mapLoaded]);

  // Geolocation
  const goToMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada por el navegador");
      return;
    }
    toast.loading("Localizando...", { id: "geo" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss("geo");
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 16, pitch: 60 });
        new maplibregl.Marker({ color: "#10b981" })
          .setLngLat([longitude, latitude])
          .setPopup(new maplibregl.Popup().setText("Tú estás aquí"))
          .addTo(mapRef.current!);
        toast.success("Ubicación encontrada");
      },
      (err) => {
        toast.dismiss("geo");
        toast.error(`Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // CRUD operations
  const openCreate = (type: EntityType) => {
    if (!canCreate(type)) {
      toast.error(type === "place" ? "Solo admins pueden crear lugares" : "Necesitas rol comerciante o admin");
      return;
    }
    setCreating(type);
    setSelected(null);
    setEditing(true);
    if (type === "event") {
      setForm({ title: "", description: "", category: "festival", location: "", event_date: "" });
    } else {
      setForm({
        name: "", description: "", category: type === "place" ? "heritage" : "commerce",
        lat: RDM_CENTER[1], lng: RDM_CENTER[0], status: "public",
        ...(type === "business" ? { hours: "", phone: "" } : {}),
      });
    }
    toast.info(type === "event" ? "Completa los datos del evento" : "Haz clic en el mapa para fijar la ubicación");
  };

  const openEdit = () => {
    if (!selected || !canEdit(selected.data, selected.type)) {
      toast.error("Sin permisos para editar");
      return;
    }
    setEditing(true);
    setForm({ ...selected.data });
  };

  const saveEntity = async () => {
    try {
      if (creating === "place" || (selected?.type === "place" && editing)) {
        const payload: any = {
          name: form.name, description: form.description, category: form.category,
          lat: Number(form.lat), lng: Number(form.lng), status: form.status || "public",
          elevation: form.elevation ? Number(form.elevation) : null,
        };
        if (creating) {
          const { error } = await supabase.from("places").insert(payload);
          if (error) throw error;
          toast.success("Lugar creado");
        } else {
          const { error } = await supabase.from("places").update(payload).eq("id", form.id);
          if (error) throw error;
          toast.success("Lugar actualizado");
        }
      } else if (creating === "business" || (selected?.type === "business" && editing)) {
        const payload: any = {
          name: form.name, description: form.description, category: form.category,
          lat: Number(form.lat), lng: Number(form.lng), status: form.status || "public",
          phone: form.phone || null, hours: form.hours || null,
        };
        if (creating) {
          payload.owner_id = user?.id;
          const { error } = await supabase.from("businesses").insert(payload);
          if (error) throw error;
          toast.success("Negocio creado");
        } else {
          const { error } = await supabase.from("businesses").update(payload).eq("id", form.id);
          if (error) throw error;
          toast.success("Negocio actualizado");
        }
      } else if (creating === "event" || (selected?.type === "event" && editing)) {
        const payload: any = {
          title: form.title, description: form.description, category: form.category,
          location: form.location || null,
          event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
        };
        if (creating) {
          payload.organizer_id = user?.id;
          const { error } = await supabase.from("events").insert(payload);
          if (error) throw error;
          toast.success("Evento creado");
        } else {
          const { error } = await supabase.from("events").update(payload).eq("id", form.id);
          if (error) throw error;
          toast.success("Evento actualizado");
        }
      }
      setCreating(null); setEditing(false); setSelected(null);
      loadAll();
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message}`);
    }
  };

  const deleteEntity = async () => {
    if (!selected) return;
    if (!confirm(`¿Eliminar "${selected.data.name || selected.data.title}"?`)) return;
    try {
      const table = selected.type === "place" ? "places" : selected.type === "business" ? "businesses" : "events";
      const { error } = await supabase.from(table).delete().eq("id", selected.data.id);
      if (error) throw error;
      toast.success("Eliminado");
      setSelected(null); setEditing(false);
      loadAll();
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const cancelForm = () => {
    setCreating(null);
    setEditing(false);
    setForm({});
  };

  // Active alerts count
  const activeAlerts = kaos.filter((k) => k.classification === "toxic" || k.classification === "noise").length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate("/")} className="glass-panel-strong border-sovereign p-2 text-muted-foreground hover:text-foreground flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="glass-panel-strong border-sovereign px-3 py-2 min-w-0">
            <h1 className="heritage-text text-base sm:text-lg whitespace-nowrap">
              <span className="text-gradient-gold">RDM-X</span><span className="text-foreground"> Explorer</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-panel-strong border-sovereign px-3 py-2 flex items-center gap-2">
            <Search className="w-3 h-3 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="bg-transparent text-xs text-foreground outline-none w-24 sm:w-32 placeholder:text-muted-foreground" />
          </div>
          <button onClick={goToMyLocation} title="Mi ubicación" className="glass-panel-strong border-sovereign p-2 text-emerald-400 hover:text-emerald-300">
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layers panel */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute left-4 top-20 z-10 glass-panel-strong border-sovereign p-4 w-56 max-h-[70vh] overflow-y-auto">
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
        <div className="mt-3 pt-3 border-t border-border/20">
          <button onClick={() => setLayers((p) => ({ ...p, businesses: !p.businesses }))} className="flex items-center gap-2 py-1.5 w-full text-left">
            <div className={`w-2 h-2 rounded-full ${layers.businesses ? "bg-[#3aa0ff]" : "bg-white/20"}`} />
            <Building2 className="w-3 h-3 text-muted-foreground" />
            <span className={`text-xs ${layers.businesses ? "text-foreground" : "text-muted-foreground"}`}>Negocios DB</span>
          </button>
          <button onClick={() => setShowRadar(!showRadar)} className="flex items-center gap-2 py-1.5 w-full text-left">
            <div className={`w-2 h-2 rounded-full ${showRadar ? "bg-pink-400 animate-pulse" : "bg-white/20"}`} />
            <Radio className="w-3 h-3 text-muted-foreground" />
            <span className={`text-xs ${showRadar ? "text-foreground" : "text-muted-foreground"}`}>Radar Quetzalcóatl</span>
          </button>
        </div>

        {/* Create buttons */}
        {user && (
          <div className="mt-3 pt-3 border-t border-border/20 space-y-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Crear</p>
            {canCreate("place") && (
              <button onClick={() => openCreate("place")} className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] rounded bg-primary/10 hover:bg-primary/20 text-primary">
                <Plus className="w-3 h-3" /> Lugar
              </button>
            )}
            {canCreate("business") && (
              <button onClick={() => openCreate("business")} className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] rounded bg-accent/10 hover:bg-accent/20 text-accent">
                <Plus className="w-3 h-3" /> Negocio
              </button>
            )}
            {canCreate("event") && (
              <button onClick={() => openCreate("event")} className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] rounded bg-violet-500/10 hover:bg-violet-500/20 text-violet-300">
                <Plus className="w-3 h-3" /> Evento
              </button>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border/20 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Database className="w-3 h-3 text-primary" />
          <span>{places.length}L · {businesses.length}N · {events.length}E</span>
        </div>
      </motion.div>

      {/* Radar alerts banner */}
      {showRadar && activeAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-10 glass-panel-strong border-sovereign px-4 py-2 flex items-center gap-2 border-amber-500/30"
        >
          <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse" />
          <span className="tabular-data text-[10px] text-amber-300">
            QUETZALCÓATL: {activeAlerts} señal{activeAlerts > 1 ? "es" : ""} en cuarentena
          </span>
        </motion.div>
      )}

      {/* SIDE PANEL: detail / edit / create */}
      <AnimatePresence>
        {(selected || creating) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-20 z-20 glass-panel-strong border-sovereign p-5 w-80 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {(creating === "event" || selected?.type === "event") ? <Calendar className="w-3.5 h-3.5 text-violet-400" /> :
                 (creating === "business" || selected?.type === "business") ? <Building2 className="w-3.5 h-3.5 text-accent" /> :
                  <MapPin className="w-3.5 h-3.5 text-primary" />}
                <h4 className="font-sans font-semibold text-sm">
                  {creating ? `Nuevo ${creating === "place" ? "lugar" : creating === "business" ? "negocio" : "evento"}` :
                   editing ? "Editando" : (selected?.data.name || selected?.data.title)}
                </h4>
              </div>
              <button onClick={() => { setSelected(null); cancelForm(); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* VIEW MODE */}
            {selected && !editing && (
              <>
                <p className="text-xs text-muted-foreground mb-3">{selected.data.description || "Sin descripción"}</p>
                <div className="space-y-1 text-[10px] tabular-data mb-3">
                  {selected.type !== "event" && (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Categoría</span><span className="text-primary">{selected.data.category}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Coords</span><span>{Number(selected.data.lat).toFixed(4)}, {Number(selected.data.lng).toFixed(4)}</span></div>
                    </>
                  )}
                  {selected.type === "place" && selected.data.elevation && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Elevación</span><span>{selected.data.elevation} msnm</span></div>
                  )}
                  {selected.type === "business" && (
                    <>
                      {selected.data.hours && <div className="flex justify-between"><span className="text-muted-foreground">Horario</span><span>{selected.data.hours}</span></div>}
                      {selected.data.phone && <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{selected.data.phone}</span></div>}
                    </>
                  )}
                  {selected.type === "event" && (
                    <>
                      {selected.data.location && <div className="flex justify-between"><span className="text-muted-foreground">Lugar</span><span>{selected.data.location}</span></div>}
                      {selected.data.event_date && <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span>{new Date(selected.data.event_date).toLocaleDateString("es-MX")}</span></div>}
                    </>
                  )}
                </div>
                {canEdit(selected.data, selected.type) && (
                  <div className="flex gap-2">
                    <button onClick={openEdit} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded text-xs">
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                    <button onClick={deleteEntity} className="flex items-center justify-center gap-1 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded text-xs">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* EDIT/CREATE MODE */}
            {editing && (
              <div className="space-y-2">
                {(creating === "event" || selected?.type === "event") ? (
                  <>
                    <input className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" placeholder="Título" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    <textarea className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" placeholder="Descripción" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                    <input className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" placeholder="Lugar" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    <input type="datetime-local" className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" value={form.event_date ? form.event_date.slice(0, 16) : ""} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                    <select className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" value={form.category || "festival"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="festival">Festival</option>
                      <option value="cultural">Cultural</option>
                      <option value="gastronomico">Gastronómico</option>
                      <option value="religioso">Religioso</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" placeholder="Nombre" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <textarea className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" placeholder="Descripción" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                    <select className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" value={form.category || "heritage"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="heritage">Patrimonio</option>
                      <option value="commerce">Comercio</option>
                      <option value="culture">Cultura</option>
                      <option value="gastronomy">Gastronomía</option>
                      <option value="service">Servicio</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input className="text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" placeholder="Lat" type="number" step="0.0001" value={form.lat ?? ""} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
                      <input className="text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" placeholder="Lng" type="number" step="0.0001" value={form.lng ?? ""} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
                    </div>
                    {(creating === "business" || selected?.type === "business") && (
                      <>
                        <input className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" placeholder="Horario (ej: 9-18)" value={form.hours || ""} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
                        <input className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5" placeholder="Teléfono" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      </>
                    )}
                    {creating && <p className="text-[9px] text-muted-foreground italic">💡 Haz clic en el mapa para fijar coordenadas</p>}
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <button onClick={saveEntity} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded text-xs font-semibold">
                    <Save className="w-3 h-3" /> Guardar
                  </button>
                  <button onClick={cancelForm} className="px-3 py-2 bg-muted/40 text-muted-foreground rounded text-xs">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events bottom strip */}
      {layers.events && events.length > 0 && !selected && !creating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 left-4 right-4 z-10 glass-panel-strong border-sovereign px-4 py-2 flex items-center gap-3 overflow-x-auto"
        >
          <Calendar className="w-3 h-3 text-violet-400 flex-shrink-0" />
          {events.slice(0, 6).map((e) => (
            <button key={e.id} onClick={() => { setSelected({ type: "event", data: e }); setEditing(false); }} className="flex-shrink-0 text-[10px] tabular-data text-muted-foreground hover:text-foreground whitespace-nowrap">
              {e.title}{e.event_date && ` · ${new Date(e.event_date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`}
            </button>
          ))}
        </motion.div>
      )}

      <div className="absolute bottom-4 left-4 z-10 glass-panel-strong border-sovereign px-4 py-2 flex items-center gap-3">
        {!mapLoaded && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-gold" />
        <span className="tabular-data text-[10px] text-muted-foreground">
          GEMELO 3D · {places.length} LUGARES · {businesses.length} NEGOCIOS · {kaos.length} SEÑALES KAOS
        </span>
      </div>
    </div>
  );
};

export default ExplorerView;
