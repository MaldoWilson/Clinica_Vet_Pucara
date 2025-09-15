// Componente principal de informacion
export default function Hero() {
  return (
    <section className="relative isolate">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent -z-10" />
      <header className="container py-16 sm:py-24 text-center">
        <p className="text-sm font-medium text-indigo-500 tracking-wide mb-2">
          Clínica Veterinaria Pucará - San Bernardo
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
          Cuidamos a tus mascotas con cariño y excelencia
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-neutral-600">
          Agenda tu hora online, conoce a nuestro equipo y servicios.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="/reservas"
            className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300"
          >
            Agendar hora
          </a>
          <a href="/contacto" className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300">
            Contáctanos
          </a>
        </div>
      </header>
    </section>
  );
}
