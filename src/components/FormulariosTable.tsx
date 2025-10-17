"use client";

import { useMemo, useState } from "react";

export type MensajeContacto = {
  id: string;
  creado_en?: string | null;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  mensaje: string;
};

export default function FormulariosTable({ items }: { items: MensajeContacto[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MensajeContacto | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => {
      return (
        m.nombre.toLowerCase().includes(q) ||
        (m.correo || "").toLowerCase().includes(q) ||
        (m.telefono || "").toLowerCase().includes(q) ||
        m.mensaje.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtrados.slice(start, start + pageSize);
  }, [filtrados, page]);

  function goTo(p: number) {
    const next = Math.min(totalPages, Math.max(1, p));
    setPage(next);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">Mensajes Recibidos</p>
          <p className="text-xs text-gray-500">Desde el formulario de contacto</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, correo, teléfono o texto..."
          className="px-3 py-2 border rounded-lg w-full max-w-xs"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
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
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">Sin resultados</td>
              </tr>
            ) : (
              pageItems.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50 align-top">
                  <td className="p-3">{m.creado_en ? new Date(m.creado_en).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" }) : "-"}</td>
                  <td className="p-3 font-medium">{m.nombre}</td>
                  <td className="p-3 text-blue-700">{m.correo || "-"}</td>
                  <td className="p-3">{m.telefono || "-"}</td>
                  <td className="p-3 max-w-[520px]">
                    <button
                      className="text-left w-full group"
                      onClick={() => setSelected(m)}
                      title="Ver mensaje completo"
                    >
                      <span className="inline-block align-top text-gray-800 whitespace-pre-wrap line-clamp-2 group-hover:underline">
                        {m.mensaje}
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación al estilo pacientes/stock */}
      {filtrados.length > 0 && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
              const idx = i + 1;
              if (totalPages > 7 && idx > 5 && idx < totalPages) {
                return null;
              }
              return (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`min-w-9 h-9 px-3 py-2 rounded border text-sm ${page === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}
                >
                  {idx}
                </button>
              );
            })}
            {totalPages > 7 && (
              <>
                <span className="px-1">…</span>
                <button
                  onClick={() => goTo(totalPages)}
                  className={`min-w-9 h-9 px-3 py-2 rounded border text-sm ${page === totalPages ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          <button
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">Mensaje</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-800">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <span className="block text-xs font-medium text-gray-500">Fecha</span>
                  <span>{selected.creado_en ? new Date(selected.creado_en).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" }) : "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">Nombre</span>
                  <span className="font-medium">{selected.nombre}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">Correo</span>
                  <span>{selected.correo || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">Teléfono</span>
                  <span>{selected.telefono || '-'}</span>
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Contenido</span>
                <div className="border rounded-md p-3 max-h-[50vh] overflow-auto whitespace-pre-wrap leading-relaxed text-gray-900">
                  {selected.mensaje}
                </div>
              </div>
            </div>
            <div className="p-5 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-md border">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


