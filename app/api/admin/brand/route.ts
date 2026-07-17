import { NextResponse } from "next/server";
import { admin, requireAdmin } from "@/lib/server";
export const dynamic = "force-dynamic";
const NUM = ["logo_site_px","logo_login_px","logo_dashboard_px","logo_admin_px","logo_stripe_px","favicon_px"];
const TXT = ["company_name","company_email","company_phone","company_address","company_cnpj"];
export async function GET(req: Request) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { data } = await admin().from("brand_settings").select("*").eq("id", 1).maybeSingle();
  return NextResponse.json({ settings: data || {} });
}
export async function POST(req: Request) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const patch: any = { id: 1, updated_at: new Date().toISOString() };
  for (const k of NUM) if (b[k] != null && b[k] !== "") patch[k] = Math.max(8, Math.min(512, parseInt(b[k], 10) || 0));
  for (const k of TXT) if (b[k] != null) patch[k] = String(b[k]).slice(0, 300);
  const { error } = await admin().from("brand_settings").upsert(patch, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
