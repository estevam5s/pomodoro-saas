import { NextResponse } from "next/server";
import { admin } from "@/lib/server";
export const dynamic = "force-dynamic";
const TYPES = new Set(["sugestao","critica","elogio","bug","outro"]);
export async function POST(req: Request) {
  try {
    const b = await req.json(); const message = String(b.message ?? "").trim();
    if (message.length < 3) return NextResponse.json({ error: "Mensagem muito curta." }, { status: 400 });
    const type = TYPES.has(String(b.type)) ? String(b.type) : "sugestao";
    const { error } = await admin().from("feedback").insert({ name:String(b.name??"").trim().slice(0,120)||null, email:String(b.email??"").trim().slice(0,160)||null, type, message:message.slice(0,4000), page:String(b.page??"").slice(0,300)||null });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }
}
