// Geração de UTM + busca automática do Post ID no WordPress.
// Convenção decodificada da planilha do Bruno:
//   utm_source   = abreviação do domínio            (ex: sc)
//   utm_medium   = split{N}_{idioma}_{país}          (ex: split1_el_gr)
//   utm_campaign = {postID}_{idioma}_{split}_{abrev} (ex: 56_el_1_sc)

export type ProjectMeta = {
  abbr: string;
  language: string;
  country: string;
};

// Extrai o "slug" (último segmento do caminho) de uma URL base.
export function extractSlug(baseUrl: string): string | null {
  try {
    const u = new URL(baseUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length ? decodeURIComponent(parts[parts.length - 1]) : null;
  } catch {
    return null;
  }
}

// Busca o Post ID no WordPress via REST API (posts e, se não achar, pages).
// Retorna o número como string, ou null se não encontrar.
export async function fetchPostId(baseUrl: string): Promise<string | null> {
  const slug = extractSlug(baseUrl);
  if (!slug) return null;
  let origin = "";
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return null;
  }

  for (const type of ["posts", "pages"]) {
    try {
      const res = await fetch(
        `${origin}/wp-json/wp/v2/${type}?slug=${encodeURIComponent(slug)}&_fields=id`,
        { cache: "no-store", headers: { accept: "application/json" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0]?.id != null) {
        return String(data[0].id);
      }
    } catch {
      // tenta o próximo tipo
    }
  }
  return null;
}

// Monta a URL final com as UTMs, preservando query/hash existentes.
export function buildUtmUrl(
  baseUrl: string,
  project: ProjectMeta,
  split: number,
  postId: string | null
): string {
  const source = project.abbr;
  const medium = `split${split}_${project.language}_${project.country}`;
  const campaign = postId
    ? `${postId}_${project.language}_${split}_${project.abbr}`
    : `${project.language}_${split}_${project.abbr}`;

  try {
    const u = new URL(baseUrl);
    u.searchParams.set("utm_source", source);
    u.searchParams.set("utm_medium", medium);
    u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    // fallback simples se a URL não parsear
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`;
  }
}
