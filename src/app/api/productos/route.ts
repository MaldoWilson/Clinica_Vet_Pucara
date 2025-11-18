import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const tipo = searchParams.get('tipo'); // Filter by product type

    // Obtener productos: si all=true, traer todos; de lo contrario, solo públicos
    let query = supabase
      .from('productos')
      .select('*, categorias(id, nombre)')
      .order('created_at', { ascending: false });

    if (!all) {
      query = query.eq('es_publico', true);
    }

    if (tipo) {
      query = query.eq('tipo_producto', tipo);
    }

    const { data: productos, error } = await query;

    if (error) {
      console.error('Error al obtener productos:', error);
      return NextResponse.json(
        { error: 'Error al obtener los productos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ productos });
  } catch (error) {
    console.error('Error en API de productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre: string = (body?.nombre || "").toString();
    const descripcion: string = (body?.descripcion || "").toString();
    const precio: number = Number(body?.precio || 0);
    const sku: string = (body?.sku || "").toString();
    const categoria_id: number | null = body?.categoria_id ? Number(body.categoria_id) : null;
    const stock: number = Number(body?.stock || 0);
    const es_publico: boolean = !!body?.publico;
    const imagen_principal: string | null = body?.imagen_principal ? String(body.imagen_principal) : null;
    const imagenes: string[] = Array.isArray(body?.imagenes) ? body.imagenes : [];

    // New fields
    const stock_min: number = Number(body?.stock_min || 5);
    const unidad: string = (body?.unidad || "unidad").toString();
    const tipo_producto: string = (body?.tipo_producto || "VENTA_GENERAL").toString();
    const controlar_lotes: boolean = !!body?.controlar_lotes;

    if (!nombre.trim() || !sku.trim() || precio < 0 || stock < 0) {
      return NextResponse.json(
        { error: 'Nombre, SKU, precio y stock son obligatorios y deben ser válidos' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre,
        descripcion,
        precio,
        sku,
        categoria_id,
        stock,
        es_publico,
        imagen_principal,
        imagenes,
        stock_min,
        unidad,
        tipo_producto,
        controlar_lotes
      }])
      .select('*, categorias(id, nombre)')
      .single();

    if (error) {
      console.error('Error al crear producto:', error);
      return NextResponse.json(
        { error: 'No se pudo crear el producto' },
        { status: 500 }
      );
    }

    return NextResponse.json({ producto: data }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id: string = String(body?.id || "");
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    const updates: any = {};
    if (typeof body?.nombre === 'string') updates.nombre = body.nombre;
    if (typeof body?.descripcion === 'string') updates.descripcion = body.descripcion;
    if (typeof body?.precio === 'number') updates.precio = body.precio;
    if (typeof body?.sku === 'string') updates.sku = body.sku;
    if (typeof body?.categoria_id === 'number') updates.categoria_id = body.categoria_id;
    if (typeof body?.stock === 'number') updates.stock = body.stock;
    if (typeof body?.publico === 'boolean') updates.es_publico = body.publico;
    if (typeof body?.imagen_principal !== 'undefined') updates.imagen_principal = body.imagen_principal ? String(body.imagen_principal) : null;
    if (Array.isArray(body?.imagenes)) updates.imagenes = body.imagenes;

    // New fields updates
    if (typeof body?.stock_min === 'number') updates.stock_min = body.stock_min;
    if (typeof body?.unidad === 'string') updates.unidad = body.unidad;
    if (typeof body?.tipo_producto === 'string') updates.tipo_producto = body.tipo_producto;
    if (typeof body?.controlar_lotes === 'boolean') updates.controlar_lotes = body.controlar_lotes;

    updates.updated_at = new Date().toISOString();

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select('*, categorias(id, nombre)')
      .single();

    if (error) {
      console.error('Error al actualizar producto:', error);
      return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 500 });
    }

    return NextResponse.json({ producto: data });
  } catch (error) {
    console.error('Error en PUT /api/productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id: string = String(body?.id || "");
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    const supabase = supabaseServer();
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar producto:', error);
      return NextResponse.json({ error: 'No se pudo eliminar el producto' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error en DELETE /api/productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
