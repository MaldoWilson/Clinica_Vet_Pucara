"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  sku: string;
  categorias: { nombre: string } | null;
  stock: number;
  imagen_principal?: string | null;
  imagenes?: string[];
  created_at?: string;
  updated_at?: string;
};

export default function ProductoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "";

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await fetch('/api/productos');
        if (!response.ok) {
          throw new Error('Error al cargar el producto');
        }
        const data = await response.json();
        const foundProducto = data.productos.find((p: Producto) => p.id.toString() === params.id);
        
        if (!foundProducto) {
          throw new Error('Producto no encontrado');
        }
        
        setProducto(foundProducto);
        setMainImage(foundProducto.imagen_principal || foundProducto.imagenes?.[0] || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProducto();
    }
  }, [params.id]);

  // Formatear precio con separadores de miles
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Formatear la fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-xl"></div>
              <div className="space-y-4">
                <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
                <div className="bg-gray-200 h-6 w-1/3 rounded"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 h-4 rounded"></div>
                  <div className="bg-gray-200 h-4 rounded"></div>
                  <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link 
              href="/productos"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <svg 
                className="mr-2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Volver a Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
            <p className="text-gray-600 mb-8">El producto que buscas no existe o ha sido eliminado.</p>
            <Link 
              href="/productos"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <svg 
                className="mr-2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Volver a Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navegación */}
        <div className="mb-8">
          <Link 
            href="/productos"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            <svg 
              className="mr-2 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Volver a Productos
          </Link>
        </div>

        {/* Contenido del producto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagen */}
          <div className="space-y-4">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage}
                alt={producto.nombre}
                className="w-full h-96 object-contain bg-white p-4 rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-400 text-lg">Sin imagen disponible</span>
              </div>
            )}
            
            {/* Imágenes adicionales si existen */}
            {producto.imagenes && producto.imagenes.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {[producto.imagen_principal, ...(producto.imagenes || [])]
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((imagen, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={index}
                    src={imagen as string}
                    alt={`${producto.nombre} ${index + 1}`}
                    className={`w-full h-20 object-contain bg-white p-1 rounded-lg cursor-pointer border ${imagen === mainImage ? 'border-indigo-500' : 'border-transparent'}`}
                    onClick={() => setMainImage(imagen as string)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 leading-tight">
                {producto.nombre}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-indigo-600">
                  {formatPrice(producto.precio)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  producto.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin stock'}
                </span>
              </div>
              <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-md mb-4 inline-block">Compra solo en tienda física.</span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">SKU</h3>
                <p className="text-gray-600 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                  {producto.sku}
                </p>
              </div>

              {producto.categorias?.nombre && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Categoría</h3>
                  <p className="text-gray-600">{producto.categorias.nombre}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {producto.descripcion}
                </div>
              </div>
            </div>

            {/* Botón de consulta por WhatsApp */}
            <div className="pt-6 border-t">
              {(() => {
                const envPhone = WHATSAPP_PHONE;
                const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
                const message = `Hola, quisiera consultar la disponibilidad del producto "${producto.nombre}" (SKU: ${producto.sku}). Precio: ${formatPrice(producto.precio)}. Link: ${currentUrl}`;
                const href = envPhone ? `https://wa.me/${envPhone}?text=${encodeURIComponent(message)}` : "/contacto";
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-lg"
                  >
                    <svg 
                      className="mr-2 w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                      />
                    </svg>
                    Consultar Disponibilidad
                  </a>
                );
              })()}
            </div>

            {/* Información adicional */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>Compra solo en tienda física.</p>
              {producto.created_at && (
                <p>Agregado: {formatDate(producto.created_at)}</p>
              )}
              {producto.updated_at && producto.updated_at !== producto.created_at && (
                <p>Actualizado: {formatDate(producto.updated_at)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
