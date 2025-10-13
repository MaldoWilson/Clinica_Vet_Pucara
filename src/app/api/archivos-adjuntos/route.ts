import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET: Lista plantillas globales de certificados (no asociadas a historial)
export async function GET(_req: NextRequest) {
  try {
    const supa = supabaseServer();
    const { data, error } = await supa
      .from("archivos_adjuntos")
      .select("id, nombre_archivo, tipo_archivo, url_archivo, created_at")
      .eq("tipo_archivo", "Certificado")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}


