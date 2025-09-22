"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  sku: string;
  categoria?: string;
  stock: number;
  imagen_principal?: string | null;
  created_at?: string;
};

export default function LatestProducts() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('/api/productos');
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }
        const data = await response.json();
        // Tomar solo los primeros 8 productos (4x2)
        setProductos(data.productos.slice(0, 8));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Productos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Productos
          </h2>
          <div className="text-center text-red-600">
            <p>Error al cargar los productos: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (productos.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Productos
          </h2>
          <div className="text-center text-gray-600">
            <p>No hay productos disponibles en este momento.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white w-full">
      <div className="mx-auto max-w-screen-2xl px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="text-gray-800">Nuestros </span>
          <span className="text-indigo-400">Productos</span>
          <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
        </h2>
        
        {/* Grid 4x2 para productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8 mb-8">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/productos" 
            className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300"
          >
            Ver Más Productos
          </Link>
        </div>
      </div>
    </section>
  );
}
