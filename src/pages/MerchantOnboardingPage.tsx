import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle, CreditCard, Store, Newspaper, Tag, Plus, Trash2, Power, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const MerchantOnboardingPage = () => {
  const navigate = useNavigate();
  const { user, isComerciante, isAdmin } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [biz, setBiz] = useState<any>(null);
  const [bizForm, setBizForm] = useState<any>({ name: "", category: "commerce", description: "", phone: "", hours: "", lat: "", lng: "" });
  const [saving, setSaving] = useState(false);

  const [news, setNews] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [newsForm, setNewsForm] = useState<any>({ title: "", excerpt: "", body: "", category: "novedad", published: true });
  const [offerForm, setOfferForm] = useState<any>({ title: "", description: "", discount_percent: 10, ends_at: "", active: true });
  const [editingNews, setEditingNews] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [s, b, n, o] = await Promise.all([
      supabase.from("merchant_subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle(),
      supabase.from("news").select("*").eq("author_id", user.id).order("created_at", { ascending: false }),
      supabase.from("offers").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]);
    setSub(s.data); setBiz(b.data);
    setNews(n.data || []); setOffers(o.data || []);
    if (b.data) setBizForm({
      name: b.data.name || "", category: b.data.category || "commerce", description: b.data.description || "",
      phone: b.data.phone || "", hours: b.data.hours || "",
      lat: String(b.data.lat ?? ""), lng: String(b.data.lng ?? "")
    });
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

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
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "comerciante" as any });
    if (error && !error.message.includes("duplicate")) { toast.error(error.message); return; }
    toast.success("Rol comerciante activado. Recargando...");
    setTimeout(() => window.location.reload(), 800);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocalización no disponible"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setBizForm((f: any) => ({ ...f, lat: String(p.coords.latitude), lng: String(p.coords.longitude) })); toast.success("Ubicación capturada"); },
      () => toast.error("No se pudo obtener tu ubicación")
    );
  };

  const saveBusiness = async () => {
    if (!bizForm.lat || !bizForm.lng) { toast.error("Necesitas geolocalización"); return; }
    setSaving(true);
    const payload = {
      owner_id: user.id, name: bizForm.name, category: bizForm.category,
      description: bizForm.description, phone: bizForm.phone, hours: bizForm.hours,
      lat: Number(bizForm.lat), lng: Number(bizForm.lng), status: "public"
    };
    const { error } = biz
      ? await supabase.from("businesses").update(payload).eq("id", biz.id)
      : await supabase.from("businesses").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Negocio guardado"); refresh(); }
  };

  const activateSubscription = async () => {
    if (!biz) { toast.error("Crea primero tu negocio"); return; }
    const periodEnd = new Date(); periodEnd.setMonth(periodEnd.getMonth() + 1);
    const payload = {
      user_id: user.id, business_id: biz.id, plan: "monthly",
      status: "active", amount_cents: 29900, currency: "MXN",
      current_period_end: periodEnd.toISOString(),
    };
    const { error } = sub
      ? await supabase.from("merchant_subscriptions").update(payload).eq("user_id", user.id)
      : await supabase.from("merchant_subscriptions").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Suscripción activada (modo demo). Tu negocio ya es visible."); refresh(); }
  };

  // ============ NEWS CRUD ============
  const saveNews = async () => {
    if (!newsForm.title) { toast.error("Falta título"); return; }
    const payload = { ...newsForm, author_id: user.id };
    const { error } = editingNews
      ? await supabase.from("news").update(payload).eq("id", editingNews)
      : await supabase.from("news").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(editingNews ? "Noticia actualizada" : "Noticia publicada");
      setNewsForm({ title: "", excerpt: "", body: "", category: "novedad", published: true });
      setEditingNews(null); refresh();
    }
  };
  const editNews = (n: any) => { setNewsForm(n); setEditingNews(n.id); };
  const deleteNews = async (id: string) => {
    if (!confirm("¿Eliminar noticia?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminada"); refresh(); }
  };
  const togglePublishNews = async (n: any) => {
    await supabase.from("news").update({ published: !n.published }).eq("id", n.id);
    refresh();
  };

  // ============ OFFERS CRUD ============
  const saveOffer = async () => {
    if (!offerForm.title) { toast.error("Falta título"); return; }
    if (!biz) { toast.error("Necesitas un negocio creado"); return; }
    const payload = {
      ...offerForm, owner_id: user.id, business_id: biz.id,
      discount_percent: Number(offerForm.discount_percent) || null,
      ends_at: offerForm.ends_at ? new Date(offerForm.ends_at).toISOString() : null,
    };
    const { error } = editingOffer
      ? await supabase.from("offers").update(payload).eq("id", editingOffer)
      : await supabase.from("offers").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(editingOffer ? "Oferta actualizada" : "Oferta publicada");
      setOfferForm({ title: "", description: "", discount_percent: 10, ends_at: "", active: true });
      setEditingOffer(null); refresh();
    }
  };
  const editOffer = (o: any) => {
    setOfferForm({ ...o, ends_at: o.ends_at ? o.ends_at.slice(0, 16) : "" });
    setEditingOffer(o.id);
  };
  const deleteOffer = async (id: string) => {
    if (!confirm("¿Eliminar oferta?")) return;
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminada"); refresh(); }
  };
  const toggleActiveOffer = async (o: any) => {
    await supabase.from("offers").update({ active: !o.active }).eq("id", o.id);
    refresh();
  };

  const isActive = sub?.status === "active" && (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>

        <h1 className="heritage-text text-4xl mb-2">
          <span className="text-foreground">Panel </span><span className="text-gradient-gold">Comerciante</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Gestiona tu negocio, noticias y promociones. Solo comercios con suscripción activa son visibles a turistas.
        </p>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="setup">Negocio</TabsTrigger>
            <TabsTrigger value="news" disabled={!isComerciante && !isAdmin}><Newspaper className="w-3 h-3 mr-1" />Noticias</TabsTrigger>
            <TabsTrigger value="offers" disabled={!isComerciante && !isAdmin}><Tag className="w-3 h-3 mr-1" />Ofertas</TabsTrigger>
          </TabsList>

          {/* ===== Setup ===== */}
          <TabsContent value="setup" className="space-y-4">
            <div className="glass-panel-strong border-sovereign p-5">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="heritage-text text-base">1. Activa tu rol de comerciante</span>
                {isComerciante && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
              </div>
              {!isComerciante && <Button size="sm" onClick={becomeComerciante}>Soy comerciante</Button>}
            </div>

            <div className="glass-panel-strong border-sovereign p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="heritage-text text-base">2. Datos del negocio</span>
                {biz && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="Nombre" value={bizForm.name} onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })} />
                <select value={bizForm.category} onChange={(e) => setBizForm({ ...bizForm, category: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="commerce">Comercio</option><option value="restaurant">Restaurante</option>
                  <option value="hotel">Hotel</option><option value="paste">Pastería</option>
                  <option value="craft">Artesanía</option><option value="tour">Tour/Guía</option>
                </select>
                <Input placeholder="Descripción" value={bizForm.description} onChange={(e) => setBizForm({ ...bizForm, description: e.target.value })} className="sm:col-span-2" />
                <Input placeholder="Teléfono" value={bizForm.phone} onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })} />
                <Input placeholder="Horario" value={bizForm.hours} onChange={(e) => setBizForm({ ...bizForm, hours: e.target.value })} />
                <Input placeholder="Latitud" value={bizForm.lat} onChange={(e) => setBizForm({ ...bizForm, lat: e.target.value })} />
                <Input placeholder="Longitud" value={bizForm.lng} onChange={(e) => setBizForm({ ...bizForm, lng: e.target.value })} />
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={useCurrentLocation}>📍 Usar mi ubicación</Button>
                <Button size="sm" onClick={saveBusiness} disabled={!isComerciante || saving}>
                  {saving ? "Guardando..." : biz ? "Actualizar" : "Crear negocio"}
                </Button>
              </div>
            </div>

            <div className="glass-panel-strong border-sovereign p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="heritage-text text-base">3. Suscripción mensual · $299 MXN</span>
                {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
              </div>
              {!isActive ? (
                <>
                  <div className="flex items-start gap-2 text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded mb-3">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>Modo demo: Stripe no conectado. Botón abajo activa tu suscripción manualmente para pruebas.</span>
                  </div>
                  <Button onClick={activateSubscription} disabled={!biz} className="w-full">
                    {biz ? "Activar suscripción (demo)" : "Crea primero tu negocio"}
                  </Button>
                </>
              ) : (
                <p className="text-xs text-emerald-400">Activo hasta {new Date(sub.current_period_end).toLocaleDateString("es-MX")}.</p>
              )}
            </div>
          </TabsContent>

          {/* ===== News ===== */}
          <TabsContent value="news" className="space-y-4">
            <div className="glass-panel-strong border-sovereign p-5">
              <h3 className="heritage-text text-base mb-3">{editingNews ? "Editar noticia" : "Nueva noticia"}</h3>
              <div className="space-y-2">
                <Input placeholder="Título" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
                <Input placeholder="Resumen" value={newsForm.excerpt} onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })} />
                <Textarea placeholder="Cuerpo de la noticia" rows={4} value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} />
                <div className="flex gap-2">
                  <select value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm flex-1">
                    <option value="novedad">Novedad</option><option value="evento">Evento</option>
                    <option value="cultura">Cultura</option><option value="oferta">Oferta</option>
                  </select>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={newsForm.published} onChange={(e) => setNewsForm({ ...newsForm, published: e.target.checked })} />
                    Publicar
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveNews}>{editingNews ? "Actualizar" : "Publicar"}</Button>
                  {editingNews && <Button variant="outline" onClick={() => { setEditingNews(null); setNewsForm({ title: "", excerpt: "", body: "", category: "novedad", published: true }); }}>Cancelar</Button>}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {news.length === 0 ? <p className="text-xs text-muted-foreground italic">Aún no has publicado noticias.</p> : news.map((n) => (
                <div key={n.id} className="glass-panel border-sovereign p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs">{n.title}</span>
                      <span className="text-[9px] tabular-data text-muted-foreground uppercase">{n.category}</span>
                      {!n.published && <span className="text-[9px] text-amber-400">borrador</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{n.excerpt}</p>
                  </div>
                  <button onClick={() => togglePublishNews(n)} className="p-1.5 text-muted-foreground hover:text-primary"><Power className="w-3 h-3" /></button>
                  <button onClick={() => editNews(n)} className="p-1.5 text-primary"><Edit3 className="w-3 h-3" /></button>
                  <button onClick={() => deleteNews(n.id)} className="p-1.5 text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ===== Offers ===== */}
          <TabsContent value="offers" className="space-y-4">
            {!isActive && <div className="text-[11px] bg-amber-500/10 text-amber-400 p-2 rounded">Las ofertas solo son visibles públicamente si tu suscripción está activa.</div>}
            <div className="glass-panel-strong border-sovereign p-5">
              <h3 className="heritage-text text-base mb-3">{editingOffer ? "Editar oferta" : "Nueva oferta"}</h3>
              <div className="space-y-2">
                <Input placeholder="Título" value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })} />
                <Textarea placeholder="Descripción" rows={3} value={offerForm.description} onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="% descuento" value={offerForm.discount_percent} onChange={(e) => setOfferForm({ ...offerForm, discount_percent: e.target.value })} />
                  <Input type="datetime-local" value={offerForm.ends_at} onChange={(e) => setOfferForm({ ...offerForm, ends_at: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={offerForm.active} onChange={(e) => setOfferForm({ ...offerForm, active: e.target.checked })} /> Activa
                </label>
                <div className="flex gap-2">
                  <Button onClick={saveOffer}>{editingOffer ? "Actualizar" : "Publicar"}</Button>
                  {editingOffer && <Button variant="outline" onClick={() => { setEditingOffer(null); setOfferForm({ title: "", description: "", discount_percent: 10, ends_at: "", active: true }); }}>Cancelar</Button>}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {offers.length === 0 ? <p className="text-xs text-muted-foreground italic">Aún no has creado ofertas.</p> : offers.map((o) => (
                <div key={o.id} className="glass-panel border-sovereign p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs">{o.title}</span>
                      {o.discount_percent && <span className="text-[9px] tabular-data text-primary">{o.discount_percent}% OFF</span>}
                      {!o.active && <span className="text-[9px] text-muted-foreground">(inactiva)</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{o.description}</p>
                  </div>
                  <button onClick={() => toggleActiveOffer(o)} className="p-1.5 text-muted-foreground hover:text-primary"><Power className="w-3 h-3" /></button>
                  <button onClick={() => editOffer(o)} className="p-1.5 text-primary"><Edit3 className="w-3 h-3" /></button>
                  <button onClick={() => deleteOffer(o.id)} className="p-1.5 text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MerchantOnboardingPage;
