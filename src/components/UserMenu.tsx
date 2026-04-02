import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, User, Shield } from "lucide-react";
import { motion } from "framer-motion";

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  if (!user) {
    return (
      <motion.button
        onClick={() => navigate("/auth")}
        className="glass-panel border-sovereign px-4 py-2 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <LogIn className="w-3 h-3" />
        <span className="tabular-data text-xs">Acceder</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      {isAdmin && (
        <button
          onClick={() => navigate("/admin")}
          className="glass-panel border-sovereign px-3 py-2 flex items-center gap-1.5 text-primary hover:text-foreground transition-colors"
        >
          <Shield className="w-3 h-3" />
          <span className="tabular-data text-[10px]">Admin</span>
        </button>
      )}
      <div className="glass-panel border-sovereign px-3 py-2 flex items-center gap-2">
        <User className="w-3 h-3 text-muted-foreground" />
        <span className="tabular-data text-[10px] text-muted-foreground max-w-[80px] truncate">
          {user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

export default UserMenu;
