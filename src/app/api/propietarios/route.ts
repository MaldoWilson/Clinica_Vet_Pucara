import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET /api/propietarios?rut=11111111-1 | ?id=123
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rut = searchParams.get("rut");
    const id = searchParams.get("id");
    const supa = supabaseServer();

    if (!rut && !id) {
      return NextResponse.json({ ok: false, error: "Falta rut o id" }, { status: 400 });
    }

    const query = supa
      .from("propietario")
      .select("propietario_id, nombre, apellido, rut, telefono, direccion, correo_electronico, created_at")
      .limit(1);

    const { data, error } = id
      ? await query.eq("propietario_id", id)
      : await query.eq("rut", rut);

    if (error) throw error;
    const owner = (data || [])[0] || null;
    return NextResponse.json({ ok: true, data: owner });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// POST /api/propietarios  { nombre, apellido, rut, telefono?, direccion?, correo_electronico? }
// Si existe por rut, retorna el existente (idempotente)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nombre = String(body?.nombre || "").trim();
    const apellido = String(body?.apellido || "").trim();
    const rut = String(body?.rut || "").trim();
    const telefono = body?.telefono ? String(body.telefono) : null;
    const direccion = body?.direccion ? String(body.direccion) : null;
    const correo_electronico = body?.correo_electronico ? String(body.correo_electronico) : null;

    if (!nombre || !apellido || !rut) {
      return NextResponse.json({ ok: false, error: "nombre, apellido y rut son obligatorios" }, { status: 400 });
    }

    const supa = supabaseServer();

    // Primero intentar obtener por RUT
    const { data: existing, error: selErr } = await supa
      .from("propietario")
      .select("propietario_id, nombre, apellido, rut, telefono, direccion, correo_electronico, created_at")
      .eq("rut", rut)
      .limit(1);
    if (selErr) throw selErr;
    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, data: existing[0], existed: true }, { status: 200 });
    }

    const { data, error } = await supa
      .from("propietario")
      .insert({ nombre, apellido, rut, telefono, direccion, correo_electronico })
      .select("propietario_id, nombre, apellido, rut, telefono, direccion, correo_electronico, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    // Manejar UNIQUE rut
    if (String(e?.message || e).toLowerCase().includes("duplicate")) {
      return NextResponse.json({ ok: false, error: "RUT ya registrado" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}


