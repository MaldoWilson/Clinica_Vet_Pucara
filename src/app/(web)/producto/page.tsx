import { supabaseServer } from "@/lib/supabaseClient";

export default async function ProductosPage() {
  const supa = supabaseServer();
  const { data } = await supa
    .from("productos")
    .select("id, nombre, descripcion, precio, foto_url");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">Nuestros Productos</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data ?? []).map((p: any) => (
          <article key={p.id} className="rounded-2xl border p-5 flex flex-col items-center">
            {p.foto_url && (
              <img
                src={p.foto_url}
                alt={p.nombre}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}
            <div className="font-semibold text-lg">{p.nombre}</div>
            <div className="text-sm text-neutral-600 mb-2">{p.descripcion}</div>
            <div className="font-medium text-blue-600">${p.precio}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
