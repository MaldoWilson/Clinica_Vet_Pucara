import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    
    // Obtener blogs públicos ordenados por fecha de creación (más recientes primero)
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('id, created_at, titulo, contenido')
      .eq('publico', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener blogs:', error);
      return NextResponse.json(
        { error: 'Error al obtener los blogs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Error en API de blogs:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
