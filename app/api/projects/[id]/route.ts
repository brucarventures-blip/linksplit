import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "apenas admin exclui projetos" }, { status: 403 });
  const { error } = await supabaseAdmin.from("projects").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
