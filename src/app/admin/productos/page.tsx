"use client";

import AdminPanel from "@/components/AdminPanel";
import ProductosForm from "@/components/ProductosForm";

export default function ProductosPage() {
  return (
    <AdminPanel
      title="Productos"
      tabs={[
        { id: "productos", label: "🛍️ Productos", content: <ProductosForm /> },
      ]}
      initialActiveTabId="productos"
    />
  );
}


