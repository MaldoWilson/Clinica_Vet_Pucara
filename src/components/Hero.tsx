// Componente principal de informacion
export default function Hero() {
  return (
    <section >
      <div className="absolute inset-0 bg-gradient-to-b from-violet-100 to-transparent -z-10" />
      <header className="container py-12 sm:py-16 md:py-24 text-center px-4">
        <p className="text-xs sm:text-sm font-medium text-indigo-400 tracking-wide mb-2">
          Clínica Veterinaria Pucará - San Bernardo
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight px-2">
          Cuidamos a tus mascotas con cariño y excelencia
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-neutral-600 px-4 text-sm sm:text-base">
          Agenda tu hora online, conoce a nuestro equipo y servicios.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
          <a href="/reservas" className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 text-center">
            Agendar hora
          </a>
          <a href="/contacto" className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 text-center">
            Contáctanos
          </a>
        </div>
      </header>
    </section>
  );
}
