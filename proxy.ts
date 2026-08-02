import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // A central de acesso consulta esta rota para exibir disponibilidade.
  // Ela precisa responder sem sessão e sem aguardar uma chamada ao Supabase.
  if (request.nextUrl.pathname === "/api/health") {
    return NextResponse.next();
  }

  return updateSession(request);
}

// Protege apenas o painel e a tela de login. As rotas de redirect públicas
// (/<slug> e /r/<slug>) NÃO passam por aqui, então os links seguem abertos.
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/api/:path*"],
};
