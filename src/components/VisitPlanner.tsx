// Planificador de visita 1d/2d/3d generado desde DB (places destacados/públicos)
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Calendar, Sparkles, Navigation as NavIcon, Coffee, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Place {
  id: string;
  name: string;
  description: string | null;
  category: string;
  visit_minutes: number | null;
  hours: string | null;
  highlights: any;
  featured: boolean;
}

type Duration = 1 | 2 | 3;

interface Stop {
  place: Place;
  startMin: number; // minutes from day start (09:00)
  endMin: number;
}

const DAY_START = 9 * 60; // 09:00
const DAY_END = 19 * 60; // 19:00
const LUNCH_START = 14 * 60;
const LUNCH_END = 15 * 60;
const TRAVEL_MIN = 15; // buffer entre paradas

const fmt = (m: number) => {
  const h = Math.floor(m / 60), mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const buildItinerary = (pool: Place[], days: Duration): Stop[][] => {
  // Prioriza featured + variedad por categoría
  const sorted = [...pool].sort((a, b) => Number(b.featured) - Number(a.featured));
  const byDay: Stop[][] = [];
  let idx = 0;
  for (let d = 0; d < days; d++) {
    const stops: Stop[] = [];
    let cursor = DAY_START;
    while (cursor < DAY_END && idx < sorted.length) {
      const p = sorted[idx++];
      const dur = p.visit_minutes ?? 60;
      // Pausa de comida
      if (cursor < LUNCH_END && cursor + dur > LUNCH_START) cursor = LUNCH_END;
      if (cursor + dur > DAY_END) break;
      stops.push({ place: p, startMin: cursor, endMin: cursor + dur });
      cursor += dur + TRAVEL_MIN;
    }
    if (stops.length === 0) break;
    byDay.push(stops);
  }
  return byDay;
};

const VisitPlanner = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState<Duration>(1);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("places")
        .select("id,name,description,category,visit_minutes,hours,highlights,featured")
        .eq("status", "public")
        .order("featured", { ascending: false })
        .limit(30);
      setPlaces((data || []) as Place[]);
      setLoading(false);
    })();
  }, []);

  const itinerary = useMemo(() => buildItinerary(places, duration), [places, duration]);

  return (
    <section id="planner" className="relative py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="tabular-data text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
            Planifica tu visita
          </span>
          <h2 className="heritage-text text-3xl sm:text-4xl mb-3">
            <span className="text-foreground">Itinerario </span>
            <span className="text-gradient-gold">a tu medida</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Elige cuántos días tienes; armamos un recorrido con horarios reales desde nuestra base de datos territorial.
          </p>
        </motion.div>

        {/* Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {([1, 2, 3] as Duration[]).map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                duration === d
                  ? "bg-primary text-primary-foreground glow-gold"
                  : "glass-panel border-sovereign text-foreground hover:border-primary"
              }`}
            >
              {d} {d === 1 ? "día" : "días"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-xs text-muted-foreground italic">Calculando itinerario óptimo...</p>
        ) : itinerary.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground italic">Sin lugares disponibles. Pide al admin agregar puntos.</p>
        ) : (
          <div className={`grid gap-5 max-w-6xl mx-auto ${duration === 1 ? "md:grid-cols-1" : duration === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {itinerary.map((stops, dayIdx) => (
              <motion.div
                key={dayIdx}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: dayIdx * 0.1 }}
                className="glass-panel border-sovereign p-5"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="heritage-text text-xl text-gradient-gold">Día {dayIdx + 1}</h3>
                  </div>
                  <span className="tabular-data text-[10px] text-accent">{stops.length} paradas</span>
                </div>
                <ol className="space-y-3">
                  {stops.map((s, i) => (
                    <li key={s.place.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-12 text-right">
                        <div className="tabular-data text-xs text-primary font-semibold">{fmt(s.startMin)}</div>
                        <div className="tabular-data text-[9px] text-muted-foreground">{fmt(s.endMin)}</div>
                      </div>
                      <div className="flex-1 min-w-0 pb-3 border-b border-border/10 last:border-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {i === 0 ? <Sun className="w-3 h-3 text-amber-400" /> :
                           s.startMin >= LUNCH_END ? <Moon className="w-3 h-3 text-violet-300" /> :
                           <Sparkles className="w-3 h-3 text-primary" />}
                          <span className="font-sans font-semibold text-xs text-foreground">{s.place.name}</span>
                        </div>
                        {s.place.description && (
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1">{s.place.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{(s.endMin - s.startMin)}m</span>
                          {s.place.hours && <span>· {s.place.hours}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                  {/* Pausa comida si aplica */}
                  {stops.some(s => s.startMin <= LUNCH_START && s.endMin >= LUNCH_START - 30) === false &&
                    stops.length > 1 && (
                    <li className="flex gap-3 opacity-70">
                      <div className="flex-shrink-0 w-12 text-right">
                        <div className="tabular-data text-xs text-amber-400 font-semibold">{fmt(LUNCH_START)}</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-300">
                        <Coffee className="w-3 h-3" /> Pausa para comer pastes
                      </div>
                    </li>
                  )}
                </ol>
                <button
                  onClick={() => navigate("/explorer")}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded text-xs font-semibold transition"
                >
                  <NavIcon className="w-3 h-3" /> Ver Día {dayIdx + 1} en mapa
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/explorer")}
            className="inline-flex items-center gap-2 px-5 py-2.5 glass-panel border-sovereign text-sm text-foreground hover:glow-gold transition"
          >
            <MapPin className="w-4 h-4 text-primary" />
            Abrir mapa 3D del recorrido
          </button>
        </div>
      </div>
    </section>
  );
};

export default VisitPlanner;
