import { supabaseAdmin } from "@/lib/supabaseServer";
import { getBaseUrl } from "@/lib/baseUrl";
import NewCampaign from "./NewCampaign";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const BASE = getBaseUrl();
  const { data: campaigns } = await supabaseAdmin
    .from("campaigns")
    .select("id, slug, name, filter_bots, facebook_pixel_id, active, created_at, links(count)")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1>Campanhas</h1>
      <p className="muted">
        Cada campanha gera um link curto. Cole ele no anúncio do Facebook — os
        cliques humanos são distribuídos igualmente entre as páginas.
      </p>

      <NewCampaign />

      <h2>Suas campanhas</h2>
      {(!campaigns || campaigns.length === 0) && (
        <p className="muted">Nenhuma campanha ainda. Crie a primeira acima.</p>
      )}
      {campaigns?.map((c: any) => {
        const n = c.links?.[0]?.count ?? 0;
        const share = n > 0 ? Math.round(100 / n) : 0;
        return (
          <div className="card" key={c.id}>
            <div className="row between">
              <div>
                <strong>{c.name}</strong>{" "}
                {!c.active && <span className="pill">pausada</span>}
                <div className="muted">
                  {n} páginas · {share}% cada · filtro de bots{" "}
                  {c.filter_bots ? "ligado" : "desligado"}
                  {c.facebook_pixel_id ? " · pixel ✓" : ""}
                </div>
              </div>
              <a href={`/dashboard/${c.id}`}>
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
