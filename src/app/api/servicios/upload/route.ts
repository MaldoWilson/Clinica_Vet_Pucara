// src/app/api/servicios/upload/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'media';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const servicioId = (form.get('servicioId') as string | null)?.trim();

    if (!servicioId) return NextResponse.json({ error: 'servicioId requerido' }, { status: 400 });
    if (!file)       return NextResponse.json({ error: 'file requerido' }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'Tipo no permitido' }, { status: 415 });
    if (file.size > MAX_SIZE)    return NextResponse.json({ error: 'Imagen > 4MB' }, { status: 413 });

    const supabase = supabaseServer();

    // 1) Asegura que el bucket exista (útil si hay confusión de proyecto/env)
    const { data: bucketInfo } = await supabase.storage.getBucket(BUCKET);
    if (!bucketInfo) {
      // si tienes SERVICE_ROLE, esto lo crea; si no, devuelve error amigable
      await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});
      const { data: again } = await supabase.storage.getBucket(BUCKET);
      if (!again) {
        return NextResponse.json({ error: `Bucket "${BUCKET}" no existe en este proyecto` }, { status: 500 });
      }
    }

    // 2) Subida
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `servicios/${servicioId}-${Date.now()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buf, { cacheControl: '3600', upsert: true, contentType: file.type });
    if (upErr) return NextResponse.json({ error: `Error al subir: ${upErr.message}` }, { status: 500 });

    // 3) URL pública y actualización en BD
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const image_url = pub?.publicUrl;

    const { error: updErr } = await supabase
      .from('servicios')
      .update({ image_url })
      .eq('id', servicioId);
    if (updErr) return NextResponse.json({ error: `No se pudo actualizar: ${updErr.message}` }, { status: 500 });

    return NextResponse.json({ ok: true, image_url, path });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || 'Error inesperado' }, { status: 500 });
  }
}
