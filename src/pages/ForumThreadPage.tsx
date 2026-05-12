import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ForumThreadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [body, setBody] = useState("");

  const load = useCallback(async () => {
    const [t, p] = await Promise.all([
      supabase.from("forum_threads").select("*").eq("id", id).maybeSingle(),
      supabase.from("forum_posts").select("*").eq("thread_id", id).order("created_at", { ascending: true }),
    ]);
    setThread(t.data); setPosts(p.data || []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase.channel(`thread-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "forum_posts", filter: `thread_id=eq.${id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, load]);

  const reply = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!body.trim()) return;
    const { error } = await supabase.from("forum_posts").insert({ thread_id: id, user_id: user.id, body });
    if (error) toast.error(error.message);
    else { setBody(""); toast.success("Respuesta enviada"); }
  };

  if (!thread) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Cargando hilo...</div>;

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/foros")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Foros
        </button>
        <div className="text-[10px] tabular-data text-primary uppercase mb-2">{thread.category}</div>
        <h1 className="heritage-text text-3xl text-gradient-gold mb-3">{thread.title}</h1>
        <p className="text-sm text-foreground/90 whitespace-pre-line mb-8">{thread.body}</p>

        <div className="space-y-3 mb-6">
          {posts.map((p) => (
            <div key={p.id} className="glass-panel border-sovereign p-3">
              <p className="text-sm text-foreground/90 whitespace-pre-line">{p.body}</p>
              <div className="text-[9px] tabular-data text-muted-foreground mt-1">{new Date(p.created_at).toLocaleString("es-MX")}</div>
            </div>
          ))}
        </div>

        {user ? (
          <div className="glass-panel-strong border-sovereign p-4">
            <Textarea placeholder="Escribe tu respuesta..." rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="flex justify-end mt-2"><Button size="sm" onClick={reply}>Responder</Button></div>
          </div>
        ) : (
          <Button onClick={() => navigate("/auth")} className="w-full">Inicia sesión para responder</Button>
        )}
      </div>
    </div>
  );
};

export default ForumThreadPage;
