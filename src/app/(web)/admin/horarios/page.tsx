"use client";

import { useEffect, useMemo, useState } from "react";

type Vet = { id: string; nombre: string; especialidad?: string | null };
type Slot = { 
  id: string; 
  inicio: string; 
  fin: string; 
  reservado: boolean; 
  veterinario_id: string;
  citas?: {
    id: string;
    tutor_nombre: string;
    servicio_id: string;
    servicios: {
      id: string;
      nombre: string;
    };
  };
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminHorariosPage() {
  const [vets, setVets] = useState<Vet[]>([]);
  const [selectedVet, setSelectedVet] = useState<string>("");
  const [date, setDate] = useState<string>(ymd(new Date()));
  const [dateTo, setDateTo] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("09:00");
  const [horaFin, setHoraFin] = useState<string>("13:00");
  const [duracionMin, setDuracionMin] = useState<number>(30);
  const [gapMin, setGapMin] = useState<number>(0);
  const [noOverlap, setNoOverlap] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);

  const qs = useMemo(() => {
    const from = new Date(`${date}T00:00:00`);
    const to = new Date(`${date}T23:59:59`);
    const p = new URLSearchParams({ from: from.toISOString(), to: to.toISOString(), onlyAvailable: "0", limit: "500" });
    if (selectedVet) p.set("veterinarioId", selectedVet);
    return p.toString();
  }, [date, selectedVet]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [v, h] = await Promise.all([
          fetch("/api/Veterinarios").then(r => r.json()).catch(() => ({ data: [] })),
          fetch(`/api/horarios?${qs}`).then(r => r.json()).catch(() => ({ data: [] })),
        ]);
        setVets(v?.data || []);
        setSlots(h?.data || []);
        if (!selectedVet && (v?.data?.[0]?.id)) setSelectedVet(v.data[0].id);
      } catch (e) {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [qs]);

  const fmtHora = (iso: string) => new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

  const crearLote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedVet) return setError("Selecciona un veterinario");
    try {
      setSaving(true);
      const res = await fetch("/api/horarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaDesde: date,
          fechaHasta: dateTo || undefined,
          horaInicio,
          horaFin,
          duracionMin,
          gapMin,
          veterinarioId: selectedVet,
          evitarSolapamientos: noOverlap,
        }),
      });
      const j = await res.json();
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "No se pudo crear");
      // recargar lista
      const r = await fetch(`/api/horarios?${qs}`);
      const jj = await r.json();
      setSlots(jj?.data || []);
    } catch (e: any) {
      setError(e?.message || "Error creando horarios");
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar horario?")) return;
    try {
      const res = await fetch("/api/horarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await res.json();
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "No se pudo eliminar");
      setSlots(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      alert(e?.message || "Error eliminando");
    }
  };

  const eliminarLibresDelDia = async () => {
    if (!selectedVet) return alert("Selecciona un veterinario");
    if (!confirm("¿Eliminar TODOS los horarios libres del día?")) return;
    const res = await fetch("/api/horarios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha: date, veterinarioId: selectedVet, soloLibres: true })
    });
    const j = await res.json();
    if (!res.ok || j?.ok === false) return alert(j?.error || "Error eliminando");
    const r = await fetch(`/api/horarios?${qs}`);
    const jj = await r.json();
    setSlots(jj?.data || []);
  };

  const reasignarLibresDelDia = async () => {
    if (!selectedVet) return alert("Selecciona un veterinario");
    const destino = prompt("Pega el ID del veterinario destino:");
    if (!destino) return;
    const seleccionados = slots.filter(s => !s.reservado).map(s => s.id);
    if (seleccionados.length === 0) return alert("No hay horarios libres para reasignar");
    const res = await fetch("/api/horarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: seleccionados, toVeterinarioId: destino })
    });
    const j = await res.json();
    if (!res.ok || j?.ok === false) return alert(j?.error || "Error reasignando");
    const r = await fetch(`/api/horarios?${qs}`);
    const jj = await r.json();
    setSlots(jj?.data || []);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Generar horarios</h3>
        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
        <form onSubmit={crearLote} className="grid grid-cols-1 md:grid-cols-8 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Veterinario</label>
            <select className="w-full rounded border px-3 py-2" value={selectedVet} onChange={(e) => setSelectedVet(e.target.value)} required aria-label="Seleccionar veterinario" title="Seleccionar veterinario">
              <option value="">Selecciona…</option>
              {vets.map(v => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input type="date" className="w-full rounded border px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} required aria-label="Fecha" title="Fecha" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hasta (opcional)</label>
            <input type="date" className="w-full rounded border px-3 py-2" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="Fecha hasta" title="Fecha hasta" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Desde</label>
            <input type="time" className="w-full rounded border px-3 py-2" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required aria-label="Hora inicio" title="Hora inicio" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hasta</label>
            <input type="time" className="w-full rounded border px-3 py-2" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required aria-label="Hora fin" title="Hora fin" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duración (min)</label>
            <input type="number" min={5} step={5} className="w-full rounded border px-3 py-2" value={duracionMin} onChange={(e) => setDuracionMin(parseInt(e.target.value || "0", 10))} aria-label="Duración en minutos" title="Duración en minutos" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gap (min)</label>
            <input type="number" min={0} step={5} className="w-full rounded border px-3 py-2" value={gapMin} onChange={(e) => setGapMin(parseInt(e.target.value || "0", 10))} aria-label="Tiempo de separación en minutos" title="Tiempo de separación en minutos" />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={noOverlap} onChange={(e) => setNoOverlap(e.target.checked)} />
              Evitar solapamientos
            </label>
          </div>
          <div className="md:col-span-8">
            <button disabled={saving || !selectedVet} className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300">
              {saving ? "Generando…" : "Generar horarios"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Horarios del día</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          <button onClick={eliminarLibresDelDia} className="px-3 py-2 rounded border text-red-600">Eliminar libres del día</button>
          <button onClick={reasignarLibresDelDia} className="px-3 py-2 rounded border">Reasignar libres a otro veterinario</button>
        </div>
        {loading ? (
          <div>Cargando…</div>
        ) : slots.length === 0 ? (
          <div className="text-gray-600">No hay horarios para este día.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Hora</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Servicio</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2"></th>
                </tr>
              </thead>
              <tbody>
                {slots.map(s => {
                  const cita = s.citas; // Acceder directamente al objeto cita
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">{fmtHora(s.inicio)} - {fmtHora(s.fin)}</td>
                      <td className="p-2">{s.reservado ? "Reservado" : "Libre"}</td>
                      <td className="p-2">{cita?.servicios?.nombre || "-"}</td>
                      <td className="p-2">{cita?.tutor_nombre || "-"}</td>
                      <td className="p-2">
                        <button onClick={() => eliminar(s.id)} disabled={s.reservado} className={`px-3 py-1 rounded border ${s.reservado ? "opacity-50 cursor-not-allowed" : "text-red-600"}`}>Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


