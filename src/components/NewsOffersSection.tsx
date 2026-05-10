import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Tag, Calendar } from "lucide-react";

const NewsOffersSection = () => {
  const [news, setNews] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [n, o, e] = await Promise.all([
        supabase.from("news").select("*").eq("published", true).order("published_at", { ascending: false }).limit(6),
        supabase.from("offers").select("*").eq("active", true).order("created_at", { ascending: false }).limit(6),
        supabase.from("events").select("*").gte("event_date", new Date().toISOString()).order("event_date").limit(6),
      ]);
      setNews(n.data || []); setOffers(o.data || []); setEvents(e.data || []);
    })();

    const ch = supabase.channel("news-offers-events")
      .on("postgres_changes", { event: "*", schema: "public", table: "news" }, () => {
        supabase.from("news").select("*").eq("published", true).order("published_at", { ascending: false }).limit(6).then(({ data }) => setNews(data || []));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => {
        supabase.from("offers").select("*").eq("active", true).order("created_at", { ascending: false }).limit(6).then(({ data }) => setOffers(data || []));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="tabular-data text-[10px] text-primary mb-3">EN TIEMPO REAL</p>
          <h2 className="heritage-text text-3xl md:text-4xl">
            <span className="text-foreground">Noticias, </span>
            <span className="text-gradient-gold">Eventos y Ofertas</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* News */}
          <Column icon={Newspaper} title="Noticias" empty="Sin noticias publicadas">
            {news.map((n) => (
              <Item key={n.id} title={n.title} subtitle={n.excerpt} meta={new Date(n.published_at).toLocaleDateString("es-MX")} tag={n.category} />
            ))}
          </Column>
          {/* Events */}
          <Column icon={Calendar} title="Próximos eventos" empty="No hay eventos programados">
            {events.map((e) => (
              <Item key={e.id} title={e.title} subtitle={e.description} meta={new Date(e.event_date).toLocaleString("es-MX")} tag={e.category} />
            ))}
          </Column>
          {/* Offers */}
          <Column icon={Tag} title="Ofertas activas" empty="Sin promociones vigentes">
            {offers.map((o) => (
              <Item key={o.id} title={o.title} subtitle={o.description}
                meta={o.discount_percent ? `${o.discount_percent}% OFF` : "Promoción"}
                tag={o.ends_at ? `hasta ${new Date(o.ends_at).toLocaleDateString("es-MX")}` : "Vigente"} />
            ))}
          </Column>
        </div>
      </div>
    </section>
  );
};

const Column = ({ icon: Icon, title, empty, children }: any) => (
  <div className="glass-panel-strong border-sovereign p-5">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
      <Icon className="w-4 h-4 text-primary" />
      <span className="heritage-text text-base">{title}</span>
    </div>
    <div className="space-y-3">
      {Array.isArray(children) && children.length > 0 ? children : <p className="text-xs text-muted-foreground text-center py-6">{empty}</p>}
    </div>
  </div>
);

const Item = ({ title, subtitle, meta, tag }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-l-2 border-primary/40 pl-3 py-1">
    <div className="text-xs font-semibold text-foreground line-clamp-1">{title}</div>
    {subtitle && <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{subtitle}</div>}
    <div className="flex gap-2 mt-1">
      <span className="text-[9px] tabular-data text-primary">{meta}</span>
      {tag && <span className="text-[9px] tabular-data text-muted-foreground">· {tag}</span>}
    </div>
  </motion.div>
);

export default NewsOffersSection;
