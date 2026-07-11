"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Logout({ email }: { email?: string | null }) {
  const router = useRouter();
  async function out() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="row" style={{ gap: 10 }}>
      {email && (
        <span className="muted" style={{ fontSize: 13 }}>
          {email}
        </span>
      )}
      <button className="secondary" onClick={out}>
        Sair
      </button>
    </div>
  );
}
