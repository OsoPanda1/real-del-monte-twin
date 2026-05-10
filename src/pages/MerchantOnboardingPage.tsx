import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle, CreditCard, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MerchantOnboardingPage = () => {
  const navigate = useNavigate();
  const { user, isComerciante } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [biz, setBiz] = useState<any>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("commerce");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: b }] = await Promise.all([
        supabase.from("merchant_subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle(),
      ]);
      setSub(s); setBiz(b);
      if (b) {
        setName(b.name || ""); setCategory(b.category || "commerce");
        setDescription(b.description || ""); setPhone(b.phone || ""); setHours(b.hours || "");
        setLat(String(b.lat ?? "")); setLng(String(b.lng ?? ""));
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Necesitas iniciar sesión.</p>
          <Button onClick={() => navigate("/auth")}>Acceder</Button>
        </div>
      </div>
    );
  }

  const becomeComerciante = async () => {
    await supabase.from("user_roles").insert({ user_id: user.id, role: "comerciante" as any });
    toast.success("Ahora eres comerciante. Recarga para actualizar permisos.");
    setTimeout(() => window.location.reload(), 800);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocalización no disponible"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setLat(String(p.coords.latitude)); setLng(String(p.coords.longitude)); toast.success("Ubicación capturada"); },
      () => toast.error("No se pudo obtener tu ubicación")
    );
  };

  const saveBusiness = async () => {
    if (!lat || !lng) { toast.error("Necesitas geolocalización"); return; }
    setSaving(true);
    const payload = { owner_id: user.id, name, category, description, phone, hours, lat: Number(lat), lng: Number(lng), status: "public" };
    const { data, error } = biz
      ? await supabase.from("businesses").update(payload).eq("id", biz.id).select().single()
      : await supabase.from("businesses").insert(payload).select().single();
    if (error) toast.error(error.message);
    else { setBiz(data); toast.success("Negocio guardado"); }
    setSaving(false);
  };

  const startPayment = async () => {
    // Placeholder: Stripe payments aún no conectado. Crea registro pendiente.
    const { error } = await supabase.from("merchant_subscriptions").upsert({
      user_id: user.id, business_id: biz?.id, plan: "monthly", status: "pending",
      amount_cents: 29900, currency: "MXN",
    }, { onConflict: "user_id" });
    if (error) toast.error(error.message);
    else { toast.info("Suscripción registrada como pendiente. Próximamente conectaremos Stripe."); }
  };

  const isActive = sub?.status === "active" && (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>

        <h1 className="heritage-text text-4xl mb-2">
          <span className="text-foreground">Alta de </span><span className="text-gradient-gold">Comerciante</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Solo los comercios con suscripción activa aparecen en el mapa, listados y promociones públicas.
        </p>

        {/* Step 1: rol */}
        <div className="glass-panel-strong border-sovereign p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-4 h-4 text-primary" />
            <span className="heritage-text text-base">1. Activa tu rol de comerciante</span>
            {isComerciante && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
          </div>
          {!isComerciante && <Button size="sm" onClick={becomeComerciante}>Soy comerciante</Button>}
        </div>

        {/* Step 2: negocio */}
        <div className="glass-panel-strong border-sovereign p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="heritage-text text-base">2. Datos del negocio</span>
            {biz && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Nombre del negocio" value={name} onChange={(e) => setName(e.target.value)} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="commerce">Comercio</option><option value="restaurant">Restaurante</option>
              <option value="hotel">Hotel</option><option value="paste">Pastería</option>
              <option value="craft">Artesanía</option><option value="tour">Tour/Guía</option>
            </select>
            <Input placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} className="sm:col-span-2" />
            <Input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Horario (ej. 9-18 L-D)" value={hours} onChange={(e) => setHours(e.target.value)} />
            <Input placeholder="Latitud" value={lat} onChange={(e) => setLat(e.target.value)} />
            <Input placeholder="Longitud" value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={useCurrentLocation}>📍 Usar mi ubicación actual</Button>
            <Button size="sm" onClick={saveBusiness} disabled={!isComerciante || saving}>
              {saving ? "Guardando..." : biz ? "Actualizar negocio" : "Crear negocio"}
            </Button>
          </div>
        </div>

        {/* Step 3: pago */}
        <div className="glass-panel-strong border-sovereign p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="heritage-text text-base">3. Suscripción mensual</span>
            {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            <strong className="text-foreground">$299 MXN/mes</strong> — visibilidad permanente en mapa, ofertas, eventos y notificaciones a turistas cercanos.
          </p>
          {!isActive ? (
            <>
              <div className="flex items-start gap-2 text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded mb-3">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>Sin suscripción activa, tu negocio NO aparece para turistas. Solo tú y los administradores lo ven.</span>
              </div>
              <Button onClick={startPayment} disabled={!biz} className="w-full">
                {biz ? "Iniciar suscripción" : "Crea primero tu negocio"}
              </Button>
            </>
          ) : (
            <p className="text-xs text-emerald-400">Tu negocio está activo y visible para todos los turistas.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantOnboardingPage;
