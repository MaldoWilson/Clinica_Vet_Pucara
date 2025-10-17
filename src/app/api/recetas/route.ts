import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET /api/recetas?consulta_id=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const consultaId = searchParams.get("consulta_id");
    if (!consultaId) return NextResponse.json({ ok: false, error: "consulta_id requerido" }, { status: 400 });
    const supa = supabaseServer();
    const { data: recetas, error } = await supa
      .from("recetas")
      .select("id, consulta_id, fecha, peso, notas, emitida_por, created_at")
      .eq("consulta_id", consultaId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const recetaIds = (recetas || []).map(r => r.id);
    let itemsByReceta: Record<string, any[]> = {};
    if (recetaIds.length > 0) {
      const { data: items, error: itemsErr } = await supa
        .from("receta_items")
        .select("id, receta_id, nombre_medicamento, dosis, via, frecuencia, duracion, instrucciones, created_at")
        .in("receta_id", recetaIds as any);
      if (itemsErr) throw itemsErr;
      itemsByReceta = (items || []).reduce((acc: any, it: any) => {
        const key = String(it.receta_id);
        (acc[key] ||= []).push(it);
        return acc;
      }, {});
    }

    const out = (recetas || []).map(r => ({ ...r, items: itemsByReceta[String(r.id)] || [] }));
    return NextResponse.json({ ok: true, data: out });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// POST /api/recetas  { consulta_id, peso?, notas?, items?: [...] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const consulta_id = body?.consulta_id ? String(body.consulta_id) : null;
    if (!consulta_id) return NextResponse.json({ ok: false, error: "consulta_id requerido" }, { status: 400 });
    const supa = supabaseServer();

    const insert: any = {
      consulta_id,
      peso: body?.peso ?? null,
      notas: body?.notas ?? null,
      emitida_por: body?.emitida_por ?? null,
    };

    const { data: receta, error } = await supa
      .from("recetas")
      .insert(insert)
      .select("id, consulta_id, fecha")
      .single();
    if (error) throw error;

    const items = Array.isArray(body?.items) ? body.items : [];
    if (items.length > 0) {
      const rows = items.map((it: any) => ({
        receta_id: receta.id,
        nombre_medicamento: String(it?.nombre_medicamento || "").trim(),
        dosis: String(it?.dosis || "").trim(),
        via: it?.via ?? null,
        frecuencia: it?.frecuencia ?? null,
        duracion: it?.duracion ?? null,
        instrucciones: it?.instrucciones ?? null,
      })).filter((r: any) => r.nombre_medicamento && r.dosis);
      if (rows.length > 0) {
        const { error: itemsErr } = await supa.from("receta_items").insert(rows);
        if (itemsErr) throw itemsErr;
      }
    }

    return NextResponse.json({ ok: true, data: receta });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// PUT /api/recetas  { id, peso?, notas?, items?: [...], emitida_por? }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id ? String(body.id) : null;
    if (!id) return NextResponse.json({ ok: false, error: "id requerido" }, { status: 400 });
    const supa = supabaseServer();

    const update: any = {};
    if (body?.peso !== undefined) update.peso = body?.peso ?? null;
    if (body?.notas !== undefined) update.notas = body?.notas ?? null;
    if (body?.emitida_por !== undefined) update.emitida_por = body?.emitida_por ?? null;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: false, error: "No hay campos para actualizar" }, { status: 400 });
    }

    const { data: receta, error } = await supa
      .from("recetas")
      .update(update)
      .eq("id", id)
      .select("id, consulta_id, fecha, peso, notas, emitida_por, created_at")
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, data: receta });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}


