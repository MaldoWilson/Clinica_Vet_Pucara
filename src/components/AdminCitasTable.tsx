// Componente de administar las citas falta modificar
"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Cita = {
  id: string;
  estado: string;
  creado_en: string;
  tutor_nombre: string;
  tutor_telefono: string | null;
  tutor_email: string | null;
  mascota_nombre: string;
  notas: string | null;
  servicio_id: string | null;
  horario_id: string | null;
  servicios?: { nombre: string; duracion_min?: number | null } | null;
  horarios?: { inicio: string; fin: string } | null;
};

export default function AdminCitasTable({
  initialCitas,
  initialEstado,
}: {
  initialCitas: Cita[];
  initialEstado: string;
}) {
  const router = useRouter();
  const [citas, setCitas] = useState<Cita[]>(initialCitas);
  const [estado, setEstado] = useState<string>(initialEstado);
  const [tutor, setTutor] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const [pending, startTransition] = useTransition();

  const options = ["", "PENDIENTE", "CONFIRMADA", "ATENDIDA", "CANCELADA"];

  // Formatea fecha/hora
  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" }) : "-";

  const fmtHora = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "-";

  // Cambia el filtro de estado (filtrado local)
  const onChangeEstado = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEstado(value);
    setPage(1);
  };

  const onChangeTutor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTutor(e.target.value);
    setPage(1);
  };

  const onChangeDesde = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaDesde(e.target.value);
    setPage(1);
  };

  const onChangeHasta = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaHasta(e.target.value);
    setPage(1);
  };

  const limpiarFiltros = () => {
    setEstado("");
    setTutor("");
    setFechaDesde("");
    setFechaHasta("");
    setPage(1);
  };

  const filteredCitas = useMemo(() => {
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta) : null;
    return citas.filter((c) => {
      // estado
      if (estado && c.estado !== estado) return false;
      // fecha
      if (desde || hasta) {
        const created = new Date(c.creado_en);
        if (desde && created < new Date(desde.getFullYear(), desde.getMonth(), desde.getDate())) return false;
        if (hasta) {
          const endOfDay = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23, 59, 59, 999);
          if (created > endOfDay) return false;
        }
      }
      // tutor (nombre/telefono/email)
      if (tutor) {
        const q = tutor.toLowerCase();
        const hay =
          (c.tutor_nombre || "").toLowerCase().includes(q) ||
          (c.tutor_telefono || "").toLowerCase().includes(q) ||
          (c.tutor_email || "").toLowerCase().includes(q);
        if (!hay) return false;
      }
      return true;
    });
  }, [citas, estado, fechaDesde, fechaHasta, tutor]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredCitas.length / pageSize)), [filteredCitas.length]);
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCitas.slice(start, start + pageSize);
  }, [filteredCitas, page]);

  const doAction = async (id: string, action: "confirmar" | "atendida" | "cancelar") => {
    console.log("🔍 Debug - Acción iniciada:", { id, action });
    
    try {
      const res = await fetch("/api/admin/citas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        next: { revalidate: 0 },
        body: JSON.stringify({ id, action }),
      });
      
      console.log("🔍 Debug - Respuesta del servidor:", { status: res.status, ok: res.ok });
      
      const j = await res.json();
      console.log("🔍 Debug - Datos de respuesta:", j);
      
      if (!res.ok) {
        alert(`Error: ${j.error || "Error desconocido"}`);
        return;
      }
      
      // actualiza la fila localmente
      setCitas((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, estado: action === "confirmar" ? "CONFIRMADA" : action === "atendida" ? "ATENDIDA" : "CANCELADA" }
            : c
        )
      );
      
      console.log("🔍 Debug - Estado actualizado localmente");
      // forzar refresco de datos del servidor
      router.refresh();
    } catch (error) {
      console.error("🔍 Debug - Error en doAction:", error);
      alert(`Error de conexión: ${error}`);
    }
  };

  const hayCitas = citas.length > 0;
  const hayFiltradas = filteredCitas.length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Estado:</label>
            <select 
              value={estado} 
              onChange={onChangeEstado} 
              className="px-3 py-2 border rounded-lg"
              title="Seleccionar estado de cita para filtrar"
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {o || "Todos"}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-gray-700">Fecha:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={onChangeDesde}
              className="px-3 py-2 border rounded-lg"
              title="Fecha desde"
            />
            <span className="text-gray-500">—</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={onChangeHasta}
              className="px-3 py-2 border rounded-lg"
              title="Fecha hasta"
            />

            <label className="text-sm font-medium text-gray-700">Tutor:</label>
            <input
              type="text"
              value={tutor}
              onChange={onChangeTutor}
              placeholder="Nombre, teléfono o email"
              className="px-3 py-2 border rounded-lg"
            />

            <button
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200"
              onClick={limpiarFiltros}
              title="Limpiar filtros"
            >
              Limpiar
            </button>
            
            <button
              className="px-3 py-2 rounded-lg text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700"
              onClick={async () => {
              if (confirm('¿Limpiar datos de citas canceladas? Esto limpiará los horarios de citas ya canceladas.')) {
                try {
                  const res = await fetch('/api/admin/citas', { method: 'PUT' });
                  const data = await res.json();
                  alert(data.message || 'Limpieza completada');
                  window.location.reload();
                } catch (err) {
                  alert('Error: ' + err);
                }
              }
            }}
            title="Limpiar datos de citas canceladas"
          >
            🧹 Limpiar Canceladas
          </button>
          {pending && <span className="text-sm text-neutral-500">Cargando…</span>}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredCitas.length}</span> cita{filteredCitas.length !== 1 ? 's' : ''} encontrada{filteredCitas.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {!hayCitas ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-lg font-medium">No hay citas para mostrar</p>
          <p className="text-sm">Las citas aparecerán aquí cuando los clientes las reserven</p>
        </div>
      ) : !hayFiltradas ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          <div className="text-4xl mb-2">🔎</div>
          <p className="text-lg font-medium">Sin resultados con los filtros actuales</p>
          <p className="text-sm mb-4">Ajusta los filtros o limpia para ver todas las citas</p>
          <button
            className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 bg-white hover:bg-gray-50"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3 font-semibold">📅 Fecha Creación</th>
                <th className="text-left p-3 font-semibold">📆 Día de Servicio</th>
                <th className="text-left p-3 font-semibold">👤 Tutor</th>
                <th className="text-left p-3 font-semibold">🐾 Mascota</th>
                <th className="text-left p-3 font-semibold">💊 Servicio</th>
                <th className="text-left p-3 font-semibold">🕒 Horario</th>
                <th className="text-left p-3 font-semibold">📊 Estado</th>
                <th className="text-left p-3 font-semibold">⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((c) => {
                const fechaCreacion = new Date(c.creado_en).toLocaleString("es-CL", { 
                  dateStyle: "medium",
                  timeStyle: "short"
                });
                
                return (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{fechaCreacion}</td>
                    <td className="p-3">
                      {c.horarios ? (() => {
                        const fechaServicio = new Date(c.horarios!.inicio);
                        return fechaServicio.toLocaleDateString("es-CL", { 
                          dateStyle: "medium"
                        });
                      })() : "-"}
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{c.tutor_nombre}</div>
                        <div className="text-xs text-gray-500">
                          {c.tutor_telefono || c.tutor_email || "-"}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{c.mascota_nombre}</td>
                    <td className="p-3">{c.servicios?.nombre || "-"}</td>
                    <td className="p-3">
                      {c.horarios ? (() => {
                        const start = new Date(c.horarios!.inicio);
                        const dur = c.servicios?.duracion_min ?? 30;
                        const end = new Date(start.getTime() + (dur || 30) * 60 * 1000);
                        return `${fmtHora(start.toISOString())} - ${fmtHora(end.toISOString())}`;
                      })() : "-"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                        c.estado === 'CONFIRMADA' ? 'bg-blue-100 text-blue-800' :
                        c.estado === 'ATENDIDA' ? 'bg-green-100 text-green-800' :
                        c.estado === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            c.estado !== "PENDIENTE" 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                          onClick={() => doAction(c.id, "confirmar")}
                          disabled={c.estado !== "PENDIENTE"}
                          title="Confirmar cita"
                        >
                          ✓ Confirmar
                        </button>
                        <button
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            c.estado === "ATENDIDA" || c.estado === "CANCELADA"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                          onClick={() => doAction(c.id, "atendida")}
                          disabled={c.estado === "ATENDIDA" || c.estado === "CANCELADA"}
                          title="Marcar como atendida"
                        >
                          ✓ Atendida
                        </button>
                        <button
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            c.estado === "CANCELADA"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                          onClick={() => doAction(c.id, "cancelar")}
                          disabled={c.estado === "CANCELADA"}
                          title="Cancelar cita (libera el horario)"
                        >
                          ✗ Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredCitas.length > 0 && (
        <div className="pt-4 flex items-center justify-center gap-2">
          <button
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
              const idx = i + 1;
              if (totalPages > 7 && idx > 5 && idx < totalPages) {
                return null;
              }
              return (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`min-w-9 h-9 px-3 py-2 rounded border text-sm ${page === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}
                >
                  {idx}
                </button>
              );
            })}
            {totalPages > 7 && (
              <>
                <span className="px-1">…</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className={`min-w-9 h-9 px-3 py-2 rounded border text-sm ${page === totalPages ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          <button
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
