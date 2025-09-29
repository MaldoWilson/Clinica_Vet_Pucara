"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Paciente[]>([]);

  async function fetchPacientes(query: string) {
    setLoading(true);
    try {
      const url = "/api/mascotas" + (query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "");
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "Error al obtener pacientes");
      setItems(json?.data || []);
    } catch (e: any) {
      // podríamos exponer error en UI si se desea
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPacientes("");
  }, []);

  const total = items.length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Pacientes</h1>
        <p className="text-gray-600 mt-1">Listado de mascotas y sus propietarios</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre/apellido propietario, nombre mascota, sexo, raza, RUT..."
                className="w-full border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchPacientes(search); }}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => fetchPacientes(search)}
                title="Buscar"
              >
                Buscar
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {loading ? "Cargando..." : `${total} resultado(s)`}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => {
          const o = p.propietario || {};
          const sexo = p.sexo === true ? "Macho" : p.sexo === false ? "Hembra" : "-";
          const especie = p.especie === true ? "Gato" : p.especie === false ? "Perro" : "-";
          return (
            <div key={p.mascotas_id} className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white/40 to-white/0 pointer-events-none" />
              <div className="relative z-10 p-5">
                <div className="flex gap-4">
                  {/* Propietario (izquierda) */}
                  <div className="w-1/2 pr-3 border-r">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Propietario</h3>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">{[o.nombre, o.apellido].filter(Boolean).join(" ") || "-"}</div>
                      <div className="text-gray-500">RUT: {o.rut || "-"}</div>
                      <div className="text-gray-500">Tel: {o.telefono || "-"}</div>
                      <div className="text-gray-500 line-clamp-1" title={o.direccion || undefined}>Dir: {o.direccion || "-"}</div>
                    </div>
                  </div>

                  {/* Mascota (derecha) */}
                  <div className="w-1/2 pl-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Mascota</h3>
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
                        <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Esterilizado/a</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && items.length === 0 && (
        <div className="text-center text-gray-500 mt-12">Sin pacientes que coincidan con la búsqueda.</div>
      )}
    </div>
  );
}


