import VetCard from "@/components/VetCard";

async function getVeterinarios() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/Veterinarios`, {
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error('Error fetching veterinarios:', data.error);
      return [];
    }
    return data.data || [];
  } catch (error) {
    console.error('Error fetching veterinarios:', error);
    return [];
  }
}

export default async function EquipoPage() {
  const vets = await getVeterinarios();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-4xl font-bold text-center mb-12">
        <span className="text-gray-800">Nuestro </span>
        <span className="text-indigo-400">Equipo</span>
        <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vets.map((v) => (
          <VetCard key={v.id} vet={v} />
        ))}
      </div>
    </div>
  );
}
