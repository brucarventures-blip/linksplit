import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/pixels  -> lista os pixels salvos
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("pixels")
    .select("id, name, pixel_id, description, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pixels: data ?? [] });
}

// POST /api/pixels  -> cria um pixel  { name, pixel_id, description }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON invalido" }, { status: 400 });

  const name: string = (body.name ?? "").trim();
  const pixelId: string = (body.pixel_id ?? "").trim();
  const description: string | null = (body.description ?? "").trim() || null;

  if (!name) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });
  if (!/^\d{5,}$/.test(pixelId))
    return NextResponse.json(
      { error: "ID do pixel deve ser numerico (ex: 1427853209360580)" },
      { status: 400 }
    );

  const { data, error } = await supabaseAdmin
    .from("pixels")
    .insert({ name, pixel_id: pixelId, description })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
