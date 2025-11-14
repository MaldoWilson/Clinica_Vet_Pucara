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
