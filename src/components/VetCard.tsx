import Image from "next/image";

type Vet = {
  id: string | number;
  nombre: string | null;
  especialidad?: string | null;
  foto_url?: string | null;
};

export default function VetCard({ vet }: { vet: Vet }) {
  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
      {vet.foto_url ? (
        <Image
          src={vet.foto_url}
          alt={vet.nombre ?? "Veterinario/a"}
          width={600}
          height={400}
          className="rounded-t-lg w-full h-72 object-cover group-hover:brightness-110 transition-all duration-300"
        />
      ) : (
        <div className="rounded-t-lg w-full h-72 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-all duration-300">
          <span className="text-gray-400 text-sm">Sin foto</span>
        </div>
      )}
      <div className="p-5">
        <h5 className="mb-1 text-xl font-bold tracking-tight text-gray-900 line-clamp-2 group-hover:text-indigo-400 transition-colors duration-300">
          {vet.nombre}
        </h5>
        {vet.especialidad && (
          <p className="font-normal text-gray-700 text-sm">{vet.especialidad}</p>
        )}
      </div>
    </div>
  );
}
