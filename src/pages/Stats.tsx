import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useTasksStore } from '../store/tasks'
import { useSectionsStore } from '../store/sections'

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444']

export default function Stats() {
  const tasks = useTasksStore((s) => s.tasks)
  const sections = useSectionsStore((s) => s.sections)

 const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }))
    tasks.forEach((t) => {
      if (t.completedAt) {
        const hour = new Date(t.completedAt).getHours()
        hours[hour].count++
      }
    })
    return hours
  }, [tasks])

  const sectionData = useMemo(() => {
    const sectionCounts = new Map<string, number>()
    sections.forEach((s) => sectionCounts.set(s.id, 0))
    tasks.forEach((t) => {
      const count = sectionCounts.get(t.sectionId) || 0
      sectionCounts.set(t.sectionId, count + 1)
    })
    return Array.from(sectionCounts.entries()).map(([id, count]) => ({
      name: sections.find((s) => s.id === id)?.label || id,
      value: count,
    }))
  }, [tasks, sections])

  const streakData = useMemo(() => {
    const data = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })
      
      const completed = tasks.filter((t) => {
        if (!t.completedAt) return false
        const completedDate = new Date(t.completedAt)
        return completedDate.toDateString() === date.toDateString()
      }).length
      
      data.push({ date: dateStr, tasks: completed })
    }
    return data
  }, [tasks])

  const totalCompleted = tasks.filter((t) => t.status === 'done').length
  const totalPending = tasks.filter((t) => t.status === 'pending').length
  const avgPerDay = (totalCompleted / 30).toFixed(1)

  return (
    <div className="max-w-4xl">
      <p className="eyebrow">Estadísticas</p>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Tu productividad</h1>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-[var(--text-muted)]">Completadas</p>
          <p className="text-2xl font-bold">{totalCompleted}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[var(--text-muted)]">Pendientes</p>
          <p className="text-2xl font-bold">{totalPending}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[var(--text-muted)]">Promedio/día (30d)</p>
          <p className="text-2xl font-bold">{avgPerDay}</p>
        </div>
      </div>

      <div className="mb-6 card p-5">
        <h3 className="mb-4 text-sm font-semibold">Productividad por hora</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)'
              }} 
            />
            <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 card p-5">
        <h3 className="mb-4 text-sm font-semibold">Distribución por apartado</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={sectionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {sectionData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-3">
          {sectionData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-[var(--text-muted)]">{item.name}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold">Racha (últimos 30 días)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={streakData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)'
              }} 
            />
            <Line type="monotone" dataKey="tasks" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
