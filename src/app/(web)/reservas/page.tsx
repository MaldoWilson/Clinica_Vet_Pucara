import VetCardsDay from "@/components/VetCardsDay";
import WhatsAppButton from "@/components/whatsapp";

export default function ReservasPage() {
  return (
    <>
      <h2 className="text-4xl font-bold text-center py-10">
        <span className="text-gray-800">Reservar </span>
        <span className="text-indigo-400">Hora</span>
        <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
      </h2>
      <VetCardsDay />
      <WhatsAppButton
        phone="569"   // Pongamos un numero para probar
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating // botón flotante abajo a la derecha
      />
    </>
  );
}