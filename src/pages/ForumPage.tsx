import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessagesSquare, Plus, Pin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const PAGE_SIZE = 15;

const ForumPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");

  const load = async () => {
    const from = page * PAGE_SIZE;
    const { data, count } = await supabase
      .from("forum_threads").select("*", { count: "exact" })
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    setThreads(data || []); setTotal(count || 0);
  };

  useEffect(() => { load(); }, [page]);

  const create = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!title) { toast.error("Falta título"); return; }
    const { error } = await supabase.from("forum_threads").insert({ user_id: user.id, title, body, category });
    if (error) toast.error(error.message);
    else { toast.success("Hilo creado"); setShowNew(false); setTitle(""); setBody(""); load(); }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessagesSquare className="w-6 h-6 text-primary" />
            <h1 className="heritage-text text-4xl"><span className="text-foreground">Foros </span><span className="text-gradient-gold">de la Comunidad</span></h1>
          </div>
          <Button size="sm" onClick={() => user ? setShowNew((s) => !s) : navigate("/auth")}>
            <Plus className="w-3 h-3 mr-1" />Nuevo hilo
          </Button>
        </div>

        {showNew && (
          <div className="glass-panel-strong border-sovereign p-5 mb-6 space-y-2">
            <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="¿Sobre qué quieres conversar?" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="general">General</option><option value="historia">Historia</option>
              <option value="gastronomia">Gastronomía</option><option value="mitos">Mitos y leyendas</option>
              <option value="turismo">Turismo</option>
            </select>
            <div className="flex gap-2"><Button size="sm" onClick={create}>Publicar</Button><Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button></div>
          </div>
        )}

        <div className="space-y-2">
          {threads.length === 0 ? <p className="text-sm text-muted-foreground italic">Aún no hay hilos. ¡Sé el primero!</p> : threads.map((t) => (
            <Link key={t.id} to={`/foros/${t.id}`} className="glass-panel border-sovereign p-4 flex items-center gap-3 hover:border-primary/40 transition-colors">
              {t.pinned && <Pin className="w-3 h-3 text-primary" />}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground line-clamp-1">{t.title}</div>
                <div className="text-[10px] text-muted-foreground line-clamp-1">{t.body}</div>
              </div>
              <span className="text-[9px] tabular-data text-primary uppercase">{t.category}</span>
            </Link>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
          <span className="text-xs text-muted-foreground self-center">Página {page + 1} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
