import { motion } from "framer-motion";
import { Layers, Database, Shield, Cpu, Globe, Radio, Zap, ArrowRight } from "lucide-react";
import realitoPastes from "@/assets/realito-pastes.png";
import realitoPlateria from "@/assets/realito-plateria.png";
import realitoSanitarios from "@/assets/realito-sanitarios.png";
import realitoLikes from "@/assets/realito-likes.png";

const ease = [0.2, 0, 0, 1] as const;

const layers = [
  { icon: Globe, name: "Explorer", desc: "Gemelo Digital 2D/3D con terreno real y edificios extruidos", color: "text-accent", status: "online" },
  { icon: Layers, name: "Elevated", desc: "Narrativa cinematográfica premium con audio e intro", color: "text-primary", status: "online" },
  { icon: Shield, name: "Admin", desc: "Panel soberano de gestión con CRUD completo", color: "text-primary", status: "online" },
  { icon: Cpu, name: "Isabella Core™", desc: "Motor cognitivo con detección de intención y emoción", color: "text-accent", status: "online" },
  { icon: Database, name: "BookPI", desc: "Bóveda de memoria y auditoría de cada interacción", color: "text-primary", status: "online" },
  { icon: Radio, name: "ChronusEngine", desc: "Motor de tiempo real vía WebSockets", color: "text-accent", status: "online" },
  { icon: Zap, name: "Edge Soberano", desc: "Proxy TLS + routing fino a cada célula", color: "text-primary", status: "standby" },
];

const showcaseImages = [
  { src: realitoPastes, title: "Pastes El Portal", desc: "Gastronomía Cornish" },
  { src: realitoPlateria, title: "Platería del Monte", desc: "Artesanía en Plata" },
  { src: realitoSanitarios, title: "Servicios Públicos", desc: "Infraestructura" },
  { src: realitoLikes, title: "Comunidad Digital", desc: "Reseñas RDM" },
];

const ExperienceHub = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <span className="tabular-data text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 block">
            Arquitectura Federada
          </span>
          <h2 className="heritage-text text-4xl sm:text-5xl md:text-6xl mb-4">
            <span className="text-gradient-gold">7 Capas</span>
            <span className="text-foreground">, Un Organismo</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cada célula se desarrolla, versiona y despliega de forma independiente.
            Si una cae, el ecosistema persiste. Antifragilidad por diseño.
          </p>
        </motion.div>

        {/* Layers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto mb-20">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.name}
              className="glass-panel border-sovereign p-6 group cursor-pointer transition-all duration-300 hover:glow-gold relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-3">
                <layer.icon className={`w-6 h-6 ${layer.color} transition-transform duration-300 group-hover:scale-110`} />
                <div className={`w-2 h-2 rounded-full ${layer.status === "online" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
              </div>
              <h3 className="font-sans font-semibold text-sm text-foreground mb-1">{layer.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{layer.desc}</p>
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary/5 to-transparent" />
            </motion.div>
          ))}
        </div>

        {/* Realito Showcase */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <div className="text-center mb-10">
            <span className="tabular-data text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
              Realito AI — Tu Guía Digital
            </span>
            <h3 className="heritage-text text-3xl sm:text-4xl text-foreground mb-3">
              Conoce a <span className="text-gradient-gold">Realito</span>
            </h3>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Asistente cognitivo con Isabella Core™ que conoce cada rincón de Real del Monte.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {showcaseImages.map((img, i) => (
              <motion.div
                key={img.title}
                className="glass-panel border-sovereign overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              >
                <div className="relative overflow-hidden aspect-[16/10]">
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <div className="px-4 py-3">
                  <h4 className="font-sans font-semibold text-xs text-foreground">{img.title}</h4>
                  <p className="tabular-data text-[10px] text-muted-foreground">{img.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Architecture summary */}
        <motion.div
          className="glass-panel border-sovereign p-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-sans font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Antifragilidad
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Si la capa Elevated cae, el gemelo digital y el backend siguen funcionando.
                Cada célula es resiliente e independiente.
              </p>
            </div>
            <div>
              <h4 className="font-sans font-semibold text-sm text-accent mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Federación
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Module Federation permite que cada app se versione y despliegue sin romper el todo.
                TAMVAI API unifica la comunicación.
              </p>
            </div>
            <div>
              <h4 className="font-sans font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Soberanía
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Los datos clave se mantienen bajo tu control. BookPI registra cada decisión.
                Sin dependencia de plataformas cerradas.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperienceHub;
