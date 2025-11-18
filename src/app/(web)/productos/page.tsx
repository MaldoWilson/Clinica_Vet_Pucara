"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/whatsapp";
import Image from "next/image";
import productosBanner from "@/app/img/productos.webp";

type Categoria = {
  id: number;
  nombre: string;
};

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  sku: string;
  categorias: Categoria | null;
  stock: number;
  imagen_principal?: string | null;
  created_at?: string;
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosResponse, categoriasResponse] = await Promise.all([
          fetch('/api/productos'),
          fetch('/api/categorias')
        ]);

        if (!productosResponse.ok) {
          throw new Error('Error al cargar los productos');
        }
        if (!categoriasResponse.ok) {
          throw new Error('Error al cargar las categorías');
        }

        const productosData = await productosResponse.json();
        const categoriasData = await categoriasResponse.json();

        setProductos(productosData.productos || []);
        setCategories(categoriasData.categorias || []);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos
  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || producto.categorias?.nombre === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const HeaderSection = () => (
    <section className="relative h-72 md:h-[260px] flex items-center overflow-hidden -mt-16 lg:-mt-18">
      <div className="absolute inset-0 -z-20">
        <Image
          src={productosBanner}
          alt="Productos"
          fill
          priority
          quality={95}
          className="object-cover"
        />
      </div>
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" />
      </div>
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] -z-10 rotate-180 pointer-events-none">
        <svg
          className="relative block w-[140%] md:w-[100%] h-[200px] text-white"
          fill="currentColor"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );

  if (loading) {
    return (
      <>
        <HeaderSection />
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-8 w-1/3 mb-8 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-2xl h-64"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderSection />
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600 mb-8">{error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderSection />
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              <span className="text-gray-800">Nuestros </span>
              <span className="text-indigo-400">Productos</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra amplia gama de productos veterinarios de alta calidad para el cuidado de tus mascotas. <span className="text-indigo-500">Compra solo disponible en tienda física.</span>
            </p>
            <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-4"></div>
          </div>

          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4 px-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos por nombre, descripción o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.nombre}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              {filteredProductos.length === productos.length 
                ? `${productos.length} productos disponibles`
                : `${filteredProductos.length} de ${productos.length} productos`
              }
            </p>
          </div>

          {filteredProductos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron productos</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory 
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay productos disponibles en este momento"
                }
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4">
              {filteredProductos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
      <WhatsAppButton
        text="Hola Vengo desde la web y quiero agendar una hora de emergencia para mi mascota"
        floating
      />
    </>
  );
}