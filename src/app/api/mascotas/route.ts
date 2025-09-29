import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

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


