"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Servicio = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio_clp?: number;
  duracion_min?: number;
  image_url?: string;
};

export default function ServiceSelection() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/servicios")
      .then((r) => r.json())
      .then((j) => setServicios(j?.data || []))
      .catch(() => setServicios([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDuration = (duracion?: number) => {
    if (!duracion) return "";
    return `${duracion} min`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Selecciona un <span className="text-indigo-400">Servicio</span>
        </h1>
        <p className="text-gray-600">Elige el servicio que necesitas para tu mascota</p>
        <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-4"></div>
      </div>

      {servicios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No hay servicios disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              {servicio.image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={servicio.image_url}
                    alt={servicio.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {servicio.nombre}
                </h3>
                
                {servicio.descripcion && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {servicio.descripcion}
                  </p>
                )}

                {servicio.duracion_min && (
                  <div className="flex items-center justify-end mb-4">
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatDuration(servicio.duracion_min)}
                    </div>
                  </div>
                )}

                <Link
                  href={`/reservas/servicio/${servicio.id}`}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-300 text-center block mt-auto"
                >
                  Seleccionar Servicio
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
