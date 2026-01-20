"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

export type TrendDatum = { date: string; revenue?: number; orders?: number; count?: number }

interface TrendChartProps {
  data: TrendDatum[]
  yKey: keyof TrendDatum
  label: string
}

export function TrendChart({ data, yKey, label }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
        <YAxis tick={{ fontSize: 12 }} width={60} />
        <Tooltip labelFormatter={(value) => new Date(value as string).toLocaleDateString()} />
        <Area type="monotone" dataKey={yKey as string} stroke="#2563eb" fill="url(#trend)" name={label} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data: { name: string; value: number }[]
  color?: string
}

export function SimpleBarChart({ data, color = "#16a34a" }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={50} />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const PIE_COLORS = ["#2563eb", "#16a34a", "#f97316", "#a855f7", "#ec4899"]

export function SimplePieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
          {data.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
