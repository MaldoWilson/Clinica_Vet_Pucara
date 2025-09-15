// Home Principal de la pagina web
import Hero from "@/components/Hero";
import LatestBlogs from "@/components/LatestBlogs";
import { supabaseServer } from "@/lib/supabaseClient";
import WhatsAppButton from "@/components/whatsapp";
import ImageCarousel from "@/components/ImageCarousel";


export default async function Home() {
  const supa = supabaseServer();
  const { data: servicios } = await supa
    .from("servicios")
    .select("id, nombre, descripcion, precio_clp")
    .limit(6);

  return (
    <div>
      <Hero />
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
