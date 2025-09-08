export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Cuidamos a tus mascotas con cariño y excelencia
        </h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Agenda tu hora online, conoce nuestros profesionales y servicios. Atención en San Bernardo.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <a href="/reservas" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white">
            Agendar hora
          </a>
          <a href="/contacto" className="px-5 py-2.5 rounded-xl border">
            Contáctanos
          </a>
        </div>
      </div>
    </section>
  );
}
