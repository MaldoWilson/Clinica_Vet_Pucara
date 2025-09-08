import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      horarioId: string;
      servicioId: string;
      tutorNombre: string;
      tutorTelefono?: string;
      tutorEmail?: string;
      mascotaNombre: string;
      notas?: string;
    };

    // Validación mínima
    const required = ["horarioId","servicioId","tutorNombre","mascotaNombre"] as const;
    for (const k of required) if (!(body as any)[k]) throw new Error(`Falta ${k}`);

    const supa = supabaseServer();

    // Llamamos a la función atómica (RPC)
    const { data, error } = await supa.rpc("crear_cita_atomica", {
      p_horario_id: body.horarioId,
      p_servicio_id: body.servicioId,
      p_tutor_nombre: body.tutorNombre,
      p_tutor_telefono: body.tutorTelefono ?? null,
      p_tutor_email: body.tutorEmail ?? null,
      p_mascota_nombre: body.mascotaNombre,
      p_notas: body.notas ?? null,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, citaId: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? String(e) }, { status: 400 });
  }
}
