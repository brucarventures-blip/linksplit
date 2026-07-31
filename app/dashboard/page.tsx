import { supabaseAdmin } from "@/lib/supabaseServer";
import { getBaseUrl } from "@/lib/baseUrl";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewCampaign from "./NewCampaign";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login");

  const BASE = getBaseUrl();
  let query = supabaseAdmin
    .from("campaigns")
    .select("id, slug, name, filter_bots, facebook_pixel_id, active, created_at, project_id, links(count)")
    .order("created_at", { ascending: false });

  // Operador só vê campanhas dos projetos liberados pra ele.
  if (!auth.isAdmin) {
    if (auth.allowedProjectIds.length === 0) query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    else query = query.in("project_id", auth.allowedProjectIds);
  }

  const { data: campaigns } = await query;

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">ROTEAMENTO</span>
        <h1>Campanhas</h1>
        <p className="muted">
          Crie um link curto por campanha e distribua os cliques humanos entre
          as páginas de destino.
        </p>
      </section>

      <NewCampaign />

      <div className="section-heading">
        <div>
          <span className="eyebrow">ACOMPANHAMENTO</span>
          <h2>Suas campanhas</h2>
        </div>
        {campaigns && campaigns.length > 0 && <span className="pill">{campaigns.length} ativas no histórico</span>}
      </div>
      {(!campaigns || campaigns.length === 0) && (
        <p className="muted">Nenhuma campanha ainda. Crie a primeira acima.</p>
      )}
      {campaigns?.map((c: any) => {
        const n = c.links?.[0]?.count ?? 0;
        const share = n > 0 ? Math.round(100 / n) : 0;
        return (
          <div className="card campaign-card" key={c.id}>
            <div className="row between">
              <div className="campaign-summary">
                <strong className="campaign-name">{c.name}</strong>{" "}
                {!c.active && <span className="pill">pausada</span>}
                <div className="muted">
                  {n} páginas · {share}% cada · filtro de bots{" "}
                  {c.filter_bots ? "ligado" : "desligado"}
                  {c.facebook_pixel_id ? " · pixel ✓" : ""}
                </div>
              </div>
              <a className="stats-link" href={`/dashboard/${c.id}`}>
                <button className="secondary">Ver stats</button>
              </a>
            </div>
            <div style={{ marginTop: 10 }} className="short">
              {BASE}/{c.slug}
            </div>
          </div>
        );
      })}
    </>
  );
}
