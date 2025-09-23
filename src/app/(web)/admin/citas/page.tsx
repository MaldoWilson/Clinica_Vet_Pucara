// app/admin/citas/page.tsx
import { supabaseServer } from "@/lib/supabaseClient";
import AdminPanel from "@/components/AdminPanel";
import AdminCitasTable from "@/components/AdminCitasTable";
import FichaForm from "@/components/FichasForm";
import RecetaForm from "@/components/RecetaForm";
import CertificadoForm from "@/components/CertificadoForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SearchParams = { estado?: string };

export default async function AdminCitasPage({ searchParams }: { searchParams: SearchParams }) {
  const estado = searchParams.estado ?? "";
  const supa = supabaseServer();

  // Consulta simplificada sin relaciones para evitar problemas
  const query = supa
    .from("citas")
    .select(`
      id, estado, creado_en,
      tutor_nombre, tutor_telefono, tutor_email, mascota_nombre, notas,
      servicio_id, horario_id
    `)
    .order("creado_en", { ascending: false });

  if (estado) query.eq("estado", estado);

  const { data, error } = await query;

  console.log("🔍 Debug - Consulta simplificada:", { data, error });

  // Logs de depuración
  console.log("🔍 Debug - Estado filtro:", estado);
  console.log("🔍 Debug - Query error:", error);
  console.log("🔍 Debug - Data recibida:", data);
  console.log("🔍 Debug - Cantidad de citas:", data?.length || 0);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">Admin · Citas</h1>
        <p className="text-red-600">Error cargando citas: {error.message}</p>
        <details className="mt-4 p-4 bg-gray-100 rounded">
          <summary className="cursor-pointer font-medium">Detalles del error</summary>
          <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">Admin · Citas</h1>
      
      {/* Panel de depuración */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">🔍 Información de depuración:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Estado filtro:</strong> {estado || "Todos"}</p>
          <p><strong>Citas encontradas:</strong> {data?.length || 0}</p>
          <p><strong>Error:</strong> {error ? "Sí" : "No"}</p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 rounded text-red-700">
              <strong>Error:</strong> {(error as any)?.message || "Error desconocido"}
            </div>
          )}
          {data && data.length > 0 && (
            <div className="mt-2 p-2 bg-green-100 rounded text-green-700">
              <strong>Primera cita:</strong> {data[0].tutor_nombre} - {data[0].mascota_nombre}
            </div>
          )}
        </div>
      </div>

      <AdminPanel
        title="Citas"
        tabs={[
          {
            id: "citas",
            label: "📅 Citas",
            content: <AdminCitasTable initialCitas={(data ?? []) as any} initialEstado={estado} />,
          },
          { id: "fichas", label: "🐾 Fichas Mascota", content: <FichaForm /> },
          { id: "recetas", label: "💊 Recetas Médicas", content: <RecetaForm /> },
          { id: "certificados", label: "📄 Certificados", content: <CertificadoForm /> },
        ]}
        initialActiveTabId="citas"
      />
    </div>
  );
}
