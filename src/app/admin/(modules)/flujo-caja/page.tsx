"use client";

import { useEffect, useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";
import IngresosEgresosChart from "@/components/IngresosEgresosChart";
import EgresosDistribucionChart from "@/components/EgresosDistribucionChart";
import ProfesionalesRendimientoChart from "@/components/ProfesionalesRendimientoChart";
import * as XLSX from "xlsx";

type Veterinario = {
  id: string;
  nombre: string;
  especialidad: string | null;
};

type FlujoCaja = {
  id: string;
  dia: number; // Calculado automáticamente desde created_at
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

type FormData = Omit<FlujoCaja, "id" | "created_at" | "dia"> & { id?: string };

const initialFormState: FormData = {
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
  
  // Filtro de mes/año - Por defecto el mes actual
  const getCurrentMonthString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  
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
      const res = await fetch(`/api/flujo-caja?limit=${itemsPerPage}&offset=${offset}&mes=${selectedMonth}`);
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
    setCurrentPage(1); // Resetear página al cambiar mes
    cargarRegistros();
  }, [selectedMonth]);

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
      // Remover el campo dia del formulario ya que se calcula automáticamente desde created_at
      const { dia, ...dataToSend } = formData;
      const res = await fetch("/api/flujo-caja", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
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

  // Obtener nombre del mes en español
  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  };

  // Exportar a Excel
  const exportarExcel = () => {
    if (registros.length === 0) {
      alert("No hay registros para exportar");
      return;
    }

    const monthName = getMonthName(selectedMonth);

    // Crear datos con encabezado de título
    const titulo = [[`FLUJO DE CAJA - ${monthName.toUpperCase()}`]];
    const subtitulo = [[`Clínica Veterinaria Pucará`]];
    const espacioBlanco = [[]];
    
    // Encabezados de columnas (en mayúsculas)
    const headers = [["DÍA", "TIPO", "CATEGORÍA", "NOMBRE", "EFECTIVO", "DÉBITO", "CRÉDITO", "TRANSFERENCIA", "DEUDA", "EGRESO", "DR", "FECHA CREACIÓN"]];
    
    // Preparar datos - valores nulos o 0 se muestran como vacíos
    const datosBody = registros.map(reg => [
      new Date(reg.created_at).getDate(), // Día extraído de created_at
      reg.tipo || "",
      reg.categoria || "",
      reg.nombre || "",
      reg.efectivo ? reg.efectivo : "",
      reg.debito ? reg.debito : "",
      reg.credito ? reg.credito : "",
      reg.transferencia ? reg.transferencia : "",
      reg.deuda ? reg.deuda : "",
      reg.egreso ? reg.egreso : "",
      reg.dr || "",
      new Date(reg.created_at).toLocaleDateString('es-CL')
    ]);

    // Combinar todo
    const datosCompletos = [...titulo, ...subtitulo, ...espacioBlanco, ...headers, ...datosBody];

    // Crear hoja
    const worksheet = XLSX.utils.aoa_to_sheet(datosCompletos);
    const workbook = XLSX.utils.book_new();

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 8 },  // Día
      { wch: 15 }, // Tipo
      { wch: 12 }, // Categoría
      { wch: 25 }, // Nombre
      { wch: 13 }, // Efectivo
      { wch: 13 }, // Débito
      { wch: 13 }, // Crédito
      { wch: 15 }, // Transferencia
      { wch: 13 }, // Deuda
      { wch: 13 }, // Egreso
      { wch: 20 }, // DR
      { wch: 16 }  // Fecha Creación
    ];

    // Aplicar estilos
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Estilo del título (fila 1)
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    
    // Estilo del subtítulo (fila 2)
    if (worksheet['A2']) {
      worksheet['A2'].s = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "6366F1" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    // Combinar celdas para título y subtítulo
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Título
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } }  // Subtítulo
    ];

    // Estilo de encabezados (fila 4)
    for (let col = 0; col <= 11; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 3, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "059669" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }

    // Estilo de datos (filas 5 en adelante) - alternar colores
    for (let row = 4; row <= range.e.r; row++) {
      const isEvenRow = (row - 4) % 2 === 0;
      for (let col = 0; col <= 11; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          // Formato de números con separador de miles para columnas monetarias (4-9)
          if (col >= 4 && col <= 9 && worksheet[cellAddress].v !== "") {
            const value = worksheet[cellAddress].v;
            if (typeof value === 'number') {
              worksheet[cellAddress].z = '#,##0';
            }
          }

          // Color por columna - solo si tiene valor
          let fontColor = { rgb: "000000" }; // Negro por defecto
          let fontBold = false;
          
          if (worksheet[cellAddress].v !== "") {
            switch(col) {
              case 5: // DÉBITO - Verde
                fontColor = { rgb: "16A34A" };
                fontBold = true;
                break;
              case 6: // CRÉDITO - Morado
                fontColor = { rgb: "9333EA" };
                fontBold = true;
                break;
              case 7: // TRANSFERENCIA - Celeste
                fontColor = { rgb: "0891B2" };
                fontBold = true;
                break;
              case 8: // DEUDA - Rojo
                fontColor = { rgb: "DC2626" };
                fontBold = true;
                break;
              case 9: // EGRESO - Rojo
                fontColor = { rgb: "DC2626" };
                fontBold = true;
                break;
              case 4: // EFECTIVO - Negro pero negrita
                fontBold = true;
                break;
            }
          }

          worksheet[cellAddress].s = {
            fill: { fgColor: { rgb: isEvenRow ? "FFFFFF" : "F3F4F6" } },
            alignment: { 
              horizontal: col >= 4 && col <= 9 ? "right" : "left",
              vertical: "center" 
            },
            border: {
              top: { style: "thin", color: { rgb: "E5E7EB" } },
              bottom: { style: "thin", color: { rgb: "E5E7EB" } },
              left: { style: "thin", color: { rgb: "E5E7EB" } },
              right: { style: "thin", color: { rgb: "E5E7EB" } }
            },
            font: { color: fontColor, bold: fontBold }
          };
        }
      }
    }

    // Agregar filtro automático a los encabezados
    worksheet['!autofilter'] = { ref: `A4:L${range.e.r + 1}` };

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, monthName.substring(0, 31));
    
    // Descargar archivo
    const fileName = `flujo_caja_${monthName.replace(/ /g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Imprimir mes
  const imprimirMes = () => {
    if (registros.length === 0) {
      alert("No hay registros para imprimir");
      return;
    }

    const monthName = getMonthName(selectedMonth);
    const contenidoImpresion = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Flujo de Caja - ${monthName}</title>
        <style>
          @page {
            size: landscape;
            margin: 1cm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .header h1 {
            font-size: 18px;
            margin-bottom: 5px;
          }
          .header h2 {
            font-size: 14px;
            color: #666;
            text-transform: capitalize;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #333;
            padding: 6px 4px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
          }
          td {
            font-size: 10px;
          }
          .text-right {
            text-align: right;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #666;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Clínica Veterinaria Pucará</h1>
          <h2>Flujo de Caja - ${monthName}</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">Día</th>
              <th style="width: 10%;">Tipo</th>
              <th style="width: 8%;">Categoría</th>
              <th style="width: 15%;">Nombre</th>
              <th style="width: 8%;" class="text-right">Efectivo</th>
              <th style="width: 8%;" class="text-right">Débito</th>
              <th style="width: 8%;" class="text-right">Crédito</th>
              <th style="width: 9%;" class="text-right">Transfer.</th>
              <th style="width: 8%;" class="text-right">Deuda</th>
              <th style="width: 8%;" class="text-right">Egreso</th>
              <th style="width: 13%;">DR</th>
            </tr>
          </thead>
          <tbody>
            ${registros.map(reg => `
              <tr>
                <td>${new Date(reg.created_at).getDate()}</td>
                <td>${reg.tipo || ""}</td>
                <td>${reg.categoria || ""}</td>
                <td>${reg.nombre || ""}</td>
                <td class="text-right">${reg.efectivo ? formatNumber(reg.efectivo) : ""}</td>
                <td class="text-right">${reg.debito ? formatNumber(reg.debito) : ""}</td>
                <td class="text-right">${reg.credito ? formatNumber(reg.credito) : ""}</td>
                <td class="text-right">${reg.transferencia ? formatNumber(reg.transferencia) : ""}</td>
                <td class="text-right">${reg.deuda ? formatNumber(reg.deuda) : ""}</td>
                <td class="text-right">${reg.egreso ? formatNumber(reg.egreso) : ""}</td>
                <td>${reg.dr || ""}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Impreso el ${new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })} - Total de registros: ${registros.length}</p>
        </div>
      </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      
      // Esperar a que cargue antes de imprimir
      setTimeout(() => {
        ventanaImpresion.print();
      }, 250);
    }
  };

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Flujo de Caja</h1>
          <p className="text-gray-600 mt-1">Administra ingresos y egresos - <span className="font-semibold capitalize">{getMonthName(selectedMonth)}</span></p>
        </div>
        <button
          onClick={handleNuevo}
          className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 shadow-md"
        >
          + Agregar Nuevo Registro
        </button>
      </div>

      {/* Filtros y Acciones */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrar por mes:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setSelectedMonth(getCurrentMonthString())}
              className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Mes Actual
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportarExcel}
              disabled={loading || registros.length === 0}
              className="px-4 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </button>
            <button
              onClick={imprimirMes}
              disabled={loading || registros.length === 0}
              className="px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Mes
            </button>
          </div>
        </div>
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(reg.created_at).getDate()}</td>
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
                  {/* Día (calculado automáticamente desde created_at) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Día <span className="text-gray-500">(automático)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dia}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-md"
                      placeholder="Se calcula automáticamente"
                      title="El día se calcula automáticamente desde la fecha de creación"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se calcula automáticamente desde la fecha de creación
                    </p>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => handleInputChange("tipo", e.target.value)}
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
                      placeholder="Nombre del cliente"
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

      {/* Gráfico de Ingresos vs Egresos */}
      <div id="grafico-ingresos-egresos">
        <IngresosEgresosChart data={registros} />
      </div>

      {/* Gráfico de Distribución de Egresos */}
      <div id="grafico-distribucion-egresos">
        <EgresosDistribucionChart data={registros} />
      </div>

      {/* Gráfico de Rendimiento por Profesional */}
      <div id="grafico-rendimiento-profesionales">
        <ProfesionalesRendimientoChart data={registros} />
      </div>

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

