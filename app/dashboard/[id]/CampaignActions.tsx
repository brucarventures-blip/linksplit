"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CampaignActions({
  id,
  active,
  shortUrl,
}: {
  id: string;
  active: boolean;
  shortUrl: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function toggle() {
    setBusy(true);
    await fetch(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm("Excluir esta campanha e todas as estatísticas?")) return;
    setBusy(true);
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  return (
    <div className="row" style={{ gap: 8 }}>
      <button className="secondary" onClick={copy}>
        {copied ? "Copiado!" : "Copiar link"}
      </button>
      <button className="secondary" onClick={toggle} disabled={busy}>
        {active ? "Pausar" : "Ativar"}
      </button>
      <button className="danger" onClick={remove} disabled={busy}>
        Excluir
      </button>
    </div>
  );
}
