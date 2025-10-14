"use client";

import ProductosForm from "@/components/ProductosForm";

export default function ProductosPage() {
  return (
    <div className="px-4 py-8">
      <div className="mb-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
        <p className="text-gray-600 mt-1">Administra los productos de la tienda</p>
      </div>
      <div className="max-w-5xl mx-auto">
        <ProductosForm />
      </div>
    </div>
  );
}


