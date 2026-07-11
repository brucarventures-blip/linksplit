import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { isBot } from "@/lib/bots";
import { hashIp } from "@/lib/hash";

function pixelInterstitial(pixelId: string, dest: string): string {
  const safeDest = dest.replace(/"/g, "&quot;");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="refresh" content="2;url=${safeDest}">
<title>Redirecionando...</title>
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
setTimeout(function(){ window.location.replace("${safeDest}"); }, 350);
</script></head>
<body style="background:#0b0f17;color:#8ea0b6;font-family:sans-serif;text-align:center;padding-top:20vh">
Redirecionando...
<noscript><meta http-equiv="refresh" content="0;url=${safeDest}"></noscript>
</body></html>`;
}

type Link = { id: string; url: string; position: number; weight: number };

// Round-robin ponderado baseado na CONTAGEM de cliques humanos.
// O N-esimo humano (0-based) vai para schedule[N % schedule.length].
// schedule = posicoes repetidas pelo peso (peso 2/1/1 => [0,0,1,2]).
// Nao usa RPC: apenas count + insert (que funcionam com a chave anon).
function pickIndex(links: Link[], humanCount: number): number {
  const schedule: number[] = [];
  links.forEach((l, idx) => {
    const w = Math.max(1, l.weight ?? 1);
    for (let k = 0; k < w; k++) schedule.push(idx);
  });
  if (schedule.length === 0) return 0;
  return schedule[humanCount % schedule.length];
}

export async function handleRedirect(req: NextRequest, slug: string) {
  const { data: campaign, error } = await supabaseAdmin
    .from("campaigns")
    .select("id, filter_bots, bot_fallback_url, facebook_pixel_id, active")
    .eq("slug", slug)
    .single();

  if (error || !campaign || !campaign.active) {
    return new NextResponse("Campanha nao encontrada", { status: 404 });
  }

  const ua = req.headers.get("user-agent");
  const referrer = req.headers.get("referer");
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip");
  const country = req.headers.get("x-vercel-ip-country");
  const bot = isBot(ua);

  const { data: links } = await supabaseAdmin
    .from("links")
    .select("id, url, position, weight")
    .eq("campaign_id", campaign.id)
    .order("position", { ascending: true });

  if (!links || links.length === 0) {
    return new NextResponse("Campanha sem paginas de destino", { status: 404 });
  }

  // ---- BOT: nao entra na rotacao, nao dispara pixel ----
  if (bot && campaign.filter_bots) {
    await supabaseAdmin.from("clicks").insert({
      campaign_id: campaign.id,
      link_id: null,
      is_bot: true,
      user_agent: ua,
      referrer,
      ip_hash: hashIp(ip),
      country,
    });
    const dest = campaign.bot_fallback_url || links[0].url;
    return NextResponse.redirect(dest, 302);
  }

  // ---- HUMANO: escolhe pela contagem atual de humanos ----
  // Usamos SELECT retornando linhas + .length (primitiva mais confiavel aqui)
  // com no-store garantido pelo cliente, evitando cache e o count-header.
  const { data: humanRows } = await supabaseAdmin
    .from("clicks")
    .select("id")
    .eq("campaign_id", campaign.id)
    .eq("is_bot", false);

  const humanCount = humanRows?.length ?? 0;
  const idx = pickIndex(links as Link[], humanCount);
  const chosen = links[idx] ?? links[0];

  await supabaseAdmin.from("clicks").insert({
    campaign_id: campaign.id,
    link_id: chosen.id,
    is_bot: false,
    user_agent: ua,
    referrer,
    ip_hash: hashIp(ip),
    country,
  });

  if (campaign.facebook_pixel_id) {
    return new NextResponse(
      pixelInterstitial(campaign.facebook_pixel_id, chosen.url),
      { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  return NextResponse.redirect(chosen.url, 302);
}
