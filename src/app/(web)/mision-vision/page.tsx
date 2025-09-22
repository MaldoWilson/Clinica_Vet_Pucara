import Image from "next/image";
import misionBanner from "@/app/img/blog.png";

export const metadata = {
  title: "Misión y Visión | Clínica Veterinaria Pucará",
  description: "Conoce la misión y visión de la Clínica Veterinaria Pucará en San Bernardo.",
};

export default function MisionVisionPage() {
  return (
    <>
      {/* Cabecera con imagen y efecto ondulado */}
      <section className="relative h-72 md:h-[260px] flex items-center overflow-hidden -mt-16 lg:-mt-18">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={misionBanner}
            alt="Misión y Visión"
            fill
            priority
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

      {/* Contenido principal */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <span className="text-gray-800">Misión </span>
            <span className="text-indigo-400">y Visión</span>
            <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
          </h1>
          <p className="mt-3 text-slate-600">
            Nuestro compromiso con el bienestar y la salud integral de tus mascotas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-indigo-400">Misión</h2>
            <p className="mt-3 text-slate-700 leading-relaxed">
              En Clínica Veterinaria Pucará brindamos servicios de salud animal con dedicación, experiencia y calidez. A través de nuestra
              plataforma web ofrecemos una gestión ágil y sencilla que permite a los clientes agendar citas,
              recibir recordatorios, acceder a certificados y mantenerse informados. Nuestro compromiso es mejorar
              la calidad de vida de las mascotas y optimizar el tiempo de sus dueños mediante herramientas digitales
              confiables y accesibles.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-indigo-400">Visión</h2>
            <p className="mt-3 text-slate-700 leading-relaxed">
              Ser la clínica veterinaria de referencia en la región, reconocida por su atención integral, humana
              y profesional hacia las mascotas y sus familias, incorporando innovación tecnológica que facilite la
              gestión, la comunicación y el cuidado oportuno de cada paciente.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}


