"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VetCardsDay from "@/components/VetCardsDay";
import WhatsAppButton from "@/components/whatsapp";

type Servicio = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio_clp?: number;
  duracion_min?: number;
  image_url?: string;
};

export default function ServicioHorariosPage({ params }: { params: { servicioId: string } }) {
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/servicios")
      .then((r) => r.json())
      .then((j) => {
        const servicios = j?.data || [];
        const servicioEncontrado = servicios.find((s: Servicio) => s.id === params.servicioId);
        setServicio(servicioEncontrado || null);
      })
      .catch(() => setServicio(null))
      .finally(() => setLoading(false));
  }, [params.servicioId]);

  const formatDuration = (duracion?: number) => {
    if (!duracion) return "";
    return `${duracion} min`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Servicio no encontrado</h1>
          <p className="text-gray-600 mb-6">El servicio seleccionado no existe o no está disponible.</p>
          <Link
            href="/reservas"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300"
          >
            Volver a seleccionar servicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/reservas" className="hover:text-indigo-500">
          Servicios
        </Link>
        <span>›</span>
        <span className="text-gray-800 font-medium">Horarios</span>
      </div>

      {/* Información del servicio seleccionado */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {servicio.image_url && (
            <div className="md:w-48 h-32 md:h-48 overflow-hidden rounded-xl">
              <img
                src={servicio.image_url}
                alt={servicio.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {servicio.nombre}
            </h1>
            
            {servicio.descripcion && (
              <p className="text-gray-600 mb-4">
                {servicio.descripcion}
              </p>
            )}

            {servicio.duracion_min && (
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {formatDuration(servicio.duracion_min)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Título para selección de horarios */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Selecciona un <span className="text-indigo-400">Horario</span>
        </h2>
        <p className="text-gray-600">Elige el día y hora que mejor te convenga</p>
        <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-4"></div>
      </div>

      {/* Componente de selección de horarios */}
      <VetCardsDay servicioId={params.servicioId} />

      <WhatsAppButton
        phone="569"
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating
      />
    </div>
  );
}
