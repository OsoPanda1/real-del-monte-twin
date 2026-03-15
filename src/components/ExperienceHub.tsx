import { motion } from "framer-motion";
import topoPattern from "@/assets/topo-pattern.jpg";
import { Layers, Database, Shield, Cpu, Globe, Radio, Zap } from "lucide-react";

const ease = [0.2, 0, 0, 1];

const layers = [
  { icon: Globe, name: "Explorer", desc: "Gemelo Digital 2D/3D", color: "text-accent" },
  { icon: Layers, name: "Elevated", desc: "Narrativa Cinematográfica", color: "text-primary" },
  { icon: Shield, name: "Admin", desc: "Panel Soberano", color: "text-primary" },
  { icon: Cpu, name: "AI / Realito", desc: "Inteligencia Contextual", color: "text-accent" },
  { icon: Database, name: "Analytics", desc: "Métricas OSS", color: "text-primary" },
  { icon: Radio, name: "Backend", desc: "API + WebSockets", color: "text-accent" },
  { icon: Zap, name: "Edge", desc: "Proxy Soberano", color: "text-primary" },
];

const ExperienceHub = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Topo background */}
      <div className="absolute inset-0 opacity-20">
        <img src={topoPattern} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative z-10 container mx-auto px-6">
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
            Si una cae, el ecosistema persiste.
          </p>
        </motion.div>

        {/* Layers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.name}
              className="glass-panel border-sovereign p-6 group cursor-pointer transition-all duration-300 hover:glow-gold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
            >
              <layer.icon className={`w-6 h-6 ${layer.color} mb-4 transition-transform duration-300 group-hover:scale-110`} />
              <h3 className="font-sans font-semibold text-sm text-foreground mb-1">{layer.name}</h3>
              <p className="text-xs text-muted-foreground">{layer.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Architecture diagram summary */}
        <motion.div
          className="mt-16 glass-panel border-sovereign p-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-sans font-semibold text-sm text-primary mb-2">Antifragilidad</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Si la capa Elevated cae, el gemelo digital y el backend siguen funcionando. 
                Cada célula es resiliente.
              </p>
            </div>
            <div>
              <h4 className="font-sans font-semibold text-sm text-accent mb-2">Federación</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Module Federation permite que cada app se versione y despliegue sin romper el todo.
              </p>
            </div>
            <div>
              <h4 className="font-sans font-semibold text-sm text-primary mb-2">Soberanía</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Los datos clave se mantienen bajo tu control. Sin dependencia de plataformas cerradas.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperienceHub;
