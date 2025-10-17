import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// Endpoint temporal para limpiar citas canceladas con datos inconsistentes
export async function PUT() {
  try {
    const supa = supabaseServer();
    
    // Limpiar todas las citas canceladas que aún tienen horario_id
    const { data, error } = await supa
      .from("citas")
      .update({ 
        horario_id: null,
        inicio: null,
        fin: null
      })
      .eq("estado", "CANCELADA")
      .not("horario_id", "is", null)
      .select("id, tutor_nombre, mascota_nombre");
    
    if (error) throw error;
    
    console.log(`🧹 Limpieza completada: ${data?.length || 0} citas canceladas limpiadas`);
    
    return NextResponse.json({ 
      ok: true, 
      message: `Se limpiaron ${data?.length || 0} citas canceladas`,
      cleaned: data?.length || 0
    });
  } catch (e: any) {
    console.error("Error en limpieza:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, action } = (await req.json()) as { id: string; action: "confirmar"|"atendida"|"cancelar" };
    console.log("🔍 Debug API - Recibido:", { id, action });
    
    const supa = supabaseServer();

    if (action === "cancelar") {
      // Obtenemos el horario y el servicio para calcular cuántos slots liberar
      const { data: c, error: e1 } = await supa
        .from("citas")
        .select("horario_id, servicio_id, inicio, fin")
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

      // Verificar que los slots encontrados son realmente consecutivos y pertenecen a esta cita
      const slotsParaLiberar: string[] = [];
      
      if (slotsConsecutivos.length > 0) {
        // Verificar que los slots son consecutivos
        for (let i = 0; i < slotsConsecutivos.length - 1; i++) {
          const currentEnd = new Date(slotsConsecutivos[i].fin);
          const nextStart = new Date(slotsConsecutivos[i + 1].inicio);
          const timeDiff = nextStart.getTime() - currentEnd.getTime();
          
          // Si no son consecutivos, solo liberar hasta aquí
          if (Math.abs(timeDiff) > 60000) { // Más de 1 minuto de diferencia
            break;
          }
        }
        
        // Solo liberar los slots que son realmente consecutivos
        const slotsConsecutivosReales = slotsConsecutivos.slice(0, Math.min(requiredSlots, slotsConsecutivos.length));
        slotsParaLiberar.push(...slotsConsecutivosReales.map(s => s.id));
      }

      // Actualizar el estado de la cita y limpiar la relación con el horario
      const { error: e2 } = await supa
        .from("citas")
        .update({ 
          estado: "CANCELADA",
          horario_id: null  // Limpiar la relación para que no aparezcan datos en admin
        })
        .eq("id", id);
      if (e2) throw e2;

      // Liberar los slots identificados
      if (slotsParaLiberar.length > 0) {
        console.log(`🔍 Debug - Liberando ${slotsParaLiberar.length} slots para cita cancelada ${id}:`, slotsParaLiberar);
        
        const { error: e3 } = await supa
          .from("horarios")
          .update({ reservado: false })
          .in("id", slotsParaLiberar);
        if (e3) throw e3;
        
        console.log(`✅ Debug - Slots liberados exitosamente para cita cancelada ${id}`);
      } else {
        console.log(`⚠️ Debug - No se encontraron slots consecutivos para liberar para cita ${id}`);
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
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (e:any) {
    console.log("🔍 Debug API - Error general:", e);
    return new NextResponse(JSON.stringify({ ok:false, error: e.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  }
}
