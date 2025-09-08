import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { nombre: string; correo?: string; telefono?: string; mensaje: string; };
    if (!body.nombre || !body.mensaje) throw new Error("Nombre y mensaje son obligatorios.");

    const supa = supabaseServer();
    const { error } = await supa.from("mensajes_contacto").insert({
      nombre: body.nombre,
      correo: body.correo ?? null,
      telefono: body.telefono ?? null,
      mensaje: body.mensaje
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
