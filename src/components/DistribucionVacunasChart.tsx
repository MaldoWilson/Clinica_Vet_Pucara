'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ChartData = {
  name: string
  value: number
}

type ChartProps = {
  data: ChartData[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload
    const { percent } = payload[0]
    const percentage = !isNaN(percent) ? `(${(percent * 100).toFixed(0)}%)` : ''
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2">
        <p className="font-semibold text-gray-900 text-xs">{name}</p>
        <p className="text-xs text-gray-700">
          {value} {percentage}
        </p>
      </div>
    )
  }
  return null
}

export default function DistribucionVacunasChart({ data }: ChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0)

  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 h-full">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Distribución por Tipo
        </h3>
        <div className="text-center py-12 text-gray-500 flex items-center justify-center h-full">
          <div>
            <p className="text-sm font-medium">No hay datos</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Distribución por Tipo
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={(props: any) => {
                const percent = props.percent as number | undefined
                return percent && percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
