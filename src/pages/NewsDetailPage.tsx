import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
      setItem(data); setLoading(false);
      if (data?.title) document.title = `${data.title} · RDM-X`;
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Cargando...</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Noticia no encontrada.</div>;

  return (
    <article className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/noticias")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Todas las noticias
        </button>
        <div className="text-[10px] tabular-data text-primary uppercase mb-2">{item.category} · {new Date(item.published_at).toLocaleDateString("es-MX")}</div>
        <h1 className="heritage-text text-4xl text-gradient-gold mb-4">{item.title}</h1>
        {item.excerpt && <p className="text-base text-muted-foreground mb-6 italic">{item.excerpt}</p>}
        {item.cover_url && <img src={item.cover_url} alt={item.title} className="w-full rounded-lg mb-6" />}
        <div className="prose prose-invert max-w-none text-foreground/90 whitespace-pre-line text-sm leading-relaxed">{item.body}</div>
      </div>
    </article>
  );
};

export default NewsDetailPage;
