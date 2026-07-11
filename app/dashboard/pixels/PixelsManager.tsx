"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Pixel = {
  id: string;
  name: string;
  pixel_id: string;
  description: string | null;
  created_at: string;
};

export default function PixelsManager({ initial }: { initial: Pixel[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function add() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/pixels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pixel_id: pixelId, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar");
      setName("");
      setPixelId("");
      setDescription("");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir este pixel? As campanhas que já usam o número não são afetadas.")) return;
    await fetch(`/api/pixels/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Novo pixel</h2>
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <label>Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pixel Grécia"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>ID do pixel</label>
            <input
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="Ex: 1427853209360580"
            />
          </div>
        </div>
        <label>Descrição (opcional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Anotação para lembrar de onde é este pixel"
        />
        {error && <p className="err">{error}</p>}
        <button
          onClick={add}
          disabled={loading || !name.trim() || !pixelId.trim()}
          style={{ marginTop: 10 }}
        >
          {loading ? "Salvando..." : "Salvar pixel"}
        </button>
      </div>

      <h2>Pixels salvos</h2>
      {initial.length === 0 && (
        <p className="muted">Nenhum pixel ainda. Cadastre o primeiro acima.</p>
      )}
      {initial.length > 0 && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>ID</th>
                <th>Descrição</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {initial.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
                    {p.pixel_id}
                  </td>
                  <td className="muted">{p.description || "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="danger" onClick={() => remove(p.id)}>
                      Excluir
                    </button>
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
