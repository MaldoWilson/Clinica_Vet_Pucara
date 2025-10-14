"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeRutPlain, formatRutPretty } from "@/lib/rut";

// Componente skeleton para tarjetas de pacientes
function PacienteSkeletonCard() {
  return (
    <div className="group relative overflow-hidden rounded-2xl ring-1 ring-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm animate-pulse">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400" />
      <div className="relative z-10 p-5">
        <div className="flex gap-4">
          {/* Propietario skeleton */}
          <div className="w-1/2 pr-3 border-r border-gray-100">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>

          {/* Mascota skeleton */}
          <div className="w-1/2 pl-3">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Paciente = {
  mascotas_id: string;
  nombre: string; // nombre mascota
  especie: boolean | null; // gato=true, perro=false
  raza?: string | null;
  sexo?: boolean | null; // macho=true, hembra=false
  color?: string | null;
  fecha_nacimiento?: string | null;
  numero_microchip?: string | null;
  esterilizado?: boolean | null;
  propietario_id: string;
  created_at: string;
  propietario: {
    propietario_id: string;
    nombre?: string | null;
    apellido?: string | null;
    rut?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    correo_electronico?: string | null;
  } | null;
};

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const [especieFilter, setEspecieFilter] = useState<string>(""); // "" = todos, "gato" = gatos, "perro" = perros
  const [loading, setLoading] = useState(true); // Iniciar en true para mostrar skeletons
  const [items, setItems] = useState<Paciente[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function fetchPacientes(query: string, p: number = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        const q = query.trim();
        // Candidato a RUT: sólo dígitos y/o K, largo razonable (7-9) incluyendo DV
        const stripped = q.replace(/[\.\-\s]/g, '').toUpperCase();
        const isRutCandidate = /^[0-9]+[0-9K]$/.test(stripped) && stripped.length >= 7 && stripped.length <= 9;
        params.set("search", isRutCandidate ? normalizeRutPlain(q) : q);
      }
      if (especieFilter) {
        params.set("especie", especieFilter);
      }
      params.set("page", String(Math.max(1, p)));
      params.set("pageSize", "9");
      const qp = params.toString();
      const url = "/api/mascotas" + (qp ? `?${qp}` : "");
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "Error al obtener pacientes");
      setItems(json?.data || []);
      setPage(json?.page || 1);
      setTotalPages(json?.totalPages || 1);
    } catch (e: any) {
      // podríamos exponer error en UI si se desea
      setItems([]);
      setPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPacientes("", 1);
  }, [especieFilter]);

  const total = items.length;

  // Mostrar skeletons cuando esté cargando (tanto en carga inicial como en búsquedas)
  const showSkeletons = loading;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Pacientes</h1>
        <p className="text-gray-600 mt-1">Listado de mascotas y sus propietarios</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar: mascota, propietario, RUT, sexo, raza, teléfono, dirección"
                  className="w-full border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchPacientes(search, 1); }}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => fetchPacientes(search, 1)}
                  title="Buscar"
                >
                  Buscar
                </button>
              </div>
              <div className="flex-shrink-0">
                <select
                  value={especieFilter}
                  onChange={(e) => setEspecieFilter(e.target.value)}
                  className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Todos</option>
                  <option value="gato">Gatos</option>
                  <option value="perro">Perros</option>
                </select>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {loading && items.length === 0 ? "Cargando pacientes..." : `${total} resultado(s)`}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {showSkeletons ? (
          // Mostrar 9 tarjetas skeleton mientras carga
          Array.from({ length: 9 }).map((_, index) => (
            <PacienteSkeletonCard key={`skeleton-${index}`} />
          ))
        ) : (
          // Mostrar datos reales cuando ya no esté cargando
          items.map((p) => {
            const o = (p.propietario || {}) as NonNullable<Paciente['propietario']>;
            const sexo = p.sexo === true ? "Macho" : p.sexo === false ? "Hembra" : "-";
            const especie = p.especie === true ? "Gato" : p.especie === false ? "Perro" : "-";
            return (
              <a href={`/admin/pacientes/${p.mascotas_id}`} key={p.mascotas_id} className="group relative overflow-hidden rounded-2xl ring-1 ring-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-white/30 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10 p-5">
                  <div className="flex gap-4">
                    {/* Propietario (izquierda) */}
                    <div className="w-1/2 pr-3 border-r border-gray-100">
                      <h3 className="text-xs font-semibold tracking-wide text-indigo-600 mb-2">Propietario</h3>
                      <div className="text-sm text-gray-700">
                        <div className="font-medium">{[o.nombre, o.apellido].filter(Boolean).join(" ") || "-"}</div>
                        <div className="text-gray-500">RUT: {o.rut ? formatRutPretty(o.rut) : "-"}</div>
                        <div className="text-gray-500">Tel: {o.telefono || "-"}</div>
                        <div className="text-gray-500 line-clamp-1" title={o.direccion || undefined}>Dir: {o.direccion || "-"}</div>
                      </div>
                    </div>

                    {/* Mascota (derecha) */}
                    <div className="w-1/2 pl-3">
                      <h3 className="text-xs font-semibold tracking-wide text-indigo-600 mb-2">Mascota</h3>
                      <div className="text-sm text-gray-700">
                        <div className="font-medium">{p.nombre}</div>
                        <div className="text-gray-500">{especie}{p.raza ? ` · ${p.raza}` : ""}</div>
                        <div className="text-gray-500">Sexo: {sexo}</div>
                        {p.fecha_nacimiento && (
                          <div className="text-gray-500">Nac.: {new Date(p.fecha_nacimiento).toLocaleDateString("es-CL")}</div>
                        )}
                        {p.numero_microchip && (
                          <div className="text-gray-500">Chip: {p.numero_microchip}</div>
                        )}
                        {p.esterilizado === true && (
                          <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Esterilizado/a</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>

      {/* Paginación */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          onClick={() => fetchPacientes(search, Math.max(1, page - 1))}
          disabled={page <= 1 || loading}
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
                onClick={() => fetchPacientes(search, idx)}
                className={`min-w-9 h-9 px-3 py-2 rounded border text-sm ${page === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}
                disabled={loading}
              >
                {idx}
              </button>
            );
          })}
          {totalPages > 7 && (
            <>
              <span className="px-1">…</span>
              <button
                onClick={() => fetchPacientes(search, totalPages)}
                className={`min-w-9 h-9 px-3 py-2 rounded border text-sm ${page === totalPages ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}
                disabled={loading}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        <button
          className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          onClick={() => fetchPacientes(search, Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || loading}
        >
          Siguiente
        </button>
      </div>

      {!loading && items.length === 0 && (
        <div className="text-center text-gray-500 mt-12">Sin pacientes que coincidan con la búsqueda.</div>
      )}
    </div>
  );
}


