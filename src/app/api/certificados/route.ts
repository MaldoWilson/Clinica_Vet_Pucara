import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET /api/certificados?consulta_id=... | ?mascota_id=... | ?all=true
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const consultaId = searchParams.get("consulta_id");
    const mascotaId = searchParams.get("mascota_id");
    const all = searchParams.get("all") === "true";

    const supa = supabaseServer();
    
    // Si hay mascota_id, necesitamos filtrar por consultas primero
    let consultaIds: number[] | null = null;
    if (mascotaId) {
      const { data: consultasData, error: consultasError } = await supa
        .from("consultas")
        .select("id")
        .eq("mascota_id", mascotaId);
      if (consultasError) throw consultasError;
      consultaIds = (consultasData || []).map((c: any) => c.id);
      if (consultaIds.length === 0) {
        return NextResponse.json({ ok: true, data: [] });
      }
    }
    
    let query = supa
      .from("certificados")
      .select("id, id_consulta, nombre, datos, created_at")
      .order("created_at", { ascending: false });

    if (consultaId) {
      query = query.eq("id_consulta", consultaId);
    } else if (consultaIds) {
      query = query.in("id_consulta", consultaIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Los datos completos ya están en el JSON, así que simplemente los devolvemos
    // Formatear los datos para que sean más fáciles de usar
    const formatted = (data || []).map((cert: any) => ({
      id: cert.id,
      id_consulta: cert.id_consulta,
      nombre: cert.nombre,
      datos: cert.datos,
      created_at: cert.created_at,
      // Los datos del paciente y propietario ya están en cert.datos
      paciente: cert.datos?.paciente || null,
      propietario: cert.datos?.propietario || null,
    }));

    return NextResponse.json({ ok: true, data: formatted });
  } catch (e: any) {
    console.error("Error en GET /api/certificados:", e);
    return NextResponse.json(
      { ok: false, error: e.message || String(e) },
      { status: 500 }
    );
  }
}

// POST /api/certificados
// Body: { id_consulta, nombre, datos: { template_id, template_name, paciente, propietario, veterinario_id, veterinario_nombre, campos, labels } }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_consulta, nombre, datos } = body;

    if (!id_consulta) {
      return NextResponse.json(
        { ok: false, error: "id_consulta es requerido" },
        { status: 400 }
      );
    }

    if (!datos || typeof datos !== "object") {
      return NextResponse.json(
        { ok: false, error: "datos es requerido y debe ser un objeto JSON" },
        { status: 400 }
      );
    }

    const supa = supabaseServer();

    // Verificar que la consulta existe
    const { data: consulta, error: consultaError } = await supa
      .from("consultas")
      .select("id")
      .eq("id", id_consulta)
      .single();

    if (consultaError || !consulta) {
      return NextResponse.json(
        { ok: false, error: "La consulta especificada no existe" },
        { status: 404 }
      );
    }

    // Insertar el certificado
    const { data: nuevoCertificado, error: insertError } = await supa
      .from("certificados")
      .insert({
        id_consulta: Number(id_consulta),
        nombre: nombre || datos.template_name || "Certificado",
        datos: datos,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, data: nuevoCertificado });
  } catch (e: any) {
    console.error("Error en POST /api/certificados:", e);
    return NextResponse.json(
      { ok: false, error: e.message || String(e) },
      { status: 500 }
    );
  }
}

