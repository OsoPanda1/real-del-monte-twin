import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import rdmBadge from "@/assets/rdm-logo-badge.png";

const ease = [0.2, 0, 0, 1] as const;

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Bienvenido al ecosistema RDM-X");
        navigate("/admin");
      }
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Cuenta creada. Revisa tu correo para verificar tu cuenta.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rdm-carbon via-card to-rdm-carbon" />
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(var(--rdm-gold) / 0.2), transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-10 glass-panel border-sovereign p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        <div className="glass-panel-strong border-sovereign p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={rdmBadge} alt="RDM" className="w-16 h-16 mx-auto mb-4 object-contain" />
            <h1 className="heritage-text text-2xl mb-1">
              <span className="text-gradient-gold">RDM‑X</span>
              <span className="text-foreground"> Soberano</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "login" ? "Accede al ecosistema digital" : "Únete al ecosistema soberano"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-xs font-sans font-semibold rounded-lg transition-colors ${
                mode === "login" ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-xs font-sans font-semibold rounded-lg transition-colors ${
                mode === "register" ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nombre"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-3 bg-muted/50 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {loading
                ? "Procesando..."
                : mode === "login"
                ? "Acceder al Panel Soberano"
                : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-[10px] text-muted-foreground mt-6">
            TAMV Online Network · Soberanía Digital · RDM‑X v2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
