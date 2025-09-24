"use client";

import AdminPanel from "@/components/AdminPanel";
import AdminHorariosPage from "./horarios/page";

export default function AdminHome() {
  return (
    <AdminPanel
      title="Gestión"
      tabs={[
        { id: "horarios", label: "⏰ Horarios", content: <AdminHorariosPage /> },
      ]}
      initialActiveTabId="horarios"
    />
  );
}


