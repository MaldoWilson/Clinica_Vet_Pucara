import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    // Obtener blogs: si all=true, traer todos; de lo contrario, solo públicos
    let query = supabase
      .from('blogs')
      .select('id, created_at, titulo, contenido, publico, image_url')
      .order('created_at', { ascending: false });

    if (!all) {
      query = query.eq('publico', true);
    }

    const { data: blogs, error } = await query;

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const titulo: string = (body?.titulo || "").toString();
    const contenido: string = (body?.contenido || "").toString();
    const publico: boolean = Boolean(body?.publico);

    if (!titulo.trim() || !contenido.trim()) {
      return NextResponse.json(
        { error: 'Título y contenido son obligatorios' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const image_url: string | null = body?.image_url ? String(body.image_url) : null;

    const { data, error } = await supabase
      .from('blogs')
      .insert([{ titulo, contenido, publico, image_url }])
      .select('id, created_at, titulo, contenido, publico, image_url')
      .single();

    if (error) {
      console.error('Error al crear blog:', error);
      return NextResponse.json(
        { error: 'No se pudo crear el blog' },
        { status: 500 }
      );
    }

    return NextResponse.json({ blog: data }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/blogs:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
