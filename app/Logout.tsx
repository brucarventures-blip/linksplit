"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

function initials(email?: string | null) {
  return (email?.trim().charAt(0) || "U").toUpperCase();
}

export default function Logout({ email, avatarUrl }: { email?: string | null; avatarUrl?: string | null }) {
  const router = useRouter();
  const effectiveAvatar = avatarUrl || (email?.toLowerCase() === "bruno@brucarventures.com" ? "/bruno-avatar.jpg" : null);
  async function out() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="row user-session" style={{ gap: 10 }}>
      {email && (
        <span className="muted" style={{ fontSize: 13 }}>
          {email}
        </span>
      )}
      {effectiveAvatar ? (
        <Image className="user-avatar" src={effectiveAvatar} alt={email ? `Foto de ${email}` : "Foto do usuário"} width={36} height={36} />
      ) : (
        <span className="user-avatar user-avatar-fallback" aria-label={email ? `Usuário ${email}` : "Usuário"}>{initials(email)}</span>
      )}
      <button className="secondary" onClick={out}>
        Sair
      </button>
    </div>
  );
}
