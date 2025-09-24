export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { supabaseServer } from "@/lib/supabaseClient";

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

  const mensajes = (data || []) as Mensaje[];

  return (
    <div className="px-4 py-12 space-y-4">
      {mensajes.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-gray-500 bg-white">
          <div className="text-4xl mb-2">📬</div>
          <p className="text-lg font-medium">No hay mensajes recibidos aún</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left p-3 font-semibold">📅 Fecha</th>
                <th className="text-left p-3 font-semibold">👤 Nombre</th>
                <th className="text-left p-3 font-semibold">✉️ Correo</th>
                <th className="text-left p-3 font-semibold">📞 Teléfono</th>
                <th className="text-left p-3 font-semibold">📝 Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {mensajes.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50 align-top">
                  <td className="p-3">{m.creado_en ? new Date(m.creado_en).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" }) : "-"}</td>
                  <td className="p-3 font-medium">{m.nombre}</td>
                  <td className="p-3 text-blue-700">{m.correo || "-"}</td>
                  <td className="p-3">{m.telefono || "-"}</td>
                  <td className="p-3 whitespace-pre-wrap max-w-[480px]">{m.mensaje}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


