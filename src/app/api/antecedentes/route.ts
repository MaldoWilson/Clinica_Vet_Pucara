import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET /api/antecedentes?mascota_id=... | ?id=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const mascotaId = searchParams.get("mascota_id");
    const supa = supabaseServer();

    if (id) {
      const { data, error } = await supa
        .from("antecedentes")
        .select("id, mascota_id, origen, habitat, comportamiento, enfermedades, alergias, observaciones, alertas, created_at")
        .eq("id", id)
        .single();
      if (error) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
      return NextResponse.json({ ok: true, data });
    }

    if (mascotaId) {
      const { data, error } = await supa
        .from("antecedentes")
        .select("id, mascota_id, origen, habitat, comportamiento, enfermedades, alergias, observaciones, alertas, created_at")
        .eq("mascota_id", mascotaId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error && (error as any).code !== "PGRST116") throw error; // ignora no rows en maybeSingle
      return NextResponse.json({ ok: true, data: data || null });
    }

    return NextResponse.json({ ok: false, error: "Parámetro requerido: mascota_id o id" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// POST /api/antecedentes  Crea o actualiza (si ya existe para la mascota)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mascota_id = body?.mascota_id ? String(body.mascota_id) : null;
    if (!mascota_id) return NextResponse.json({ ok: false, error: "mascota_id requerido" }, { status: 400 });

    const payload: any = {
      origen: body?.origen ?? null,
      habitat: body?.habitat ?? null,
      comportamiento: body?.comportamiento ?? null,
      enfermedades: body?.enfermedades ?? null,
      alergias: body?.alergias ?? null,
      observaciones: body?.observaciones ?? null,
      alertas: body?.alertas ?? null,
    };

    const supa = supabaseServer();
    const { data: existing } = await supa
      .from("antecedentes")
      .select("id")
      .eq("mascota_id", mascota_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await supa
        .from("antecedentes")
        .update({ ...payload })
        .eq("id", existing.id)
        .select("id, mascota_id, origen, habitat, comportamiento, enfermedades, alergias, observaciones, alertas, created_at")
        .single();
      if (error) throw error;
      return NextResponse.json({ ok: true, data });
    }

    const { data, error } = await supa
      .from("antecedentes")
      .insert([{ mascota_id, ...payload }])
      .select("id, mascota_id, origen, habitat, comportamiento, enfermedades, alergias, observaciones, alertas, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// PUT /api/antecedentes { id?, mascota_id?, ...campos }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id ? String(body.id) : null;
    const mascota_id = body?.mascota_id ? String(body.mascota_id) : null;
    const updates: any = {};
    for (const k of ["origen","habitat","comportamiento","enfermedades","alergias","observaciones","alertas"]) {
      if (k in body) updates[k] = body[k] ?? null;
    }
    if (!id && !mascota_id) return NextResponse.json({ ok: false, error: "id o mascota_id requerido" }, { status: 400 });
    if (Object.keys(updates).length === 0) return NextResponse.json({ ok: false, error: "Sin cambios" }, { status: 400 });

    const supa = supabaseServer();
    if (id) {
      const { data, error } = await supa
        .from("antecedentes")
        .update(updates)
        .eq("id", id)
        .select("id, mascota_id, origen, habitat, comportamiento, enfermedades, alergias, observaciones, alertas, created_at")
        .single();
      if (error) throw error;
      return NextResponse.json({ ok: true, data });
    }

    // Si llega mascota_id sin id, actualizamos el registro más reciente de esa mascota
    const { data: existing, error: exErr } = await supa
      .from("antecedentes")
      .select("id")
      .eq("mascota_id", mascota_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (exErr) throw exErr;
    if (!existing) return NextResponse.json({ ok: false, error: "No existe antecedente para la mascota" }, { status: 404 });

    const { data, error } = await supa
      .from("antecedentes")
      .update(updates)
      .eq("id", existing.id as any)
      .select("id, mascota_id, origen, habitat, comportamiento, enfermedades, alergias, observaciones, alertas, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}


