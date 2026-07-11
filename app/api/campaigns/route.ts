import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { buildUtmUrl, fetchPostId } from "@/lib/utm";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

type InLink = { url: string; weight: number; post_id?: string };

// POST /api/campaigns
// body: { name, slug?, links:[{url, weight, post_id?}], filter_bots,
//         bot_fallback_url, facebook_pixel_id, project_id?, split_number? }
// Com project_id: `url` de cada link é a URL BASE; o servidor busca o Post ID
// e gera a URL final com UTM. Sem project_id: `url` é usada como está.
export async function POST(req: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "não autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON invalido" }, { status: 400 });

  const name: string = (body.name ?? "").trim();

  let links: InLink[] = [];
  if (Array.isArray(body.links)) {
    links = body.links
      .map((l: any) => ({
        url: (l?.url ?? "").trim(),
        weight: Math.max(1, parseInt(l?.weight ?? 1, 10) || 1),
        post_id: (l?.post_id ?? "").toString().trim() || undefined,
      }))
      .filter((l: InLink) => l.url);
  } else if (Array.isArray(body.urls)) {
    links = body.urls
      .map((u: string) => ({ url: (u ?? "").trim(), weight: 1 }))
      .filter((l: InLink) => l.url);
  }

  const filterBots: boolean = body.filter_bots !== false;
  const botFallback: string | null = (body.bot_fallback_url ?? "").trim() || null;
  const pixel: string | null = (body.facebook_pixel_id ?? "").trim() || null;
  const customSlug: string = slugify(body.slug ?? "");
  const projectId: string | null = (body.project_id ?? "").trim() || null;
  const splitNumber: number = Math.max(1, parseInt(body.split_number ?? 1, 10) || 1);

  if (!name) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });
  if (links.length < 2)
    return NextResponse.json(
      { error: "Informe pelo menos 2 links de destino" },
      { status: 400 }
    );

  // Operador só cria campanha dentro de um projeto liberado pra ele.
  if (!auth.isAdmin) {
    if (!projectId || !auth.allowedProjectIds.includes(projectId)) {
      return NextResponse.json(
        { error: "Escolha um projeto liberado para você." },
        { status: 403 }
      );
    }
  }

  // Se tiver projeto, carrega os metadados p/ montar as UTMs.
  let project: { abbr: string; language: string; country: string } | null = null;
  if (projectId) {
    const { data: p } = await supabaseAdmin
      .from("projects")
      .select("abbr, language, country")
      .eq("id", projectId)
      .single();
    if (!p)
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 400 });
    project = p;
  }

  // slug único
  let base = customSlug || slugify(name) || "camp";
  let slug = base;
  for (let i = 0; i < 50; i++) {
    const { data: exists } = await supabaseAdmin
      .from("campaigns")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!exists) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: campaign, error } = await supabaseAdmin
    .from("campaigns")
    .insert({
      name,
      slug,
      filter_bots: filterBots,
      bot_fallback_url: botFallback,
      facebook_pixel_id: pixel,
      project_id: projectId,
      split_number: projectId ? splitNumber : null,
    })
    .select("id, slug")
    .single();

  if (error || !campaign)
    return NextResponse.json({ error: error?.message ?? "Falha ao criar" }, { status: 500 });

  // Monta as linhas. Com projeto: busca Post ID + gera UTM.
  const rows = [];
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    if (project) {
      const postId = l.post_id ?? (await fetchPostId(l.url));
      const finalUrl = buildUtmUrl(l.url, project, splitNumber, postId ?? null);
      rows.push({
        campaign_id: campaign.id,
        url: finalUrl,
        base_url: l.url,
        post_id: postId ?? null,
        position: i,
        weight: l.weight,
      });
    } else {
      rows.push({
        campaign_id: campaign.id,
        url: l.url,
        base_url: null,
        post_id: null,
        position: i,
        weight: l.weight,
      });
    }
  }

  const { error: linkErr } = await supabaseAdmin.from("links").insert(rows);
  if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 });

  return NextResponse.json({ id: campaign.id, slug: campaign.slug });
}
