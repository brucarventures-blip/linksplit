import "./globals.css";
import type { Metadata, Viewport } from "next";
import { getCurrentUser } from "@/lib/auth";
import { VERSION } from "@/lib/version";
import Logout from "./Logout";
import LinkSplitBrandIcon from "./BrandIcon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LinkSplit — Rotador de Links",
  description: "Distribua o trafego das suas campanhas igualmente entre varias paginas.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#15120f",
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
          <span className="version-badge">v{VERSION}</span>
          {auth && (
            <>
              <nav className="nav">
                <a href="/dashboard">Campanhas</a>
                {auth.isAdmin && <a href="/dashboard/projects">Projetos</a>}
                {auth.isAdmin && <a href="/dashboard/pixels">Pixels</a>}
                {auth.isAdmin && <a href="/dashboard/users">Usuários</a>}
              </nav>
              <div className="topbar-actions">
                <a className="panel-link" href="https://painel.brucarventures.com" aria-label="Voltar ao Painel Brucar">
                  ← Painel
                </a>
                <Logout email={auth.profile?.email ?? auth.user.email} avatarUrl={auth.profile?.avatar_url} />
              </div>
            </>
          )}
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
