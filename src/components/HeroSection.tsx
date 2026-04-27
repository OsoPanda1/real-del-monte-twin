import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Map, Mountain, Compass, Radio, Sparkles } from "lucide-react";
import heroImage from "@/assets/rdm-hero-banner.png";
import rdmBadge from "@/assets/rdm-logo-badge.png";
import UserMenu from "@/components/UserMenu";

const ease = [0.2, 0, 0, 1] as const;

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with Ken Burns */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease }}
      >
        <motion.img
          src={heroImage}
          alt="Vista aérea de Real del Monte con pueblo mágico iluminado de noche"
          className="w-full h-full object-cover"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
      </motion.div>

      {/* Particle field */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-primary/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -150 - Math.random() * 200],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      {/* Scan line */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden opacity-[0.02]">
        <div className="w-full h-px bg-primary animate-scan" />
      </div>

      {/* User menu */}
      <div className="absolute top-4 right-6 z-20">
        <UserMenu />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center pt-24 pb-32">
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.2 }}
        >
          <img
            src={rdmBadge}
            alt="RDM Digital Badge"
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.4 }}
          className="mb-3"
        >
          <span className="tabular-data text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground">
            TAMV Online Network · Soberanía Digital
          </span>
        </motion.div>

        <motion.h1
          className="heritage-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-3"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.6 }}
        >
          <span className="text-gradient-gold">RDM</span>
          <span className="text-foreground">‑X</span>
        </motion.h1>

        <motion.p
          className="heritage-text text-lg sm:text-xl md:text-2xl text-foreground/80 mb-2 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.8 }}
        >
          El pulso digital de la montaña
        </motion.p>

        <motion.p
          className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 1.0 }}
        >
          Gemelo digital soberano de Real del Monte. 7 capas federadas.
          Un solo organismo digital coherente.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 1.2 }}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.6 }}
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
          <span className="tabular-data text-xs text-muted-foreground block">Cobertura</span>
          <span className="tabular-data text-sm text-primary font-semibold">94.2%</span>
        </div>
        <div className="text-center">
          <span className="tabular-data text-xs text-muted-foreground block">Nodos</span>
          <span className="tabular-data text-sm text-accent font-semibold">1,248</span>
        </div>
        <div className="text-center">
          <span className="tabular-data text-xs text-muted-foreground block">Latencia</span>
          <span className="tabular-data text-sm text-foreground font-semibold">12ms</span>
        </div>
        <div className="text-center hidden sm:block">
          <span className="tabular-data text-xs text-muted-foreground block">Células</span>
          <span className="tabular-data text-sm text-secondary-foreground font-semibold">7/7</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="tabular-data text-xs text-muted-foreground">Isabella Core™</span>
      </div>
    </div>
  );
};

export default HeroSection;
