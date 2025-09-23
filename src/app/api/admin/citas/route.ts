import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function PATCH(req: Request) {
  try {
    const { id, action } = (await req.json()) as { id: string; action: "confirmar"|"atendida"|"cancelar" };
    console.log("🔍 Debug API - Recibido:", { id, action });
    
    const supa = supabaseServer();

    if (action === "cancelar") {
      // Obtenemos el horario y el servicio para calcular cuántos slots liberar
      const { data: c, error: e1 } = await supa
        .from("citas")
        .select("horario_id, servicio_id")
        .eq("id", id)
        .single();
      if (e1 || !c) throw new Error("Cita no encontrada");

      // Obtener la duración del servicio
      const { data: servicio, error: servicioError } = await supa
        .from("servicios")
        .select("duracion_min")
        .eq("id", c.servicio_id)
        .single();

      if (servicioError) throw servicioError;

      // Calcular cuántos slots necesitamos liberar
      const slotDuration = 30; // Duración fija de los slots (30 minutos)
      const serviceDuration = servicio.duracion_min || 30;
      const requiredSlots = Math.ceil(serviceDuration / slotDuration);

      // Obtener el slot inicial para encontrar los consecutivos
      const { data: slotInicial, error: slotError } = await supa
        .from("horarios")
        .select("id, inicio, fin, veterinario_id")
        .eq("id", c.horario_id)
        .single();

      if (slotError) throw slotError;

      // Buscar slots consecutivos del mismo veterinario que estén reservados
      const { data: slotsConsecutivos, error: slotsError } = await supa
        .from("horarios")
        .select("id, inicio, fin, reservado")
        .eq("veterinario_id", slotInicial.veterinario_id)
        .eq("reservado", true)
        .gte("inicio", slotInicial.inicio)
        .order("inicio", { ascending: true })
        .limit(requiredSlots);

      if (slotsError) throw slotsError;

      // Actualizar el estado de la cita
      const { error: e2 } = await supa.from("citas").update({ estado: "CANCELADA" }).eq("id", id);
      if (e2) throw e2;

      // Liberar todos los slots consecutivos que estén reservados
      if (slotsConsecutivos.length > 0) {
        const slotsParaLiberar = slotsConsecutivos.map(s => s.id);
        console.log(`🔍 Debug - Liberando ${slotsParaLiberar.length} slots para cita cancelada ${id}:`, slotsParaLiberar);
        
        const { error: e3 } = await supa
          .from("horarios")
          .update({ reservado: false })
          .in("id", slotsParaLiberar);
        if (e3) throw e3;
      }

      return NextResponse.json({ ok: true });
    }

    const next = action === "confirmar" ? "CONFIRMADA" : action === "atendida" ? "ATENDIDA" : null;
    if (!next) throw new Error("Acción no soportada");

    const { error } = await supa.from("citas").update({ estado: next }).eq("id", id);
    if (error) {
      console.log("🔍 Debug API - Error en update:", error);
      throw error;
    }

    console.log("🔍 Debug API - Actualización exitosa");
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    console.log("🔍 Debug API - Error general:", e);
    return NextResponse.json({ ok:false, error: e.message }, { status: 400 });
  }
}
