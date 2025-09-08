import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const supa = supabaseServer();
    const { data, error } = await supa
      .from("servicios")
      .select("id, nombre")
      .order("nombre");
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("API /servicios error:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
