"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Project = { id: string; code: string | null; name: string };
type User = {
  id: string;
  email: string | null;
  role: "admin" | "operador";
  project_ids: string[];
};

export default function UsersManager({
  initialUsers,
  projects,
  meId,
}: {
  initialUsers: User[];
  projects: Project[];
  meId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editSel, setEditSel] = useState<string[]>([]);

  const projName = (id: string) => {
    const p = projects.find((x) => x.id === id);
    return p ? (p.code ? `${p.code}` : p.name) : "—";
  };

  function toggle(list: string[], id: string) {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  async function create() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, project_ids: sel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar");
      setEmail("");
      setPassword("");
      setSel([]);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir este usuário? Ele perde o acesso imediatamente.")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Falha ao excluir");
      return;
    }
    router.refresh();
  }

  async function saveProjects(id: string) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_ids: editSel }),
    });
    setEditing(null);
    router.refresh();
  }

  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Novo operador</h2>
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operador@brucar.com" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Senha (mín. 6)</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <label>Projetos liberados</label>
        {projects.length === 0 && <p className="muted">Cadastre projetos primeiro na aba Projetos.</p>}
        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          {projects.map((p) => (
            <label key={p.id} className="pill" style={{ cursor: "pointer", display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={sel.includes(p.id)}
                onChange={() => setSel((s) => toggle(s, p.id))}
                style={{ width: 16, margin: 0 }}
              />
              {p.code ? `${p.code} · ` : ""}{p.name}
            </label>
          ))}
        </div>
        {error && <p className="err">{error}</p>}
        <button onClick={create} disabled={loading || !email.trim() || password.length < 6} style={{ marginTop: 12 }}>
          {loading ? "Criando..." : "Criar operador"}
        </button>
      </div>

      <h2>Usuários</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Papel</th>
              <th>Projetos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.email}{u.id === meId ? " (você)" : ""}</td>
                <td>
                  <span className="pill">{u.role}</span>
                </td>
                <td className="muted">
                  {u.role === "admin"
                    ? "todos"
                    : editing === u.id
                    ? (
                      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                        {projects.map((p) => (
                          <label key={p.id} style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 12 }}>
                            <input
                              type="checkbox"
                              checked={editSel.includes(p.id)}
                              onChange={() => setEditSel((s) => toggle(s, p.id))}
                              style={{ width: 15, margin: 0 }}
                            />
                            {p.code || p.name}
                          </label>
                        ))}
                        <button className="secondary" onClick={() => saveProjects(u.id)}>Salvar</button>
                        <button className="secondary" onClick={() => setEditing(null)}>Cancelar</button>
                      </div>
                    )
                    : (u.project_ids.length ? u.project_ids.map(projName).join(", ") : "nenhum")}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {u.role === "operador" && editing !== u.id && (
                    <button
                      className="secondary"
                      onClick={() => {
                        setEditing(u.id);
                        setEditSel(u.project_ids);
                      }}
                    >
                      Projetos
                    </button>
                  )}{" "}
                  {u.id !== meId && (
                    <button className="danger" onClick={() => remove(u.id)}>Excluir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
