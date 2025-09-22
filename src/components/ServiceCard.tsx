import Image from 'next/image';

type Service = {
  id: string | number;
  name: string | null;
  description?: string | null;
  price_clp?: number | null;
  imageUrl?: string;
};

export default function ServiceCard({ service }: { service: Service }) {
  const formatPriceClp = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
      {service.imageUrl ? (
        <Image
          src={service.imageUrl}
          alt={service.name ?? 'Servicio'}
          width={600}
          height={400}
          className="rounded-t-lg w-full h-48 object-cover group-hover:brightness-110 transition-all duration-300"
        />
      ) : (
        <div className="rounded-t-lg w-full h-48 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-all duration-300">
          <span className="text-gray-400 text-sm">Sin imagen</span>
        </div>
      )}

      <div className="p-5">
        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 line-clamp-2 group-hover:text-indigo-400 transition-colors duration-300">
          {service.name}
        </h5>

        {service.description && (
          <p className="mb-3 font-normal text-gray-700 line-clamp-3 text-sm">
            {service.description}
          </p>
        )}

        {service.price_clp != null && (
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-indigo-600">
              {formatPriceClp(service.price_clp)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
