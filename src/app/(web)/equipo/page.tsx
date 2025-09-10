import { supabaseServer } from "@/lib/supabaseClient";
import VetCard from "@/components/VetCard";

export default async function EquipoPage() {
  const supa = supabaseServer(); // o un cliente ANON para lectura pública
  const { data: vets, error } = await supa
    .from("veterinarios")
    .select("id, nombre, especialidad, foto_url")
    .order("nombre", { ascending: true });

  if (error) {
    console.error(error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">Nuestro Equipo</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(vets ?? []).map((v) => (
          <VetCard key={v.id} vet={v} />
        ))}
      </div>
    </div>
  );
}
