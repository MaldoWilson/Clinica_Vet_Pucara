import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET: listar veterinarios
export async function GET() {
  try {
    const supa = supabaseServer();
    const { data, error } = await supa
      .from("veterinarios")
      .select("id, nombre, especialidad, foto_url, creado_en")
      .order("creado_en", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// POST: crear veterinario
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, especialidad, foto_url } = body || {};
    if (!nombre || !String(nombre).trim()) {
      return NextResponse.json(
        { ok: false, error: "nombre es requerido" },
        { status: 400 }
      );
    }
    if (!especialidad || !String(especialidad).trim()) {
      return NextResponse.json(
        { ok: false, error: "especialidad es requerida" },
        { status: 400 }
      );
    }
    const supa = supabaseServer();
    const { data, error } = await supa
      .from("veterinarios")
      .insert({ nombre: String(nombre).trim(), especialidad: String(especialidad).trim(), foto_url: foto_url ?? null })
      .select("id, nombre, especialidad, foto_url, creado_en")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// PUT: actualizar veterinario
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, especialidad, foto_url } = body || {};
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "id es requerido" },
        { status: 400 }
      );
    }
    const fields: Record<string, any> = {};
    if (nombre !== undefined) fields.nombre = String(nombre);
    if (especialidad !== undefined) fields.especialidad = String(especialidad);
    if (foto_url !== undefined) fields.foto_url = foto_url ?? null;

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("veterinarios")
      .update(fields)
      .eq("id", id)
      .select("id, nombre, especialidad, foto_url, creado_en")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// DELETE: eliminar veterinario
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "id es requerido" },
        { status: 400 }
      );
    }
    const supa = supabaseServer();
    const { error } = await supa.from("veterinarios").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}



