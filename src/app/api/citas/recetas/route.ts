import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      mascotaId: string;
      medicamento: string;
      dosis: string;
      indicaciones?: string;
    };

    if (!body.mascotaId || !body.medicamento || !body.dosis) {
      throw new Error("Faltan campos obligatorios");
    }

    const supa = supabaseServer();
    const { data, error } = await supa
      .from("recetas")
      .insert({
        mascota_id: body.mascotaId,
        medicamento: body.medicamento,
        dosis: body.dosis,
        indicaciones: body.indicaciones ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, receta: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? String(e) }, { status: 400 });
  }
}
