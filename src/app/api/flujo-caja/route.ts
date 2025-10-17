import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// GET - Obtener registros de flujo de caja
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 100);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);
    const mes = url.searchParams.get("mes"); // Formato: YYYY-MM
    
    const supa = supabaseServer();
    
    // Obtener registros con paginación
    let query = supa
      .from("flujo_caja")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    
    // Filtrar por mes si se especifica
    if (mes) {
      const [year, month] = mes.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
      query = query
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(
      {
        ok: true,
        data,
        meta: { limit, offset, count: count || 0, mes }
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || String(e) },
      { status: 400 }
    );
  }
}

// POST - Crear nuevo registro
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // El día se calcula automáticamente desde created_at, no se recibe del formulario

    const supa = supabaseServer();

    const nuevoRegistro = {
      tipo: body.tipo,
      categoria: body.categoria || null,
      nombre: body.nombre || null,
      efectivo: parseFloat(body.efectivo) || 0,
      debito: parseFloat(body.debito) || 0,
      credito: parseFloat(body.credito) || 0,
      transferencia: parseFloat(body.transferencia) || 0,
      deuda: parseFloat(body.deuda) || 0,
      egreso: parseFloat(body.egreso) || 0,
      dr: body.dr || null,
    };
    
    const { data, error } = await supa
      .from("flujo_caja")
      .insert(nuevoRegistro)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(
      { ok: true, data },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || String(e) },
      { status: 400 }
    );
  }
}

// PUT - Actualizar registro existente
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json(
        { ok: false, error: "Se requiere el ID del registro" },
        { status: 400 }
      );
    }
    
    // El día se calcula automáticamente desde created_at, no se recibe del formulario

    const supa = supabaseServer();

    const registroActualizado = {
      tipo: body.tipo,
      categoria: body.categoria || null,
      nombre: body.nombre || null,
      efectivo: parseFloat(body.efectivo) || 0,
      debito: parseFloat(body.debito) || 0,
      credito: parseFloat(body.credito) || 0,
      transferencia: parseFloat(body.transferencia) || 0,
      deuda: parseFloat(body.deuda) || 0,
      egreso: parseFloat(body.egreso) || 0,
      dr: body.dr || null,
    };
    
    const { data, error } = await supa
      .from("flujo_caja")
      .update(registroActualizado)
      .eq("id", body.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || String(e) },
      { status: 400 }
    );
  }
}

// DELETE - Eliminar registro
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json(
        { ok: false, error: "Se requiere el ID del registro" },
        { status: 400 }
      );
    }
    
    const supa = supabaseServer();
    
    const { error } = await supa
      .from("flujo_caja")
      .delete()
      .eq("id", body.id);
    
    if (error) throw error;
    
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || String(e) },
      { status: 400 }
    );
  }
}

