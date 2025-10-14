import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET: Lista plantillas globales de certificados (no asociadas a historial)
export async function GET(_req: NextRequest) {
  try {
    const supa = supabaseServer();
    
    // Primero, consulta sin filtros para ver todos los registros
    const { data: allData, error: allError } = await supa
      .from("archivos_adjuntos")
      .select("id, nombre_archivo, tipo_archivo, url_archivo, created_at");
    
    console.log("🗄️ TODOS los registros en archivos_adjuntos:", allData);
    console.log("❌ Errores en consulta general:", allError);
    
    // Ahora la consulta con filtros
    const { data, error } = await supa
      .from("archivos_adjuntos")
      .select("id, nombre_archivo, tipo_archivo, url_archivo, created_at")
      // Tolerante a mayúsculas/minúsculas y espacios/sufijos accidentales
      .ilike("tipo_archivo", "Certificado%")
      .order("id", { ascending: true }); // Cambio el ordenamiento por ID en lugar de created_at

    console.log("🗄️ Consulta filtrada - archivos_adjuntos:");
    console.log("📊 Datos encontrados:", data);
    console.log("🔍 Buscando específicamente ID 8, 9 y 10:", data?.filter(x => x.id == 8 || x.id == 9 || x.id == 10));
    console.log("🔍 Verificando tipo_archivo para ID 10:", allData?.filter(x => x.id == 10));
    console.log("❌ Errores:", error);

    if (error) throw error;
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (e: any) {
    console.error("💥 Error en la API de archivos-adjuntos:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}


