"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const LOGOS: { key: string; label: string; hint: string }[] = [
  { key: "logo_site_px", label: "Logo do site", hint: "Cabeçalho / navbar" },
  { key: "logo_login_px", label: "Logo de login/registro", hint: "Telas de acesso" },
  { key: "logo_dashboard_px", label: "Logo do dashboard", hint: "Painel do usuário" },
  { key: "logo_admin_px", label: "Logo do admin", hint: "Painel administrativo" },
  { key: "logo_stripe_px", label: "Logo dos produtos Stripe", hint: "Checkout / faturas" },
  { key: "favicon_px", label: "Favicon", hint: "Ícone ao lado da URL" },
];
const INFO: { key: string; label: string; ph: string }[] = [
  { key: "company_name", label: "Nome da empresa", ph: "Cliste Tecnologia" },
  { key: "company_email", label: "E-mail de contato", ph: "contato@empresa.com" },
  { key: "company_phone", label: "Telefone", ph: "(00) 00000-0000" },
  { key: "company_address", label: "Endereço", ph: "Rua, nº, cidade/UF" },
  { key: "company_cnpj", label: "CNPJ", ph: "00.000.000/0001-00" },
];

export default function AdminMarcaPage() {
  const [form, setForm] = useState<Record<string, any>>({});
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setState("denied"); return; }
      const res = await fetch("/api/admin/brand", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
      if (!res.ok) { setState("denied"); return; }
      const json = await res.json();
      setForm(json.settings || {}); setState("ok");
    })();
  }, []);

  const save = async () => {
    setSaving(true); setMsg("");
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/brand", { method: "POST", headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setMsg(res.ok ? "Salvo com sucesso ✓" : "Erro ao salvar");
  };
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  if (state === "loading") return <div className="min-h-screen bg-black p-8">Carregando…</div>;
  if (state === "denied") return <div className="min-h-screen bg-black p-8">Acesso restrito.</div>;

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white">Personalização da marca</h1>
        <p className="mt-1 text-sm text-white/50">Ajuste os tamanhos das logos e as informações institucionais exibidas no site.</p>

        <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">Tamanhos das logos (px)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {LOGOS.map((l) => (
            <label key={l.key} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/90">{l.label}</span>
                <input type="number" min={8} max={512} value={form[l.key] ?? ""} onChange={(e) => set(l.key, e.target.value)}
                  className="w-20 rounded-lg border border-white/15 px-2 py-1 text-right text-sm" />
              </div>
              <p className="mt-1 text-xs text-white/40">{l.hint}</p>
            </label>
          ))}
        </div>

        <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">Informações institucionais</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {INFO.map((i) => (
            <label key={i.key} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-white/70">{i.label}</span>
              <input type="text" placeholder={i.ph} value={form[i.key] ?? ""} onChange={(e) => set(i.key, e.target.value)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm" />
            </label>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button onClick={save} disabled={saving} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{saving ? "Salvando…" : "Salvar alterações"}</button>
          {msg && <span className="text-sm text-white/70">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
