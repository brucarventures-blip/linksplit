import crypto from "crypto";

// Guarda o IP de forma anonima (hash), só para contagem/anti-fraude leve,
// sem armazenar o IP em texto puro.
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.IP_SALT ?? "linksplit";
  return crypto.createHash("sha256").update(salt + ip).digest("hex").slice(0, 32);
}
