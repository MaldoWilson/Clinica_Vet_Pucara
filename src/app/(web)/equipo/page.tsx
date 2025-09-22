import VetCard from "@/components/VetCard";
import WhatsAppButton from "@/components/whatsapp";
import Image from "next/image";
import equipoBanner from "@/app/img/equipo.webp";

async function getVeterinarios() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/Veterinarios`, {
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error('Error fetching veterinarios:', data.error);
      return [];
    }
    return data.data || [];
  } catch (error) {
    console.error('Error fetching veterinarios:', error);
    return [];
  }
}

export default async function EquipoPage() {
  const vets = await getVeterinarios();

  return (
    <div>
      {/* Hero Section con imagen de equipo */}
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

      {/* Equipo Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="text-gray-800">Nuestro </span>
          <span className="text-indigo-400">Equipo</span>
          <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vets.map((v: any) => (
            <VetCard key={v.id} vet={v} />
          ))}
        </div>
      </div>

      <WhatsAppButton
        phone="569"
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating
      />
    </div>
  );
}
