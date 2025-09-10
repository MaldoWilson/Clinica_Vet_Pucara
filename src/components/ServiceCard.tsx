import Image from 'next/image';

type Service = {
  id: string | number;
  name: string | null;
  description?: string | null;
  price_clp?: number | null;
  imageUrl?: string;
};

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="rounded-2xl shadow p-4 bg-white">
      {service.imageUrl ? (
        <Image
          src={service.imageUrl}
          alt={service.name ?? 'Servicio'}
          width={600}
          height={400}
          className="w-full h-48 object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-48 rounded-xl bg-neutral-100 grid place-items-center">
          <span className="text-sm text-neutral-500">Sin imagen</span>
        </div>
      )}

      <h3 className="mt-3 font-semibold">{service.name}</h3>
      {service.description && <p className="text-sm text-neutral-600 line-clamp-3">{service.description}</p>}
      {service.price_clp != null && <p className="mt-2 font-medium">${service.price_clp}</p>}
    </div>
  );
}
