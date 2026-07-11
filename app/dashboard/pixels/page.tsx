import { supabaseAdmin } from "@/lib/supabaseServer";
import PixelsManager from "./PixelsManager";

export const dynamic = "force-dynamic";

export default async function PixelsPage() {
  const { data: pixels } = await supabaseAdmin
    .from("pixels")
    .select("id, name, pixel_id, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1>Pixels do Facebook</h1>
      <p className="muted">
        Cadastre seus pixels aqui e reutilize nas campanhas. Por enquanto a
        adição é manual — depois dá pra integrar via API.
      </p>
      <PixelsManager initial={pixels ?? []} />
    </>
  );
}
