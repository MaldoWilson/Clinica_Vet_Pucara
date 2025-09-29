import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";
import { normalizeRutPlain } from "@/lib/rut";

// GET /api/mascotas?search=...
// Lista mascotas con datos del propietario, con filtro de texto por: nombre mascota, raza, rut, nombre/apellido propietario, sexo
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const id = searchParams.get("id");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, Math.min(50, parseInt(searchParams.get("pageSize") || "9", 10))); // default 9
    const supa = supabaseServer();

    // Si viene id, devolver una sola mascota con propietario
    if (id) {
      const { data: m, error: mErr } = await supa
        .from("mascotas")
        .select("mascotas_id, nombre, especie, raza, sexo, color, fecha_nacimiento, numero_microchip, esterilizado, propietario_id, created_at")
        .eq("mascotas_id", id)
        .single();
      if (mErr) return NextResponse.json({ ok: false, error: "Mascota no encontrada" }, { status: 404 });
      let propietario: any = null;
      if (m?.propietario_id) {
        const { data: o, error: oErr } = await supa
          .from("propietario")
          .select("propietario_id, nombre, apellido, rut, telefono, direccion, correo_electronico")
          .eq("propietario_id", m.propietario_id)
          .single();
        if (!oErr) propietario = o;
      }
      return NextResponse.json({ ok: true, data: { ...m, propietario } });
    }

    // Primero obtenemos todas las mascotas y propietarios necesarios (listado/paginado)
    // Nota: Si hay muchas filas, en el futuro se puede paginar y/o usar RPC/materialized view.
    const { data: mascotas, error } = await supa
      .from("mascotas")
      .select("mascotas_id, nombre, especie, raza, sexo, color, fecha_nacimiento, numero_microchip, esterilizado, propietario_id, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;

    // Cargar propietarios relacionados en un segundo query (evitamos N+1 usando in)
    const ownerIds = Array.from(new Set((mascotas || []).map(m => m.propietario_id).filter(Boolean)));
    let propietariosById: Record<string, any> = {};
    if (ownerIds.length > 0) {
      const { data: owners, error: ownerErr } = await supa
        .from("propietario")
        .select("propietario_id, nombre, apellido, rut, telefono, direccion, correo_electronico")
        .in("propietario_id", ownerIds);
      if (ownerErr) throw ownerErr;
      propietariosById = Object.fromEntries((owners || []).map(o => [String(o.propietario_id), o]));
    }

    const items = (mascotas || []).map(m => ({
      ...m,
      propietario: propietariosById[String(m.propietario_id)] || null,
    }));

    const filtered = search.length === 0 ? items : items.filter((it) => {
      const o = it.propietario || {};
      const especieStr = it.especie === true ? "gato" : it.especie === false ? "perro" : "";
      const fields = [
        String(it.nombre || ""),
        String(it.raza || ""),
        String(o.nombre || ""),
        String(o.apellido || ""),
        String(o.rut || ""),
        // sexo es booleano: true = macho, false = hembra
        it.sexo === true ? "macho" : it.sexo === false ? "hembra" : "",
        especieStr,
      ].join(" ").toLowerCase();
      // soporte a búsqueda por rut sin formato
      const searchRutPlain = normalizeRutPlain(search).toLowerCase();
      return fields.includes(search) || (o.rut || "").toLowerCase().includes(searchRutPlain);
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return NextResponse.json({ ok: true, data, page: safePage, pageSize, total, totalPages });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// POST /api/mascotas  Crea ficha de mascota
// Body: {
//  nombre, especie, raza, sexo (boolean), color, fecha_nacimiento (YYYY-MM-DD), numero_microchip,
//  esterilizado (boolean), propietario_id (bigint)
// }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nombre = String(body?.nombre || "").trim();
    // especie ahora es booleana: gato=true, perro=false
    const especie = typeof body?.especie === "boolean" ? body.especie : null;
    const raza = body?.raza ? String(body.raza) : null;
    const sexo = typeof body?.sexo === "boolean" ? body.sexo : null;
    const color = body?.color ? String(body.color) : null;
    const fecha_nacimiento = body?.fecha_nacimiento ? String(body.fecha_nacimiento) : null; // YYYY-MM-DD
    const numero_microchip = body?.numero_microchip ? String(body.numero_microchip) : null;
    const esterilizado = typeof body?.esterilizado === "boolean" ? body.esterilizado : null;
    const propietario_id = body?.propietario_id ? String(body.propietario_id) : null;

    if (!nombre || !propietario_id) {
      return NextResponse.json({ ok: false, error: "nombre y propietario_id son obligatorios" }, { status: 400 });
    }
    if (especie === null) {
      return NextResponse.json({ ok: false, error: "especie es obligatoria (gato=true, perro=false)" }, { status: 400 });
    }

    // Validación de fecha simple
    if (fecha_nacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)) {
      return NextResponse.json({ ok: false, error: "fecha_nacimiento debe ser YYYY-MM-DD" }, { status: 400 });
    }

    const supa = supabaseServer();

    // Verificar existencia de propietario
    const { data: owner, error: ownerErr } = await supa
      .from("propietario")
      .select("propietario_id")
      .eq("propietario_id", propietario_id)
      .single();
    if (ownerErr) {
      return NextResponse.json({ ok: false, error: "propietario_id inválido" }, { status: 400 });
    }

    const insertObj: any = {
      nombre,
      propietario_id,
      especie, // booleano
    };
    if (raza !== null) insertObj.raza = raza;
    if (sexo !== null) insertObj.sexo = sexo;
    if (color !== null) insertObj.color = color;
    if (fecha_nacimiento !== null) insertObj.fecha_nacimiento = fecha_nacimiento;
    if (numero_microchip !== null) insertObj.numero_microchip = numero_microchip;
    if (esterilizado !== null) insertObj.esterilizado = esterilizado;

    const { data, error } = await supa
      .from("mascotas")
      .insert(insertObj)
      .select("mascotas_id, nombre, especie, raza, sexo, color, fecha_nacimiento, numero_microchip, esterilizado, propietario_id, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}

// PUT /api/mascotas  { mascotas_id, ...campos a actualizar }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const mascotas_id = body?.mascotas_id ? String(body.mascotas_id) : null;
    if (!mascotas_id) return NextResponse.json({ ok: false, error: "mascotas_id requerido" }, { status: 400 });

    const updates: any = {};
    if (typeof body.nombre === "string") updates.nombre = body.nombre.trim();
    if (typeof body.especie === "boolean") updates.especie = body.especie;
    if (typeof body.raza === "string") updates.raza = body.raza.trim();
    if (typeof body.sexo === "boolean") updates.sexo = body.sexo;
    if (typeof body.color === "string") updates.color = body.color.trim();
    if (typeof body.fecha_nacimiento === "string") updates.fecha_nacimiento = body.fecha_nacimiento;
    if (typeof body.numero_microchip === "string") updates.numero_microchip = body.numero_microchip.trim();
    if (typeof body.esterilizado === "boolean") updates.esterilizado = body.esterilizado;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: "Sin cambios" }, { status: 400 });
    }

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("mascotas")
      .update(updates)
      .eq("mascotas_id", mascotas_id)
      .select("mascotas_id, nombre, especie, raza, sexo, color, fecha_nacimiento, numero_microchip, esterilizado, propietario_id, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || String(e) }, { status: 500 });
  }
}


