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

    // Obtener información del servicio para calcular duración
    const { data: servicio, error: servicioError } = await supa
      .from("servicios")
      .select("duracion_min")
      .eq("id", body.servicioId)
      .single();

    if (servicioError) throw servicioError;

    // Calcular cuántos slots necesitamos
    const slotDuration = 30; // Duración fija de los slots (30 minutos)
    const serviceDuration = servicio.duracion_min || 30;
    const requiredSlots = Math.ceil(serviceDuration / slotDuration);

    if (requiredSlots === 1) {
      // Si solo necesita 1 slot, primero validar que el slot no sea pasado
      const { data: slot, error: slotErr } = await supa
        .from("horarios")
        .select("id, inicio, reservado")
        .eq("id", body.horarioId)
        .single();
      if (slotErr) throw slotErr;
      if (!slot) throw new Error("Horario no encontrado");
      if (new Date(slot.inicio).getTime() < Date.now()) {
        throw new Error("No es posible reservar un horario en el pasado");
      }
      if (slot.reservado) throw new Error("Este horario ya está reservado por otra cita");

      // Usar la función original
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
    }

    // Intentar crear la cita con reintentos para manejar condiciones de carrera
    let citaId: string | null = null;
    let intentos = 0;
    const maxIntentos = 3;

    while (intentos < maxIntentos) {
      try {
        // Verificar disponibilidad del slot principal
        const { data: citaExistente, error: citaExistenteError } = await supa
          .from("citas")
          .select("id")
          .eq("horario_id", body.horarioId)
          .single();

        if (citaExistenteError && citaExistenteError.code !== 'PGRST116') {
          throw citaExistenteError;
        }

        if (citaExistente) {
          throw new Error("Este horario ya está reservado por otra cita");
        }

        // Obtener el slot inicial
        const { data: slotInicial, error: slotError } = await supa
          .from("horarios")
          .select("id, inicio, fin, veterinario_id")
          .eq("id", body.horarioId)
          .eq("reservado", false)
          .single();

        if (slotError) throw slotError;

        // Evitar slots en el pasado
        if (new Date(slotInicial.inicio).getTime() < Date.now()) {
          throw new Error("No es posible reservar un horario en el pasado");
        }

        // Buscar slots consecutivos del mismo veterinario
        const { data: slotsConsecutivos, error: slotsError } = await supa
          .from("horarios")
          .select("id, inicio, fin, reservado")
          .eq("veterinario_id", slotInicial.veterinario_id)
          .eq("reservado", false)
          .gte("inicio", slotInicial.inicio)
          .order("inicio", { ascending: true })
          .limit(requiredSlots);

        if (slotsError) throw slotsError;

        // Verificar que tenemos suficientes slots consecutivos
        if (slotsConsecutivos.length < requiredSlots) {
          throw new Error("No hay suficientes horarios consecutivos disponibles");
        }

        // Verificar que los slots son consecutivos
        for (let i = 0; i < requiredSlots - 1; i++) {
          const currentEnd = new Date(slotsConsecutivos[i].fin);
          const nextStart = new Date(slotsConsecutivos[i + 1].inicio);
          const timeDiff = nextStart.getTime() - currentEnd.getTime();
          if (Math.abs(timeDiff) > 60000) { // Más de 1 minuto de diferencia
            throw new Error("Los horarios no son consecutivos");
          }
        }

        // Verificar que ninguno de los slots ya tenga una cita asociada
        const slotIds = slotsConsecutivos.map(s => s.id);
        const { data: citasConflictivas, error: citasConflictivasError } = await supa
          .from("citas")
          .select("id, horario_id")
          .in("horario_id", slotIds)
          .limit(1);
        if (citasConflictivasError) throw citasConflictivasError;
        if (citasConflictivas && citasConflictivas.length > 0) {
          throw new Error("Uno o más horarios ya están asociados a otra cita");
        }

        // Crear la cita
        const { data: citaData, error: citaError } = await supa
          .from("citas")
          .insert({
            horario_id: body.horarioId,
            servicio_id: body.servicioId,
            tutor_nombre: body.tutorNombre,
            tutor_telefono: body.tutorTelefono ?? null,
            tutor_email: body.tutorEmail ?? null,
            mascota_nombre: body.mascotaNombre,
            notas: body.notas ?? null,
            estado: "PENDIENTE"
          })
          .select("id")
          .single();

        if (citaError) {
          if (citaError.code === '23505' && citaError.message.includes('citas_horario_id_key')) {
            // Si es un error de clave duplicada, reintentar
            intentos++;
            if (intentos >= maxIntentos) {
              throw new Error("Este horario ya está reservado. Por favor, selecciona otro horario.");
            }
            // Esperar un poco antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 100 * intentos));
            continue;
          }
          throw citaError;
        }

        citaId = citaData.id;

        // Marcar todos los slots como reservados
        const todosLosSlots = slotsConsecutivos.map(s => s.id);
        console.log(`🔍 Debug - Marcando ${todosLosSlots.length} slots como reservados para cita ${citaId}:`, todosLosSlots);
        
        const { error: updateSlotsError } = await supa
          .from("horarios")
          .update({ reservado: true })
          .in("id", todosLosSlots);

        if (updateSlotsError) {
          console.warn("Error marcando slots como reservados:", updateSlotsError);
          // No lanzamos error aquí porque la cita ya se creó
        } else {
          console.log(`✅ Debug - Todos los slots marcados como reservados para cita ${citaId}`);
        }

        break; // Éxito, salir del bucle

      } catch (error: any) {
        if (error.message.includes("ya está reservado") && intentos < maxIntentos - 1) {
          intentos++;
          await new Promise(resolve => setTimeout(resolve, 100 * intentos));
          continue;
        }
        throw error;
      }
    }

    if (!citaId) {
      throw new Error("No se pudo crear la cita");
    }
    return NextResponse.json({ ok: true, citaId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? String(e) }, { status: 400 });
  }
}
