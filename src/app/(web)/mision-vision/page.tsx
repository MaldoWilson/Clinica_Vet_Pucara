export const metadata = {
  title: "Misión y Visión | Clínica Veterinaria Pucará",
  description: "Conoce la misión y visión de la Clínica Veterinaria Pucará en San Bernardo.",
};

export default function MisionVisionPage() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-700 bg-clip-text text-transparent">
          Misión y Visión
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
  );
}


