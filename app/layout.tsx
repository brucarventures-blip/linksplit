import "./globals.css";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import Logout from "./Logout";
import LinkSplitBrandIcon from "./BrandIcon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LinkSplit — Rotador de Links",
  description: "Distribua o trafego das suas campanhas igualmente entre varias paginas.",
  icons: { icon: "/icon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const auth = await getCurrentUser();
  return (
    <html lang="pt-BR">
      <body>
        <header className="topbar">
          <a href={auth ? "/dashboard" : "/login"} className="brand">
            <span className="brand-mark"><LinkSplitBrandIcon title="LinkSplit" /></span>
            <span className="brand-copy">
              <strong>LinkSplit</strong>
              <small>ROTEAMENTO</small>
            </span>
          </a>
          {auth && (
            <>
              <nav className="nav">
                <a href="/dashboard">Campanhas</a>
                {auth.isAdmin && <a href="/dashboard/projects">Projetos</a>}
                {auth.isAdmin && <a href="/dashboard/pixels">Pixels</a>}
                {auth.isAdmin && <a href="/dashboard/users">Usuários</a>}
              </nav>
              <div className="topbar-actions">
                <a className="panel-link" href="https://painel.brucarventures.com">
                  ← Painel
                </a>
                <Logout email={auth.profile?.email ?? auth.user.email} />
              </div>
            </>
          )}
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
