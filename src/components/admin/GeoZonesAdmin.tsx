// CRUD de Geo Zonas — Admin only. Cambios se reflejan en Explorer en tiempo real (ya suscrito).
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit3, Save, X, Layers, AlertTriangle, CheckCircle2, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeoZone {
  id: string;
  name: string;
  zone_type: string;
  description: string | null;
  polygon: any;
  center_lat: number | null;
  center_lng: number | null;
  alert_level: string;
  fill_color: string;
  fill_opacity: number;
  active: boolean;
}

const ZONE_TYPES = ["heritage", "mining", "natural", "commerce", "restricted", "tourism"];
const ALERT_LEVELS = [
  { value: "normal", label: "Normal", color: "text-emerald-400" },
  { value: "caution", label: "Precaución", color: "text-amber-400" },
  { value: "alert", label: "Alerta", color: "text-orange-400" },
  { value: "critical", label: "Crítico", color: "text-red-500" },
];

const emptyForm: Partial<GeoZone> = {
  name: "",
  zone_type: "heritage",
  description: "",
  polygon: [],
  alert_level: "normal",
  fill_color: "#C5A572",
  fill_opacity: 0.25,
  active: true,
};

const GeoZonesAdmin = () => {
  const [zones, setZones] = useState<GeoZone[]>([]);
  const [editing, setEditing] = useState<Partial<GeoZone> | null>(null);
  const [polygonText, setPolygonText] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("geo_zones").select("*").order("name");
    if (error) toast.error(error.message);
    else setZones((data || []) as GeoZone[]);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-geo-zones")
      .on("postgres_changes", { event: "*", schema: "public", table: "geo_zones" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const startCreate = () => {
    setEditing({ ...emptyForm });
    setPolygonText("[]");
  };

  const startEdit = (z: GeoZone) => {
    setEditing({ ...z });
    setPolygonText(JSON.stringify(z.polygon, null, 2));
  };

  const cancel = () => { setEditing(null); setPolygonText(""); };

  const validatePolygon = (raw: string): [number, number][] | null => {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      if (parsed.length > 0 && parsed.length < 3) return null;
      for (const p of parsed) {
        if (!Array.isArray(p) || p.length !== 2) return null;
        if (typeof p[0] !== "number" || typeof p[1] !== "number") return null;
      }
      return parsed;
    } catch { return null; }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) { toast.error("Nombre obligatorio"); return; }
    const poly = validatePolygon(polygonText);
    if (poly === null) { toast.error("Polígono inválido. Debe ser [[lng,lat],…] con ≥3 puntos."); return; }
    setLoading(true);
    const payload = {
      name: editing.name,
      zone_type: editing.zone_type || "heritage",
      description: editing.description || null,
      polygon: poly,
      center_lat: editing.center_lat ?? null,
      center_lng: editing.center_lng ?? null,
      alert_level: editing.alert_level || "normal",
      fill_color: editing.fill_color || "#C5A572",
      fill_opacity: Number(editing.fill_opacity ?? 0.25),
      active: editing.active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("geo_zones").update(payload).eq("id", editing.id)
      : await supabase.from("geo_zones").insert(payload);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Zona actualizada" : "Zona creada");
    cancel();
  };

  const toggleActive = async (z: GeoZone) => {
    const { error } = await supabase.from("geo_zones").update({ active: !z.active }).eq("id", z.id);
    if (error) toast.error(error.message);
    else toast.success(`Zona ${!z.active ? "activada" : "desactivada"}`);
  };

  const remove = async (z: GeoZone) => {
    if (!confirm(`¿Eliminar la zona "${z.name}"?`)) return;
    const { error } = await supabase.from("geo_zones").delete().eq("id", z.id);
    if (error) toast.error(error.message);
    else toast.success("Zona eliminada");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-primary" />
          <div>
            <h3 className="heritage-text text-xl text-gradient-gold">Geo Zonas</h3>
            <p className="text-[10px] text-muted-foreground">CRUD soberano · cambios en vivo en Explorer</p>
          </div>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded text-xs font-semibold"
        >
          <Plus className="w-3 h-3" /> Nueva zona
        </button>
      </div>

      {/* Editor */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel border-sovereign p-5 mb-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-semibold text-sm">{editing.id ? "Editar zona" : "Nueva zona"}</h4>
            <button onClick={cancel} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5"
              placeholder="Nombre"
              value={editing.name || ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <select
              className="text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5"
              value={editing.zone_type || "heritage"}
              onChange={(e) => setEditing({ ...editing, zone_type: e.target.value })}
            >
              {ZONE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              className="text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5"
              value={editing.alert_level || "normal"}
              onChange={(e) => setEditing({ ...editing, alert_level: e.target.value })}
            >
              {ALERT_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-9 w-12 bg-muted/40 border border-border/30 rounded"
                value={editing.fill_color || "#C5A572"}
                onChange={(e) => setEditing({ ...editing, fill_color: e.target.value })}
              />
              <input
                type="number" step="0.05" min="0" max="1"
                className="flex-1 text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5"
                placeholder="Opacidad 0–1"
                value={editing.fill_opacity ?? 0.25}
                onChange={(e) => setEditing({ ...editing, fill_opacity: Number(e.target.value) })}
              />
            </div>
            <input
              type="number" step="0.0001"
              className="text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5"
              placeholder="Center lat (opcional)"
              value={editing.center_lat ?? ""}
              onChange={(e) => setEditing({ ...editing, center_lat: e.target.value ? Number(e.target.value) : null })}
            />
            <input
              type="number" step="0.0001"
              className="text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5"
              placeholder="Center lng (opcional)"
              value={editing.center_lng ?? ""}
              onChange={(e) => setEditing({ ...editing, center_lng: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <textarea
            className="w-full text-xs bg-muted/40 border border-border/30 rounded px-2 py-1.5"
            placeholder="Descripción"
            value={editing.description || ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            rows={2}
          />
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
              Polígono [[lng, lat], …] · mínimo 3 puntos
            </label>
            <textarea
              className="w-full text-[10px] font-mono bg-muted/40 border border-border/30 rounded px-2 py-1.5"
              value={polygonText}
              onChange={(e) => setPolygonText(e.target.value)}
              rows={5}
              placeholder='[[-98.674,20.143],[-98.673,20.144],[-98.672,20.142]]'
            />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={editing.active ?? true}
              onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
            />
            Activa
          </label>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded text-xs font-semibold disabled:opacity-50"
            >
              <Save className="w-3 h-3" /> {loading ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={cancel} className="px-3 py-2 bg-muted/40 text-muted-foreground rounded text-xs">Cancelar</button>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="space-y-2">
        {zones.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No hay zonas. Crea la primera.</p>
        ) : zones.map((z) => {
          const lvl = ALERT_LEVELS.find((l) => l.value === z.alert_level);
          const polyCount = Array.isArray(z.polygon) ? z.polygon.length : 0;
          return (
            <div key={z.id} className="glass-panel border-sovereign p-3 flex items-center gap-3">
              <div
                className="w-3 h-3 rounded flex-shrink-0"
                style={{ backgroundColor: z.fill_color, opacity: z.active ? 1 : 0.3 }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-sans font-semibold text-xs text-foreground">{z.name}</span>
                  <span className="text-[9px] tabular-data text-muted-foreground uppercase">{z.zone_type}</span>
                  <span className={`text-[9px] tabular-data ${lvl?.color || "text-muted-foreground"} flex items-center gap-1`}>
                    {z.alert_level === "normal" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                    {lvl?.label || z.alert_level}
                  </span>
                  {!z.active && <span className="text-[9px] tabular-data text-muted-foreground">(inactiva)</span>}
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-1">
                  {z.description || "Sin descripción"} · {polyCount} pts
                </p>
              </div>
              <button onClick={() => toggleActive(z)} title={z.active ? "Desactivar" : "Activar"} className={`p-1.5 rounded ${z.active ? "text-emerald-400" : "text-muted-foreground"} hover:bg-muted/40`}>
                <Power className="w-3 h-3" />
              </button>
              <button onClick={() => startEdit(z)} className="p-1.5 rounded text-primary hover:bg-primary/10">
                <Edit3 className="w-3 h-3" />
              </button>
              <button onClick={() => remove(z)} className="p-1.5 rounded text-destructive hover:bg-destructive/10">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GeoZonesAdmin;
