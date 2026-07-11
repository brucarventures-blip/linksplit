import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, cookieOptions } from "./config";

// Atualiza a sessão a cada request e protege as rotas do painel.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach((c) => request.cookies.set(c.name, c.value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach((c) => response.cookies.set(c.name, c.value, c.options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPanel = path === "/dashboard" || path.startsWith("/dashboard/");
  const isApi = path.startsWith("/api/");

  // API sem login -> 401 (as rotas de redirect públicas não passam por aqui).
  if (isApi && !user) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  // Sem login tentando acessar o painel -> vai pro login.
  if (isPanel && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Já logado abrindo /login -> manda pro painel.
  if (path === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
