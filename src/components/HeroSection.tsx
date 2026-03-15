import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Map, Mountain, Compass, Radio } from "lucide-react";
import heroImage from "@/assets/hero-rdm.jpg";

const ease = [0.2, 0, 0, 1] as const;

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease }}
      >
        <img
          src={heroImage}
          alt="Vista aérea de Real del Monte entre la neblina"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </motion.div>

      {/* Scan line effect */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="w-full h-px bg-primary animate-scan" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
          className="mb-4"
        >
          <span className="tabular-data text-xs uppercase tracking-[0.3em] text-muted-foreground">
            TAMV Online Network · Soberanía Digital
          </span>
        </motion.div>

        <motion.h1
          className="heritage-text text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.5 }}
        >
          <span className="text-gradient-gold">RDM</span>
          <span className="text-foreground">‑X</span>
        </motion.h1>

        <motion.p
          className="heritage-text text-xl sm:text-2xl md:text-3xl text-foreground/80 mb-2 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.7 }}
        >
          El pulso digital de la montaña
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground max-w-xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.9 }}
        >
          Gemelo digital soberano de Real del Monte. 7 capas federadas. 
          Un solo organismo digital coherente.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 1.1 }}
        >
          <button
            onClick={() => navigate("/explorer")}
            className="group glass-panel border-sovereign px-8 py-4 flex items-center gap-3 transition-all duration-300 hover:glow-gold"
          >
            <Map className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="font-sans font-semibold text-sm tracking-wide text-foreground">
              Gemelo Digital
            </span>
          </button>

          <button
            onClick={() => navigate("/explorer")}
            className="group glass-panel border-sovereign px-8 py-4 flex items-center gap-3 transition-all duration-300 hover:glow-oxygen"
          >
            <Compass className="w-5 h-5 text-accent transition-transform duration-300 group-hover:scale-110" />
            <span className="font-sans font-semibold text-sm tracking-wide text-foreground">
              Explorar Rutas
            </span>
          </button>

          <button
            onClick={() => navigate("/admin")}
            className="group px-8 py-4 flex items-center gap-3 transition-all duration-300 text-muted-foreground hover:text-foreground"
          >
            <Radio className="w-4 h-4" />
            <span className="font-sans text-sm tracking-wide">
              Panel Soberano
            </span>
          </button>
        </motion.div>
      </div>

      {/* Chronus Ticker */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <ChronusTicker />
      </motion.div>
    </section>
  );
};

const ChronusTicker = () => {
  return (
    <div className="glass-panel-strong border-sovereign mx-4 mb-4 sm:mx-8 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-gold" />
        <span className="tabular-data text-xs text-muted-foreground">CHRONUS ENGINE</span>
      </div>
      
      <div className="flex items-center gap-6 sm:gap-10">
        <div className="text-center">
          <span className="tabular-data text-xs text-muted-foreground block">Cobertura Soberana</span>
          <span className="tabular-data text-sm text-primary font-semibold">94.2%</span>
        </div>
        <div className="text-center">
          <span className="tabular-data text-xs text-muted-foreground block">Nodos Activos</span>
          <span className="tabular-data text-sm text-accent font-semibold">1,248</span>
        </div>
        <div className="text-center">
          <span className="tabular-data text-xs text-muted-foreground block">Latencia Edge</span>
          <span className="tabular-data text-sm text-foreground font-semibold">12ms</span>
        </div>
        <div className="text-center hidden sm:block">
          <span className="tabular-data text-xs text-muted-foreground block">Células</span>
          <span className="tabular-data text-sm text-secondary-foreground font-semibold">7/7</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Mountain className="w-3 h-3 text-muted-foreground" />
        <span className="tabular-data text-xs text-muted-foreground">2,660 msnm</span>
      </div>
    </div>
  );
};

export default HeroSection;
