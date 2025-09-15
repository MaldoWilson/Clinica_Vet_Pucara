"use client";
import { useState } from "react";
import Image from "next/image";
import MapVet from "@/components/MapaVet";
import WhatsAppButton from "@/components/whatsapp";
import contactoBg from "@/app/img/contacto.png";

export default function ContactoPage() {
  const direccion = "Esmeralda 97, San Bernardo, Santiago, Chile";
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/contacto", { method: "POST", body: JSON.stringify(body) });
    setSending(false);
    if (res.ok) {
      alert("¡Mensaje enviado!");
      e.currentTarget.reset();
    } else {
      alert("Error al enviar");
    }
  };

  return (
    <section className="relative -mb-16">
      {/* Fondo con imagen personalizada */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${(contactoBg as unknown as { src: string }).src})` }}
      />
      <div className="absolute inset-0 -z-10 bg-teal-900/60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6 md:pb-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Columna izquierda: texto, datos y mapa, con logo pequeño */}
          <div className="text-white">
            <div className="flex items-center gap-3 mb-6">
              
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">¡Agenda Tu Cita con Nosotros!</h1>
            </div>
            <p className="text-teal-50/90 max-w-2xl mb-6">
              Estamos aquí para cuidar de tu mascota. Completa el formulario y te contactaremos a la brevedad.
              También puedes escribirnos o visitar nuestra ubicación a continuación.
            </p>

            <div className="space-y-2 mb-4">
              <p className="flex items-center gap-2 text-teal-50/90">
                <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                medicoveterinariodomicilio@gmail.com
              </p>
              <p className="flex items-center gap-2 text-teal-50/90">
                <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h2l3.6 7.59a1 1 0 00.9.57H17a1 1 0 001-1V7a1 1 0 00-1-1h-6"/></svg>
                +56 9 9272 9827
              </p>
            </div>

            <div className="bg-white/90 rounded-xl p-4 shadow-xl">
              <h2 className="text-neutral-900 text-lg font-semibold mb-1">Ubicación</h2>
              <p className="text-neutral-700 text-sm mb-2">{direccion}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
                target="_blank"
                rel="noreferrer"
                className="text-teal-700 hover:underline text-sm"
              >
                Ver en Google Maps
              </a>
              <div className="mt-3">
                <MapVet query={direccion} heightClass="h-[260px]" />
              </div>
            </div>
          </div>

          {/* Columna derecha: Formulario */}
          <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Formulario</h2>
              <p className="text-sm text-neutral-600">¡Estamos aquí para ayudarte!</p>
            </div>
            <input name="name" placeholder="Nombre completo" className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
            <input name="phone" placeholder="Número de contacto" className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="subject" placeholder="Tipo de consulta" className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input name="reference" placeholder="Ubicación de referencia" className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <textarea name="message" placeholder="Mensaje" rows={5} className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" required />
            <button
          disabled={sending}
          className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 w-full"
        >
          {sending ? "Enviando..." : "Enviar"}
        </button>


          </form>
        </div>
      </div>

      <WhatsAppButton
        phone="569"
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating
      />
    </section>
  );
}
