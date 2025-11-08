'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

type ChartData = {
  date: string
  count: number
}

type ChartProps = {
  data: ChartData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // The payload contains the full data object, which has the original date string
    const originalDate = payload[0].payload.date
    // To fix the timezone issue, we create a UTC date and then adjust it by the timezone offset
    const utcDate = new Date(originalDate)
    const correctedDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000)

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-1">
          {format(correctedDate, 'PPP', { locale: es })}
        </p>
        <p className="text-sm text-indigo-600">
          Total de Vacunas: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export default function TendenciaVacunasChart ({ data }: ChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    // Format the label for the X-axis to just be the day number
    formattedDate: format(parseISO(item.date), 'd')
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Cantidad de Vacunas por Día
      </h3>
      {data.length === 0
        ? (
          <div className="text-center py-12 text-gray-500 flex items-center justify-center h-full">
            <div>
              <p className="text-lg font-medium">No hay datos para mostrar</p>
            </div>
          </div>
          )
        : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="count" name="Nº de Vacunas" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
          )}
    </div>
  )
}
