import Image from "next/image";

type Vet = {
  id: string | number;
  nombre: string | null;
  especialidad?: string | null;
  foto_url?: string | null;
};

export default function VetCard({ vet }: { vet: Vet }) {
  return (
    <div className="rounded-2xl shadow p-4 bg-white">
      {vet.foto_url ? (
        <Image
          src={vet.foto_url}
          alt={vet.nombre ?? "Veterinario/a"}
          width={600}
          height={400}
          className="w-full h-48 object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-48 rounded-xl bg-neutral-100 grid place-items-center">
          <span className="text-sm text-neutral-500">Sin foto</span>
        </div>
      )}
      <h3 className="mt-3 font-semibold">{vet.nombre}</h3>
      {vet.especialidad && <p className="text-sm text-neutral-600">{vet.especialidad}</p>}
    </div>
  );
}
