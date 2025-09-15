import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET: lista completa de servicios
export async function GET(req: Request) {
  try {
    const supa = supabaseServer();
    const { data, error } = await supa
      .from("servicios")
      .select("id, nombre, descripcion, precio_clp, duracion_min, creado_en, image_url")
      .order("creado_en", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("API /servicios GET error:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// POST: crear servicio
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, descripcion, precio_clp, duracion_min } = body || {};
    if (!nombre) {
      return NextResponse.json({ ok: false, error: "nombre es requerido" }, { status: 400 });
    }
    const supa = supabaseServer();
    const { data, error } = await supa
      .from("servicios")
      .insert({ nombre, descripcion, precio_clp, duracion_min })
      .select("id, nombre, descripcion, precio_clp, duracion_min, creado_en, image_url")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err: any) {
    console.error("API /servicios POST error:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// PUT: actualizar servicio
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, descripcion, precio_clp, duracion_min, image_url } = body || {};
    if (!id) {
      return NextResponse.json({ ok: false, error: "id es requerido" }, { status: 400 });
    }
    const fields: Record<string, any> = {};
    if (nombre !== undefined) fields.nombre = nombre;
    if (descripcion !== undefined) fields.descripcion = descripcion;
    if (precio_clp !== undefined) fields.precio_clp = precio_clp;
    if (duracion_min !== undefined) fields.duracion_min = duracion_min;
    if (image_url !== undefined) fields.image_url = image_url;

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("servicios")
      .update(fields)
      .eq("id", id)
      .select("id, nombre, descripcion, precio_clp, duracion_min, creado_en, image_url")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("API /servicios PUT error:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// DELETE: eliminar servicio
export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = body || {};
    if (!id) {
      return NextResponse.json({ ok: false, error: "id es requerido" }, { status: 400 });
    }
    const supa = supabaseServer();
    const { error } = await supa.from("servicios").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("API /servicios DELETE error:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
