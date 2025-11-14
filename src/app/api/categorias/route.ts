import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener categorias:', error);
      return NextResponse.json(
        { error: 'Error al obtener las categorias' },
        { status: 500 }
      );
    }

    return NextResponse.json({ categorias: data });
  } catch (error) {
    console.error('Error en API de categorias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre: string = (body?.nombre || "").toString().trim();

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Check if category already exists (case-insensitive)
    const { data: existing, error: existingError } = await supabase
      .from('categorias')
      .select('nombre')
      .ilike('nombre', nombre);

    if (existingError) {
      console.error('Error al verificar categoría existente:', existingError);
      throw new Error('Error al verificar categoría existente');
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'La categoría ya existe' },
        { status: 409 } // 409 Conflict
      );
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre }])
      .select('id, nombre')
      .single();

    if (error) {
      console.error('Error al crear categoría:', error);
      return NextResponse.json(
        { error: 'No se pudo crear la categoría' },
        { status: 500 }
      );
    }

    return NextResponse.json({ categoria: data }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/categorias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
