import Image from "next/image";
import misionBanner from "@/app/img/blog.webp";
import misionBg from "@/app/img/mision.webp";

export const metadata = {
  title: "Términos y Condiciones | Clínica Veterinaria Pucará",
  description: "Términos y condiciones de uso de los servicios de la Clínica Veterinaria Pucará en San Bernardo.",
};

export default function TerminosCondicionesPage() {
  return (
    <>
      {/* Cabecera con imagen y efecto ondulado */}
      <section className="relative h-72 md:h-[260px] flex items-center overflow-hidden -mt-16 lg:-mt-18">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 -z-20">
        <Image
          src={misionBanner}
          alt="Términos y Condiciones"
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
              <span className="text-gray-800">Términos </span>
              <span className="text-indigo-400">y Condiciones</span>
              <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
            </h1>
            <p className="mt-3 text-slate-600">
              Normativas y condiciones de uso de nuestros servicios veterinarios.
            </p>
          </div>

          <div className="space-y-8">
            {/* Sección 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-slate-700 leading-relaxed">
                Al acceder y utilizar los servicios de la Clínica Veterinaria Pucará, ya sea a través de nuestra 
                plataforma web, aplicación móvil o servicios presenciales, usted acepta estar sujeto a estos términos 
                y condiciones. Si no está de acuerdo con alguna parte de estos términos, le solicitamos que no utilice 
                nuestros servicios.
              </p>
            </div>

            {/* Sección 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">2. Servicios Veterinarios</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                La Clínica Veterinaria Pucará ofrece servicios de atención médica veterinaria, consultas, procedimientos 
                quirúrgicos, vacunaciones, desparasitaciones y otros servicios relacionados con la salud animal. Todos 
                los servicios son proporcionados por personal veterinario calificado y licenciado.
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Las consultas y procedimientos se realizan previa cita agendada.</li>
                <li>Los servicios están sujetos a disponibilidad y capacidad de la clínica.</li>
                <li>Nos reservamos el derecho de rechazar servicios en casos de emergencias o situaciones especiales.</li>
              </ul>
            </div>

            {/* Sección 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">3. Reservas y Cancelaciones</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Al realizar una reserva a través de nuestra plataforma, usted acepta las siguientes condiciones:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Las reservas deben realizarse con al menos 24 horas de anticipación, salvo casos de emergencia.</li>
                <li>Las cancelaciones deben notificarse con al menos 12 horas de anticipación para evitar cargos.</li>
                <li>Las no presentaciones sin aviso previo pueden resultar en restricciones para futuras reservas.</li>
                <li>Nos reservamos el derecho de modificar o cancelar citas en caso de emergencias médicas.</li>
              </ul>
            </div>

            {/* Sección 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">4. Pagos y Facturación</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Todos los servicios deben ser pagados al momento de la prestación, salvo acuerdos previos:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Aceptamos efectivo, transferencias bancarias y tarjetas de débito/crédito.</li>
                <li>Los precios están sujetos a cambios sin previo aviso, pero se respetarán los precios acordados al momento de la reserva.</li>
                <li>Los servicios adicionales no incluidos en la consulta inicial serán informados y facturados por separado.</li>
                <li>Las facturas y comprobantes se proporcionan al momento del pago.</li>
              </ul>
            </div>

            {/* Sección 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">5. Responsabilidad y Limitaciones</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                La Clínica Veterinaria Pucará se compromete a brindar servicios profesionales de la más alta calidad:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Realizamos todos los procedimientos con el mayor cuidado y profesionalismo.</li>
                <li>No nos hacemos responsables por complicaciones derivadas de condiciones preexistentes no informadas.</li>
                <li>El propietario es responsable de proporcionar información veraz sobre el historial médico de su mascota.</li>
                <li>En caso de emergencias fuera del horario de atención, recomendamos contactar servicios de emergencia veterinaria.</li>
              </ul>
            </div>

            {/* Sección 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">6. Privacidad y Protección de Datos</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Respetamos su privacidad y protegemos la información personal y médica de sus mascotas:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>La información proporcionada se utiliza exclusivamente para la prestación de servicios veterinarios.</li>
                <li>No compartimos información personal con terceros sin su consentimiento, salvo requerimientos legales.</li>
                <li>Los registros médicos se mantienen de forma confidencial y segura.</li>
                <li>Usted tiene derecho a acceder, rectificar o solicitar la eliminación de sus datos personales.</li>
              </ul>
            </div>

            {/* Sección 7 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">7. Propiedad Intelectual</h2>
              <p className="text-slate-700 leading-relaxed">
                Todo el contenido de nuestra plataforma web, incluyendo textos, imágenes, logos y diseño, es propiedad 
                de la Clínica Veterinaria Pucará y está protegido por leyes de propiedad intelectual. No está permitida 
                la reproducción, distribución o uso comercial sin autorización previa por escrito.
              </p>
            </div>

            {/* Sección 8 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">8. Modificaciones de los Términos</h2>
              <p className="text-slate-700 leading-relaxed">
                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones 
                entrarán en vigor inmediatamente después de su publicación en nuestra plataforma. Es responsabilidad del 
                usuario revisar periódicamente estos términos para estar informado de cualquier cambio.
              </p>
            </div>

            {/* Sección 9 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">9. Contacto y Consultas</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Para cualquier consulta, reclamo o sugerencia relacionada con estos términos y condiciones o nuestros servicios, 
                puede contactarnos a través de:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Email: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contacto@clinicapucara.cl"}</li>
                <li>Teléfono: {process.env.NEXT_PUBLIC_WHATSAPP_PHONE ? `+${process.env.NEXT_PUBLIC_WHATSAPP_PHONE.replace(/^(?!\+)/, "")}` : "+56 2 859 2840"}</li>
                <li>Dirección: Esmeralda 97, San Bernardo, Región Metropolitana</li>
              </ul>
            </div>

            {/* Sección 10 */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-indigo-400 mb-4">10. Ley Aplicable y Jurisdicción</h2>
              <p className="text-slate-700 leading-relaxed">
                Estos términos y condiciones se rigen por las leyes de la República de Chile. Cualquier disputa que surja 
                de estos términos o de la prestación de servicios será resuelta en los tribunales competentes de San Bernardo, 
                Región Metropolitana, Chile.
              </p>
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

