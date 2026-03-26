import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import rdmBanner from "@/assets/rdm-hero-banner.png";
import rdmBadge from "@/assets/rdm-logo-badge.png";

const ease = [0.22, 0.03, 0.26, 1] as const;

const INTRO_LINES = [
  {
    text: "Real del Monte",
    delay: 0.6,
    className:
      "heritage-text text-4xl sm:text-6xl md:text-7xl text-gradient-gold tracking-tight",
  },
  {
    text: "Sistema Operativo Turístico Vivo",
    delay: 2.4,
    className:
      "font-sans text-xs sm:text-sm md:text-base text-muted-foreground tracking-[0.25em] uppercase",
  },
  {
    text: "Gemelo Digital Soberano",
    delay: 4.2,
    className:
      "heritage-text text-xl sm:text-2xl md:text-3xl text-foreground/80",
  },
];

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [phase, setPhase] = useState<"badge" | "lines" | "reveal" | "done">(
    "badge",
  );
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/isabella-intro.mp3");
      audioRef.current.volume = 0.55;
    }
    audioRef.current
      .play()
      .then(() => setAudioEnabled(true))
      .catch(() => {
        // usuario no interactuó; no forzar
      });
  }, []);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) {
      startAudio();
      return;
    }
    if (audioEnabled) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setAudioEnabled((prev) => !prev);
  }, [audioEnabled, startAudio]);

  const skip = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPhase("done");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => {
        startAudio();
        setPhase("lines");
      }, 1700),
    );

    timers.push(
      setTimeout(() => {
        setPhase("reveal");
      }, 6400),
    );

    timers.push(
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 9000),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete, startAudio]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease }}
      >
        {/* Capa base: gradiente nocturno */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 0%, rgba(253, 224, 71, 0.05), transparent 55%), radial-gradient(circle at 80% 100%, rgba(56, 189, 248, 0.06), transparent 60%), linear-gradient(to bottom, hsl(222 47% 8%), hsl(222 47% 3%))",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease }}
        />

        {/* Fondo con efecto Ken Burns suave */}
        <motion.div
          className="absolute inset-0 mix-blend-soft-light"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={
            phase === "reveal"
              ? { opacity: 0.4, scale: 1.02 }
              : { opacity: 0.2, scale: 1.06 }
          }
          transition={{ duration: 3.2, ease }}
        >
          <img
            src={rdmBanner}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </motion.div>

        {/* Capa de neblina volumétrica */}
        <motion.div
          className="pointer-events-none absolute inset-[-20%] opacity-40 mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 120%, rgba(148, 163, 184, 0.15), transparent 70%), radial-gradient(ellipse at 0% 0%, rgba(248, 250, 252, 0.08), transparent 55%), radial-gradient(ellipse at 100% 10%, rgba(252, 211, 77, 0.09), transparent 60%)",
          }}
          animate={{
            opacity: [0.25, 0.4, 0.3],
            x: [0, -10, 8, 0],
            y: [0, 12, -8, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Partículas elegantes (órbitas lentas) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 26 }).map((_, i) => {
            const delay = Math.random() * 6;
            const duration = 10 + Math.random() * 10;
            const size = 3 + Math.random() * 6;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary/30 blur-[1.5px]"
                style={{
                  width: size,
                  height: size,
                  left: `${Math.random() * 110 - 5}%`,
                  top: `${Math.random() * 110 - 5}%`,
                }}
                animate={{
                  x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
                  y: [0, Math.random() * 30 - 15, Math.random() * 30 - 15, 0],
                  opacity: [0, 0.8, 0.4, 0],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        {/* Aro orbital alrededor del badge */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "badge" ? 0.45 : 0.25 }}
          transition={{ duration: 1.4, ease }}
        >
          <motion.div
            className="relative w-[18rem] h-[18rem] sm:w-[22rem] sm:h-[22rem] rounded-full border border-amber-300/10"
            animate={{
              rotate: [0, 360],
              boxShadow: [
                "0 0 0 0 rgba(250, 250, 249, 0.0)",
                "0 0 60px 0 rgba(250, 250, 249, 0.18)",
                "0 0 0 0 rgba(250, 250, 249, 0.0)",
              ],
            }}
            transition={{
              rotate: { duration: 42, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div className="absolute inset-[20%] rounded-full border border-emerald-400/10" />
            <div className="absolute inset-[40%] rounded-full border border-slate-500/10" />
          </motion.div>
        </motion.div>

        {/* Badge central */}
        <AnimatePresence mode="sync">
          {phase === "badge" && (
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.7, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                scale: 1.15,
                filter: "blur(18px)",
              }}
              transition={{ duration: 1.3, ease }}
            >
              <motion.div
                className="relative"
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-4 rounded-full bg-black/40 blur-2xl" />
                <img
                  src={rdmBadge}
                  alt="RDM Digital Badge"
                  className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain drop-shadow-[0_35px_55px_rgba(0,0,0,0.8)]"
                />
              </motion.div>
              <motion.div
                className="mt-8 text-[11px] sm:text-xs tracking-[0.22em] text-slate-400 uppercase"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1, ease }}
              >
                RDM DIGITAL · GEMELO SOBERANO EN TIEMPO CASI REAL
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Líneas de texto centrales */}
        {(phase === "lines" || phase === "reveal") && (
          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            {INTRO_LINES.map((line, index) => (
              <motion.p
                key={line.text}
                className={line.className}
                initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 1.2,
                  ease,
                  delay: line.delay,
                }}
              >
                {line.text}
              </motion.p>
            ))}

            {/* Subcopy fino */}
            <motion.p
              className="mt-6 max-w-md text-xs sm:text-sm text-slate-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: phase === "reveal" ? 1 : 0.85, y: 0 }}
              transition={{ duration: 1.4, ease, delay: 5.4 }}
            >
              Un laboratorio vivo donde el territorio, sus historias y su
              economía se sincronizan con una inteligencia local, pensada sólo
              para Real del Monte.
            </motion.p>
          </div>
        )}

        {/* Etiqueta de capa contextual arriba a la izquierda */}
        <motion.div
          className="absolute top-6 left-6 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.1, ease, delay: 1.4 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-black/50 px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase text-slate-300">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Entrada al gemelo digital</span>
          </div>
        </motion.div>

        {/* Controles */}
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
          <button
            onClick={toggleAudio}
            className="glass-panel border-sovereign px-2.5 py-2 rounded-full text-muted-foreground hover:text-foreground hover:border-emerald-400/70 hover:bg-emerald-400/5 transition-colors flex items-center justify-center"
            aria-label={audioEnabled ? "Silenciar introducción" : "Activar audio introducción"}
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={skip}
            className="glass-panel border-sovereign px-4 py-2.5 rounded-full text-[11px] text-slate-300 hover:text-foreground hover:border-slate-200/60 hover:bg-slate-50/5 transition-colors flex items-center gap-2"
          >
            <SkipForward className="w-3 h-3" />
            Saltar introducción
          </button>
        </div>

        {/* Barra de progreso refinada */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800/80 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-300 via-amber-200 to-sky-300"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 9, ease: "linear" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CinematicIntro;
