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
  servicio: { id: string; nombre: string } | null;
  horario: { id: string; inicio: string; fin: string } | null;
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
    const res = await fetch("/api/admin/citas", {
      method: "PATCH",
      body: JSON.stringify({ id, action }),
    });
    const j = await res.json();
    if (!res.ok) {
      alert(j.error || "Error");
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
  };

  const hayCitas = citas.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Estado:</label>
        <select value={estado} onChange={onChangeEstado} className="border rounded-xl px-3 py-2">
          {options.map((o) => (
            <option key={o} value={o}>
              {o || "Todos"}
            </option>
          ))}
        </select>
        {pending && <span className="text-sm text-neutral-500">Cargando…</span>}
      </div>

      {!hayCitas ? (
        <div className="border rounded-xl p-6 text-neutral-600">No hay citas para mostrar.</div>
      ) : (
        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Hora</th>
                <th className="text-left p-3">Servicio</th>
                <th className="text-left p-3">Tutor</th>
                <th className="text-left p-3">Mascota</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => {
                const fecha = c.horario ? new Date(c.horario.inicio).toLocaleDateString("es-CL", { dateStyle: "medium" }) : "-";
                const hora = c.horario
                  ? `${new Date(c.horario.inicio).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} - ${new Date(c.horario.fin).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`
                  : "-";
                return (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{fecha}</td>
                    <td className="p-3">{hora}</td>
                    <td className="p-3">{c.servicio?.nombre ?? "-"}</td>
                    <td className="p-3">
                      {c.tutor_nombre}
                      <div className="text-neutral-500">{c.tutor_telefono || c.tutor_email || "-"}</div>
                    </td>
                    <td className="p-3">{c.mascota_nombre}</td>
                    <td className="p-3">{c.estado}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 rounded-lg border"
                          onClick={() => doAction(c.id, "confirmar")}
                          disabled={c.estado !== "PENDIENTE"}
                          title="Confirmar"
                        >
                          Confirmar
                        </button>
                        <button
                          className="px-3 py-1 rounded-lg border"
                          onClick={() => doAction(c.id, "atendida")}
                          disabled={c.estado === "ATENDIDA" || c.estado === "CANCELADA"}
                          title="Marcar atendida"
                        >
                          Atendida
                        </button>
                        <button
                          className="px-3 py-1 rounded-lg border text-red-600"
                          onClick={() => doAction(c.id, "cancelar")}
                          disabled={c.estado === "CANCELADA"}
                          title="Cancelar (libera el horario)"
                        >
                          Cancelar
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
