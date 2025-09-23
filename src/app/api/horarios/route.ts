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
      .select(`
        id, 
        inicio, 
        fin, 
        reservado, 
        veterinario_id,
        veterinario:veterinario_id (
          id, 
          nombre, 
          especialidad
        ),
        citas (
          id, 
          tutor_nombre, 
          servicio_id,
          servicios:servicio_id (
            id, 
            nombre
          )
        )
      `)
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

// Crear horarios (uno o en lote)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supa = supabaseServer();

    // Modalidad 1: crear uno
    if (body && body.inicio && body.fin && body.veterinarioId) {
      const nuevo = {
        inicio: new Date(body.inicio).toISOString(),
        fin: new Date(body.fin).toISOString(),
        reservado: false,
        veterinario_id: String(body.veterinarioId),
      };
      const { data, error } = await supa
        .from("horarios")
        .insert(nuevo)
        .select("id, inicio, fin, reservado, veterinario_id")
        .single();
      if (error) throw error;
      return NextResponse.json({ ok: true, data }, { status: 201 });
    }

    // Modalidad 2: generar por rango en una fecha
    const {
      fecha, // YYYY-MM-DD (alias: fechaDesde)
      fechaDesde,
      fechaHasta, // YYYY-MM-DD (opcional, para multidía)
      horaInicio, // "09:00"
      horaFin, // "13:00"
      duracionMin = 30,
      gapMin = 0,
      veterinarioId,
      evitarSolapamientos = true,
    } = body || {};

    const fechaBase = fecha || fechaDesde;

    if (!fechaBase || !horaInicio || !horaFin || !veterinarioId) {
      return NextResponse.json(
        { ok: false, error: "Parámetros inválidos. Requiere fecha/fechaDesde, horaInicio, horaFin y veterinarioId" },
        { status: 400 }
      );
    }

    const toISO = (dt: Date) => new Date(dt).toISOString();
    const [yy, mm, dd] = String(fechaBase).split("-").map((n: string) => parseInt(n, 10));
    const [hStart, minStart] = String(horaInicio).split(":").map((n: string) => parseInt(n, 10));
    const [hEnd, minEnd] = String(horaFin).split(":").map((n: string) => parseInt(n, 10));

    // Importante: usar hora local para evitar desfase por UTC
    const startDay = new Date(yy, (mm || 1) - 1, dd || 1, 0, 0, 0, 0);
    const endDay   = new Date(yy, (mm || 1) - 1, dd || 1, 23, 59, 59, 999);

    const rangeEnd = (() => {
      if (!fechaHasta) return startDay;
      const [Y2, M2, D2] = String(fechaHasta).split("-").map((n: string) => parseInt(n, 10));
      return new Date(Y2, (M2 || 1) - 1, D2 || 1, 0, 0, 0, 0);
    })();

    function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

    const generated: Array<{ inicio: string; fin: string; reservado: boolean; veterinario_id: string }> = [];
    const stepMs = (Number(duracionMin) || 30) * 60 * 1000;
    const gapMs = (Number(gapMin) || 0) * 60 * 1000;

    // Iterar días desde fechaBase hasta fechaHasta (si existe)
    for (
      let day = new Date(startDay);
      day <= (fechaHasta ? rangeEnd : startDay);
      day = addDays(day, 1)
    ) {
      let cursor = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hStart || 0, minStart || 0, 0, 0);
      const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hEnd || 0, minEnd || 0, 0, 0);

      while (cursor < end) {
        const inicio = new Date(cursor);
        const fin = new Date(cursor.getTime() + stepMs);
        if (fin > end) break;

        if (evitarSolapamientos) {
          // Check de solapamiento: inicio < finExistente Y fin > inicioExistente
          const { data: overlap, error: ovErr } = await supa
            .from("horarios")
            .select("id")
            .eq("veterinario_id", String(veterinarioId))
            .lt("inicio", toISO(fin))
            .gt("fin", toISO(inicio))
            .limit(1);
          if (ovErr) throw ovErr;
          if (overlap && overlap.length > 0) {
            cursor = new Date(fin.getTime() + gapMs);
            continue; // saltar este slot
          }
        }

        generated.push({
          inicio: toISO(inicio),
          fin: toISO(fin),
          reservado: false,
          veterinario_id: String(veterinarioId),
        });
        cursor = new Date(fin.getTime() + gapMs);
      }
    }

    if (generated.length === 0) {
      return NextResponse.json({ ok: false, error: "No se generaron slots con ese rango." }, { status: 400 });
    }

    const { data, error } = await supa
      .from("horarios")
      .insert(generated)
      .select("id, inicio, fin, reservado, veterinario_id");
    if (error) throw error;
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}

// Eliminar uno o varios horarios
export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.ids)
      ? body.ids
      : body?.id
      ? [body.id]
      : [];
    const supa = supabaseServer();

    // Modalidad 1: por ids
    if (ids.length > 0) {
      const { error } = await supa.from("horarios").delete().in("id", ids);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    // Modalidad 2: eliminar libres por día y veterinario
    const { fecha, veterinarioId, soloLibres = true } = body || {};
    if (!fecha || !veterinarioId) {
      return NextResponse.json({ ok: false, error: "Se requieren ids o (fecha y veterinarioId)" }, { status: 400 });
    }

    const [y, m, d] = String(fecha).split("-").map((n: string) => parseInt(n, 10));
    const from = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0).toISOString();
    const to = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999).toISOString();

    let del = supa
      .from("horarios")
      .delete()
      .eq("veterinario_id", String(veterinarioId))
      .gte("inicio", from)
      .lte("fin", to);
    if (soloLibres) del = del.eq("reservado", false);

    const { error } = await del;
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}

// Reasignar horarios (ids) a otro veterinario
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ids, toVeterinarioId } = body || {};
    if (!Array.isArray(ids) || ids.length === 0 || !toVeterinarioId) {
      return NextResponse.json({ ok: false, error: "Se requieren ids[] y toVeterinarioId" }, { status: 400 });
    }
    const supa = supabaseServer();
    const { data, error } = await supa
      .from("horarios")
      .update({ veterinario_id: String(toVeterinarioId) })
      .in("id", ids)
      .eq("reservado", false)
      .select("id, veterinario_id");
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 400 });
  }
}
