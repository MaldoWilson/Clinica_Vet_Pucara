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
                <tr
                  key={m.id}
                  className="border-t hover:bg-gray-50 align-top cursor-pointer transition-colors"
                  onClick={() => setSelected(m)}
                >
                  <td className="p-3">{m.creado_en ? new Date(m.creado_en).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" }) : "-"}</td>
                  <td className="p-3 font-medium">{m.nombre}</td>
                  <td className="p-3 text-blue-700">{m.correo || "-"}</td>
                  <td className="p-3">{m.telefono || "-"}</td>
                  <td className="p-3 max-w-[520px]">
                    <span className="inline-block align-top text-gray-800 whitespace-pre-wrap line-clamp-2">
                      {m.mensaje}
                    </span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalles del Mensaje</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                {/* Remitente */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Remitente</p>
                    <p className="text-base font-semibold text-gray-900">{selected.nombre}</p>
                    <p className="text-sm text-gray-600">{selected.creado_en ? new Date(selected.creado_en).toLocaleString("es-CL", { dateStyle: "long", timeStyle: "short" }) : "-"}</p>
                  </div>
                </div>

                {/* Contacto */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Contacto</p>
                    <div className="space-y-1 mt-1">
                      {selected.correo && (
                        <div className="flex items-center text-sm text-gray-900">
                          <span className="font-medium">{selected.correo}</span>
                        </div>
                      )}
                      {selected.telefono && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selected.telefono}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mensaje */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-2">Mensaje</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selected.mensaje}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


