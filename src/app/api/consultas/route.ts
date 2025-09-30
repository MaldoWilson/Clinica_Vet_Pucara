import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET /api/consultas?mascota_id=...  -> lista por fecha desc
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mascotaId = searchParams.get("mascota_id");
    if (!mascotaId) {
      return NextResponse.json({ ok: false, error: "mascota_id requerido" }, { status: 400 });
    }
    const supa = supabaseServer();
    const { data, error } = await supa
      .from("consultas")
      .select("id, mascota_id, veterinario_id, fecha, motivo, tipo_atencion, anamnesis, diagnostico, tratamiento, proximo_control, observaciones, created_at")
      .eq("mascota_id", mascotaId)
      .order("fecha", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, data: data || [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// POST /api/consultas  { mascota_id, ...campos }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mascota_id = body?.mascota_id ? String(body.mascota_id) : null;
    if (!mascota_id) return NextResponse.json({ ok: false, error: "mascota_id requerido" }, { status: 400 });

    const insert: any = {
      mascota_id,
      fecha: body?.fecha ?? null,
      motivo: body?.motivo ?? null,
      tipo_atencion: body?.tipo_atencion ?? null,
      anamnesis: body?.anamnesis ?? null,
      diagnostico: body?.diagnostico ?? null,
      tratamiento: body?.tratamiento ?? null,
      proximo_control: body?.proximo_control ?? null,
      observaciones: body?.observaciones ?? null,
    };

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("consultas")
      .insert(insert)
      .select("id, mascota_id, fecha")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// PUT /api/consultas { id, ...campos }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id ? String(body.id) : null;
    if (!id) return NextResponse.json({ ok: false, error: "id requerido" }, { status: 400 });

    const updates: any = {};
    for (const k of ["fecha","motivo","tipo_atencion","anamnesis","diagnostico","tratamiento","proximo_control","observaciones"]) {
      if (k in body) updates[k] = body[k] ?? null;
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ ok: false, error: "Sin cambios" }, { status: 400 });

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("consultas")
      .update(updates)
      .eq("id", id)
      .select("id, mascota_id, fecha")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}


