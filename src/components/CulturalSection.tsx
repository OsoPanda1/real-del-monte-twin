import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Utensils, Skull, Palette, Sparkles } from "lucide-react";

const ICONS: Record<string, any> = {
  historia: BookOpen, gastronomia: Utensils, mitos: Skull, leyendas: Sparkles, arte: Palette,
};

const CulturalSection = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("todos");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("cultural_content").select("*").order("featured", { ascending: false });
      setItems(data || []);
    })();
  }, []);

  const cats = ["todos", "historia", "gastronomia", "mitos", "leyendas", "arte"];
  const filtered = filter === "todos" ? items : items.filter((i) => i.category === filter);

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-background via-card/30 to-background">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <p className="tabular-data text-[10px] text-primary mb-3">PATRIMONIO VIVO</p>
          <h2 className="heritage-text text-4xl md:text-5xl mb-3">
            <span className="text-foreground">Historia, </span>
            <span className="text-gradient-gold">Mitos y Sabores</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Real del Monte cuenta con siglos de leyendas mineras, arquitectura inglesa y la cuna del paste mexicano.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {cats.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all ${
                filter === c ? "bg-primary text-primary-foreground" : "glass-panel border-sovereign text-muted-foreground hover:text-foreground"
              }`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, i) => {
            const Icon = ICONS[item.category] || BookOpen;
            return (
              <motion.article key={item.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel-strong border-sovereign p-5 hover:border-primary/40 transition-all group">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="tabular-data text-[9px] text-primary uppercase">{item.category}</span>
                  {item.featured && <span className="ml-auto text-[9px] tabular-data text-rdm-gold">★ DESTACADO</span>}
                </div>
                <h3 className="heritage-text text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{item.body || item.excerpt}</p>
              </motion.article>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-8">No hay contenido en esta categoría aún.</p>
        )}
      </div>
    </section>
  );
};

export default CulturalSection;
