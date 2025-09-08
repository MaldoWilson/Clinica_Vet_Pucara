"use client";
import { useState } from "react";

export default function ContactoPage() {
  const [sending, setSending] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/contacto", { method: "POST", body: JSON.stringify(body) });
    setSending(false);
    if (res.ok) { alert("¡Mensaje enviado!"); e.currentTarget.reset(); } else { alert("Error al enviar"); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">Contacto</h1>
      <form onSubmit={submit} className="space-y-4">
        <input name="name" placeholder="Tu nombre" className="w-full border rounded-xl p-3" required />
        <input name="email" placeholder="Correo (opcional)" className="w-full border rounded-xl p-3" />
        <input name="phone" placeholder="Teléfono (opcional)" className="w-full border rounded-xl p-3" />
        <textarea name="message" placeholder="¿Cómo podemos ayudarte?" className="w-full border rounded-xl p-3" rows={5} required />
        <button disabled={sending} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white">
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
