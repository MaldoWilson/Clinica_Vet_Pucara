"use client";

import { useEffect, useState } from "react";
import VetCard from "@/components/VetCard";
import WhatsAppButton from "@/components/whatsapp";
import Image from "next/image";
import equipoBanner from "@/app/img/equipos.webp";

type Veterinario = {
  id: string;
  nombre: string;
  especialidad: string;
  experiencia: number;
  descripcion: string;
  image_url?: string;
  created_at?: string;
};

export default function EquipoPage() {
  const [vets, setVets] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVeterinarios = async () => {
      try {
        const response = await fetch('/api/Veterinarios');
        if (!response.ok) {
          throw new Error('Error al cargar los veterinarios');
        }
        const data = await response.json();
        if (data.ok) {
          setVets(data.data || []);
        } else {
          throw new Error(data.error || 'Error al cargar los veterinarios');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchVeterinarios();
  }, []);

  const HeaderSection = () => (
    <section className="relative h-96 md:h-[250px] flex items-center overflow-hidden -mt-16 lg:-mt-18">
      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <Image
          src={equipoBanner}
          alt="Equipo veterinario"
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
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] -z-10 rotate-180 pointer-events-none">
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
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-8 w-1/3 mb-8 rounded mx-auto"></div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="min-h-screen bg-gray-50 py-16">
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

      {/* Equipo Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-6">
          <span className="text-gray-800">Quienes </span>
          <span className="text-indigo-400">Somos</span>
          <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
        </h2>

        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12 text-lg leading-relaxed px-4">
          En Clínica Veterinaria Pucará, nuestro equipo está conformado por profesionales apasionados y comprometidos con la salud y el bienestar de tus mascotas. Combinamos experiencia, tecnología avanzada y un trato cercano para brindar una atención integral, asegurando que cada paciente reciba el cuidado y el cariño que merece en cada visita.
        </p>

        {vets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay veterinarios disponibles</h3>
            <p className="text-gray-600">Pronto agregaremos información sobre nuestro equipo veterinario.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map((v) => (
              <VetCard key={v.id} vet={v} />
            ))}
          </div>
        )}
      </div>

      <WhatsAppButton
        phone="569"
        text="Hola Vengo desde la web y quiero agendar una hora de emergencia para mi mascota"
        floating
      />
    </div>
  );
}
