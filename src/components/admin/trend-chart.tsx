"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid } from "recharts"

export type TrendDatum = { date: string; revenue?: number; orders?: number; count?: number }

const COLORS = {
  primary: "#4b9286", // brand teal
  success: "#abcdc1", // brand jade
  warning: "#dfa053", // brand gold
  danger: "#dd4c3a", // brand coral
  slate: "#dabf8f",   // brand beige
  umber: "#4a2b28",   // brand umber
}

const PIE_COLORS = [COLORS.primary, COLORS.warning, COLORS.success, COLORS.danger, COLORS.umber]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-brand-teal/20 bg-white/90 p-4 shadow-xl backdrop-blur-md">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {new Date(label).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm font-bold text-slate-700">
              {entry.name}: <span className="text-brand-umber">{entry.value.toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

interface TrendChartProps {
  data: TrendDatum[]
  yKey: keyof TrendDatum
  label: string
  color?: string
  height?: number
}

export function TrendChart({ data, yKey, label, color, height = 240 }: TrendChartProps) {
  const strokeColor = color ?? COLORS.primary
  const gradientId = `colorValue-${strokeColor.replace('#', '')}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={15}
          tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={yKey as string}
          stroke={strokeColor}
          strokeWidth={4}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          name={label}
          isAnimationActive={true}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export interface BarChartDatum { name: string; value: number; color?: string }

interface BarChartProps {
  data: BarChartDatum[]
  color?: string
}

export function SimpleBarChart({ data, color = COLORS.primary }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip cursor={{ fill: "#f1f5f9", radius: 8 }} content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          fill={color}
          radius={[8, 8, 0, 0]}
          isAnimationActive={true}
          animationDuration={1500}
          barSize={32}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SimplePieChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            innerRadius={75}
            paddingAngle={4}
            stroke="none"
            isAnimationActive={true}
            animationDuration={1500}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total</span>
        <span className="text-2xl font-black text-brand-umber">{total.toLocaleString()}</span>
      </div>
    </div>
  )
}
