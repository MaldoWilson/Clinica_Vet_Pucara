"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import WhatsAppButton from "@/components/whatsapp";
import Image from "next/image";
import serviciosBanner from "@/app/img/servicio2.webp";
import serviciosBg from "@/app/img/servicios3.png";

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio_clp: number;
  duracion_min: number;
  image_url?: string;
  creado_en?: string;
};

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await fetch('/api/servicios');
        if (!response.ok) {
          throw new Error('Error al cargar los servicios');
        }
        const data = await response.json();
        if (data.ok) {
          setServicios(data.data || []);
        } else {
          throw new Error(data.error || 'Error al cargar los servicios');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  const HeaderSection = () => (
    <section className="relative h-96 md:h-[250px] flex items-center overflow-hidden -mt-16 lg:-mt-18 z-10">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={serviciosBanner}
          alt="Servicios veterinarios"
          fill
          priority
          quality={95}
          className="object-cover"
        />
      </div>
      
      {/* Content - solo fondo */}
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Solo el fondo, sin tarjeta de contenido */}
        </div>
      </div>
      
      {/* Curved Bottom Effect */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-0 rotate-180 pointer-events-none">
        <svg
          className="relative block w-[140%] md:w-[100%] h-[200px] text-white"
          fill="currentColor"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );

  if (loading) {
    return (
      <>
        <HeaderSection />
        <div className="min-h-screen bg-white py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-8 w-1/3 mb-8 rounded mx-auto"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-2xl h-64"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderSection />
        <div className="min-h-screen bg-white py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600 mb-8">{error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <HeaderSection />

      {/* Servicios Grid con fondo personalizado */}
      <section className="relative">
        {/* Fondo */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={serviciosBg}
            alt="Fondo servicios"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 px-4">
            <span className="text-gray-800">Servicios </span>
            <span className="text-indigo-400">Disponibles</span>
            <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
          </h2>
          
          {servicios.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-20 sm:h-24 w-20 sm:w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No hay servicios disponibles</h3>
              <p className="text-sm sm:text-base text-gray-600">Pronto agregaremos nuestros servicios veterinarios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch auto-rows-fr">
              {servicios.map((s) => (
                <ServiceCard
                  key={s.id}
                  service={{
                    id: s.id,
                    name: s.nombre,
                    description: s.descripcion,
                    imageUrl: s.image_url,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <WhatsAppButton
        text="Hola Vengo desde la web y quiero agendar una hora de emergencia para mi mascota"
        floating
      />
    </div>
  );
}
