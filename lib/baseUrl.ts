// Domínio fixo dos links curtos. Todos os links gerados no painel usam este
// domínio, independentemente de por onde o painel foi acessado.
// Pode sobrescrever via env NEXT_PUBLIC_BASE_URL se precisar.
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://brucar.click";
}
