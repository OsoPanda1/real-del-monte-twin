import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ForumSection = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const load = async () => {
    const { data } = await supabase.from("forum_threads").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false }).limit(20);
    setThreads(data || []);
  };
  useEffect(() => { load(); }, []);

  const createThread = async () => {
    if (!user) { toast.error("Inicia sesión para participar"); return; }
    if (!title.trim()) return;
    const { error } = await supabase.from("forum_threads").insert({ user_id: user.id, title, body, category: "general" });
    if (error) toast.error(error.message);
    else { toast.success("Hilo creado"); setTitle(""); setBody(""); setCreating(false); load(); }
  };

  return (
    <section className="py-16 px-6 bg-card/20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="tabular-data text-[10px] text-primary mb-2">VOZ DEL PUEBLO</p>
            <h2 className="heritage-text text-3xl">
              <span className="text-foreground">Foros </span>
              <span className="text-gradient-gold">Soberanos</span>
            </h2>
          </div>
          <Button size="sm" onClick={() => setCreating(!creating)}>
            <Plus className="w-3 h-3 mr-1" /> Nuevo hilo
          </Button>
        </div>

        {creating && (
          <div className="glass-panel-strong border-sovereign p-4 mb-6 space-y-3">
            <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Cuéntanos..." value={body} onChange={(e) => setBody(e.target.value)} />
            <Button onClick={createThread} className="w-full">Publicar</Button>
          </div>
        )}

        <div className="space-y-2">
          {threads.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">Sé el primero en abrir un hilo.</p>}
          {threads.map((t) => (
            <div key={t.id} className="glass-panel border-sovereign p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {t.pinned && <span className="text-[9px] tabular-data text-rdm-gold">📌 FIJADO</span>}
                    <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
                  </div>
                  {t.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.body}</p>}
                  <div className="text-[9px] tabular-data text-muted-foreground mt-2">
                    {t.category} · {new Date(t.updated_at).toLocaleDateString("es-MX")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForumSection;
