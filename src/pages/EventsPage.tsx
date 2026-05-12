import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const EventsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const from = page * PAGE_SIZE;
      const { data, count } = await supabase
        .from("events").select("*", { count: "exact" })
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      setItems(data || []); setTotal(count || 0);
    })();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-6 h-6 text-primary" />
          <h1 className="heritage-text text-4xl"><span className="text-foreground">Próximos </span><span className="text-gradient-gold">Eventos</span></h1>
        </div>
        {items.length === 0 ? <p className="text-sm text-muted-foreground italic">No hay eventos programados.</p> : (
          <div className="space-y-3">
            {items.map((e) => (
              <div key={e.id} className="glass-panel-strong border-sovereign p-5">
                <div className="text-[10px] tabular-data text-primary uppercase mb-1">{e.category}</div>
                <h2 className="font-semibold text-base text-foreground mb-1">{e.title}</h2>
                <p className="text-xs text-muted-foreground mb-2">{e.description}</p>
                <div className="flex flex-wrap gap-3 text-[10px] tabular-data text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(e.event_date).toLocaleString("es-MX")}</span>
                  {e.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>}
                  {e.instructor && <span>Imparte: {e.instructor}</span>}
                  {e.capacity && <span>Cupo: {e.capacity}</span>}
                </div>
              </div>
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

export default EventsPage;
