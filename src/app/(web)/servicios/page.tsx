
import { supabaseServer } from "@/lib/supabaseClient";
import ServiceCard from "@/components/ServiceCard";

export default async function ServiciosPage() {
  const supa = supabaseServer();
  const { data: servicios } = await supa
    .from("servicios")
    .select("id, nombre, descripcion, precio_clp")
    .limit(6);
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">Servicios</h1>
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
    </div>
  );
}
