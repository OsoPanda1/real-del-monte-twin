// Sync público de publicaciones académicas desde Zenodo y Figshare
// Búsqueda por consulta o por ORCID. Sin auth (lectura pública).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "Real del Monte Hidalgo";
    const orcid = url.searchParams.get("orcid") || "";

    const ZENODO_TOKEN = Deno.env.get("ZENODO_TOKEN");
    const FIGSHARE_TOKEN = Deno.env.get("FIGSHARE_TOKEN");

    const tasks: Promise<any>[] = [];

    // Zenodo
    if (ZENODO_TOKEN) {
      const zUrl = new URL("https://zenodo.org/api/records");
      zUrl.searchParams.set("q", orcid ? `creators.orcid:${orcid}` : q);
      zUrl.searchParams.set("size", "10");
      zUrl.searchParams.set("sort", "mostrecent");
      tasks.push(
        fetch(zUrl, { headers: { Authorization: `Bearer ${ZENODO_TOKEN}` } })
          .then((r) => r.ok ? r.json() : { hits: { hits: [] } })
          .then((j) => ({
            source: "zenodo",
            ok: true,
            items: (j.hits?.hits || []).map((h: any) => ({
              id: h.id,
              title: h.metadata?.title,
              authors: (h.metadata?.creators || []).map((c: any) => c.name).join(", "),
              date: h.metadata?.publication_date,
              url: h.links?.html,
              type: h.metadata?.resource_type?.title,
            })),
          }))
          .catch((e) => ({ source: "zenodo", ok: false, error: String(e), items: [] })),
      );
    } else {
      tasks.push(Promise.resolve({ source: "zenodo", ok: false, error: "missing_token", items: [] }));
    }

    // Figshare
    if (FIGSHARE_TOKEN) {
      tasks.push(
        fetch("https://api.figshare.com/v2/articles/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${FIGSHARE_TOKEN}`,
          },
          body: JSON.stringify({ search_for: orcid || q, page_size: 10, order: "published_date", order_direction: "desc" }),
        })
          .then((r) => r.ok ? r.json() : [])
          .then((arr: any[]) => ({
            source: "figshare",
            ok: true,
            items: (arr || []).map((a) => ({
              id: a.id,
              title: a.title,
              authors: (a.authors || []).map((au: any) => au.full_name).join(", "),
              date: a.published_date,
              url: a.url_public_html || a.url,
              type: a.defined_type_name,
            })),
          }))
          .catch((e) => ({ source: "figshare", ok: false, error: String(e), items: [] })),
      );
    } else {
      tasks.push(Promise.resolve({ source: "figshare", ok: false, error: "missing_token", items: [] }));
    }

    const results = await Promise.all(tasks);

    return new Response(
      JSON.stringify({ ok: true, query: orcid ? `orcid:${orcid}` : q, sources: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
