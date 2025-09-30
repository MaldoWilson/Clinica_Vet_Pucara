import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET /api/mascotas/antecedentes?mascotas_id=123
// Devuelve los antecedentes de la mascota. Si no existen, entrega valores vacíos.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mascotas_id = searchParams.get("mascotas_id") || searchParams.get("id");
    if (!mascotas_id) {
      return NextResponse.json({ ok: false, error: "mascotas_id requerido" }, { status: 400 });
    }

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("mascota_antecedentes")
      .select(
        "mascotas_id, origen, habitat, comportamiento, enfermedades, alergias, observaciones, alertas, updated_at"
      )
      .eq("mascotas_id", mascotas_id)
      .limit(1);

    if (error) throw error;
    const row = (data || [])[0] || null;
    const safe = row || {
      mascotas_id: String(mascotas_id),
      origen: null,
      habitat: null,
      comportamiento: null,
      enfermedades: null,
      alergias: null,
      observaciones: null,
      alertas: [],
      updated_at: null,
    };
    return NextResponse.json({ ok: true, data: safe });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// PUT /api/mascotas/antecedentes
// Body: { mascotas_id, origen?, habitat?, comportamiento?, enfermedades?, alergias?, observaciones?, alertas?: string[] }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const mascotas_id = body?.mascotas_id ? String(body.mascotas_id) : null;
    if (!mascotas_id) {
      return NextResponse.json({ ok: false, error: "mascotas_id requerido" }, { status: 400 });
    }

    const payload: any = { mascotas_id };
    if (typeof body.origen === "string") payload.origen = body.origen.trim();
    if (typeof body.habitat === "string") payload.habitat = body.habitat.trim();
    if (typeof body.comportamiento === "string") payload.comportamiento = body.comportamiento.trim();
    if (typeof body.enfermedades === "string") payload.enfermedades = body.enfermedades.trim();
    if (typeof body.alergias === "string") payload.alergias = body.alergias.trim();
    if (typeof body.observaciones === "string") payload.observaciones = body.observaciones.trim();
    if (Array.isArray(body.alertas)) payload.alertas = body.alertas.map((a: any) => String(a)).filter((s: string) => s.length > 0);

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("mascota_antecedentes")
      .upsert(payload, { onConflict: "mascotas_id" })
      .select(
        "mascotas_id, origen, habitat, comportamiento, enfermedades, alergias, observaciones, alertas, updated_at"
      )
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

/*
-- SQL sugerido para Supabase (si la tabla no existe)
create table if not exists public.mascota_antecedentes (
  mascotas_id bigint primary key references public.mascotas(mascotas_id) on delete cascade,
  origen text,
  habitat text,
  comportamiento text,
  enfermedades text,
  alergias text,
  observaciones text,
  alertas jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
*/

