"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase, isAdminEmail } from "@/lib/supabase";

type F = { id: number; name: string | null; email: string | null; type: string; message: string; page: string | null; created_at: string };
const TL: Record<string, string> = { sugestao: "Sugestão", elogio: "Elogio", critica: "Crítica", bug: "Problema", outro: "Outro" };
const TC: Record<string, string> = { sugestao: "bg-blue-500/15 text-blue-300", elogio: "bg-emerald-500/15 text-emerald-300", critica: "bg-amber-500/15 text-amber-300", bug: "bg-red-500/15 text-red-300", outro: "bg-gray-500/15 text-gray-300" };

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<F[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  const load = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user || !isAdminEmail(user.email)) { setDenied(true); setLoading(false); return; }
    const t = sess.session?.access_token;
    const res = await fetch("/api/admin?module=feedback", { headers: t ? { Authorization: `Bearer ${t}` } : {} });
    const json = await res.json();
    setItems(json.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="min-h-screen bg-black p-8 text-white">Carregando…</div>;
  if (denied) return <div className="min-h-screen bg-black p-8 text-white">Acesso restrito.</div>;
  const counts = items.reduce<Record<string, number>>((a, f) => { a[f.type] = (a[f.type] ?? 0) + 1; return a; }, {});

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">Feedbacks dos usuários</h1>
        <p className="mt-1 text-sm text-white/50">{items.length} mensagem(ns).</p>
        <div className="my-6 flex flex-wrap gap-2">
          {(["sugestao", "elogio", "critica", "bug"] as const).map((t) => (
            <span key={t} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${TC[t]}`}>{TL[t]} · {counts[t] ?? 0}</span>
          ))}
        </div>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-white/40">Nenhum feedback ainda.</div>
        ) : (
          <div className="space-y-3">
            {items.map((f) => (
              <div key={f.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TC[f.type] ?? TC.outro}`}>{TL[f.type] ?? f.type}</span>
                  <span className="text-sm font-medium">{f.name || "Anônimo"}</span>
                  {f.email && <span className="text-xs text-white/40">· {f.email}</span>}
                  <span className="ml-auto text-xs text-white/40">{new Date(f.created_at).toLocaleString("pt-BR")}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">{f.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
