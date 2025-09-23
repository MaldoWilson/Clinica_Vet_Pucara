"use client";
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Service = {
  id: string | number;
  name: string | null;
  description?: string | null;
  price_clp?: number | null;
  imageUrl?: string;
};

export default function ServiceCard({ service }: { service: Service }) {
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar con tecla ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const formatPriceClp = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
    <div
      className="relative overflow-hidden rounded-2xl 
  border-2 border-gray-400/70 shadow-md
  bg-gradient-to-br from-white/80 via-white/60 to-white/40 
  backdrop-blur-md group transition-all duration-300
  hover:shadow-2xl hover:scale-[1.03] active:scale-[1.05] cursor-pointer"
      onClick={() => setIsOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') setIsOpen(true); }}
    >
      {/* Imagen en overlay: oculta por defecto y aparece en hover */}
      {service.imageUrl && (
        <div className="absolute inset-0 z-0 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500">
          <Image
            src={service.imageUrl}
            alt={service.name ?? 'Servicio'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* velo para mantener legibilidad al inicio del hover */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Contenido */}
      <div className="relative z-10 p-6 text-center">
        <h5 className="mb-2 text-xl md:text-2xl font-bold tracking-tight text-gray-900 group-hover:text-white transition-colors duration-300">
          {service.name}
        </h5>
        {service.description && (
          <p className="text-base text-gray-800 group-hover:text-white/90 transition-colors duration-300 line-clamp-3 mx-auto">
            {service.description}
          </p>
        )}
        {/* Precios ocultos por requerimiento */}
      </div>
    </div>

    {/* Modal */}
    {isOpen && (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-2xl lg:max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {service.imageUrl && (
              <div className="relative w-full h-80 bg-black">
                <Image 
                  src={service.imageUrl as string} 
                  alt={service.name ?? 'Servicio'} 
                  fill 
                  className="object-contain" 
                />
              </div>
            )}
            <div className="p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar"
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                >
                  ✕
                </button>
              </div>
              {service.description && (
                <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                  {service.description}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    )}
    </>
  );
}
