"use client";

import AdminPanel from "@/components/AdminPanel";
import BlogsForm from "@/components/BlogsForm";
import ProductosForm from "@/components/ProductosForm";
import AdminServiciosPage from "../servicios/page";
import AdminEquipoPage from "../equipo/page";

export default function ContenidoPage() {
  return (
    <AdminPanel
      title="Contenido"
      tabs={[
        { id: "blogs", label: "📝 Blogs", content: <BlogsForm /> },
        { id: "productos", label: "🛍️ Productos", content: <ProductosForm /> },
        { id: "servicios", label: "💼 Servicios", content: <AdminServiciosPage /> },
        { id: "equipo", label: "👩‍⚕️ Equipo", content: <AdminEquipoPage /> },
      ]}
      initialActiveTabId="blogs"
    />
  );
}


