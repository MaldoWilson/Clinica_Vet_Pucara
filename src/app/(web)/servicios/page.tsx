// src/app/servicios/page.tsx
import { supabaseServer } from "@/lib/supabaseClient";
import ServiceCard from "@/components/ServiceCard";
import WhatsAppButton from "@/components/whatsapp";

export default async function ServiciosPage() {
  const supa = supabaseServer(); // si quieres, usa un cliente ANON para lectura pública
  const { data: servicios, error } = await supa
    .from("servicios")
    .select("id, nombre, descripcion, precio_clp, image_url")
    .order("nombre", { ascending: true })
    .limit(6);

  if (error) console.error(error);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-center mb-12">
        <span className="text-gray-800">Servicios </span>
        <span className="text-indigo-400">Mascota</span>
        <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(servicios ?? []).map((s) => (
          <ServiceCard
            key={s.id}
            service={{
              id: s.id,
              name: s.nombre,
              description: s.descripcion,
              price_clp: s.precio_clp,
              imageUrl: s.image_url,
            }}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <a
          href="/reservas"
          className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300"
        >
          Agendar hora
        </a>
        <a href="/contacto" className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300">
          Contáctanos
        </a>
      </div>
      <WhatsAppButton
        phone="569"
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating
      />
    </div>
  );
}
