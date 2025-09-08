import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function PATCH(req: Request) {
  try {
    const { id, action } = (await req.json()) as { id: string; action: "confirmar"|"atendida"|"cancelar" };
    const supa = supabaseServer();

    if (action === "cancelar") {
      // Obtenemos el horario y revertimos la reserva en transacción ligera
      const { data: c, error: e1 } = await supa.from("citas").select("horario_id").eq("id", id).single();
      if (e1 || !c) throw new Error("Cita no encontrada");

      const { error: e2 } = await supa.from("citas").update({ estado: "CANCELADA" }).eq("id", id);
      if (e2) throw e2;

      const { error: e3 } = await supa.from("horarios").update({ reservado: false }).eq("id", c.horario_id);
      if (e3) throw e3;

      return NextResponse.json({ ok: true });
    }

    const next = action === "confirmar" ? "CONFIRMADA" : action === "atendida" ? "ATENDIDA" : null;
    if (!next) throw new Error("Acción no soportada");

    const { error } = await supa.from("citas").update({ estado: next }).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status: 400 });
  }
}
