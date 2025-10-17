export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'media';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: 'id requerido' }), { status: 400 });
    }

    const supa = supabaseServer();
    const { data: row, error: rowErr } = await supa
      .from('archivos_adjuntos')
      .select('id, nombre_archivo, tipo_archivo, url_archivo')
      .eq('id', id)
      .single();
    if (rowErr || !row) {
      return new Response(JSON.stringify({ ok: false, error: 'No encontrado' }), { status: 404 });
    }
    if (row.tipo_archivo !== 'Certificado') {
      return new Response(JSON.stringify({ ok: false, error: 'Tipo no permitido' }), { status: 400 });
    }
    const url = String(row.url_archivo || '').trim();
    if (!url) {
      return new Response(JSON.stringify({ ok: false, error: 'url_archivo vacío' }), { status: 400 });
    }

    // Estrategia: si es URL absoluta, descargar via fetch servidor; si no, intentar Storage.download en DEFAULT_BUCKET
    let arrayBuffer: ArrayBuffer | null = null;
    if (/^https?:\/\//i.test(url)) {
      const r = await fetch(url);
      if (!r.ok) {
        return new Response(JSON.stringify({ ok: false, error: `No se pudo descargar: ${r.status}` }), { status: 400 });
      }
      arrayBuffer = await r.arrayBuffer();
    } else {
      const { data: fileData, error: dlErr } = await supa.storage.from(DEFAULT_BUCKET).download(url);
      if (dlErr || !fileData) {
        return new Response(JSON.stringify({ ok: false, error: 'No se pudo descargar desde storage' }), { status: 400 });
      }
      arrayBuffer = await fileData.arrayBuffer();
    }

    return new Response(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || String(e) }), { status: 500 });
  }
}


