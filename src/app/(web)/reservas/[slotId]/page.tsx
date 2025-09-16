"use client";

import { useEffect, useMemo, useState } from "react";
import WhatsAppButton from "@/components/whatsapp";

type Servicio = { id: string; nombre: string };
type Slot = {
  id: string;
  inicio: string;
  fin: string;
  reservado: boolean;
  veterinario?: { id: string; nombre: string } | null;
};

export default function ReservarSlot({ params }: { params: { slotId: string } }) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formateadores
  const fmtFecha = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "short" }) : "-";
  const fmtHora = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "-";

  // Carga servicios y detalle del slot
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/servicios").then((r) => r.json()).catch(() => ({ data: [] })),
      // Si tu /api/horarios soporta filtro por id, intenta obtener el slot
      fetch(`/api/horarios?slotId=${params.slotId}`).then((r) => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([srv, s]) => {
        setServicios(srv?.data || []);
        // si el API devuelve un objeto o un array, normalizamos
        const maybe = Array.isArray(s?.data) ? s.data[0] : s?.data || null;
        setSlot(maybe || null);
      })
      .finally(() => setLoading(false));
  }, [params.slotId]);

  // Texto de cabecera del slot
  const encabezadoSlot = useMemo(() => {
    if (!slot) return "Completar reserva";
    const vet = slot.veterinario?.nombre ? ` · ${slot.veterinario.nombre}` : "";
    return `${fmtFecha(slot.inicio)} ${fmtHora(slot.inicio)}–${fmtHora(slot.fin)}${vet}`;
  }, [slot]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const f = new FormData(e.currentTarget);
    const servicioId = String(f.get("servicioId") || "");
    const tutorNombre = String(f.get("tutorNombre") || "");
    const tutorTelefono = String(f.get("tutorTelefono") || "");
    const tutorEmail = String(f.get("tutorEmail") || "");
    const mascotaNombre = String(f.get("mascotaNombre") || "");
    const notas = String(f.get("notas") || "");

    // Validaciones
    if (!servicioId) return setError("Selecciona un servicio.");
    if (!tutorNombre.trim()) return setError("Ingresa tu nombre.");
    if (!mascotaNombre.trim()) return setError("Ingresa el nombre de tu mascota.");
    if (!tutorTelefono.trim() && !tutorEmail.trim()) {
      return setError("Indica al menos un medio de contacto (teléfono o correo).");
    }

    setSending(true);
    try {
      const payload = {
        horarioId: params.slotId,
        servicioId,
        tutorNombre,
        tutorTelefono,
        tutorEmail,
        mascotaNombre,
        notas,
      };
      const res = await fetch("/api/citas", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "No se pudo crear la reserva.");
      }
      alert("✅ Reserva creada con éxito");
      window.location.href = "/reservas";
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al reservar.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">
        {loading ? "Cargando…" : encabezadoSlot}
      </h1>
      {!loading && !slot && (
        <p className="text-red-600 mb-4">
          No se pudo cargar el detalle del horario. Puedes continuar, pero asegúrate de haber
          seleccionado un horario válido desde la lista.
        </p>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <select name="servicioId" required className="w-full border rounded-xl p-3" disabled={sending} aria-label="Seleccionar servicio">
          <option value="">Selecciona un servicio…</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        <input
          name="tutorNombre"
          placeholder="Tu nombre"
          required
          className="w-full border rounded-xl p-3"
          disabled={sending}
        />
        <input
          name="tutorTelefono"
          placeholder="Teléfono"
          className="w-full border rounded-xl p-3"
          disabled={sending}
        />
        <input
          name="tutorEmail"
          placeholder="Correo"
          className="w-full border rounded-xl p-3"
          type="email"
          disabled={sending}
        />
        <input
          name="mascotaNombre"
          placeholder="Nombre de tu mascota"
          required
          className="w-full border rounded-xl p-3"
          disabled={sending}
        />
        <textarea
          name="notas"
          placeholder="Notas (opcional)"
          className="w-full border rounded-xl p-3"
          rows={4}
          disabled={sending}
        />
        <button disabled={sending} className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300">
          {sending ? "Enviando…" : "Reservar"}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          * Si tu mascota requiere atención urgente, contáctanos directamente por WhatsApp para una atención más rápida.
        </p>
      </form>

      <WhatsAppButton
        phone="569"   // Pongamos numero para probar
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating // botón flotante abajo a la derecha
      />

    </div>
  );
}
