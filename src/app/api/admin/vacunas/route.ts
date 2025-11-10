import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

interface MonthlyVaccineStats {
  [month: string]: {
    [vetName: string]: number
  }
}

export async function GET () {
  const supabase = createServerComponentClient({ cookies })

  const { data: vacunas, error } = await supabase
    .from('vacunas_registradas')
    .select(`
      fecha_aplicacion,
      veterinarios ( nombre )
    `)
    .order('fecha_aplicacion', { ascending: false })

  if (error) {
    console.error('Error fetching vacunas:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }

  if (!vacunas) {
    return NextResponse.json([])
  }

  // Process data to group by month and vet
  const stats = vacunas.reduce((acc: MonthlyVaccineStats, vacuna) => {
    const { fecha_aplicacion, veterinarios } = vacuna
    if (!veterinarios) return acc // Skip if vet info is missing

    const vetName = Array.isArray(veterinarios)
      ? (veterinarios[0]?.nombre ?? 'Desconocido')
      : ((veterinarios as { nombre?: string })?.nombre ?? 'Desconocido')
    const month = new Date(fecha_aplicacion).toISOString().slice(0, 7) // Format YYYY-MM

    if (!acc[month]) {
      acc[month] = {}
    }
    if (!acc[month][vetName]) {
      acc[month][vetName] = 0
    }
    acc[month][vetName]++

    return acc
  }, {})

  // Format for the chart
  const chartData = Object.entries(stats).map(([month, vetCounts]) => {
    return {
      name: month,
      ...vetCounts
    }
  })

  return NextResponse.json(chartData)
}
