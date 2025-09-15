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
            <h2 className="text-4xl font-bold text-center mb-12">
        <span className="text-gray-800">Nuestro </span>
        <span className="text-indigo-400">Equipo</span>
        <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(vets ?? []).map((v) => (
          <VetCard key={v.id} vet={v} />
        ))}
      </div>
    </div>
  );
}
