import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

const NewsListPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const from = page * PAGE_SIZE;
      const { data, count } = await supabase
        .from("news")
        .select("*", { count: "exact" })
        .eq("published", true)
        .order("published_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      setItems(data || []); setTotal(count || 0); setLoading(false);
    })();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="w-6 h-6 text-primary" />
          <h1 className="heritage-text text-4xl"><span className="text-foreground">Noticias del </span><span className="text-gradient-gold">Pueblo</span></h1>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Cargando...</p> : items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aún no hay noticias publicadas.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((n) => (
              <Link key={n.id} to={`/noticias/${n.id}`} className="glass-panel-strong border-sovereign p-4 hover:border-primary/40 transition-colors block">
                {n.cover_url && <img src={n.cover_url} alt={n.title} className="w-full h-32 object-cover rounded mb-3" loading="lazy" />}
                <div className="text-[9px] tabular-data text-primary uppercase mb-1">{n.category}</div>
                <h2 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">{n.title}</h2>
                <p className="text-xs text-muted-foreground line-clamp-3">{n.excerpt}</p>
                <p className="text-[9px] tabular-data text-muted-foreground mt-2">{new Date(n.published_at).toLocaleDateString("es-MX")}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
          <span className="text-xs text-muted-foreground self-center">Página {page + 1} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
        </div>
      </div>
    </div>
  );
};

export default NewsListPage;
