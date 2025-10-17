// app/admin/(modules)/citas/page.tsx
import { supabaseServer } from "@/lib/supabaseClient";
import AdminCitasTable from "@/components/AdminCitasTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SearchParams = { estado?: string };

export default async function AdminCitasPage({ searchParams }: { searchParams: SearchParams }) {
  const estado = searchParams.estado ?? "";
  const supa = supabaseServer();

  const query = supa
    .from("citas")
    .select(`
      id, estado, creado_en,
      tutor_nombre, tutor_telefono, tutor_email, mascota_nombre, notas,
      servicio_id, horario_id,
      servicios:servicios(nombre, duracion_min),
      horarios:horarios(inicio, fin)
    `)
    .order("creado_en", { ascending: false });

  if (estado) query.eq("estado", estado);

  const { data, error } = await query;

  if (error) {
    return (
      <div className="px-4 py-12">
        <p className="text-red-600">Error cargando citas: {error.message}</p>
        <details className="mt-4 p-4 bg-gray-100 rounded">
          <summary className="cursor-pointer font-medium">Detalles del error</summary>
          <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-600">Visualiza, filtra y gestiona las citas</p>
        </div>
      </div>
      <AdminCitasTable initialCitas={(data ?? []) as any} initialEstado={estado} />
    </div>
  );
}



