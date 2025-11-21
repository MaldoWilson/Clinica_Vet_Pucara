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
    const originalDate = payload[0].payload.date
    const utcDate = new Date(originalDate)
    const correctedDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000)

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2">
        <p className="font-semibold text-gray-900 text-xs mb-1">
          {format(correctedDate, 'dd MMM', { locale: es })}
        </p>
        <p className="text-xs text-indigo-600">
          Total: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export default function TendenciaVacunasChart({ data }: ChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'dd/MM')
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Cantidad de Vacunas por Día
      </h3>
      {data.length === 0
        ? (
          <div className="text-center py-12 text-gray-500 flex items-center justify-center h-full">
            <div>
              <p className="text-sm font-medium">No hay datos</p>
            </div>
          </div>
        )
        : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  tickMargin={10}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10 }}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Vacunas"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
    </div>
  )
}
