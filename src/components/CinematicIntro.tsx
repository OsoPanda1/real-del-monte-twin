import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import rdmBanner from "@/assets/rdm-hero-banner.png";
import rdmBadge from "@/assets/rdm-logo-badge.png";

const ease = [0.2, 0, 0, 1] as const;

const INTRO_LINES = [
  { text: "Real del Monte", delay: 0.5, className: "heritage-text text-5xl sm:text-7xl md:text-8xl text-gradient-gold" },
  { text: "Innovación Turística Inteligente", delay: 2.5, className: "font-sans text-lg sm:text-xl text-muted-foreground tracking-[0.15em] uppercase" },
  { text: "Gemelo Digital Soberano", delay: 4.5, className: "heritage-text text-2xl sm:text-3xl text-foreground/80" },
];

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [phase, setPhase] = useState<"badge" | "lines" | "reveal" | "done">("badge");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/isabella-intro.mp3");
      audioRef.current.volume = 0.6;
    }
    audioRef.current.play().catch(() => {});
    setAudioEnabled(true);
  }, []);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (audioEnabled) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setAudioEnabled(!audioEnabled);
  }, [audioEnabled]);

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
    // Badge phase
    timers.push(setTimeout(() => {
      startAudio();
      setPhase("lines");
    }, 2000));
    // Reveal phase
    timers.push(setTimeout(() => setPhase("reveal"), 7000));
    // Auto complete
    timers.push(setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 9000));
    return () => timers.forEach(clearTimeout);
  }, [onComplete, startAudio]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease }}
      >
        {/* Particle overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-primary/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -200 - Math.random() * 300],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Mist layers */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse at 30% 60%, hsl(var(--rdm-gold) / 0.15), transparent 70%)",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Background image fading in */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={phase === "reveal" ? { opacity: 0.3, scale: 1 } : { opacity: 0, scale: 1.15 }}
          transition={{ duration: 2, ease }}
        >
          <img src={rdmBanner} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
        </motion.div>

        {/* Badge */}
        <AnimatePresence>
          {phase === "badge" && (
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3, filter: "blur(10px)" }}
              transition={{ duration: 1.2, ease }}
            >
              <img
                src={rdmBadge}
                alt="RDM Digital Badge"
                className="w-48 h-48 sm:w-64 sm:h-64 object-contain drop-shadow-2xl"
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 40px 10px hsla(45, 60%, 50%, 0.0)",
                    "0 0 80px 30px hsla(45, 60%, 50%, 0.15)",
                    "0 0 40px 10px hsla(45, 60%, 50%, 0.0)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text lines */}
        {(phase === "lines" || phase === "reveal") && (
          <div className="relative z-10 text-center space-y-4 px-6">
            {INTRO_LINES.map((line, i) => (
              <motion.p
                key={i}
                className={line.className}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease, delay: i * 1.8 }}
              >
                {line.text}
              </motion.p>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
          <button
            onClick={toggleAudio}
            className="glass-panel border-sovereign p-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={skip}
            className="glass-panel border-sovereign px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <SkipForward className="w-3 h-3" />
            Saltar
          </button>
        </div>

        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-primary/60"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 9, ease: "linear" }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default CinematicIntro;
