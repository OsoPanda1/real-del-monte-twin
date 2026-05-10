import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Service = {
  id: string;
  name: string;
  description: string;
  status: "ready" | "missing" | "manual";
  docs: string;
  scope: string;
};

const SERVICES: Service[] = [
  { id: "zenodo", name: "Zenodo", description: "Repositorio europeo de datos científicos (CERN). Token configurado.", status: "ready", docs: "https://zenodo.org/account/settings/applications/", scope: "Lectura de records públicos y por ORCID" },
  { id: "figshare", name: "Figshare", description: "Plataforma global de publicaciones de investigación. Token configurado.", status: "ready", docs: "https://figshare.com/account/applications", scope: "Búsqueda de artículos por consulta y autor" },
  { id: "openaire", name: "OpenAIRE", description: "Federación europea de repositorios. Requiere Client ID + Secret OAuth.", status: "missing", docs: "https://develop.openaire.eu/api.html", scope: "OAuth2 — datos de financiación e impacto" },
  { id: "orcid", name: "ORCID", description: "ID único para investigadores. Requiere Client ID + Secret + ORCID iD personal.", status: "missing", docs: "https://orcid.org/developer-tools", scope: "OAuth por usuario — perfil académico" },
  { id: "frontiers", name: "Frontiers", description: "Editorial open-access. API restringida a editores autorizados.", status: "manual", docs: "https://www.frontiersin.org/", scope: "Acceso bajo invitación" },
  { id: "loops", name: "Loops", description: "Email marketing. Requiere cuenta de pago + API key.", status: "missing", docs: "https://loops.so/docs/api", scope: "Envío de campañas" },
  { id: "isni", name: "ISNI", description: "Identificador internacional de nombre. Acceso bibliográfico institucional.", status: "manual", docs: "https://isni.org/", scope: "Resolución de identidades" },
  { id: "linkedin", name: "LinkedIn", description: "OAuth2 por usuario. Requiere registrar app en LinkedIn Developers.", status: "missing", docs: "https://www.linkedin.com/developers/", scope: "Sign-in / share" },
];

const StatusPill = ({ status }: { status: Service["status"] }) => {
  if (status === "ready") return <span className="tabular-data text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> CONECTADO</span>;
  if (status === "missing") return <span className="tabular-data text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> CREDENCIAL FALTANTE</span>;
  return <span className="tabular-data text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">SOLICITUD MANUAL</span>;
};

const IntegrationsPage = () => {
  const navigate = useNavigate();
  const [orcid, setOrcid] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-sync${orcid ? `?orcid=${encodeURIComponent(orcid)}` : "?q=Real+del+Monte"}`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } });
      const j = await r.json();
      setResults(j);
    } catch (e: any) {
      setResults({ ok: false, error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>

        <div className="mb-8">
          <p className="tabular-data text-[10px] text-primary mb-2">RED TAMV</p>
          <h1 className="heritage-text text-4xl mb-2">
            <span className="text-foreground">Integraciones </span>
            <span className="text-gradient-gold">Federadas</span>
          </h1>
          <p className="text-sm text-muted-foreground">Estado en vivo de las credenciales de cada servicio externo de la red TAMV.</p>
        </div>

        <div className="glass-panel-strong border-sovereign p-5 mb-6">
          <div className="heritage-text text-base mb-3">Sincronizar publicaciones (Zenodo + Figshare)</div>
          <div className="flex gap-2 mb-3">
            <Input placeholder="ORCID iD opcional (ej. 0000-0001-2345-6789)" value={orcid} onChange={(e) => setOrcid(e.target.value)} />
            <Button onClick={sync} disabled={loading}>
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sincronizar"}
            </Button>
          </div>
          {results && (
            <div className="space-y-3 mt-4">
              {(results.sources || []).map((s: any) => (
                <div key={s.source} className="border-l-2 border-primary/40 pl-3">
                  <div className="text-xs font-semibold text-primary uppercase">{s.source} · {s.ok ? `${s.items.length} resultados` : `Error: ${s.error}`}</div>
                  <div className="space-y-1 mt-2">
                    {(s.items || []).slice(0, 5).map((it: any) => (
                      <a key={it.id} href={it.url} target="_blank" rel="noopener" className="block text-[11px] text-muted-foreground hover:text-foreground">
                        · {it.title} {it.date && <span className="opacity-60">({it.date})</span>}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {SERVICES.map((s) => (
            <div key={s.id} className="glass-panel-strong border-sovereign p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="heritage-text text-lg">{s.name}</h3>
                <StatusPill status={s.status} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">{s.description}</p>
              <p className="text-[10px] tabular-data text-muted-foreground/70 mb-3">{s.scope}</p>
              <a href={s.docs} target="_blank" rel="noopener" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                Documentación oficial <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground mt-8 text-center">
          Para activar OAuth de OpenAIRE, ORCID o LinkedIn registra una app en cada plataforma y comparte las credenciales para añadirlas como secrets.
        </p>
      </div>
    </div>
  );
};

export default IntegrationsPage;
