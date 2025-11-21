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
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 w-full">
            {/* Estado */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <select
                value={estado}
                onChange={onChangeEstado}
                className="w-full sm:w-40 px-3 py-2 border rounded-lg"
                title="Seleccionar estado de cita para filtrar"
              >
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o || "Todos"}
                  </option>
                ))}
              </select>
            </div>

            {/* Fechas */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700">Fecha</label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={onChangeDesde}
                  className="flex-1 min-w-0 sm:flex-none sm:w-auto px-3 py-2 border rounded-lg"
                  title="Fecha desde"
                />
                <span className="text-gray-500 hidden sm:inline">—</span>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={onChangeHasta}
                  className="flex-1 min-w-0 sm:flex-none sm:w-auto px-3 py-2 border rounded-lg"
                  title="Fecha hasta"
                />
              </div>
            </div>

            {/* Tutor */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700">Tutor</label>
              <input
                type="text"
                value={tutor}
                onChange={onChangeTutor}
                placeholder="Nombre, teléfono o email"
                className="w-full sm:w-48 px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
              <button
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={limpiarFiltros}
                title="Limpiar filtros"
              >
                Limpiar
              </button>

              <button
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
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
                Limpiar Canceladas
              </button>
            </div>

            {pending && <span className="text-sm text-neutral-500 self-center">Cargando…</span>}
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
                return (
                  <tr
                    key={c.id}
                    className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCita(c)}
                  >
                    <td className="p-3">
                      <span className="block sm:hidden">
                        {new Date(c.creado_en).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                      </span>
                      <span className="hidden sm:block">
                        {new Date(c.creado_en).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </td>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
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
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${c.estado !== "PENDIENTE"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          onClick={(e) => { e.stopPropagation(); doAction(c.id, "confirmar"); }}
                          disabled={c.estado !== "PENDIENTE"}
                          title="Confirmar cita"
                        >
                          ✓ Confirmar
                        </button>
                        <button
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${c.estado === "ATENDIDA" || c.estado === "CANCELADA"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          onClick={(e) => { e.stopPropagation(); doAction(c.id, "atendida"); }}
                          disabled={c.estado === "ATENDIDA" || c.estado === "CANCELADA"}
                          title="Marcar como atendida"
                        >
                          ✓ Atendida
                        </button>
                        <button
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${c.estado === "CANCELADA"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                          onClick={(e) => { e.stopPropagation(); doAction(c.id, "cancelar"); }}
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

      {/* Modal de detalles de cita */}
      {selectedCita && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCita(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalles de la Cita</h3>
                <button
                  onClick={() => setSelectedCita(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                {/* Tutor */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tutor</p>
                    <h4 className="font-semibold text-gray-900 text-lg">{selectedCita.tutor_nombre}</h4>
                    <div className="flex flex-col gap-1 mt-1 text-sm text-gray-600">
                      {selectedCita.tutor_telefono && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{selectedCita.tutor_telefono}</span>
                        </div>
                      )}
                      {selectedCita.tutor_email && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{selectedCita.tutor_email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mascota */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mascota</p>
                    <h4 className="font-semibold text-gray-900 text-lg">{selectedCita.mascota_nombre}</h4>
                  </div>
                </div>

                {/* Servicio y Horario */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Servicio y Horario</p>
                    <h4 className="font-semibold text-gray-900">{selectedCita.servicios?.nombre || "Servicio no especificado"}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCita.horarios ? (() => {
                        const start = new Date(selectedCita.horarios!.inicio);
                        const dur = selectedCita.servicios?.duracion_min ?? 30;
                        const end = new Date(start.getTime() + (dur || 30) * 60 * 1000);
                        return `${start.toLocaleDateString("es-CL", { weekday: 'long', day: 'numeric', month: 'long' })} • ${fmtHora(start.toISOString())} - ${fmtHora(end.toISOString())}`;
                      })() : "Horario no asignado"}
                    </p>
                  </div>
                </div>

                {/* Notas */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Notas</p>
                    {selectedCita.notas ? (
                      <div className="mt-1 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-gray-700 italic">
                        "{selectedCita.notas}"
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-1">Sin notas adicionales</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedCita(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
