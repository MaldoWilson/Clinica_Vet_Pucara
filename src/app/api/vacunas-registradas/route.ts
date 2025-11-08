import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET all records
export async function GET (request: Request) {
  const supabase = createServerComponentClient({ cookies })
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)
  const offset = (page - 1) * limit
  const mes = searchParams.get('mes') // YYYY-MM format

  let query = supabase
    .from('vacunas_registradas')
    .select(`
      id,
      nombre_vacuna,
      fecha_aplicacion,
      created_at,
      veterinarios ( id, nombre )
    `, { count: 'exact' })

  if (mes) {
    const [year, month] = mes.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // Last day of the month

    query = query.gte('fecha_aplicacion', startDate.toISOString())
    query = query.lte('fecha_aplicacion', endDate.toISOString())
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, meta: { count } })
}

// POST a new record
export async function POST (request: Request) {
  const supabase = createServerComponentClient({ cookies })
  const body = await request.json()

  const { veterinario_id, nombre_vacuna, fecha_aplicacion } = body

  if (!veterinario_id || !nombre_vacuna || !fecha_aplicacion) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('vacunas_registradas')
    .insert({
      veterinario_id,
      nombre_vacuna,
      fecha_aplicacion
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// PUT to update a record
export async function PUT (request: Request) {
  const supabase = createServerComponentClient({ cookies })
  const body = await request.json()
  const { id, veterinario_id, nombre_vacuna, fecha_aplicacion } = body

  if (!id) {
    return NextResponse.json({ error: 'El ID del registro es requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('vacunas_registradas')
    .update({
      veterinario_id,
      nombre_vacuna,
      fecha_aplicacion
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// DELETE a record
export async function DELETE (request: Request) {
  const supabase = createServerComponentClient({ cookies })
  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'El ID del registro es requerido' }, { status: 400 })
  }

  const { error } = await supabase
    .from('vacunas_registradas')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Registro eliminado correctamente' })
}
