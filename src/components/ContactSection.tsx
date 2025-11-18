"use client";

import { CSSProperties, FormEvent, useState } from "react";
import MapVet from "@/components/MapaVet";
import WhatsAppButton from "@/components/whatsapp";
import contactoBg from "@/app/img/Contacto2.png";

type ContactSectionProps = {
  showFloatingButton?: boolean;
  withBackground?: boolean;
  backgroundMode?: "page" | "section";
  minHeightClass?: string;
  anchorId?: string;
};

export default function ContactSection({
  showFloatingButton = true,
  withBackground = true,
  backgroundMode = "page",
  minHeightClass = "min-h-screen",
  anchorId,
}: ContactSectionProps) {
  const direccion = "Esmeralda 97, San Bernardo, Santiago, Chile";
  const [sending, setSending] = useState(false);
  const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "";

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const nombre = formData.get("nombre") as string;
    const correo = formData.get("correo") as string;
    const telefono = formData.get("telefono") as string;
    const mensaje = formData.get("mensaje") as string;

    if (!nombre?.trim()) {
      alert("El nombre completo es obligatorio");
      setSending(false);
      return;
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      alert("Por favor ingresa un correo electrónico válido");
      setSending(false);
      return;
    }

    if (telefono && !/^[\+]?\d[0-9\s\-()]{7,14}$/.test(telefono)) {
      alert("Por favor ingresa un número de teléfono válido");
      setSending(false);
      return;
    }

    if (!mensaje?.trim()) {
      alert("El mensaje es obligatorio");
      setSending(false);
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      correo: correo?.trim() || undefined,
      telefono: telefono?.trim() || undefined,
      mensaje: mensaje.trim(),
    };

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("¡Mensaje enviado!");
        form.reset();
      } else {
        alert("Error al enviar");
      }
    } catch (err) {
      alert("No se pudo enviar. Revisa tu conexión.");
    } finally {
      setSending(false);
    }
  };

  const backgroundPositionClass = backgroundMode === "page" ? "fixed inset-0" : "absolute inset-0";
  const wrapperClasses = [
    "relative",
    minHeightClass,
    backgroundMode === "section" ? "overflow-hidden" : "",
  ].filter(Boolean).join(" ");

  return (
    <div id={anchorId} className={wrapperClasses}>
      {withBackground && (
        <div
          className={`${backgroundPositionClass} -z-10 bg-cover bg-center contacto-bg`}
          style={{ "--contacto-bg": `url(${contactoBg.src})` } as CSSProperties}
        />
      )}

      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
            <div className="text-white order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">¡Contactate con nosotros!</h1>
              </div>
              <p className="text-sm sm:text-base text-teal-50/90 max-w-2xl mb-4 sm:mb-6">
                Estamos aquí para cuidar de tu mascota. Completa el formulario y te contactaremos a la brevedad.
                También puedes escribirnos o visitar nuestra ubicación a continuación.
              </p>

              <div className="space-y-2 mb-6">
                <p className="flex items-center gap-2 text-teal-50/90">
                  <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  {CONTACT_EMAIL || "contacto@clinicapucara.cl"}
                </p>
                <p className="flex items-center gap-2 text-teal-50/90">
                  <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h2l3.6 7.59a1 1 0 00.9.57H17a1 1 0 001-1V7a1 1 0 00-1-1h-6"/></svg>
                  {WHATSAPP_PHONE ? `+${WHATSAPP_PHONE.replace(/^(?!\+)/, "")}` : "+56 9 9272 9827"}
                </p>
              </div>

              <div className="bg-white/90 rounded-xl p-3 sm:p-4 shadow-xl">
                <h2 className="text-neutral-900 text-base sm:text-lg font-semibold mb-1">Ubicación</h2>
                <p className="text-neutral-700 text-xs sm:text-sm mb-2">{direccion}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 hover:underline text-xs sm:text-sm"
                >
                  Ver en Google Maps
                </a>
                <div className="mt-3">
                  <MapVet query={direccion} heightClass="h-[200px] sm:h-[240px] md:h-[260px]" />
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 lg:sticky lg:top-24">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Formulario</h2>
                  <p className="text-xs sm:text-sm text-neutral-600">¡Estamos aquí para ayudarte!</p>
                </div>
                <input
                  name="nombre"
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <input
                  name="correo"
                  type="email"
                  placeholder="Correo electrónico"
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <input
                  name="telefono"
                  type="tel"
                  placeholder="Número de contacto"
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <textarea
                  name="mensaje"
                  placeholder="Mensaje"
                  rows={5}
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <button
                  disabled={sending}
                  className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 w-full"
                >
                  {sending ? "Enviando..." : "Enviar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {showFloatingButton && (
        <WhatsAppButton
          phone={WHATSAPP_PHONE}
          text="Hola Vengo desde la web y quiero agendar una hora de emergencia para mi mascota"
          floating
        />
      )}
    </div>
  );
}
