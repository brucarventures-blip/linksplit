"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Row = { url: string; weight: number };
type SavedPixel = { id: string; name: string; pixel_id: string };
type Project = { id: string; code: string | null; name: string };

const selStyle = {
  width: "100%",
  background: "var(--panel2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  padding: "10px 12px",
  margin: "6px 0",
} as const;

export default function NewCampaign() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [rows, setRows] = useState<Row[]>([
    { url: "", weight: 1 },
    { url: "", weight: 1 },
  ]);
  const [customWeights, setCustomWeights] = useState(false);
  const [filterBots, setFilterBots] = useState(true);
  const [botFallback, setBotFallback] = useState("");
  const [pixel, setPixel] = useState("");
  const [savedPixels, setSavedPixels] = useState<SavedPixel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [splitNumber, setSplitNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/pixels").then((r) => r.json()).then((d) => setSavedPixels(d.pixels ?? [])).catch(() => {});
    fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(d.projects ?? [])).catch(() => {});
  }, []);

  const hasProject = !!projectId;
  const filledRows = rows.filter((r) => r.url.trim());
  const totalWeight = filledRows.reduce((s, r) => s + Math.max(1, r.weight), 0);

  function setRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { url: "", weight: 1 }]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }
  function pctFor(r: Row) {
    if (totalWeight === 0) return 0;
    return Math.round((Math.max(1, r.weight) / totalWeight) * 100);
  }

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const links = rows
        .filter((r) => r.url.trim())
        .map((r) => ({ url: r.url.trim(), weight: customWeights ? Math.max(1, r.weight) : 1 }));
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          links,
          filter_bots: filterBots,
          bot_fallback_url: botFallback,
          facebook_pixel_id: pixel,
          project_id: projectId || null,
          split_number: splitNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar");
      setName("");
      setSlug("");
      setRows([{ url: "", weight: 1 }, { url: "", weight: 1 }]);
      setPixel("");
      setBotFallback("");
      setCustomWeights(false);
      setProjectId("");
      setSplitNumber(1);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Nova campanha</h2>

      <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <label>Nome da campanha</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: GRSCBR - Vídeo 1" />
        </div>
        <div style={{ flex: 1 }}>
          <label>Slug do link (opcional)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ex: grscbr (vira /grscbr)" />
        </div>
      </div>

      <div className="row" style={{ gap: 12, alignItems: "flex-start", marginTop: 6 }}>
        <div style={{ flex: 2 }}>
          <label>Projeto (opcional — gera UTM automática)</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={selStyle}>
            <option value="">— Sem projeto (URLs diretas) —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code ? `${p.code} · ` : ""}{p.name}
              </option>
            ))}
          </select>
        </div>
        {hasProject && (
          <div style={{ flex: 1 }}>
            <label>Nº do split</label>
            <input
              type="number"
              min={1}
              value={splitNumber}
              onChange={(e) => setSplitNumber(Math.max(1, parseInt(e.target.value || "1", 10)))}
            />
          </div>
        )}
      </div>
      {hasProject && (
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
          Cole as <strong>URLs base</strong> abaixo. O sistema busca o Post ID no WordPress e monta a UTM
          (utm_source/medium/campaign) sozinho.
        </div>
      )}

      <div className="row between" style={{ marginTop: 10 }}>
        <label>{hasProject ? "URLs base das páginas" : "Páginas de destino"}</label>
        <div className="row" style={{ gap: 6 }}>
          <input type="checkbox" id="cw" checked={customWeights} style={{ width: 18 }} onChange={(e) => setCustomWeights(e.target.checked)} />
          <label htmlFor="cw" style={{ margin: 0 }}>Pesos customizados (senão, divisão igual)</label>
        </div>
      </div>

      {rows.map((r, i) => (
        <div className="linkline" key={i} style={{ alignItems: "center" }}>
          <input
            value={r.url}
            onChange={(e) => setRow(i, { url: e.target.value })}
            placeholder={hasProject ? `https://dominio.com/pagina-${i + 1}` : `https://pagina-${i + 1}.com`}
          />
          {customWeights && (
            <>
              <input type="number" min={1} value={r.weight} onChange={(e) => setRow(i, { weight: parseInt(e.target.value || "1", 10) })} style={{ width: 70 }} title="Peso" />
              <span className="pill" style={{ whiteSpace: "nowrap" }}>{pctFor(r)}%</span>
            </>
          )}
          {rows.length > 2 && (
            <button className="secondary" type="button" onClick={() => removeRow(i)}>✕</button>
          )}
        </div>
      ))}
      <div className="row between" style={{ marginTop: 6 }}>
        <button className="secondary" type="button" onClick={addRow}>+ Adicionar página</button>
        {filledRows.length >= 2 && !customWeights && (
          <span className="pill">{filledRows.length} páginas · {Math.round(100 / filledRows.length)}% cada</span>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <label>Pixel do Facebook (opcional — deixe vazio p/ split "SP")</label>
        {savedPixels.length > 0 && (
          <select value={pixel} onChange={(e) => setPixel(e.target.value)} style={selStyle}>
            <option value="">— Sem pixel (SP) —</option>
            {savedPixels.map((p) => (
              <option key={p.id} value={p.pixel_id}>{p.name} ({p.pixel_id})</option>
            ))}
          </select>
        )}
        <input value={pixel} onChange={(e) => setPixel(e.target.value)} placeholder="ou digite o ID do pixel, ex: 1427853209360580" />
        <div className="muted" style={{ fontSize: 12 }}>
          Cadastre pixels reutilizáveis na aba <a href="/dashboard/pixels">Pixels</a>.
        </div>
      </div>

      <div style={{ marginTop: 12 }} className="row">
        <input type="checkbox" id="fb" checked={filterBots} style={{ width: 18 }} onChange={(e) => setFilterBots(e.target.checked)} />
        <label htmlFor="fb" style={{ margin: 0 }}>Filtrar bots/crawlers (recomendado — mantém a divisão exata)</label>
      </div>

      {filterBots && (
        <>
          <label style={{ marginTop: 8, display: "block" }}>URL para onde mandar os bots (opcional — vazio = primeira página)</label>
          <input value={botFallback} onChange={(e) => setBotFallback(e.target.value)} placeholder="https://sua-pagina-neutra.com" />
        </>
      )}

      {error && <p className="err">{error}</p>}
      <button onClick={submit} disabled={loading || !name.trim() || filledRows.length < 2} style={{ marginTop: 10 }}>
        {loading ? "Criando..." : "Criar campanha"}
      </button>
    </div>
  );
}
