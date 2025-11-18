import Link from "next/link";

// Componente para mostrar las cartas de productos
type Props = {
  producto: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    sku: string;
    categorias: { nombre: string } | null;
    stock: number;
    imagen_principal?: string | null;
    created_at?: string;
  };
  showPurchaseLocation?: boolean;
};

export default function ProductCard({ producto, showPurchaseLocation = false }: Props) {
  // Truncar la descripción para mostrar solo un resumen
  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Formatear precio con separadores de miles
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
      <Link href={`/productos/${producto.id}`}>
        {producto.imagen_principal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imagen_principal}
            alt={producto.nombre}
            className="rounded-t-lg w-full h-48 object-contain bg-white p-2 group-hover:brightness-110 transition-all duration-300"
          />
        ) : (
          <div className="rounded-t-lg w-full h-48 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-all duration-300">
            <span className="text-gray-400 text-sm">Sin imagen</span>
          </div>
        )}
      </Link>
      <div className="p-5">
        <Link href={`/productos/${producto.id}`}>
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 line-clamp-2 group-hover:text-indigo-400 transition-colors duration-300">
            {producto.nombre}
          </h5>
        </Link>
        <p className="mb-3 font-normal text-gray-700 line-clamp-3 text-sm">
          {truncateContent(producto.descripcion)}
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-indigo-600">
            {formatPrice(producto.precio)}
          </span>

        </div>
        {showPurchaseLocation && (
          <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-md mb-2 inline-block">Compra solo en tienda física.</span>
        )}
        {producto.categorias?.nombre && (
          <p className="text-xs text-gray-500 font-medium mb-1">
            {producto.categorias.nombre}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${producto.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin stock'}
          </span>
          {producto.created_at && (
            <span className="text-xs text-gray-400">
              {new Date(producto.created_at).toLocaleDateString("es-CL")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
