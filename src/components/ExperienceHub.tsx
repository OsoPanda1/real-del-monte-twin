import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Clock, MapPin, Sparkles, Calendar, Utensils, Mountain, Church,
  Camera, Navigation as NavIcon, ArrowRight, ChevronRight, Layers, Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import realitoPastes from "@/assets/realito-pastes.png";
import realitoPlateria from "@/assets/realito-plateria.png";

const ease = [0.2, 0, 0, 1] as const;

interface FeaturedPlace {
  id: string;
  name: string;
  description: string | null;
  category: string;
  visit_minutes: number | null;
  hours: string | null;
  highlights: any;
}

interface UpcomingEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  category: string;
}

const CATEGORY_META: Record<string, { label: string; icon: any; color: string }> = {
  heritage: { label: "Patrimonio", icon: Church, color: "text-primary" },
  mining: { label: "Minería", icon: Mountain, color: "text-amber-400" },
  culture: { label: "Cultura", icon: Camera, color: "text-violet-300" },
  viewpoint: { label: "Mirador", icon: Mountain, color: "text-emerald-300" },
  religious: { label: "Religioso", icon: Church, color: "text-primary" },
  commerce: { label: "Comercio", icon: Utensils, color: "text-accent" },
  gastronomy: { label: "Gastronomía", icon: Utensils, color: "text-amber-300" },
};

const itineraries = [
  {
    title: "1 día · Esencial",
    duration: "6 horas",
    stops: ["Centro Histórico", "Mina de Acosta", "Panteón Inglés", "Pastes El Portal"],
    desc: "El recorrido obligado: plata, historia cornish y gastronomía local.",
  },
  {
    title: "Fin de semana",
    duration: "2 días",
    stops: ["Todo el itinerario esencial", "Mirador del Hiloche", "Talleres de plata", "Iglesia de la Asunción"],
    desc: "Vive el pueblo de noche con neblina, posadas y bares minero-ingleses.",
  },
  {
    title: "Cultura profunda",
    duration: "3 días",
    stops: ["Museo de Medicina Laboral", "Capilla Santa Veracruz", "Senderismo Cerro Ventanas", "Festivales locales"],
    desc: "Para quienes quieren entender la huella inglesa y la sierra hidalguense.",
  },
];

const ExperienceHub = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<FeaturedPlace[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    (async () => {
      const [p, e] = await Promise.all([
        supabase.from("places")
          .select("id,name,description,category,visit_minutes,hours,highlights")
          .eq("status", "public")
          .eq("featured", true)
          .order("name")
          .limit(6),
        supabase.from("events")
          .select("id,title,description,event_date,location,category")
          .order("event_date", { ascending: true })
          .limit(4),
      ]);
      if (p.data) setPlaces(p.data as FeaturedPlace[]);
      if (e.data) setEvents(e.data as UpcomingEvent[]);
    })();
  }, []);

  return (
    <>
      {/* HIGHLIGHTED PLACES */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <span className="tabular-data text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
              Imperdibles
            </span>
            <h2 className="heritage-text text-3xl sm:text-4xl md:text-5xl mb-3">
              <span className="text-foreground">Qué visitar en </span>
              <span className="text-gradient-gold">Real del Monte</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Cada parada incluye tiempo recomendado, horarios actualizados y lo que no debes perderte.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {places.length === 0 ? (
              <p className="col-span-full text-center text-xs text-muted-foreground italic">
                Cargando lugares destacados...
              </p>
            ) : places.map((p, i) => {
              const meta = CATEGORY_META[p.category] || CATEGORY_META.heritage;
              const Icon = meta.icon;
              const tags: string[] = Array.isArray(p.highlights) ? p.highlights : [];
              return (
                <motion.button
                  key={p.id}
                  onClick={() => navigate("/explorer")}
                  className="glass-panel border-sovereign p-5 text-left group transition-all duration-300 hover:glow-gold"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease, delay: i * 0.06 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-card/40 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {p.visit_minutes && (
                      <div className="flex items-center gap-1 text-[10px] tabular-data text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {p.visit_minutes >= 60 ? `${Math.round(p.visit_minutes / 60 * 10) / 10}h` : `${p.visit_minutes}m`}
                      </div>
                    )}
                  </div>
                  <h3 className="font-sans font-semibold text-base text-foreground mb-1.5">{p.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {p.description}
                  </p>
                  {p.hours && (
                    <p className="text-[10px] tabular-data text-accent mb-3">
                      🕒 {p.hours}
                    </p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver en el mapa <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/explorer")}
              className="inline-flex items-center gap-2 px-5 py-2.5 glass-panel border-sovereign text-sm text-foreground hover:glow-gold transition"
            >
              <MapPin className="w-4 h-4 text-primary" />
              Ver todos los puntos en el mapa 3D
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ITINERARIES */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <span className="tabular-data text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
              Planifica tu visita
            </span>
            <h2 className="heritage-text text-3xl sm:text-4xl mb-3">
              <span className="text-foreground">Itinerarios </span>
              <span className="text-gradient-gold">recomendados</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {itineraries.map((it, i) => (
              <motion.div
                key={it.title}
                className="glass-panel border-sovereign p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="heritage-text text-xl text-foreground">{it.title}</h3>
                  <span className="tabular-data text-[10px] text-accent">{it.duration}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{it.desc}</p>
                <ul className="space-y-1.5 mb-4">
                  {it.stops.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                      <span className="tabular-data text-primary mt-0.5">{idx + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/explorer")}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded text-xs font-semibold transition"
                >
                  <NavIcon className="w-3 h-3" /> Iniciar ruta
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS + REALITO */}
      <section id="realito" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-card/20" />
        <div className="relative z-10 container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Events column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-violet-400" />
                <h3 className="heritage-text text-2xl text-foreground">Próximos eventos</h3>
              </div>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No hay eventos próximos. Vuelve pronto.</p>
                ) : events.map((e, i) => (
                  <motion.div
                    key={e.id}
                    className="glass-panel border-sovereign p-4 flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <div className="text-center min-w-[52px]">
                      {e.event_date ? (
                        <>
                          <div className="tabular-data text-2xl font-semibold text-primary leading-none">
                            {new Date(e.event_date).getDate()}
                          </div>
                          <div className="tabular-data text-[9px] uppercase text-muted-foreground">
                            {new Date(e.event_date).toLocaleDateString("es-MX", { month: "short" })}
                          </div>
                        </>
                      ) : (
                        <Sparkles className="w-5 h-5 text-amber-400 mx-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans font-semibold text-sm text-foreground">{e.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{e.description || e.location}</p>
                      {e.location && (
                        <p className="text-[10px] tabular-data text-accent mt-1 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {e.location}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Realito promo */}
            <motion.div
              className="glass-panel border-sovereign p-6 flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="grid grid-cols-2 gap-1 w-14">
                  <img src={realitoPastes} alt="" className="rounded aspect-square object-cover" />
                  <img src={realitoPlateria} alt="" className="rounded aspect-square object-cover" />
                </div>
                <h3 className="heritage-text text-xl text-gradient-gold">Realito</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4 flex-1">
                Tu guía local con IA. Pregúntale por horarios, dónde comer pastes, cuánto tarda
                bajar a la mina o qué hacer si llueve.
              </p>
              <p className="text-[10px] tabular-data text-primary mb-3">
                💬 "¿Qué hago en Real del Monte con niños?"
              </p>
              <p className="text-[10px] tabular-data text-accent">
                💬 "¿Cuánto cuesta entrar a la Mina de Acosta?"
              </p>
              <p className="text-[10px] tabular-data text-violet-300 mb-4">
                💬 "Recomiéndame un mirador con buen clima"
              </p>
              <span className="text-[10px] text-muted-foreground italic">
                Disponible en la esquina inferior derecha →
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DISCREET PLATFORM CREDIT */}
      <section className="relative py-10 border-t border-border/20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-[11px] tabular-data text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-start gap-2">
                <Layers className="w-3 h-3" /> Plataforma soberana RDM-X
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Gemelo digital del Pueblo Mágico · IA local Isabella Core™ · Datos abiertos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin")}
                className="text-[11px] text-muted-foreground/80 hover:text-foreground transition flex items-center gap-1.5"
              >
                <Shield className="w-3 h-3" /> Panel administrativo
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ExperienceHub;
