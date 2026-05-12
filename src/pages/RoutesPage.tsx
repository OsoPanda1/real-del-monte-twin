import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Route as RouteIcon, Clock, Mountain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const RoutesPage = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("routes").select("*").order("created_at", { ascending: false });
      setRoutes(data || []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>
        <div className="flex items-center gap-3 mb-8">
          <RouteIcon className="w-6 h-6 text-primary" />
          <h1 className="heritage-text text-4xl"><span className="text-foreground">Rutas </span><span className="text-gradient-gold">Curadas</span></h1>
        </div>
        {routes.length === 0 ? <p className="text-sm text-muted-foreground italic">Aún no hay rutas publicadas.</p> : (
          <div className="grid md:grid-cols-2 gap-4">
            {routes.map((r) => (
              <div key={r.id} className="glass-panel-strong border-sovereign p-5">
                <h2 className="font-semibold text-base text-foreground mb-2">{r.name}</h2>
                <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
                <div className="flex gap-4 text-[10px] tabular-data text-muted-foreground">
                  {r.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.duration_minutes} min</span>}
                  {r.difficulty && <span className="flex items-center gap-1"><Mountain className="w-3 h-3" />{r.difficulty}</span>}
                  {Array.isArray(r.waypoints) && <span>{r.waypoints.length} paradas</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutesPage;
