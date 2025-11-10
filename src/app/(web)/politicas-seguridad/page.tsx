import Image from "next/image";
import misionBanner from "@/app/img/blog.webp";
import misionBg from "@/app/img/mision.webp";

export const metadata = {
  title: "Políticas de Seguridad | Clínica Veterinaria Pucará",
  description: "Políticas de seguridad y protección de datos de la Clínica Veterinaria Pucará en San Bernardo.",
};

export default function PoliticasSeguridadPage() {
  return (
    <>
      {/* Cabecera con imagen y efecto ondulado */}
      <section className="relative h-72 md:h-[260px] flex items-center overflow-hidden -mt-16 lg:-mt-18">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 -z-20">
        <Image
          src={misionBanner}
          alt="Políticas de Seguridad"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover"
        />
        </div>

        

        {/* Contenido vacío para mantener el alto */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" />
        </div>

        {/* Efecto ondulado inferior */}
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

      {/* Contenido principal con fondo mision.webp */}
      <section
        className="relative bg-white"
        style={{
          backgroundImage: `url('/mision.webp')`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "75%",
        }}
      >
        {/* Overlay opcional para dar contraste al texto */}
        <div className="absolute inset-0 -z-10 bg-white/70" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              <span className="text-gray-800">Políticas de </span>
              <span className="text-indigo-400">Seguridad</span>
              <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
            </h1>
            <p className="mt-3 text-slate-600">
              Comprometidos con la protección y seguridad de su información y la de sus mascotas.
            </p>
          </div>

          <div className="space-y-8">
            {/* Sección 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">1. Compromiso con la Seguridad</h2>
              <p className="text-slate-700 leading-relaxed">
                En la Clínica Veterinaria Pucará, nos comprometemos a proteger la seguridad y privacidad de la información 
                personal de nuestros clientes y los datos médicos de sus mascotas. Implementamos medidas técnicas y 
                organizativas apropiadas para garantizar la confidencialidad, integridad y disponibilidad de todos los datos 
                que manejamos.
              </p>
            </div>

            {/* Sección 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">2. Protección de Datos Personales</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Respetamos y protegemos sus datos personales de acuerdo con la Ley N° 19.628 sobre Protección de la Vida 
                Privada y la normativa vigente en Chile:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Recopilamos únicamente la información necesaria para brindar nuestros servicios veterinarios.</li>
                <li>Sus datos personales (nombre, teléfono, email, dirección) se utilizan exclusivamente para gestión de citas, comunicación y facturación.</li>
                <li>Los registros médicos de sus mascotas se mantienen de forma confidencial y segura.</li>
                <li>No compartimos información personal con terceros sin su consentimiento explícito, salvo requerimientos legales.</li>
              </ul>
            </div>

            {/* Sección 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">3. Seguridad de la Información</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Implementamos medidas de seguridad técnicas y físicas para proteger su información:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Sistemas de almacenamiento con encriptación y respaldos regulares.</li>
                <li>Acceso restringido a información sensible únicamente para personal autorizado.</li>
                <li>Protocolos de seguridad en nuestras instalaciones físicas.</li>
                <li>Monitoreo continuo de nuestros sistemas para detectar y prevenir accesos no autorizados.</li>
                <li>Actualizaciones regulares de software y sistemas de seguridad.</li>
              </ul>
            </div>

            {/* Sección 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">4. Seguridad en Transacciones</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Cuando realiza pagos a través de nuestra plataforma, protegemos su información financiera:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Utilizamos conexiones seguras (HTTPS/SSL) para todas las transacciones en línea.</li>
                <li>No almacenamos información completa de tarjetas de crédito o débito.</li>
                <li>Trabajamos con procesadores de pago certificados y seguros.</li>
                <li>Todas las transacciones se registran de forma segura y auditada.</li>
              </ul>
            </div>

            {/* Sección 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">5. Seguridad en Comunicaciones</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Protegemos las comunicaciones entre usted y nuestra clínica:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Las comunicaciones por email se realizan a través de servidores seguros.</li>
                <li>Los mensajes de WhatsApp y otras plataformas se manejan con discreción profesional.</li>
                <li>No compartimos información médica sensible a través de canales no seguros sin su autorización.</li>
                <li>Mantenemos registros seguros de todas las comunicaciones relevantes para el historial médico.</li>
              </ul>
            </div>

            {/* Sección 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">6. Retención y Eliminación de Datos</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Gestionamos la retención de datos de acuerdo con normativas legales y necesidades médicas:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Los registros médicos se conservan según los plazos establecidos por la normativa veterinaria.</li>
                <li>Los datos personales se mantienen mientras sea necesario para la prestación de servicios o requerimientos legales.</li>
                <li>Usted puede solicitar la eliminación de sus datos personales cuando ya no sean necesarios, sujeto a obligaciones legales.</li>
                <li>La eliminación de datos se realiza de forma segura para prevenir recuperación no autorizada.</li>
              </ul>
            </div>

            {/* Sección 7 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">7. Sus Derechos</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Acceder a sus datos personales y registros médicos de sus mascotas.</li>
                <li>Rectificar información incorrecta o incompleta.</li>
                <li>Solicitar la eliminación de datos cuando sea apropiado.</li>
                <li>Oponerse al procesamiento de datos para ciertos fines.</li>
                <li>Recibir una copia de sus datos en formato estructurado.</li>
                <li>Presentar reclamos ante la autoridad de protección de datos si considera que sus derechos han sido vulnerados.</li>
              </ul>
            </div>

            {/* Sección 8 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">8. Seguridad Física</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Protegemos la seguridad física de nuestras instalaciones y registros:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Acceso controlado a nuestras instalaciones y áreas de almacenamiento de registros.</li>
                <li>Sistemas de seguridad y monitoreo en nuestras instalaciones.</li>
                <li>Almacenamiento seguro de documentos físicos y registros médicos.</li>
                <li>Protocolos de seguridad para el manejo de información sensible.</li>
              </ul>
            </div>

            {/* Sección 9 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">9. Incidentes de Seguridad</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                En caso de detectar un incidente de seguridad que pueda afectar sus datos:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Actuaremos inmediatamente para contener y mitigar el incidente.</li>
                <li>Notificaremos a las autoridades competentes cuando sea requerido por ley.</li>
                <li>Le informaremos sobre cualquier incidente que pueda afectar significativamente sus datos personales.</li>
                <li>Tomaremos medidas correctivas para prevenir futuros incidentes similares.</li>
              </ul>
            </div>

            {/* Sección 10 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">10. Actualización de Políticas</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Estas políticas de seguridad pueden ser actualizadas periódicamente para reflejar cambios en nuestras prácticas 
                o en la normativa legal. Le notificaremos sobre cambios significativos a través de:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Publicación en nuestra plataforma web con fecha de última actualización.</li>
                <li>Notificación por email para cambios importantes que afecten sus derechos.</li>
                <li>Comunicación en nuestras instalaciones cuando sea relevante.</li>
              </ul>
            </div>

            {/* Sección 11 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">11. Contacto sobre Seguridad</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Si tiene preguntas, inquietudes o solicitudes relacionadas con la seguridad de sus datos, puede contactarnos:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Email: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contacto@clinicapucara.cl"}</li>
                <li>Teléfono: {process.env.NEXT_PUBLIC_WHATSAPP_PHONE ? `+${process.env.NEXT_PUBLIC_WHATSAPP_PHONE.replace(/^(?!\+)/, "")}` : "+56 2 859 2840"}</li>
                <li>Dirección: Esmeralda 97, San Bernardo, Región Metropolitana</li>
                <li>Horario de atención: Lunes a Sábado 10:30 - 19:00, Domingos 11:00 - 18:00</li>
              </ul>
            </div>

            {/* Fecha de última actualización */}
            <div className="text-center mt-8 pt-6 border-t border-slate-300">
              <p className="text-sm text-slate-500">
                Última actualización: {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

