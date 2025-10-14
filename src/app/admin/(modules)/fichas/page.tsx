"use client";

import FichaForm from "@/components/FichasForm";

export default function AdminFichasPage() {
  return (
    <div className="px-4 py-12">
      <div className="mb-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Crear Ficha Clínica</h1>
        <p className="text-gray-600 mt-1">Registra la atención clínica de un paciente</p>
      </div>
      <div className="max-w-5xl mx-auto">
        <FichaForm />
      </div>
    </div>
  );
}


