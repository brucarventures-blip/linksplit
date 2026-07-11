import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Protege apenas o painel e a tela de login. As rotas de redirect públicas
// (/<slug> e /r/<slug>) NÃO passam por aqui, então os links seguem abertos.
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/api/:path*"],
};
