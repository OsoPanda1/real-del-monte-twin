import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";

const ease = [0.2, 0, 0, 1];

const Footer = () => {
  return (
    <footer className="relative border-t border-border/30 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="heritage-text text-lg text-gradient-gold mb-3">RDM‑X</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Ecosistema soberano federado para Real del Monte.
              Gemelo digital vivo de la montaña minera.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-xs text-foreground mb-3 uppercase tracking-wider">Células</h4>
            <div className="space-y-1.5">
              {["Explorer", "Elevated", "Admin", "Realito AI", "Analytics", "Backend", "Edge"].map((item) => (
                <p key={item} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-xs text-foreground mb-3 uppercase tracking-wider">TAMV Network</h4>
            <div className="space-y-1.5">
              <a href="https://github.com/OsoPanda1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-3 h-3" /> OsoPanda1
              </a>
              <a href="https://tamvonlinenetwork.blogspot.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink className="w-3 h-3" /> TAMV Blog
              </a>
              <p className="text-xs text-muted-foreground">Pachuca, Hidalgo · México</p>
              <p className="text-xs text-muted-foreground">CEO: Edwin O. Castillo Trejo</p>
            </div>
          </div>
        </div>

        <motion.div
          className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <span className="tabular-data text-[10px] text-muted-foreground">
            © 2026 TAMV ONLINE NETWORK · Soberanía Digital · Real del Monte, Hidalgo
          </span>
          <span className="tabular-data text-[10px] text-muted-foreground">
            RDM‑X v1.0 · 7 Células · Arquitectura Federada
          </span>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
