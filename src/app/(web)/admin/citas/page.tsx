// app/admin/citas/page.tsx
import { supabaseServer } from "@/lib/supabaseClient";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";

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
      servicio:servicio_id ( id, nombre ),
      horario:horario_id ( id, inicio, fin )
    `)
    .order("creado_en", { ascending: false });

  if (estado) query.eq("estado", estado);

  const { data, error } = await query;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">Admin · Citas</h1>
        <p className="text-red-600">Error cargando citas: {error.message}</p>
      </div>
    );
  }

  return <AdminPanel initialCitas={data ?? []} estado={estado} />;
}
