"use client";
import { useState } from "react";
import Image from "next/image";
import MapVet from "@/components/MapaVet";
import WhatsAppButton from "@/components/whatsapp";

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
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
      
    
      <div className="space-y-6">
        <Image
          src="/logo.png" 
          alt="Clínica Pucará"
          width={300}
          height={300}
          priority
        />

        <div>
          <h2 className="text-xl font-semibold mb-2">Ubicación</h2>
          <p className="text-neutral-700">{direccion}</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Ver en Google Maps
          </a>
        </div>

        <MapVet query={direccion} heightClass="h-[280px]" />
      </div>

      {/* Columna derecha: Formulario */}
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">Contacto</h1>
        <input
          name="name"
          placeholder="Tu nombre"
          className="w-full border rounded-xl p-3"
          required
        />
        <input
          name="email"
          placeholder="Correo (opcional)"
          className="w-full border rounded-xl p-3"
        />
        <input
          name="phone"
          placeholder="Teléfono (opcional)"
          className="w-full border rounded-xl p-3"
        />
        <textarea
          name="message"
          placeholder="¿Cómo podemos ayudarte?"
          className="w-full border rounded-xl p-3"
          rows={5}
          required
        />
        <button
          disabled={sending}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white w-full"
        >
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </form>
           <WhatsAppButton
        phone="569"   // Pongamos numero para probar
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating // botón flotante abajo a la derecha
      />
    </div>



  );
}
