import { Bell, Check } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";

const NotificationsBell = () => {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="glass-panel border-sovereign p-2 relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-3.5 h-3.5" />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-[14px] h-[14px] px-1 flex items-center justify-center"
              >
                {unread > 9 ? "9+" : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass-panel-strong border-sovereign">
        <div className="p-3 border-b border-border/30 flex items-center justify-between">
          <span className="heritage-text text-sm">Notificaciones</span>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-[10px] text-primary hover:underline flex items-center gap-1">
              <Check className="w-3 h-3" /> Marcar leídas
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Sin notificaciones aún</div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => { if (!n.read) markRead(n.id); if (n.link) window.location.href = n.link; }}
                className={`w-full text-left p-3 border-b border-border/20 hover:bg-muted/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="w-1.5 h-1.5 mt-1.5 bg-primary rounded-full shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{n.title}</div>
                    {n.body && <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>}
                    <div className="text-[9px] text-muted-foreground/70 mt-1">{new Date(n.created_at).toLocaleString("es-MX")}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsBell;
