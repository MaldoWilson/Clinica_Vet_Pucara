import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// Estructura de la tabla en Supabase (public.stock)
// id | nombre | categoria | cantidad | stock_min | unidad | precio | estado | created_at

function computeStatus(cantidad: number, stockMin: number): "OK" | "BAJO" | "CRITICO" {
  const qty = Number(cantidad || 0);
  const min = Number(stockMin || 0);
  if (qty <= 0) return "CRITICO";
  if (qty < Math.max(1, min * 0.3)) return "CRITICO";
  if (qty < min) return "BAJO";
  return "OK";
}

export async function GET(request: NextRequest) {
  try {
    const supa = supabaseServer();
    const url = new URL(request.url);

    // Permite filtros simples por categoria/estado y búsqueda por nombre
    const categoria = url.searchParams.get("categoria");
    const estado = url.searchParams.get("estado");
    const q = url.searchParams.get("q");

    let query = supa
      .from("stock")
      .select("id, nombre, categoria, cantidad, stock_min, unidad, precio, estado, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (categoria) query = query.eq("categoria", categoria);
    if (estado) query = query.eq("estado", estado);
    if (q) query = query.ilike("nombre", `%${q}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ ok: true, data, count: count || 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const nuevo = {
      nombre: String(body?.nombre || "").trim(),
      categoria: String(body?.categoria || "").trim(),
      cantidad: Number(body?.cantidad ?? 0),
      stock_min: Number(body?.stock_min ?? 0),
      unidad: String(body?.unidad || "").trim(),
      precio: Number(body?.precio ?? 0),
      estado: String(body?.estado || "OK").trim() || "OK",
    };

    if (!nuevo.nombre || !nuevo.categoria || !nuevo.unidad || !(Number.isFinite(nuevo.precio)) || !(Number.isFinite(nuevo.stock_min))) {
      return NextResponse.json({ ok: false, error: "Campos obligatorios faltantes" }, { status: 400 });
    }

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("stock")
      .insert(nuevo)
      .select("id, nombre, categoria, cantidad, stock_min, unidad, precio, estado, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    if (!id) return NextResponse.json({ ok: false, error: "id requerido" }, { status: 400 });

    const updates: any = {};
    if (typeof body?.nombre === "string") updates.nombre = body.nombre.trim();
    if (typeof body?.categoria === "string") updates.categoria = body.categoria.trim();
    if (typeof body?.cantidad !== "undefined") updates.cantidad = Number(body.cantidad ?? 0);
    if (typeof body?.stock_min !== "undefined") updates.stock_min = Number(body.stock_min ?? 0);
    if (typeof body?.unidad === "string") updates.unidad = body.unidad.trim();
    if (typeof body?.precio !== "undefined") updates.precio = Number(body.precio ?? 0);
    if (typeof body?.estado === "string") updates.estado = body.estado.trim();

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("stock")
      .update(updates)
      .eq("id", id)
      .select("id, nombre, categoria, cantidad, stock_min, unidad, precio, estado, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}

// PATCH: ajustar cantidad +/- 1 (o delta específico)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const deltaRaw = body?.delta;
    const delta = typeof deltaRaw === "number" ? deltaRaw : (body?.action === "decrement" ? -1 : 1);
    if (!id || !Number.isFinite(delta)) {
      return NextResponse.json({ ok: false, error: "id y delta requeridos" }, { status: 400 });
    }

    const supa = supabaseServer();
    // Leer fila actual
    const { data: current, error: getErr } = await supa
      .from("stock")
      .select("id, cantidad, stock_min")
      .eq("id", id)
      .single();
    if (getErr || !current) throw getErr || new Error("No encontrado");

    const newCantidad = Math.max(0, Number(current.cantidad || 0) + Number(delta));
    const newEstado = computeStatus(newCantidad, Number(current.stock_min || 0));

    const { data, error } = await supa
      .from("stock")
      .update({ cantidad: newCantidad, estado: newEstado })
      .eq("id", id)
      .select("id, nombre, categoria, cantidad, stock_min, unidad, precio, estado, created_at")
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    if (!id) return NextResponse.json({ ok: false, error: "id requerido" }, { status: 400 });

    const supa = supabaseServer();
    const { error } = await supa.from("stock").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}


