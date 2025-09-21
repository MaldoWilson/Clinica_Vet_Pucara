// Página de depuración para verificar la conexión a la base de datos
import { supabaseServer } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function DebugCitasPage() {
  const supa = supabaseServer();

  // Prueba 1: Verificar conexión básica
  const { data: testConnection, error: connectionError } = await supa
    .from("citas")
    .select("count", { count: "exact", head: true });

  // Prueba 2: Obtener todas las citas sin filtros
  const { data: allCitas, error: allCitasError } = await supa
    .from("citas")
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(5);

  // Prueba 3: Verificar estructura de la tabla
  const { data: tableInfo, error: tableError } = await supa
    .from("citas")
    .select("id, estado, tutor_nombre, mascota_nombre, creado_en")
    .limit(1);

  // Prueba 4: Verificar políticas RLS
  const { data: rlsTest, error: rlsError } = await supa
    .from("citas")
    .select("id")
    .limit(1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">🔍 Debug - Base de Datos Citas</h1>
      
      <div className="space-y-6">
        {/* Prueba 1: Conexión */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">1. Prueba de Conexión</h2>
          <div className="text-sm space-y-1">
            <p><strong>Estado:</strong> {connectionError ? "❌ Error" : "✅ Conectado"}</p>
            <p><strong>Total de citas:</strong> {testConnection?.[0]?.count || "N/A"}</p>
            {connectionError && (
              <div className="mt-2 p-2 bg-red-100 rounded text-red-700">
                <strong>Error:</strong> {connectionError.message}
              </div>
            )}
          </div>
        </div>

        {/* Prueba 2: Datos */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">2. Datos de Citas</h2>
          <div className="text-sm space-y-1">
            <p><strong>Estado:</strong> {allCitasError ? "❌ Error" : "✅ Datos obtenidos"}</p>
            <p><strong>Citas encontradas:</strong> {allCitas?.length || 0}</p>
            {allCitasError && (
              <div className="mt-2 p-2 bg-red-100 rounded text-red-700">
                <strong>Error:</strong> {allCitasError.message}
              </div>
            )}
            {allCitas && allCitas.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Primeras 5 citas:</p>
                <div className="mt-2 space-y-2">
                  {allCitas.map((cita, index) => (
                    <div key={cita.id} className="p-2 bg-gray-50 rounded text-xs">
                      <p><strong>#{index + 1}:</strong> {cita.tutor_nombre} - {cita.mascota_nombre}</p>
                      <p>Estado: {cita.estado} | Fecha: {new Date(cita.creado_en).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prueba 3: Estructura */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">3. Estructura de Tabla</h2>
          <div className="text-sm space-y-1">
            <p><strong>Estado:</strong> {tableError ? "❌ Error" : "✅ Estructura OK"}</p>
            {tableError && (
              <div className="mt-2 p-2 bg-red-100 rounded text-red-700">
                <strong>Error:</strong> {tableError.message}
              </div>
            )}
            {tableInfo && tableInfo.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Estructura de datos:</p>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(tableInfo[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Prueba 4: RLS */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">4. Prueba de Políticas RLS</h2>
          <div className="text-sm space-y-1">
            <p><strong>Estado:</strong> {rlsError ? "❌ Error RLS" : "✅ RLS OK"}</p>
            <p><strong>Datos accesibles:</strong> {rlsTest?.length || 0}</p>
            {rlsError && (
              <div className="mt-2 p-2 bg-red-100 rounded text-red-700">
                <strong>Error RLS:</strong> {rlsError.message}
                <div className="mt-1 text-xs">
                  <strong>Posible causa:</strong> Las políticas RLS están bloqueando el acceso
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-yellow-800">💡 Información Adicional</h2>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Si no hay citas, verifica que existan datos en la tabla "citas"</p>
            <p>• Si hay error de conexión, verifica las variables de entorno de Supabase</p>
            <p>• Si hay error de permisos, verifica las políticas RLS de Supabase</p>
            <p>• <strong>Para deshabilitar RLS temporalmente:</strong> Ve a Supabase → Authentication → Policies → Disable RLS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
