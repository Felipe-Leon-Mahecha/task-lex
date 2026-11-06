import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { useTasksStore } from '../store/tasks'
import { useSectionsStore } from '../store/sections'

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444']

export default function Stats() {
  const tasks = useTasksStore((s) => s.tasks)
  const sections = useSectionsStore((s) => s.sections)
  const [period, setPeriod] = useState<'week' | 'month'>('week')

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

  const activityData = useMemo(() => {
    const data: { date: string; tasks: number }[] = []
    const today = new Date()
    const days = period === 'week' ? 7 : 30
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = period === 'week'
        ? date.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '')
        : date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })
      const completed = tasks.filter((t) => {
        if (!t.completedAt) return false
        const completedDate = new Date(t.completedAt)
        return completedDate.toDateString() === date.toDateString()
      }).length
      data.push({ date: dateStr, tasks: completed })
    }
    return data
  }, [tasks, period])

  const totalCompleted = tasks.filter((t) => t.status === 'done').length
  const totalPending = tasks.filter((t) => t.status !== 'done' && !t.archived).length
  const activeDays = activityData.filter((day) => day.tasks > 0).length
  const periodDays = period === 'week' ? 7 : 30
  const insight = useMemo(() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const windowSize = period === 'week' ? 7 : 30
    const currentStart = new Date(todayStart)
    currentStart.setDate(currentStart.getDate() - windowSize + 1)
    const previousStart = new Date(currentStart)
    previousStart.setDate(previousStart.getDate() - windowSize)
    const current = tasks.filter((task) => task.completedAt && task.completedAt >= currentStart && task.completedAt < new Date(todayStart.getTime() + 86400000)).length
    const previous = tasks.filter((task) => task.completedAt && task.completedAt >= previousStart && task.completedAt < currentStart).length
    const busiest = activityData.reduce<{ date: string; tasks: number } | null>((best, day) => !best || day.tasks > best.tasks ? day : best, null)
    let message = 'Completa algunas tareas y volveremos con una lectura de tu progreso.'
    if (current > 0) {
      const difference = current - previous
      const comparison = previous === 0
        ? 'Este es tu primer periodo con actividad registrada.'
        : difference > 0
          ? `Son ${difference} más que en el periodo anterior.`
          : difference < 0
            ? `Van ${Math.abs(difference)} menos que en el periodo anterior.`
            : 'Mantienes el mismo ritmo que en el periodo anterior.'
      message = `Llevas ${current} tarea${current === 1 ? '' : 's'} completada${current === 1 ? '' : 's'} en estos ${windowSize} días. ${comparison}${busiest?.tasks ? ` Tu día con más actividad fue ${busiest.date}, con ${busiest.tasks}.` : ''}`
    }
    return { current, previous, message, average: Math.round((current / windowSize) * 10) / 10 }
  }, [activityData, period, tasks])

  return (
    <div className="max-w-4xl">
      <p className="eyebrow">Estadísticas</p>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Tu productividad</h1>

      {tasks.length === 0 && (
        <div className="card mb-6 flex flex-col items-center gap-3 p-10 text-center">
          <BarChart3 className="h-10 w-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            Empieza a crear y completar tareas para ver tus estadísticas aquí.
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-[var(--text-muted)]">Completadas</p>
          <p className="text-2xl font-bold">{totalCompleted}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[var(--text-muted)]">Pendientes</p>
          <p className="text-2xl font-bold">{totalPending}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[var(--text-muted)]">Días con actividad · {period === 'week' ? '7 días' : '30 días'}</p>
          <p className="text-2xl font-bold">{activeDays}<span className="ml-1 text-sm font-medium text-[var(--text-muted)]">/ {periodDays}</span></p>
        </div>
      </div>

      {tasks.length > 0 && <section className="mb-6 overflow-hidden rounded-2xl border border-[var(--accent)]/25 bg-gradient-to-br from-[var(--surface)] to-[var(--accent)]/[0.08] p-5" aria-live="polite">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/12 text-[var(--accent)]"><BarChart3 className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Lo que cuentan tus datos</p><p className="mt-1 text-sm leading-relaxed text-[var(--text)]">{insight.message}</p><p className="mt-2 text-xs text-[var(--text-muted)]">Promedio: {insight.average} tareas al día · Comparación: {insight.current} frente a {insight.previous}</p></div></div>
      </section>}

      <div className="mb-6 card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Días en que estuviste activo</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Elige el periodo que te resulte más útil.</p>
          </div>
          <div className="flex gap-2 rounded-xl bg-[var(--surface-2)] p-1">
            <button onClick={() => setPeriod('week')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${period === 'week' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-muted)]'}`}>Semana</button>
            <button onClick={() => setPeriod('month')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${period === 'month' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-muted)]'}`}>Mes</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={period === 'month' ? 4 : 0} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)'
              }} 
            />
            <Bar dataKey="tasks" name="Tareas completadas" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">Tu actividad se muestra como referencia; los días sin tareas no reducen tu progreso.</p>
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

    </div>
  )
}
