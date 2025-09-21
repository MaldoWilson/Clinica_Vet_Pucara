// Componente de administar las citas falta modificar
"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
};

export default function AdminCitasTable({
  initialCitas,
  initialEstado,
}: {
  initialCitas: Cita[];
  initialEstado: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [citas, setCitas] = useState<Cita[]>(initialCitas);
  const [estado, setEstado] = useState<string>(initialEstado);
  const [pending, startTransition] = useTransition();

  const options = ["", "PENDIENTE", "CONFIRMADA", "ATENDIDA", "CANCELADA"];

  // Formatea fecha/hora
  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" }) : "-";

  // Cambia el filtro (actualiza querystring y recarga server component)
  const onChangeEstado = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEstado(value);
    const qs = new URLSearchParams(params.toString());
    if (value) qs.set("estado", value);
    else qs.delete("estado");
    startTransition(() => {
      router.replace(`/admin/citas?${qs.toString()}`);
      router.refresh();
    });
  };

  const doAction = async (id: string, action: "confirmar" | "atendida" | "cancelar") => {
    console.log("🔍 Debug - Acción iniciada:", { id, action });
    
    try {
      const res = await fetch("/api/admin/citas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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
    } catch (error) {
      console.error("🔍 Debug - Error en doAction:", error);
      alert(`Error de conexión: ${error}`);
    }
  };

  const hayCitas = citas.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select 
            value={estado} 
            onChange={onChangeEstado} 
            className="border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            title="Seleccionar estado de cita para filtrar"
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {o || "Todos"}
              </option>
            ))}
          </select>
          {pending && <span className="text-sm text-neutral-500">Cargando…</span>}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{citas.length}</span> cita{citas.length !== 1 ? 's' : ''} encontrada{citas.length !== 1 ? 's' : ''}
        </div>
      </div>

      {!hayCitas ? (
        <div className="border rounded-xl p-8 text-center text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-lg font-medium">No hay citas para mostrar</p>
          <p className="text-sm">Las citas aparecerán aquí cuando los clientes las reserven</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3 font-semibold">📅 Fecha Creación</th>
                <th className="text-left p-3 font-semibold">🩺 Servicio ID</th>
                <th className="text-left p-3 font-semibold">👤 Tutor</th>
                <th className="text-left p-3 font-semibold">🐾 Mascota</th>
                <th className="text-left p-3 font-semibold">📊 Estado</th>
                <th className="text-left p-3 font-semibold">⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => {
                const fechaCreacion = new Date(c.creado_en).toLocaleString("es-CL", { 
                  dateStyle: "medium",
                  timeStyle: "short"
                });
                
                return (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{fechaCreacion}</td>
                    <td className="p-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {c.servicio_id ? c.servicio_id.substring(0, 8) + "..." : "-"}
                      </span>
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
    </div>
  );
}
