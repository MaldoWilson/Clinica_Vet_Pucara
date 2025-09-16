// Home Principal de la pagina web
import Hero from "@/components/Hero";
import LatestBlogs from "@/components/LatestBlogs";
import { supabaseServer } from "@/lib/supabaseClient";
import WhatsAppButton from "@/components/whatsapp";
import ImageCarousel from "@/components/ImageCarousel";
import Image from "next/image";
import pageBanner from "@/app/img/page2.png";


export default async function Home() {
  const supa = supabaseServer();
  const { data: servicios } = await supa
    .from("servicios")
    .select("id, nombre, descripcion, precio_clp")
    .limit(6);

  return (
    <div>
      {/* Hero Section estilo Móvil Pet */}
      <section className="relative min-h-screen flex items-center overflow-hidden -mt-16 lg:-mt-18">
        {/* Background Image */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={pageBanner}
            alt="Veterinaria móvil"
            fill
            priority
            className="object-cover"
          />
        </div>
        
        {/* Teal Overlay */}
        <div className="absolute inset-0 -z-10 bg-teal-900/60" />
        
        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
                  Veterinaria <span className="text-indigo-400">Pucará</span>
                </h1>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Completamente <strong>equipada</strong> para atender a su mascota en la puerta de su casa, 
                  entregando el <strong>mejor servicio veterinario</strong> en la comodidad de su hogar.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/servicios" className="btn btn-primary px-6 py-3 text-base">
                    Ver Servicios
                  </a>
                  <a href="/contacto" className="btn btn-primary px-6 py-3 text-base">
                    Contacto
                  </a>
                </div>
              </div>
              
              {/* Right side - empty for background image visibility */}
              <div className="hidden lg:block" />
            </div>
          </div>
        </div>
        
        {/* Curved Bottom Effect */}
        <div className="absolute bottom-0 left-0 right-0 -z-10 pointer-events-none">
          {/* Ola invertida única y base blanca para evitar bandas */}
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-32 md:h-36 fill-white transform rotate-180"
          >
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-white" />
        </div>
      </section>

      <ImageCarousel
        images={[
          { src: "/slide1.png", alt: "Clinica Vet Pucara" },
          { src: "/slide.png", alt: "Servicios Veterinarios" },
          { src: "/slide1.png", alt: "Cuidado de Mascotas" },
        ]}
        aspectRatio="aspect-[16/6]"
        intervalMs={4000}
        className="rounded-none shadow-none"
      />
      <LatestBlogs />
      
      <WhatsAppButton
        phone="569"   // Pongamos numero para probar
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating // botón flotante abajo a la derecha
      />
    </div>
    
  );
}
