'use client'

import { useEffect, useState } from 'react'
import ConfirmationModal from '@/components/ConfirmationModal'
import RendimientoVetsChart from '@/components/RendimientoVetsChart'
import DistribucionVacunasChart from '@/components/DistribucionVacunasChart'
import TendenciaVacunasChart from '@/components/TendenciaVacunasChart'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import * as XLSX from 'xlsx'

// Types
type Vet = { id: string; nombre: string }
type VaccineRecord = { id: number; nombre_vacuna: string; fecha_aplicacion: string; veterinarios: Vet }
type FormData = { id?: number; veterinario_id: string; nombre_vacuna: string; fecha_aplicacion: string }

// Stats Types from API
type KpiData = { totalMes: number; vetDestacado: string; vacunaComun: string }
type RendimientoData = { name: string; [key: string]: number | string }
type DistribucionData = { name: string; value: number }
type TendenciaData = { date: string; count: number }

const initialFormState: FormData = {
  veterinario_id: '',
  nombre_vacuna: '',
  fecha_aplicacion: format(new Date(), 'yyyy-MM-dd')
}

const getCurrentMonthString = () => new Date().toISOString().slice(0, 7)

// Helper to get month name
const getMonthName = (monthString: string) => {
  if (!monthString.includes('-')) return 'Histórico'
  const [year, month] = monthString.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
}

export default function VacunasPage () {
  // Dashboard data
  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [rendimientoData, setRendimientoData] = useState<RendimientoData[]>([])
  const [distribucionData, setDistribucionData] = useState<DistribucionData[]>([])
  const [tendenciaData, setTendenciaData] = useState<TendenciaData[]>([])
  const [allVets, setAllVets] = useState<Vet[]>([])
  const [allVetsFromStats, setAllVetsFromStats] = useState<string[]>([])

  // Table data
  const [tableData, setTableData] = useState<VaccineRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString())
  const [isTableExpanded, setIsTableExpanded] = useState(false)

  // State management
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormState)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Fetch all data for the dashboard and table
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, tableRes, vetsRes] = await Promise.all([
        fetch(`/api/admin/vacunas/stats?mes=${selectedMonth}`),
        fetch(`/api/vacunas-registradas?mes=${selectedMonth}&limit=1000`), // Fetch all for the month
        fetch('/api/Veterinarios')
      ])

      const statsJson = await statsRes.json()
      const tableJson = await tableRes.json()
      const vetsJson = await vetsRes.json()

      if (!statsRes.ok) throw new Error(statsJson.error || 'Error al cargar estadísticas')
      if (!tableRes.ok) throw new Error(tableJson.error || 'Error al cargar registros')
      if (!vetsJson.ok) throw new Error(vetsJson.error || 'Error al cargar veterinarios')

      setKpis(statsJson.kpis)
      setRendimientoData(statsJson.rendimientoVets)
      setDistribucionData(statsJson.distribucionVacunas)
      setTendenciaData(statsJson.tendenciaGeneral)
      setAllVetsFromStats(statsJson.allVets)
      setTableData(tableJson.data || [])
      setAllVets(vetsJson.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  // CRUD handlers
  const handleNew = () => {
    setFormData(initialFormState)
    setIsEditing(false)
    setShowModal(true)
  }

  const handleEdit = (record: VaccineRecord) => {
    setFormData({
      id: record.id,
      veterinario_id: record.veterinarios.id,
      nombre_vacuna: record.nombre_vacuna,
      fecha_aplicacion: record.fecha_aplicacion
    })
    setIsEditing(true)
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/vacunas-registradas', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Error al guardar')
      }
      setShowModal(false)
      await fetchData()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = (id: number) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch('/api/vacunas-registradas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId })
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Error al eliminar')
      }
      setShowDeleteModal(false)
      setDeleteId(null)
      await fetchData()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const monthTitle = getMonthName(selectedMonth)

  // Export and Print Functions
  const exportarExcel = () => {
    if (tableData.length === 0) return

    const monthName = getMonthName(selectedMonth)

    // --- Create Summary Data ---
    const totalsByVet = tableData.reduce((acc, rec) => {
      const vetName = rec.veterinarios?.nombre || 'N/A'
      acc[vetName] = (acc[vetName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalsByVaccine = tableData.reduce((acc, rec) => {
      const vaccineName = rec.nombre_vacuna || 'N/A'
      acc[vaccineName] = (acc[vaccineName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // --- Build Worksheet Data ---
    const ws_data: any[][] = []
    ws_data.push([`REGISTRO DE VACUNAS - ${monthName.toUpperCase()}`])
    ws_data.push([])

    ws_data.push(['Resumen del Mes'])
    ws_data.push(['Total de Registros:', tableData.length])
    ws_data.push([])

    ws_data.push(['Totales por Veterinario/a'])
    ws_data.push(['Veterinario/a', 'Cantidad'])
    Object.entries(totalsByVet).forEach(([name, count]) => ws_data.push([name, count]))
    ws_data.push([])

    ws_data.push(['Totales por Tipo de Vacuna'])
    ws_data.push(['Tipo de Vacuna', 'Cantidad'])
    Object.entries(totalsByVaccine).forEach(([name, count]) => ws_data.push([name, count]))
    ws_data.push([])

    ws_data.push(['Historial Detallado'])
    const detailHeaderRowIndex = ws_data.length
    ws_data.push(['VETERINARIO/A', 'NOMBRE VACUNA', 'FECHA APLICACIÓN'])
    tableData.forEach(rec => {
      let formattedDate = ''
      if (rec.fecha_aplicacion && rec.fecha_aplicacion.includes('-')) {
        const parts = rec.fecha_aplicacion.split('-')
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
      }
      ws_data.push([
        rec.veterinarios?.nombre || 'N/A',
        rec.nombre_vacuna,
        formattedDate
      ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(ws_data)

    // --- Apply Basic Formatting ---
    worksheet['!cols'] = [{ wch: 35 }, { wch: 25 }, { wch: 20 }]
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }]

    // Add autofilter
    const filterRange = `A${detailHeaderRowIndex + 1}:C${detailHeaderRowIndex + 1}`
    worksheet['!autofilter'] = { ref: filterRange }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vacunas')
    XLSX.writeFile(workbook, `registro_vacunas_${monthName.replace(/ /g, '_')}.xlsx`)
  }

  const imprimirMes = () => {
    if (tableData.length === 0) return
    const monthName = getMonthName(selectedMonth)

    // --- Create Summary Data ---
    const totalsByVet = tableData.reduce((acc, rec) => {
      const vetName = rec.veterinarios?.nombre || 'N/A'
      acc[vetName] = (acc[vetName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalsByVaccine = tableData.reduce((acc, rec) => {
      const vaccineName = rec.nombre_vacuna || 'N/A'
      acc[vaccineName] = (acc[vaccineName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const printContent = `
      <html>
        <head>
          <title>Registro de Vacunas - ${monthName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; }
            h1, h2 { text-align: center; }
            .summary-section { margin-bottom: 30px; page-break-inside: avoid; }
            .summary-section h2 { text-align: left; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>Registro de Vacunas - ${monthName}</h1>
          <div class="summary-section">
            <h2>Totales por Veterinario/a</h2>
            <table>
              <thead><tr><th>Veterinario/a</th><th>Cantidad</th></tr></thead>
              <tbody>
                ${Object.entries(totalsByVet).map(([name, count]) => `<tr><td>${name}</td><td>${count}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="summary-section">
            <h2>Totales por Tipo de Vacuna</h2>
            <table>
              <thead><tr><th>Tipo de Vacuna</th><th>Cantidad</th></tr></thead>
              <tbody>
                ${Object.entries(totalsByVaccine).map(([name, count]) => `<tr><td>${name}</td><td>${count}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="summary-section">
            <h2>Historial Detallado</h2>
            <table>
              <thead><tr><th>Veterinario/a</th><th>Nombre Vacuna</th><th>Fecha Aplicación</th></tr></thead>
              <tbody>
                ${tableData.map(rec => {
                  const formattedDate = rec.fecha_aplicacion ? rec.fecha_aplicacion.split('-').reverse().join('-') : ''
                  return `
                    <tr>
                      <td>${rec.veterinarios?.nombre || 'N/A'}</td>
                      <td>${rec.nombre_vacuna}</td>
                      <td>${formattedDate}</td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow?.document.write(printContent)
    printWindow?.document.close()
    printWindow?.focus()
    setTimeout(() => printWindow?.print(), 250)
  }

  const displayedRecords = isTableExpanded ? tableData : tableData.slice(0, 10)

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Vacunación</h1>
          <p className="text-gray-600 mt-1 capitalize">Mostrando datos para: <span className="font-semibold">{monthTitle}</span></p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md"/>
          <button onClick={exportarExcel} disabled={loading || tableData.length === 0} className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">Exportar</button>
          <button onClick={imprimirMes} disabled={loading || tableData.length === 0} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">Imprimir</button>
          <button onClick={handleNew} className="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700">+ Registrar</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title={`Total Vacunas (${monthTitle})`} value={kpis?.totalMes} loading={loading} />
        <KpiCard title="Veterinario/a Destacado/a" value={kpis?.vetDestacado} loading={loading} />
        <KpiCard title="Vacuna Más Común" value={kpis?.vacunaComun} loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3"><TendenciaVacunasChart data={tendenciaData} /></div>
        <div className="lg:col-span-2"><DistribucionVacunasChart data={distribucionData} /></div>
        <div className="lg:col-span-5"><RendimientoVetsChart data={rendimientoData} veterinarios={allVetsFromStats} /></div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b"><h2 className="text-xl font-bold text-gray-900">Historial de Registros ({monthTitle})</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veterinario/a</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vacuna</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Aplicación</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading
                ? (<tr><td colSpan={4} className="p-8 text-center text-gray-500">Cargando...</td></tr>)
                : displayedRecords.length === 0
                  ? (<tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay registros para el mes seleccionado.</td></tr>)
                  : (displayedRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{rec.veterinarios?.nombre || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{rec.nombre_vacuna}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {rec.fecha_aplicacion ? rec.fecha_aplicacion.split('-').reverse().join('-') : ''}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(rec)} className="px-3 py-1 text-sm rounded border">Editar</button>
                            <button onClick={() => handleDeleteConfirm(rec.id)} className="px-3 py-1 text-sm rounded bg-red-600 text-white">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                  )))}
            </tbody>
          </table>
        </div>
        {tableData.length > 10 && (
          <div className="bg-gray-50 px-4 py-3 text-center border-t">
            <button onClick={() => setIsTableExpanded(!isTableExpanded)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              {isTableExpanded ? 'Ver Menos' : `Ver ${tableData.length - 10} más`}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && <FormModal formData={formData} setFormData={setFormData} allVets={allVets} handleSave={handleSave} setShowModal={setShowModal} isEditing={isEditing} saving={saving} />}
      <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Confirmar Eliminación" message="¿Seguro que quieres eliminar este registro?" />
    </div>
  )
}

// Sub-components
function KpiCard ({ title, value, loading }: { title: string, value: string | number | undefined, loading: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-md font-medium text-gray-500">{title}</h3>
      {loading
        ? <div className="mt-2 h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
        : <p className="text-3xl font-bold text-gray-900 mt-2 truncate">{value ?? 'N/A'}</p>
      }
    </div>
  )
}

function FormModal({ formData, setFormData, allVets, handleSave, setShowModal, isEditing, saving }: any) {
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <form onSubmit={handleSave} className="p-6">
          <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar Registro' : 'Nuevo Registro'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario/a</label>
              <select value={formData.veterinario_id} onChange={(e) => handleInputChange('veterinario_id', e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="" disabled>Seleccionar...</option>
                {allVets.map((v: Vet) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Vacuna</label>
              <input type="text" value={formData.nombre_vacuna} onChange={(e) => handleInputChange('nombre_vacuna', e.target.value)} required placeholder="Ej: Antirrábica" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Aplicación</label>
              <input type="date" value={formData.fecha_aplicacion} onChange={(e) => handleInputChange('fecha_aplicacion', e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} disabled={saving} className="px-4 py-2 rounded-md border">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-md bg-indigo-600 text-white">{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
