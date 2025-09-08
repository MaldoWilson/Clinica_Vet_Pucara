// Componente de calendario para tomar horas
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Slot = {
  id: string;
  inicio: string;
  fin: string;
  reservado: boolean;
  veterinario?: { id: string; nombre: string } | null;
};

type SlotsByDay = Record<string, Slot[]>;

const monthLabel = (d: Date) =>
  d.toLocaleDateString("es-CL", { month: "long", year: "numeric" });

function startOfDayLocal(d: Date) { const c = new Date(d); c.setHours(0,0,0,0); return c; }
function endOfDayLocal(d: Date)   { const c = new Date(d); c.setHours(23,59,59,999); return c; }
function addDays(d: Date, n: number) { const c = new Date(d); c.setDate(c.getDate()+n); return c; }
function startOfMonth(d: Date)    { return startOfDayLocal(new Date(d.getFullYear(), d.getMonth(), 1)); }
function endOfMonth(d: Date)      { return endOfDayLocal(new Date(d.getFullYear(), d.getMonth()+1, 0)); }
function startOfWeekMonday(d: Date) {
  const c = startOfDayLocal(d); const dow = (c.getDay()+6)%7; c.setDate(c.getDate()-dow); return c;
}

export default function BookingCalendar() {
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = startOfMonth(month);
    const to   = addDays(endOfMonth(month), 7); // buffer de 1 semana
    const qs = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
      onlyAvailable: "1",
      limit: "1000",
    }).toString();

    setLoading(true);
    fetch(`/api/horarios?${qs}`)
      .then(r => r.json())
      .then(j => setSlots(j?.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [month]);

  // indexar por día local
  const byDay: SlotsByDay = useMemo(() => {
    const acc: SlotsByDay = {};
    for (const s of slots) {
      const d = new Date(s.inicio);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      (acc[key] ||= []).push(s);
    }
    Object.values(acc).forEach(arr => arr.sort((a,b) => +new Date(a.inicio) - +new Date(b.inicio)));
    return acc;
  }, [slots]);

  // grid (6 semanas)
  const firstGridDay = startOfWeekMonday(startOfMonth(month));
  const days = Array.from({ length: 42 }, (_, i) => addDays(firstGridDay, i));

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const selectedKey = selectedDay
    ? `${selectedDay.getFullYear()}-${String(selectedDay.getMonth()+1).padStart(2,"0")}-${String(selectedDay.getDate()).padStart(2,"0")}`
    : "";
  const timesForDay = selectedKey ? (byDay[selectedKey] || []) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-[1.1fr,0.9fr] gap-6">
        {/* Calendario */}
        <div className="border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonth(addDays(startOfMonth(month), -1))} className="px-3 py-2 rounded-lg border">←</button>
            <div className="font-semibold capitalize">{monthLabel(month)}</div>
            <button onClick={() => setMonth(addDays(endOfMonth(month), 1))} className="px-3 py-2 rounded-lg border">→</button>
          </div>

          <div className="grid grid-cols-7 text-center text-sm text-neutral-600 mb-2">
            {["lun.","mar.","mié.","jue.","vie.","sáb.","dom."].map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const inMonth = d.getMonth() === month.getMonth();
              const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
              const available = !!byDay[key]?.length;
              const selected  = selectedDay && isSameDay(d, selectedDay);
              const isPast    = +endOfDayLocal(d) < +new Date();

              const base = "h-11 rounded-xl flex items-center justify-center border select-none";
              const tone = !inMonth
                ? "text-neutral-300 border-neutral-100"
                : isPast
                ? "text-neutral-400 border-neutral-200 bg-neutral-50"
                : available
                ? "border-neutral-200 hover:bg-neutral-50"
                : "text-neutral-500 border-neutral-200"; // sin cupos pero clickeable
              const sel = selected ? "ring-2 ring-blue-500 font-medium" : "";

              return (
                <button
                  key={d.toISOString()}
                  disabled={isPast || !inMonth}
                  onClick={() => setSelectedDay(d)}
                  className={`${base} ${tone} ${sel}`}
                  title={available ? `${byDay[key].length} horarios` : "Sin horarios"}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-neutral-600">
            Zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </div>
        </div>

        {/* Lista de horas */}
        <div className="border rounded-2xl p-4">
          <h2 className="font-semibold mb-3">
            {selectedDay
              ? selectedDay.toLocaleDateString("es-CL",{ weekday:"long", day:"numeric", month:"long"})
              : "Selecciona un día"}
          </h2>

          {!selectedDay ? (
            <p className="text-neutral-600 text-sm">Elige un día con disponibilidad para ver los horarios.</p>
          ) : timesForDay.length === 0 ? (
            <p className="text-neutral-600 text-sm">No hay horarios disponibles en este día.</p>
          ) : (
            <div className="space-y-2">
              {timesForDay.map((s) => (
                <Link key={s.id} href={`/reservas/${s.id}`} className="block border rounded-xl px-4 py-3 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {new Date(s.inicio).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}
                    </span>
                    <span className="text-sm text-neutral-600">
                      {new Date(s.fin).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"})}
                    </span>
                  </div>
                  {s.veterinario?.nombre && (
                    <div className="text-xs text-neutral-500 mt-1">{s.veterinario.nombre}</div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
