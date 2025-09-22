// Home Principal de la pagina web
import Hero from "@/components/Hero";
import LatestBlogs from "@/components/LatestBlogs";
import LatestProducts from "@/components/LatestProducts";
import { supabaseServer } from "@/lib/supabaseClient";
import WhatsAppButton from "@/components/whatsapp";
import ImageCarousel from "@/components/ImageCarousel";
import Image from "next/image";
import pageBanner from "@/app/img/pucara.png";


export default async function Home() {
  const supa = supabaseServer();
  const { data: servicios } = await supa
    .from("servicios")
    .select("id, nombre, descripcion, precio_clp")
    .limit(6);

  return (
    <div>
      {/* Hero Section estilo Móvil Pet */}
      <section className="relative min-h-[500px] md:h-[700px] flex items-center overflow-hidden -mt-16 lg:-mt-18">
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
        
        
        
        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 shadow-2xl mx-2 md:mx-0">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                  Veterinaria <span className="text-indigo-400">Pucará</span>
                </h1>
                <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 leading-relaxed">
                  Cuidamos a tus <strong className="text-indigo-400">mascotas</strong> con cariño y excelencia.<strong className="text-indigo-400"> Agenda tu hora</strong> online y conoce a nuestro equipo.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <a href="/reservas" className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 text-center">
                    Agendar hora
                  </a>
                  <a href="/contacto" className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 text-center">
                    Contacto
                  </a>
                </div>
              </div>
              
              {/* Right side - empty for background image visibility */}
              <div className="hidden lg:block" />
            </div>
          </div>
        </div>
        
        {/* Curved Bottom Effect (referencia proporcionada) */}
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

      <ImageCarousel
        images={[
          { src: "/3.png", alt: "Clinica Vet Pucara" },
          { src: "/4.png", alt: "Clinica Vet Pucara" },
         
          
        ]}
        aspectRatio="aspect-[3/1]"
        intervalMs={4000}
        className="rounded-none shadow-none"
      />
      
      <LatestProducts />
      <LatestBlogs />
      
      <WhatsAppButton
        phone="569"   // Pongamos numero para probar
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating // botón flotante abajo a la derecha
      />
    </div>
    
  );
}
