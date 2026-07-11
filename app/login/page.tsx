"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou senha inválidos.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="card" style={{ maxWidth: 380, margin: "60px auto" }}>
      <h1 style={{ marginTop: 0 }}>Entrar</h1>
      <p className="muted">Acesse o painel do LinkSplit.</p>
      <form onSubmit={submit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@brucar.com"
          autoComplete="email"
        />
        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {error && <p className="err">{error}</p>}
        <button
          type="submit"
          disabled={loading || !email || !password}
          style={{ marginTop: 12, width: "100%" }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
