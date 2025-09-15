"use client";

import AdminPanel from "@/components/AdminPanel";

export default function ContenidoPage() {
  return (
    <AdminPanel
      title="Admin · Contenido"
      tabs={[
        { id: "blogs", label: "📝 Blogs", content: <div>Gestión de blogs (próximamente)</div> },
        { id: "productos", label: "🛍️ Productos", content: <div>Gestión de productos (próximamente)</div> },
      ]}
      initialActiveTabId="blogs"
    />
  );
}
