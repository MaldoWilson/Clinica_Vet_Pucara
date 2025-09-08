import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import { supabaseServer } from "@/lib/supabaseClient";

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
    </div>
  );
}
