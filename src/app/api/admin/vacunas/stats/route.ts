import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { subDays, format, getDaysInMonth } from 'date-fns'

export const dynamic = 'force-dynamic'

type VaccineRecord = {
  fecha_aplicacion: string
  nombre_vacuna: string
  veterinarios: { nombre: string } | null
}

export async function GET (request: Request) {
  const supabase = createServerComponentClient({ cookies })
  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes') // YYYY-MM format

  // Base query
  let query = supabase
    .from('vacunas_registradas')
    .select(`
      fecha_aplicacion,
      nombre_vacuna,
      veterinarios ( nombre )
    `)
    .order('fecha_aplicacion', { ascending: true })

  // Apply month filter if provided
  if (mes) {
    const [year, month] = mes.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    query = query.gte('fecha_aplicacion', startDate.toISOString())
    query = query.lte('fecha_aplicacion', endDate.toISOString())
  }

  const { data: records, error } = await query

  if (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 })
  }

  if (!records || records.length === 0) {
    return NextResponse.json({
      kpis: { totalMes: 0, vetDestacado: 'N/A', vacunaComun: 'N/A' },
      rendimientoVets: [],
      distribucionVacunas: [],
      tendenciaGeneral: [],
      allVets: []
    })
  }

  // --- 1. KPIs ---
  const kpiRecords = mes ? records : records.filter(r => new Date(r.fecha_aplicacion) >= subDays(new Date(), 30))

  const totalMes = kpiRecords.length
  const vetCountsMes = kpiRecords.reduce((acc, rec) => {
    const vetName = rec.veterinarios?.nombre || 'Desconocido'
    acc[vetName] = (acc[vetName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const vacunaCountsMes = kpiRecords.reduce((acc, rec) => {
    acc[rec.nombre_vacuna] = (acc[rec.nombre_vacuna] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const vetDestacado = Object.keys(vetCountsMes).length > 0
    ? Object.entries(vetCountsMes).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : 'N/A'
  const vacunaComun = Object.keys(vacunaCountsMes).length > 0
    ? Object.entries(vacunaCountsMes).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : 'N/A'

  const kpis = { totalMes, vetDestacado, vacunaComun }

  // --- 2. Rendimiento Vets (Grouped Bar Chart) ---
  const { data: vets } = await supabase.from('veterinarios').select('nombre')
  const allVetsList = vets ? vets.map(v => v.nombre).sort() : []

  const performanceByMonth = records.reduce((acc, rec) => {
    const month = format(new Date(rec.fecha_aplicacion), 'yyyy-MM')
    const vetName = rec.veterinarios?.nombre || 'Desconocido'

    if (!acc[month]) {
      acc[month] = { name: month }
      allVetsList.forEach(vet => {
        acc[month][vet] = 0
      })
    }
    if (allVetsList.includes(vetName)) {
      acc[month][vetName] = (acc[month][vetName] || 0) + 1
    }
    return acc
  }, {} as Record<string, any>)
  const rendimientoVets = Object.values(performanceByMonth)

  // --- 3. Distribucion Vacunas (Donut Chart) ---
  const distribution = records.reduce((acc, rec) => {
    acc[rec.nombre_vacuna] = (acc[rec.nombre_vacuna] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const distribucionVacunas = Object.entries(distribution).map(([name, value]) => ({ name, value }))

  // --- 4. Cantidad por Día (Line Chart) ---
  const dailyCounts = new Map<string, number>()
  if (mes) {
    const year = parseInt(mes.split('-')[0])
    const month = parseInt(mes.split('-')[1]) - 1
    const numDays = getDaysInMonth(new Date(year, month))

    for (let i = 1; i <= numDays; i++) {
      const date = new Date(year, month, i)
      dailyCounts.set(format(date, 'yyyy-MM-dd'), 0)
    }
  }

  records.forEach(rec => {
    const dateKey = format(new Date(rec.fecha_aplicacion), 'yyyy-MM-dd')
    if (dailyCounts.has(dateKey)) {
      dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1)
    } else if (!mes) { // If no month is selected, just add the days that have records
      dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1)
    }
  })
  const tendenciaGeneral = Array.from(dailyCounts.entries()).map(([date, count]) => ({ date, count }))

  return NextResponse.json({
    kpis,
    rendimientoVets,
    distribucionVacunas,
    tendenciaGeneral,
    allVets: allVetsList
  })
}
