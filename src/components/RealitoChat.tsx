import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

const ease = [0.2, 0, 0, 1] as const;

const RealitoChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages] = useState([
    { role: "assistant", text: "¡Hola! Soy Realito, tu asistente digital de Real del Monte. ¿En qué puedo ayudarte hoy?" },
  ]);

  return (
    <>
      {/* Launcher */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-glow-gold transition-transform hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-5 h-5 text-primary-foreground" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] glass-panel-strong border-sovereign overflow-hidden flex flex-col"
            style={{ height: "480px" }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm text-foreground">Realito</h3>
                <span className="tabular-data text-[10px] text-muted-foreground">Asistente Contextual · En línea</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary/20 text-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button className="w-7 h-7 rounded-md bg-primary flex items-center justify-center transition-transform hover:scale-105">
                  <Send className="w-3 h-3 text-primary-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RealitoChat;
