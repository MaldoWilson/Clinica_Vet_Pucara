// Home Principal de la pagina web
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import LatestBlogs from "@/components/LatestBlogs";
import { supabaseServer } from "@/lib/supabaseClient";
import WhatsAppButton from "@/components/whatsapp";


export default async function Home() {
  const supa = supabaseServer();
  const { data: servicios } = await supa
    .from("servicios")
    .select("id, nombre, descripcion, precio_clp")
    .limit(6);

  return (
    <div>
      <Hero />
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Servicios</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(servicios ?? []).map((s) => (
            <ServiceCard key={s.id} service={{
              id: s.id,
              name: s.nombre,
              description: s.descripcion,
              price_clp: s.precio_clp
            }} />
          ))}
        </div>
      </section>
<<<<<<< Updated upstream
      
      <LatestBlogs />
=======

>>>>>>> Stashed changes
     
      <WhatsAppButton
        phone="569"   // Pongamos numero para probar
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating // botón flotante abajo a la derecha
      />
    </div>
  );
}
