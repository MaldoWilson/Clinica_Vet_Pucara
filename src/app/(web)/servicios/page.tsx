import { supabaseServer } from "@/lib/supabaseClient";
import ServiceCard from "@/components/ServiceCard";

export default async function ServiciosPage() {
  const supa = supabaseServer();
  const { data } = await supa.from("services").select("*").order("name");
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">Servicios</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data ?? []).map((s:any) => <ServiceCard key={s.id} service={s} />)}
      </div>
    </div>
  );
}
