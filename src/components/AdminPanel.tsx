"use client";

import { useState } from "react";
import AdminCitasTable from "@/components/AdminCitasTable";
import RecetaForm from "@/components/RecetaForm";
import CertificadoForm from "@/components/CertificadoForm";
import FichaForm from "@/components/FichasForm";

export default function AdminPanel({ initialCitas, estado }: { initialCitas: any[]; estado: string }) {
  const [activeTab, setActiveTab] = useState("citas");

  const tabs = [
    { id: "citas", label: "📅 Citas" },
    { id: "fichas", label: "🐾 Fichas Mascota" },
    { id: "recetas", label: "💊 Recetas Médicas" },
    { id: "certificados", label: "📄 Certificados" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Panel de Administración</h1>

      {/* Menú tabs */}
      <div className="flex gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all shadow-sm ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido según pestaña */}
      {activeTab === "citas" && <AdminCitasTable initialCitas={initialCitas} initialEstado={estado} />}
      {activeTab === "fichas" && <FichaForm />}
      {activeTab === "recetas" && <RecetaForm />}
      {activeTab === "certificados" && <CertificadoForm />}
    </div>
  );
}
