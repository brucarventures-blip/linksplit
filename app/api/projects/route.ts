import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, code, name, domain, abbr, language, country, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON invalido" }, { status: 400 });

  const name = (body.name ?? "").trim();
  const domain = (body.domain ?? "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const abbr = (body.abbr ?? "").trim();
  const language = (body.language ?? "").trim();
  const country = (body.country ?? "").trim();
  const code = (body.code ?? "").trim() || null;

  if (!name || !domain || !abbr || !language || !country) {
    return NextResponse.json(
      { error: "Preencha nome, domínio, abreviação, idioma e país" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({ code, name, domain, abbr, language, country })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
