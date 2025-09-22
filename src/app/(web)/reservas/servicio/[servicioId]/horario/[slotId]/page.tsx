"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import WhatsAppButton from "@/components/whatsapp";

type Servicio = { 
  id: string; 
  nombre: string; 
  descripcion?: string;
  precio_clp?: number;
  duracion_min?: number;
};
type Slot = {
  id: string;
  inicio: string;
  fin: string;
  reservado: boolean;
  veterinario?: { id: string; nombre: string } | null;
};

export default function ReservarSlotConServicio({ 
  params 
}: { 
  params: { servicioId: string; slotId: string } 
}) {
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

  // Obtener servicio seleccionado
  const servicioSeleccionado = useMemo(() => {
    return servicios.find(s => s.id === params.servicioId) || null;
  }, [servicios, params.servicioId]);

  // Carga servicios y detalle del slot
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/servicios").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch(`/api/horarios?slotId=${params.slotId}`).then((r) => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([srv, s]) => {
        setServicios(srv?.data || []);
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
    const tutorNombre = String(f.get("tutorNombre") || "");
    const tutorTelefono = String(f.get("tutorTelefono") || "");
    const tutorEmail = String(f.get("tutorEmail") || "");
    const mascotaNombre = String(f.get("mascotaNombre") || "");
    const notas = String(f.get("notas") || "");

    // Validaciones
    if (!tutorNombre.trim()) return setError("Ingresa tu nombre.");
    if (!mascotaNombre.trim()) return setError("Ingresa el nombre de tu mascota.");
    if (!tutorTelefono.trim() && !tutorEmail.trim()) {
      return setError("Indica al menos un medio de contacto (teléfono o correo).");
    }

    setSending(true);
    try {
      const payload = {
        horarioId: params.slotId,
        servicioId: params.servicioId,
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

  const formatPrice = (precio?: number) => {
    if (!precio) return "Consultar precio";
    return `$${precio.toLocaleString("es-CL")}`;
  };

  const formatDuration = (duracion?: number) => {
    if (!duracion) return "";
    return `${duracion} min`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/reservas" className="hover:text-indigo-500">
          Servicios
        </Link>
        <span>›</span>
        <Link href={`/reservas/servicio/${params.servicioId}`} className="hover:text-indigo-500">
          Horarios
        </Link>
        <span>›</span>
        <span className="text-gray-800 font-medium">Reservar</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-semibold mb-2">
        {loading ? "Cargando…" : encabezadoSlot}
      </h1>

      {/* Información del servicio seleccionado */}
      {servicioSeleccionado && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-indigo-800 mb-2">Servicio seleccionado:</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-indigo-900">{servicioSeleccionado.nombre}</p>
              {servicioSeleccionado.descripcion && (
                <p className="text-sm text-indigo-700">{servicioSeleccionado.descripcion}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-indigo-600">{formatPrice(servicioSeleccionado.precio_clp)}</p>
              {servicioSeleccionado.duracion_min && (
                <p className="text-xs text-indigo-600">{formatDuration(servicioSeleccionado.duracion_min)}</p>
              )}
            </div>
          </div>
        </div>
      )}

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

      <form onSubmit={submit} className="space-y-4">
        <div className="bg-gray-50 border rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Información del tutor</h3>
          <div className="space-y-3">
            <input
              name="tutorNombre"
              placeholder="Tu nombre completo"
              required
              className="w-full border rounded-xl p-3"
              disabled={sending}
            />
            <input
              name="tutorTelefono"
              placeholder="Teléfono de contacto"
              className="w-full border rounded-xl p-3"
              disabled={sending}
            />
            <input
              name="tutorEmail"
              placeholder="Correo electrónico"
              className="w-full border rounded-xl p-3"
              type="email"
              disabled={sending}
            />
          </div>
        </div>

        <div className="bg-gray-50 border rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Información de la mascota</h3>
          <div className="space-y-3">
            <input
              name="mascotaNombre"
              placeholder="Nombre de tu mascota"
              required
              className="w-full border rounded-xl p-3"
              disabled={sending}
            />
            <textarea
              name="notas"
              placeholder="Notas adicionales (opcional) - Describe síntomas, comportamiento, etc."
              className="w-full border rounded-xl p-3"
              rows={4}
              disabled={sending}
            />
          </div>
        </div>

        <button 
          disabled={sending} 
          className="w-full px-6 py-4 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 disabled:opacity-50"
        >
          {sending ? "Creando reserva…" : "Confirmar Reserva"}
        </button>

        <p className="text-sm text-gray-600 text-center">
          * Si tu mascota requiere atención urgente, contáctanos directamente por WhatsApp para una atención más rápida.
        </p>
      </form>

      <WhatsAppButton
        phone="569"
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating
      />
    </div>
  );
}
