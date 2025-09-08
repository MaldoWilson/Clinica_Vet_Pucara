import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

const MAX_SPAN_DAYS = 30;

function toISOOrNull(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slotId = url.searchParams.get("slotId");

    const rawFrom = url.searchParams.get("from");
    const rawTo = url.searchParams.get("to");
    const vetId = url.searchParams.get("veterinarioId");

    const onlyAvailable =
      url.searchParams.get("onlyAvailable") !== "0" &&
      url.searchParams.get("onlyAvailable") !== "false"; // default: true

    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "100", 10), 1), 500);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);

    const nowISO = new Date().toISOString();

    // Normaliza y acota rango
    let from = toISOOrNull(rawFrom) || nowISO;
    let to =
      toISOOrNull(rawTo) ||
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(); // +14 días por defecto

    // Evita rangos > 30 días
    const spanMs = new Date(to).getTime() - new Date(from).getTime();
    const maxMs = MAX_SPAN_DAYS * 24 * 60 * 60 * 1000;
    if (spanMs > maxMs) {
      to = new Date(new Date(from).getTime() + maxMs).toISOString();
    }

    const supa = supabaseServer();

    // ---- Caso 1: pedir un slot específico
    if (slotId) {
      const q = supa
        .from("horarios")
        .select(
          `id, inicio, fin, reservado, veterinario_id, especialidad veterinario:veterinario_id ( id, nombre, especialidad )
`
        )
        .eq("id", slotId)
        .limit(1);

      if (onlyAvailable) q.eq("reservado", false);

      const { data, error } = await q.single();
      if (error) throw error;

      return NextResponse.json(
        { ok: true, data, meta: { slotId, onlyAvailable } },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // ---- Caso 2: lista de slots
    const q = supa
      .from("horarios")
      .select(
        `id, inicio, fin, reservado, veterinario_id, veterinario:veterinario_id ( id, nombre,especialidad )`
      )
      .gte("inicio", from)
      .lte("fin", to)
      .order("inicio", { ascending: true })
      .range(offset, offset + limit - 1);

    if (onlyAvailable) q.eq("reservado", false);
    if (vetId) q.eq("veterinario_id", vetId);

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json(
      {
        ok: true,
        data,
        meta: { from, to, limit, offset, onlyAvailable, veterinarioId: vetId, count: data?.length || 0 },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}
