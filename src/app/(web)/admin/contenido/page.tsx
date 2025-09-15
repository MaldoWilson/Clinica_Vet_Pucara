"use client";

import AdminPanel from "@/components/AdminPanel";
import BlogsForm from "@/components/BlogsForm";

export default function ContenidoPage() {
  return (
    <AdminPanel
      title="Admin · Contenido"
      tabs={[
        { id: "blogs", label: "📝 Blogs", content: <BlogsForm /> },
        { id: "productos", label: "🛍️ Productos", content: <div>Gestión de productos (próximamente)</div> },
      ]}
      initialActiveTabId="blogs"
    />
  );
}
