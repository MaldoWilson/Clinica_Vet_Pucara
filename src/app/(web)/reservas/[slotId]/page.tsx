"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import WhatsAppButton from "@/components/whatsapp";
import ConfirmationModal from "@/components/ConfirmationModal";

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<any>(null);

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

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
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

    // Guardar datos del formulario y mostrar modal de confirmación
    setFormData({
      horarioId: params.slotId,
      servicioId,
      tutorNombre,
      tutorTelefono,
      tutorEmail,
      mascotaNombre,
      notas,
    });
    setShowConfirmation(true);
  };

  const confirmReservation = async () => {
    if (!formData) return;

    setSending(true);
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "No se pudo crear la reserva.");
      }
      
      // Mostrar modal de éxito en lugar de alert
      setShowConfirmation(false);
      setFormData(null);
      
      // Marcar en localStorage que hubo una reserva exitosa
      localStorage.setItem('reserva_exitosa', 'true');
      
      // Crear modal de éxito
      const successModal = document.createElement('div');
      successModal.className = 'fixed inset-0 z-50 flex items-center justify-center';
      successModal.innerHTML = `
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 text-center">
          <div class="text-green-500 text-6xl mb-4">✅</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">¡Reserva creada con éxito!</h3>
          <p class="text-gray-600 mb-6">Tu cita ha sido confirmada. Te contactaremos pronto.</p>
          <button 
            onclick="this.closest('.fixed').remove(); window.location.href='/reservas';"
            class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Continuar
          </button>
        </div>
      `;
      document.body.appendChild(successModal);
      
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al reservar.");
      setShowConfirmation(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/reservas" className="hover:text-indigo-500">
          Servicios
        </Link>
        <span>›</span>
        <span className="text-gray-800 font-medium">Reservar</span>
      </div>

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

      <form onSubmit={submit} className="space-y-4">
        <div className="bg-gray-50 border rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Seleccionar servicio</h3>
          <select name="servicioId" required className="w-full border rounded-xl p-3" disabled={sending} aria-label="Seleccionar servicio">
            <option value="">Selecciona un servicio…</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
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

        <button disabled={sending} className="w-full px-6 py-4 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 disabled:opacity-50">
          {sending ? "Creando reserva…" : "Confirmar Reserva"}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          * Si tu mascota requiere atención urgente, contáctanos directamente por WhatsApp para una atención más rápida.
        </p>
      </form>

      <WhatsAppButton
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating // botón flotante abajo a la derecha
      />

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setFormData(null);
        }}
        onConfirm={confirmReservation}
        title="Confirmar reserva"
        message={`¿Estás seguro de que quieres reservar este horario?

${encabezadoSlot}

${formData?.servicioId ? `Servicio seleccionado: ${servicios.find(s => s.id === formData.servicioId)?.nombre || 'Servicio'}` : ''}

Una vez confirmada, recibirás un mensaje de confirmación.`}
        confirmText="Confirmar reserva"
        cancelText="Cancelar"
        isLoading={sending}
      />

    </div>
  );
}
