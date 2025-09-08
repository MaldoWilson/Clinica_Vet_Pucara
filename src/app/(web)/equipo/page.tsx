import { supabaseServer } from "@/lib/supabaseClient";

export default async function EquipoPage() {
  const supa = supabaseServer();
  const { data } = await supa.from("veterinarios").select("id, nombre, especialidad, foto_url");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">Nuestro equipo</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data ?? []).map((v:any) => (
          <article key={v.id} className="rounded-2xl border p-5">
            <div className="font-semibold">{v.nombre}</div>
            <div className="text-sm text-neutral-600">{v.especialidad}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
