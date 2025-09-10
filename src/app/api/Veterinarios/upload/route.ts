import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const veterinarioId = (form.get("veterinarioId") as string | null)?.trim();

    if (!veterinarioId) return NextResponse.json({ error: "veterinarioId requerido" }, { status: 400 });
    if (!file) return NextResponse.json({ error: "file requerido" }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Tipo no permitido" }, { status: 415 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Imagen > 4MB" }, { status: 413 });

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `veterinarios/${veterinarioId}-${Date.now()}.${ext}`;

    const supabase = supabaseServer();
    const buf = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, buf, { cacheControl: "3600", upsert: true, contentType: file.type });
    if (upErr) return NextResponse.json({ error: `Error al subir: ${upErr.message}` }, { status: 500 });

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    const foto_url = pub?.publicUrl;

    const { error: updErr } = await supabase
      .from("veterinarios")
      .update({ foto_url })
      .eq("id", veterinarioId);
    if (updErr) return NextResponse.json({ error: `No se pudo actualizar: ${updErr.message}` }, { status: 500 });

    return NextResponse.json({ ok: true, foto_url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error inesperado" }, { status: 500 });
  }
}
