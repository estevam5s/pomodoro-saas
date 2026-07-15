"use client";

import { useEffect } from "react";
import { isAdminEmail, hasValidProof } from "@/lib/tfa";

// Guard client: redireciona o admin ao /2fa em rotas protegidas se não houver prova válida.
const PROTECTED = /^\/(dashboard|admin|app|painel|conta|configuracoes|produtos|relatorios)(\/|$)/i;

export function TfaGuard({ email }: { email?: string | null }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    if (!PROTECTED.test(path) || path.startsWith("/2fa")) return;
    if (isAdminEmail(email) && !hasValidProof()) {
      window.location.href = `/2fa?email=${encodeURIComponent(email || "")}&redirect=${encodeURIComponent(path)}`;
    }
  }, [email]);
  return null;
}
