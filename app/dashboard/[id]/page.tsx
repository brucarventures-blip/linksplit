import { supabaseAdmin } from "@/lib/supabaseServer";
import { getBaseUrl } from "@/lib/baseUrl";
import { getCurrentUser } from "@/lib/auth";
import CampaignActions from "./CampaignActions";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function countClicks(campaignId: string, opts: { linkId?: string; bot?: boolean }) {
  let q = supabaseAdmin.from("clicks").select("id").eq("campaign_id", campaignId);
  if (opts.linkId) q = q.eq("link_id", opts.linkId);
  if (typeof opts.bot === "boolean") q = q.eq("is_bot", opts.bot);
  const { data } = await q;
  return data?.length ?? 0;
}

export default async function CampaignStats({ params }: { params: { id: string } }) {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login");

  const { data: campaign } = await supabaseAdmin
    .from("campaigns")
    .select("id, slug, name, filter_bots, facebook_pixel_id, active, project_id")
    .eq("id", params.id)
    .single();

  if (!campaign) return notFound();

  // Operador só abre campanhas dos projetos liberados pra ele.
  if (!auth.isAdmin && !(campaign.project_id && auth.allowedProjectIds.includes(campaign.project_id))) {
    redirect("/dashboard");
  }

  const { data: links } = await supabaseAdmin
    .from("links")
    .select("id, url, position, weight")
    .eq("campaign_id", campaign.id)
    .order("position", { ascending: true });

  const totalWeight = (links ?? []).reduce(
    (s, l: any) => s + Math.max(1, l.weight ?? 1),
    0
  );

  const [totalHuman, totalBot] = await Promise.all([
    countClicks(campaign.id, { bot: false }),
    countClicks(campaign.id, { bot: true }),
  ]);

  const perLink = await Promise.all(
    (links ?? []).map(async (l) => ({
      ...l,
      human: await countClicks(campaign.id, { linkId: l.id, bot: false }),
    }))
  );

  const shortUrl = `${getBaseUrl()}/${campaign.slug}`;

  return (
    <>
      <a href="/dashboard" className="muted">← voltar</a>
      <div className="row between" style={{ marginTop: 8 }}>
        <h1 style={{ marginBottom: 0 }}>{campaign.name}</h1>
        <CampaignActions
          id={campaign.id}
          active={campaign.active}
          shortUrl={shortUrl}
        />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <label>Link para colar no anúncio</label>
        <div className="short">{shortUrl}</div>
        <div className="muted" style={{ marginTop: 8 }}>
          {campaign.facebook_pixel_id
            ? `Pixel do Facebook: ${campaign.facebook_pixel_id} (dispara no clique)`
            : "Sem pixel — redirecionamento instantâneo."}
        </div>
      </div>

      <div className="grid3">
        <div className="card">
          <div className="muted">Cliques humanos</div>
          <div className="stat">{totalHuman}</div>
        </div>
        <div className="card">
          <div className="muted">Bots filtrados</div>
          <div className="stat">{totalBot}</div>
        </div>
        <div className="card">
          <div className="muted">Páginas</div>
          <div className="stat">{perLink.length}</div>
        </div>
      </div>

      <h2>Distribuição (humanos)</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Página</th>
              <th>Alvo</th>
              <th>Cliques</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {perLink.map((l, i) => {
              const pct = totalHuman > 0 ? (l.human / totalHuman) * 100 : 0;
              return (
                <tr key={l.id}>
                  <td>{i + 1}</td>
                  <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.url}
                  </td>
                  <td className="muted">
                    {totalWeight > 0
                      ? ((Math.max(1, (l as any).weight ?? 1) / totalWeight) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                  <td>{l.human}</td>
                  <td style={{ minWidth: 160 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <div className="bar" style={{ flex: 1 }}>
                        <span style={{ width: `${pct}%` }} />
                      </div>
                      <span className="muted">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted">
        A coluna "Alvo" é a meta de cada página (pelos pesos). A rotação é
        round-robin ponderada e exata; pequenas diferenças aparecem só enquanto o
        total de cliques é baixo.
      </p>
    </>
  );
}
