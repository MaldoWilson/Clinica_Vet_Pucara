"use client";

import ProductosForm from "@/components/ProductosForm";

export default function ProductosPage() {
  return (
    <div className="space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">Administra los productos de la tienda</p>
        </div>
      </div>
      <ProductosForm />
    </div>
  );
}


