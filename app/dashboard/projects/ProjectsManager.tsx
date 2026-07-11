"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  code: string | null;
  name: string;
  domain: string;
  abbr: string;
  language: string;
  country: string;
};

const inStyle = {
  width: "100%",
  background: "var(--panel2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  padding: "10px 12px",
  margin: "6px 0",
} as const;

export default function ProjectsManager({ initial }: { initial: Project[] }) {
  const router = useRouter();
  const [f, setF] = useState({
    code: "",
    name: "",
    domain: "",
    abbr: "",
    language: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k: keyof typeof f, v: string) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  async function add() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar");
      setF({ code: "", name: "", domain: "", abbr: "", language: "", country: "" });
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir este projeto? Splits já criados não são afetados.")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Novo projeto</h2>
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 2 }}>
            <label>Nome</label>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: GR Simplificando com Café" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Código (opcional)</label>
            <input value={f.code} onChange={(e) => set("code", e.target.value)} placeholder="P031" />
          </div>
        </div>
        <label>Domínio</label>
        <input value={f.domain} onChange={(e) => set("domain", e.target.value)} placeholder="gr.simplificandocomcafe.com" />
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <label>Abreviação (utm_source)</label>
            <input value={f.abbr} onChange={(e) => set("abbr", e.target.value)} placeholder="sc" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Idioma</label>
            <input value={f.language} onChange={(e) => set("language", e.target.value)} placeholder="el" />
          </div>
          <div style={{ flex: 1 }}>
            <label>País</label>
            <input value={f.country} onChange={(e) => set("country", e.target.value)} placeholder="gr" />
          </div>
        </div>
        {error && <p className="err">{error}</p>}
        <button
          onClick={add}
          disabled={loading || !f.name.trim() || !f.domain.trim() || !f.abbr.trim() || !f.language.trim() || !f.country.trim()}
          style={{ marginTop: 10 }}
        >
          {loading ? "Salvando..." : "Salvar projeto"}
        </button>
      </div>

      <h2>Projetos cadastrados</h2>
      {initial.length === 0 && <p className="muted">Nenhum projeto ainda. Cadastre o primeiro acima.</p>}
      {initial.length > 0 && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Domínio</th>
                <th>Abrev</th>
                <th>Idioma</th>
                <th>País</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {initial.map((p) => (
                <tr key={p.id}>
                  <td>{p.code || "—"}</td>
                  <td>{p.name}</td>
                  <td style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>{p.domain}</td>
                  <td>{p.abbr}</td>
                  <td>{p.language}</td>
                  <td>{p.country}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="danger" onClick={() => remove(p.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
