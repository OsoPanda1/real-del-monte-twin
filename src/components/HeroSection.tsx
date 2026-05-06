import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Map, Compass, MessageCircle, Clock, Mountain } from "lucide-react";
import heroImage from "@/assets/rdm-hero-banner.png";

import UserMenu from "@/components/UserMenu";

const ease = [0.2, 0, 0, 1] as const;

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease }}
      >
        <motion.img
          src={heroImage}
          alt="Vista aérea de Real del Monte iluminado de noche, Pueblo Mágico de Hidalgo"
          className="w-full h-full object-cover"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/75 to-background" />
        <div className="absolute inset-0 bg-background/40" />
      </motion.div>

      <div className="absolute top-4 right-6 z-20"><UserMenu /></div>

      <div className="relative z-10 container mx-auto px-6 text-center pt-24 pb-32">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.4 }}
          className="mb-3"
        >
          <span className="tabular-data text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary">
            Pueblo Mágico de Hidalgo · 2,750 msnm
          </span>
        </motion.div>

        <motion.h1
          className="heritage-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-3"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.6 }}
        >
          <span className="text-gradient-gold">Real del Monte</span>
        </motion.h1>

        <motion.p
          className="heritage-text text-lg sm:text-xl md:text-2xl text-foreground/90 mb-3 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.8 }}
        >
          Plata, niebla, pastes y leyendas cornish en la sierra hidalguense
        </motion.p>

        <motion.p
          className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 1.0 }}
        >
          Descubre minas del siglo XVI, el único panteón inglés de México y los miradores
          más altos del estado. Planifica tu visita con tiempos reales, horarios y rutas guiadas.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 1.2 }}
        >
          <button
            onClick={() => navigate("/explorer")}
            className="group glass-panel border-sovereign px-7 py-4 flex items-center gap-3 transition-all duration-300 hover:glow-gold"
          >
            <Map className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="font-sans font-semibold text-sm tracking-wide text-foreground">
              Explorar el pueblo
            </span>
          </button>

          <button
            onClick={() => navigate("/explorer")}
            className="group glass-panel border-sovereign px-7 py-4 flex items-center gap-3 transition-all duration-300 hover:glow-oxygen"
          >
            <Compass className="w-5 h-5 text-accent transition-transform duration-300 group-hover:scale-110" />
            <span className="font-sans font-semibold text-sm tracking-wide text-foreground">
              Ver rutas y miradores
            </span>
          </button>

          <a
            href="#realito"
            className="group px-6 py-4 flex items-center gap-3 transition-all duration-300 text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-sans text-sm tracking-wide">Pregúntale a Realito</span>
          </a>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.6 }}
      >
        <VisitorTicker />
      </motion.div>
    </section>
  );
};

const VisitorTicker = () => (
  <div className="glass-panel-strong border-sovereign mx-4 mb-4 sm:mx-8 px-6 py-3 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
    <div className="flex items-center gap-2">
      <Mountain className="w-3 h-3 text-primary" />
      <span className="tabular-data text-[10px] text-muted-foreground">Altitud</span>
      <span className="tabular-data text-xs text-foreground font-semibold">2,750 m</span>
    </div>
    <div className="flex items-center gap-2">
      <Clock className="w-3 h-3 text-accent" />
      <span className="tabular-data text-[10px] text-muted-foreground">Visita ideal</span>
      <span className="tabular-data text-xs text-foreground font-semibold">1–2 días</span>
    </div>
    <div className="flex items-center gap-2">
      <Compass className="w-3 h-3 text-primary" />
      <span className="tabular-data text-[10px] text-muted-foreground">Pueblo Mágico</span>
      <span className="tabular-data text-xs text-primary font-semibold">desde 2004</span>
    </div>
    <div className="hidden sm:flex items-center gap-2">
      <span className="tabular-data text-[10px] text-muted-foreground">Clima hoy</span>
      <span className="tabular-data text-xs text-accent font-semibold">12°C · niebla</span>
    </div>
  </div>
);

export default HeroSection;
