import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinkSplit — Rotador de Links",
  description: "Distribua o trafego das suas campanhas igualmente entre varias paginas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topbar">
          <a href="/dashboard" className="brand">🔀 LinkSplit</a>
          <nav className="nav">
            <a href="/dashboard">Campanhas</a>
            <a href="/dashboard/projects">Projetos</a>
            <a href="/dashboard/pixels">Pixels</a>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
