import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
    try {
        const supabase = supabaseServer();
        const { searchParams } = new URL(request.url);
        const producto_id = searchParams.get('producto_id');
        const limit = Number(searchParams.get('limit') || 50);

        let query = supabase
            .from('movimientos_stock')
            .select(`
        *,
        productos (
          nombre,
          sku
        ),
        inventario_lotes (
          numero_lote
        )
      `)
            .order('fecha', { ascending: false })
            .limit(limit);

        if (producto_id) {
            query = query.eq('producto_id', producto_id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error al obtener movimientos:', error);
            return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error en API movimientos:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
