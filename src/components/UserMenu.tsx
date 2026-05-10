import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, User, Shield, Store, Network } from "lucide-react";
import { motion } from "framer-motion";
import NotificationsBell from "./NotificationsBell";
import ProfileEditor from "./ProfileEditor";

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isComerciante, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) {
    return (
      <motion.button
        onClick={() => navigate("/auth")}
        className="glass-panel border-sovereign px-4 py-2 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
      >
        <LogIn className="w-3 h-3" />
        <span className="tabular-data text-xs">Acceder</span>
      </motion.button>
    );
  }

  return (
    <>
      <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        <NotificationsBell />
        <button onClick={() => navigate("/integraciones")} title="Integraciones"
          className="glass-panel border-sovereign p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Network className="w-3 h-3" />
        </button>
        <button onClick={() => navigate("/comerciante")} title="Soy comerciante"
          className="glass-panel border-sovereign p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Store className="w-3 h-3" />
        </button>
        {isAdmin && (
          <button onClick={() => navigate("/admin")}
            className="glass-panel border-sovereign px-3 py-2 flex items-center gap-1.5 text-primary hover:text-foreground transition-colors">
            <Shield className="w-3 h-3" />
            <span className="tabular-data text-[10px]">Admin</span>
          </button>
        )}
        <button onClick={() => setProfileOpen(true)}
          className="glass-panel border-sovereign px-3 py-2 flex items-center gap-2 hover:border-primary/40 transition-colors">
          <User className="w-3 h-3 text-muted-foreground" />
          <span className="tabular-data text-[10px] text-muted-foreground max-w-[80px] truncate">{user.email}</span>
        </button>
        <button onClick={() => signOut()} className="glass-panel border-sovereign p-2 text-muted-foreground hover:text-foreground transition-colors" title="Salir">
          <LogOut className="w-3 h-3" />
        </button>
      </motion.div>
      <ProfileEditor open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
};

export default UserMenu;
