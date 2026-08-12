import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  value: Date | null
  onChange: (date: Date | null) => void
  onClose: () => void
}

// Fuente legible forzada solo para el calendario: la tipografía decorativa del
// tema (cursiva) no es apta para una grilla numérica densa, los trazos se
// montan entre celdas vecinas a tamaños chicos.
const legibleFont = { fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif' }

export default function CalendarPicker({ value, onChange, onClose }: Props) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay())
  const calendarEnd = new Date(monthEnd)
  calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay()))

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const handleSelectDate = (date: Date) => {
    onChange(date)
    onClose()
  }

  const handleClear = () => {
    onChange(null)
    onClose()
  }

  return (
    <div className="w-full min-w-[280px] rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {/* El nombre del mes SÍ puede quedarse con la tipografía del tema, es texto grande y suelto */}
        <span className="text-sm font-semibold capitalize text-[var(--text)]">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center" style={legibleFont}>
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
          <span key={`${day}-${i}`} className="text-[11px] font-medium tracking-wide text-[var(--text-muted)]">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((date) => {
          const isSelected = value ? isSameDay(date, value) : false
          const isCurrentMonth = isSameMonth(date, currentMonth)

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleSelectDate(date)}
              disabled={!isCurrentMonth}
              style={legibleFont}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm leading-none transition-colors ${
                isSelected
                  ? 'bg-[var(--accent)] font-semibold text-[#121212]'
                  : isCurrentMonth
                    ? 'text-[var(--text)] hover:bg-[var(--surface)]'
                    : 'text-[var(--text-muted)]'
              } ${!isCurrentMonth ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              {format(date, 'd')}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        >
          Borrar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#121212] hover:opacity-90"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
