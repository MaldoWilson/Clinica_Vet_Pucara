// Componente de horas de veterinarios
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Vet = { id: string; nombre: string; foto_url: string | null; especialidad?: string | null };
type Slot = {
  id: string;
  inicio: string;
  fin: string;
  reservado: boolean;
  veterinario?: Vet | null;
};

const fmtHora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

function startDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endDay(d: Date)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function ymd(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

export default function VetCardsDay({ servicioId }: { servicioId?: string } = {}) {
  const [day, setDay] = useState<Date>(startDay(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [allVets, setAllVets] = useState<Vet[]>([]);
  const [servicio, setServicio] = useState<{ duracion_min?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const days = Array.from({ length: 14 }, (_, i) => addDays(startDay(new Date()), i));

  useEffect(() => {
    const qs = new URLSearchParams({
      from: startDay(day).toISOString(),
      to:   endDay(day).toISOString(),
      onlyAvailable: "0",
      limit: "2000",
    }).toString();

    setLoading(true);
    
    // Obtener horarios, veterinarios y servicio (si hay servicioId)
    const promises = [
      fetch(`/api/horarios?${qs}`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`/api/Veterinarios`).then(r => r.json()).catch(() => ({ data: [] }))
    ];
    
    if (servicioId) {
      promises.push(
        fetch(`/api/servicios`).then(r => r.json()).catch(() => ({ data: [] }))
      );
    }
    
    Promise.all(promises)
      .then(([horariosRes, vetsRes, serviciosRes]) => {
        setSlots(horariosRes?.data || []);
        setAllVets(vetsRes?.data || []);
        
        if (servicioId && serviciosRes?.data) {
          const servicioEncontrado = serviciosRes.data.find((s: any) => s.id === servicioId);
          setServicio(servicioEncontrado || null);
        } else {
          setServicio(null);
        }
      })
      .catch(() => {
        setSlots([]);
        setAllVets([]);
        setServicio(null);
      })
      .finally(() => setLoading(false));
  }, [day, servicioId]);

  // Función para verificar si un slot puede acomodar la duración del servicio
  const canAccommodateService = (slot: Slot, allSlots: Slot[]): boolean => {
    if (!servicio?.duracion_min) return true; // Si no hay servicio específico, mostrar todos
    
    const slotDuration = 30; // Duración fija de los slots (30 minutos)
    const requiredSlots = Math.ceil(servicio.duracion_min / slotDuration);
    
    if (requiredSlots === 1) return true; // Si solo necesita 1 slot, está bien
    
    // Buscar slots consecutivos del mismo veterinario
    const vetSlots = allSlots
      .filter(s => s.veterinario?.id === slot.veterinario?.id && !s.reservado)
      .sort((a, b) => +new Date(a.inicio) - +new Date(b.inicio));
    
    const slotIndex = vetSlots.findIndex(s => s.id === slot.id);
    if (slotIndex === -1) return false;
    
    // Verificar si hay suficientes slots consecutivos disponibles
    for (let i = 0; i < requiredSlots; i++) {
      const checkSlot = vetSlots[slotIndex + i];
      if (!checkSlot) return false; // No hay suficientes slots
      
      // Verificar que el slot siguiente sea consecutivo (30 minutos después)
      if (i < requiredSlots - 1) {
        const nextSlot = vetSlots[slotIndex + i + 1];
        if (!nextSlot) return false; // No hay slot siguiente
        
        const currentEnd = new Date(checkSlot.fin);
        const nextStart = new Date(nextSlot.inicio);
        const timeDiff = nextStart.getTime() - currentEnd.getTime();
        if (Math.abs(timeDiff) > 60000) return false; // Más de 1 minuto de diferencia
      }
    }
    
    return true;
  };

  // agrupar por veterinario - incluir todos los veterinarios
  const groups = useMemo(() => {
    const m = new Map<string, { vet: Vet; slots: Slot[] }>();
    
    // Primero, agregar todos los veterinarios con slots vacíos
    for (const vet of allVets) {
      m.set(vet.id, { vet, slots: [] });
    }
    
    // Luego, agregar los slots existentes (filtrados por duración del servicio)
    for (const s of slots) {
      const v = s.veterinario || { id: "sin-vet", nombre: "Veterinario", foto_url: null, especialidad: null };
      if (!m.has(v.id)) m.set(v.id, { vet: v, slots: [] });
      
      // Solo agregar slots que pueden acomodar el servicio
      if (canAccommodateService(s, slots)) {
        m.get(v.id)!.slots.push(s);
      }
    }
    
    const arr = Array.from(m.values());
    arr.forEach(g => g.slots.sort((a,b) => +new Date(a.inicio) - +new Date(b.inicio)));
    arr.sort((a,b) => (a.vet.nombre || "").localeCompare(b.vet.nombre || "", "es"));
    return arr;
  }, [slots, allVets, servicio]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-9">
      {/* tira de días */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {days.map(d => {
          const active = ymd(d) === ymd(day);
          return (
            <button
              key={d.toISOString()}
              onClick={() => setDay(d)}
              className={`px-3 py-2 rounded-xl border min-w-[84px] text-center ${active ? "bg-indigo-400 text-white border-indigo-600" : "hover:bg-neutral-50"}`}
              title={d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "short" })}
            >
              <div className="text-xs capitalize">{d.toLocaleDateString("es-CL", { weekday: "short" })}</div>
              <div className="font-semibold">{d.getDate()}</div>
            </button>
          );
        })}
      </div>

      <h1 className="text-xl font-semibold mb-4">
        {day.toLocaleDateString("es-CL", { weekday:"long", day:"numeric", month:"long" })}
      </h1>

      {loading ? (
        <p className="text-neutral-500">Cargando horarios…</p>
      ) : groups.length === 0 ? (
        <p className="text-neutral-600">No hay veterinarios disponibles.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map(({ vet, slots }) => {
            const libres = slots.filter(s => !s.reservado);
            const preview = slots.slice(0, 6);
            const resto   = slots.slice(6);

            return (
              <div key={vet.id} className="rounded-2xl border shadow-sm overflow-hidden grid grid-cols-[1fr,160px] bg-white">
                {/* izquierda: foto + info */}
                <div className="p-5 flex gap-3">
                  {vet.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={vet.foto_url} alt={vet.nombre} className="w-16 h-16 rounded object-cover border" />
                  ) : (
                    <div className="w-20 h-20 rounded bg-neutral-200 border flex items-center justify-center text-lg font-semibold">
                      {(vet.nombre || "?").slice(0,1)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-medium leading-snug">{vet.nombre}</div>
                    <div className="text-xs text-neutral-500">{vet.especialidad}</div>

                    {resto.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-m text-indigo-400">Ver más horas</summary>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {resto.map(s => s.reservado ? (
                            <span key={s.id} className="px-3 py-1 rounded-full bg-teal-50 text-teal-900/60 text-sm border border-teal-100" title="Hora reservada">
                              {fmtHora(s.inicio)}
                            </span>
                          ) : (
                            <Link key={s.id} href={servicioId ? `/reservas/servicio/${servicioId}/horario/${s.id}` : `/reservas/${s.id}`} className="px-3 py-1 rounded-full bg-white text-indigo-700 text-sm border border-indigo-500 hover:bg-teal-50">
                              {fmtHora(s.inicio)}
                            </Link>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>

                {/* derecha: columnas de "píldoras" teal */}
                <div className="bg-indigo-400 text-white p-4 flex flex-col gap-2 items-center">
                  {preview.length === 0 ? (
                    <div className="text-center">
                      <span className="text-white/90 text-sm block">Sin horarios</span>
                      <span className="text-white/70 text-xs block mt-1">para este día</span>
                    </div>
                  ) : (
                    preview.map(s =>
                      s.reservado ? (
                        <span key={s.id} className="w-full max-w-[120px] text-center rounded-full py-1 bg-indigo-400 text-white/80 text-sm border border-white/20" title="Hora reservada">
                          {fmtHora(s.inicio)}
                        </span>
                      ) : (
                        <Link key={s.id} href={servicioId ? `/reservas/servicio/${servicioId}/horario/${s.id}` : `/reservas/${s.id}`} className="w-full max-w-[120px] text-center rounded-full py-1 bg-white text-indigo-400 text-sm border border-transparent hover:bg-teal-50">
                          {fmtHora(s.inicio)}
                        </Link>
                      )
                    )
                  )}
                  <div className="mt-auto">
                    <div className="mt-3 text-[11px] bg-white/10 px-3 py-1 rounded-full">
                      {libres.length} {libres.length === 1 ? "hora disponible" : "horas disponibles"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
