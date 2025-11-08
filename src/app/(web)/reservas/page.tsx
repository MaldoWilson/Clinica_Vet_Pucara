import ServiceSelection from "@/components/ServiceSelection";
import WhatsAppButton from "@/components/whatsapp";

export default function ReservasPage() {
  return (
    <>
      <ServiceSelection />
      <WhatsAppButton
        phone="569"   // Pongamos un numero para probar
        text="Hola Vengo desde la web y quiero agendar una hora de emergencia para mi mascota"
        floating // botón flotante abajo a la derecha
      />
    </>
  );
}