"use client";

import { useEffect, useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

type Veterinario = {
  id: string;
  nombre: string;
  especialidad: string | null;
};

type FlujoCaja = {
  id: string;
  dia: number;
  tipo: string;
  categoria: string | null;
  nombre: string | null;
  efectivo: number;
  debito: number;
  credito: number;
  transferencia: number;
  deuda: number;
  egreso: number;
  dr: string | null;
  created_at: string;
};

type FormData = Omit<FlujoCaja, "id" | "created_at"> & { id?: string };

const initialFormState: FormData = {
  dia: 1,
  tipo: "",
  categoria: "",
  nombre: "",
  efectivo: 0,
  debito: 0,
  credito: 0,
  transferencia: 0,
  deuda: 0,
  egreso: 0,
  dr: "",
};

// Helper para formatear input de dinero
const formatMoneyInput = (value: string): string => {
  // Remover todo excepto números y punto decimal
  const cleaned = value.replace(/[^\d.]/g, '');
  // Asegurar solo un punto decimal
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};

export default function FlujoCajaPage() {
  const [registros, setRegistros] = useState<FlujoCaja[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;
  
  // Modal de formulario
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal de confirmación para eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Cargar veterinarios
  const cargarVeterinarios = async () => {
    try {
      const res = await fetch("/api/Veterinarios");
      const json = await res.json();
      
      if (json.ok && json.data) {
        setVeterinarios(json.data);
      }
    } catch (e) {
      console.error("Error al cargar veterinarios:", e);
    }
  };

  // Cargar registros
  const cargarRegistros = async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const res = await fetch(`/api/flujo-caja?limit=${itemsPerPage}&offset=${offset}`);
      const json = await res.json();
      
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al cargar registros");
      }
      
      setRegistros(json.data || []);
      setTotalCount(json.meta?.count || 0);
    } catch (e: any) {
      setError(e.message || "Error al cargar registros");
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar veterinarios al montar el componente
  useEffect(() => {
    cargarVeterinarios();
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [currentPage]);

  // Abrir modal para crear
  const handleNuevo = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEditar = (registro: FlujoCaja) => {
    setFormData({
      id: registro.id,
      dia: registro.dia,
      tipo: registro.tipo,
      categoria: registro.categoria || "",
      nombre: registro.nombre || "",
      efectivo: registro.efectivo,
      debito: registro.debito,
      credito: registro.credito,
      transferencia: registro.transferencia,
      deuda: registro.deuda,
      egreso: registro.egreso,
      dr: registro.dr || "",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Guardar (crear o actualizar)
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/flujo-caja", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al guardar");
      }

      setShowModal(false);
      setFormData(initialFormState);
      await cargarRegistros();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // Confirmar eliminación
  const handleEliminarConfirm = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Eliminar registro
  const handleEliminar = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch("/api/flujo-caja", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al eliminar");
      }

      setShowDeleteModal(false);
      setDeleteId(null);
      await cargarRegistros();
    } catch (e: any) {
      alert(e.message || "Error al eliminar");
    }
  };

  // Cambiar valor del formulario
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler específico para campos de dinero
  const handleMoneyChange = (field: keyof FormData, value: string) => {
    const formatted = formatMoneyInput(value);
    setFormData(prev => ({ ...prev, [field]: formatted === '' ? 0 : parseFloat(formatted) || 0 }));
  };

  // Calcular páginas
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Formatear números
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-CL", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Flujo de Caja</h1>
          <p className="text-gray-600 mt-1">Administra ingresos y egresos</p>
        </div>
        <button
          onClick={handleNuevo}
          className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 shadow-md"
        >
          + Agregar Nuevo Registro
        </button>
      </div>

      {/* Error global */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Efectivo</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Débito</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Crédito</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deuda</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Egreso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DR</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                    Cargando registros...
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                    No hay registros. ¡Crea uno nuevo!
                  </td>
                </tr>
              ) : (
                registros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.dia}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{reg.tipo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{reg.categoria || "-"}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{reg.nombre || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">${formatNumber(reg.efectivo)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">${formatNumber(reg.debito)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">${formatNumber(reg.credito)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">${formatNumber(reg.transferencia)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">${formatNumber(reg.deuda)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">${formatNumber(reg.egreso)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{reg.dr || "-"}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditar(reg)}
                          className="px-3 py-1 text-sm rounded border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarConfirm(reg.id)}
                          className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} de {totalCount} registros
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {isEditing ? "Editar Registro" : "Nuevo Registro"}
              </h2>

              <form onSubmit={handleGuardar} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Día */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Día <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.dia}
                      onChange={(e) => handleInputChange("dia", parseInt(e.target.value) || 0)}
                      min={1}
                      max={31}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => handleInputChange("tipo", e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="IMPUESTOS">IMPUESTOS</option>
                      <option value="TRANSBANK">TRANSBANK</option>
                      <option value="VERONICA">VERONICA</option>
                      <option value="HIPOTECARIO">HIPOTECARIO</option>
                      <option value="AGUAS ANDINA">AGUAS ANDINA</option>
                      <option value="CGE">CGE</option>
                      <option value="MOVISTAR">MOVISTAR</option>
                      <option value="GAS">GAS</option>
                    </select>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      value={formData.categoria || ""}
                      onChange={(e) => handleInputChange("categoria", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="GCL">GCL</option>
                      <option value="PRO">PRO</option>
                      <option value="HON">HON</option>
                      <option value="GC">GC</option>
                    </select>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre || ""}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Descripción del movimiento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Efectivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo ($)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.efectivo === 0 ? "" : formData.efectivo}
                      onChange={(e) => handleMoneyChange("efectivo", e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Débito */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Débito ($)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.debito === 0 ? "" : formData.debito}
                      onChange={(e) => handleMoneyChange("debito", e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Crédito */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crédito ($)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.credito === 0 ? "" : formData.credito}
                      onChange={(e) => handleMoneyChange("credito", e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Transferencia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transferencia ($)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.transferencia === 0 ? "" : formData.transferencia}
                      onChange={(e) => handleMoneyChange("transferencia", e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Deuda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deuda ($)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.deuda === 0 ? "" : formData.deuda}
                      onChange={(e) => handleMoneyChange("deuda", e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Egreso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Egreso ($)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.egreso === 0 ? "" : formData.egreso}
                      onChange={(e) => handleMoneyChange("egreso", e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* DR */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">DR (Doctor)</label>
                    <select
                      value={formData.dr || ""}
                      onChange={(e) => handleInputChange("dr", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar veterinario...</option>
                      {veterinarios.map((vet) => (
                        <option key={vet.id} value={vet.nombre}>
                          {vet.nombre} {vet.especialidad ? `- ${vet.especialidad}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData(initialFormState);
                      setError(null);
                    }}
                    disabled={saving}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        onConfirm={handleEliminar}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}

