import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET /api/consultas?mascota_id=...  -> lista por fecha desc
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const mascotaId = searchParams.get("mascota_id");
    const supa = supabaseServer();

    if (id) {
      const { data, error } = await supa
        .from("consultas")
        .select("id, mascota_id, veterinario_id, fecha, motivo, tipo_atencion, anamnesis, diagnostico, tratamiento, proximo_control, observaciones, created_at")
        .eq("id", id)
        .single();
      if (error) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
      return NextResponse.json({ ok: true, data });
    }

    if (!mascotaId) {
      return NextResponse.json({ ok: false, error: "mascota_id requerido" }, { status: 400 });
    }
    const { data, error } = await supa
      .from("consultas")
      .select("id, mascota_id, veterinario_id, fecha, motivo, tipo_atencion, anamnesis, diagnostico, tratamiento, proximo_control, observaciones, created_at")
      .eq("mascota_id", mascotaId)
      .order("created_at", { ascending: false });
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
      proximo_control: (body?.proximo_control && body.proximo_control.trim() !== "") ? body.proximo_control : null,
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
      if (k in body) {
        if (k === "proximo_control") {
          updates[k] = (body[k] && body[k].trim() !== "") ? body[k] : null;
        } else {
          updates[k] = body[k] ?? null;
        }
      }
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

// DELETE /api/consultas { id }
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id ? String(body.id) : null;
    if (!id) return NextResponse.json({ ok: false, error: "id requerido" }, { status: 400 });
    const supa = supabaseServer();
    const { error } = await supa.from("consultas").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}


