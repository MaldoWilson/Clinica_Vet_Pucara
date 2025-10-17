export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { supabaseServer } from "@/lib/supabaseClient";
import FormulariosTable, { MensajeContacto } from "@/components/FormulariosTable";

type Mensaje = {
  id: string;
  creado_en?: string | null;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  mensaje: string;
};

export default async function FormulariosPage() {
  const supa = supabaseServer();
  const { data, error } = await supa
    .from("mensajes_contacto")
    .select("id, creado_en, nombre, correo, telefono, mensaje")
    .order("creado_en", { ascending: false });

  if (error) {
    return (
      <div className="px-4 py-12">
        <p className="text-red-600">Error cargando mensajes: {error.message}</p>
      </div>
    );
  }

  const mensajes = (data || []) as MensajeContacto[];

  return (
    <div className="space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Formularios de Contacto</h1>
          <p className="text-gray-600">Mensajes recibidos desde el sitio</p>
        </div>
      </div>

      {mensajes.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          <div className="text-4xl mb-2">📬</div>
          <p className="text-lg font-medium">No hay mensajes recibidos aún</p>
        </div>
      ) : (
        <FormulariosTable items={mensajes} />
      )}
    </div>
  );
}


