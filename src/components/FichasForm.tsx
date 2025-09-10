// src/components/FichaForm.tsx
"use client";

export default function FichaForm() {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Crear Ficha de Mascota</h2>
      <form>
        <div className="mb-2">
          <label className="block font-medium">Nombre de la mascota</label>
          <input type="text" className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Edad</label>
          <input type="number" className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Especie / Raza</label>
          <input type="text" className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Notas</label>
          <textarea className="w-full border rounded px-2 py-1"></textarea>
        </div>
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Guardar Ficha
        </button>
      </form>
    </div>
  );
}
