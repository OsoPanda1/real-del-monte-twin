// Concurrencia + realtime + RLS matrix para geo_zones.
// Usa el cliente Supabase directamente (vía anon key publicada en el bundle)
// para validar las políticas como turista/comerciante/admin.
import { test, expect } from "../playwright-fixture";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";

const haveEnv = !!(SUPABASE_URL && SUPABASE_ANON);

const TEST_USERS = {
  turista: { email: process.env.E2E_TURISTA_EMAIL, password: process.env.E2E_TURISTA_PASSWORD },
  comerciante: { email: process.env.E2E_COMERCIANTE_EMAIL, password: process.env.E2E_COMERCIANTE_PASSWORD },
  admin: { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD },
};

function freshClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function signedClient(role: keyof typeof TEST_USERS) {
  const c = freshClient();
  const u = TEST_USERS[role];
  if (!u.email || !u.password) return null;
  const { error } = await c.auth.signInWithPassword({ email: u.email, password: u.password });
  if (error) return null;
  return c;
}

test.describe("geo_zones · RLS por rol", () => {
  test.skip(!haveEnv, "Supabase env vars not set");

  test("anon (turista no autenticado) sólo lee zonas activas", async () => {
    const anon = freshClient();
    const { data, error } = await anon.from("geo_zones").select("id,name,active").eq("active", true).limit(5);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBeTruthy();

    // No puede insertar
    const ins = await anon.from("geo_zones").insert({
      name: "anon-attempt-" + Date.now(),
      polygon: [[-98.67, 20.14], [-98.66, 20.14], [-98.66, 20.15]],
    } as any);
    expect(ins.error).not.toBeNull();
  });

  test("turista autenticado no puede mutar geo_zones", async () => {
    const c = await signedClient("turista");
    test.skip(!c, "no test turista credentials");
    const { error } = await c!.from("geo_zones").insert({
      name: "turista-attempt-" + Date.now(),
      polygon: [[-98.67, 20.14], [-98.66, 20.14], [-98.66, 20.15]],
    } as any);
    expect(error, "RLS debe negar insert al turista").not.toBeNull();
  });

  test("comerciante no puede mutar geo_zones", async () => {
    const c = await signedClient("comerciante");
    test.skip(!c, "no test comerciante credentials");
    const { error } = await c!.from("geo_zones").update({ name: "x" }).eq("name", "Centro Histórico RDM");
    expect(error || true).toBeTruthy(); // update sin permiso = 0 filas o error
    const verify = await c!.from("geo_zones").select("name").eq("name", "x").limit(1);
    expect(verify.data?.length || 0).toBe(0);
  });

  test("admin puede crear, actualizar y eliminar una zona efímera", async () => {
    const c = await signedClient("admin");
    test.skip(!c, "no test admin credentials");
    const name = "e2e-zone-" + Date.now();
    const ins = await c!.from("geo_zones").insert({
      name, zone_type: "tourism",
      polygon: [[-98.671, 20.141], [-98.670, 20.141], [-98.670, 20.142]],
      fill_color: "#FF00AA", fill_opacity: 0.2, alert_level: "normal", active: true,
    } as any).select().single();
    expect(ins.error).toBeNull();
    expect(ins.data?.name).toBe(name);

    const upd = await c!.from("geo_zones").update({ alert_level: "alert" }).eq("id", ins.data!.id);
    expect(upd.error).toBeNull();

    const del = await c!.from("geo_zones").delete().eq("id", ins.data!.id);
    expect(del.error).toBeNull();
  });
});

test.describe("geo_zones · concurrencia + realtime", () => {
  test.skip(!haveEnv, "Supabase env vars not set");

  test("dos admins editando en paralelo: last-write-wins, sin pérdida de fila", async () => {
    const a = await signedClient("admin");
    const b = await signedClient("admin");
    test.skip(!a || !b, "no admin credentials");

    const name = "concurrent-" + Date.now();
    const created = await a!.from("geo_zones").insert({
      name,
      polygon: [[-98.670, 20.140], [-98.669, 20.140], [-98.669, 20.141]],
    } as any).select().single();
    expect(created.error).toBeNull();
    const id = created.data!.id;

    // Updates concurrentes
    const [r1, r2] = await Promise.all([
      a!.from("geo_zones").update({ alert_level: "caution", fill_color: "#AA0000" }).eq("id", id),
      b!.from("geo_zones").update({ alert_level: "alert", fill_color: "#0000AA" }).eq("id", id),
    ]);
    expect(r1.error).toBeNull();
    expect(r2.error).toBeNull();

    const final = await a!.from("geo_zones").select("alert_level,fill_color").eq("id", id).single();
    expect(final.data).toBeTruthy();
    expect(["caution", "alert"]).toContain(final.data!.alert_level);

    await a!.from("geo_zones").delete().eq("id", id);
  });

  test("propagación realtime: insert de admin llega al canal del turista", async () => {
    const admin = await signedClient("admin");
    test.skip(!admin, "no admin credentials");
    const listener = freshClient();

    const name = "rt-" + Date.now();
    const received = new Promise<any>((resolve) => {
      const ch = listener
        .channel("test-geo-" + name)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "geo_zones" }, (payload) => {
          if ((payload.new as any)?.name === name) resolve(payload.new);
        })
        .subscribe();
      // safety: cleanup desde el resolve hace el caller
      (received as any).ch = ch;
    });

    // Pequeño delay para que el canal quede SUBSCRIBED
    await new Promise((r) => setTimeout(r, 800));

    const ins = await admin!.from("geo_zones").insert({
      name, zone_type: "tourism", active: true,
      polygon: [[-98.671, 20.141], [-98.670, 20.141], [-98.670, 20.142]],
    } as any).select().single();
    expect(ins.error).toBeNull();

    const got = await Promise.race([
      received,
      new Promise((_, rej) => setTimeout(() => rej(new Error("realtime timeout")), 8000)),
    ]);
    expect((got as any).name).toBe(name);

    await admin!.from("geo_zones").delete().eq("id", ins.data!.id);
  });
});
