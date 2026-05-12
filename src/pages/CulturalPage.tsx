import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = ["historia", "gastronomia", "mitos", "arte", "tradicion"];

const CulturalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [item, setItem] = useState<any>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      supabase.from("cultural_content").select("*").eq("id", id).maybeSingle().then(({ data }) => setItem(data));
    } else {
      let q = supabase.from("cultural_content").select("*").order("featured", { ascending: false }).order("created_at", { ascending: false });
      if (filter) q = q.eq("category", filter);
      q.then(({ data }) => setItems(data || []));
    }
  }, [id, filter]);

  if (id) {
    if (!item) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Cargando...</div>;
    return (
      <article className="min-h-screen bg-background py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate("/cultural")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
            <ArrowLeft className="w-3 h-3" /> Volver a cultural
          </button>
          <div className="text-[10px] tabular-data text-primary uppercase mb-2">{item.category}</div>
          <h1 className="heritage-text text-4xl text-gradient-gold mb-4">{item.title}</h1>
          {item.cover_url && <img src={item.cover_url} alt={item.title} className="w-full rounded-lg mb-6" />}
          {item.excerpt && <p className="text-base text-muted-foreground italic mb-6">{item.excerpt}</p>}
          <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{item.body}</div>
          {item.source && <p className="text-[10px] text-muted-foreground mt-6 italic">Fuente: {item.source}</p>}
        </div>
      </article>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="heritage-text text-4xl"><span className="text-foreground">Cultura, Historia </span><span className="text-gradient-gold">y Leyendas</span></h1>
        </div>
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setFilter(null)} className={`text-[10px] tabular-data uppercase px-3 py-1.5 rounded ${!filter ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}>Todo</button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`text-[10px] tabular-data uppercase px-3 py-1.5 rounded ${filter === c ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}>{c}</button>
          ))}
        </div>
        {items.length === 0 ? <p className="text-sm text-muted-foreground italic">No hay contenido en esta categoría.</p> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((c) => (
              <Link key={c.id} to={`/cultural/${c.id}`} className="glass-panel-strong border-sovereign p-4 hover:border-primary/40 transition-colors block">
                {c.cover_url && <img src={c.cover_url} alt={c.title} className="w-full h-32 object-cover rounded mb-3" loading="lazy" />}
                <div className="text-[9px] tabular-data text-primary uppercase mb-1">{c.category}{c.featured && " · destacado"}</div>
                <h2 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">{c.title}</h2>
                <p className="text-xs text-muted-foreground line-clamp-3">{c.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CulturalPage;
