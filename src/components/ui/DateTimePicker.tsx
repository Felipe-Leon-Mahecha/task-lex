import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import CalendarPicker from './CalendarPicker'
import TimePicker from './TimePicker'

interface Props {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
}

export default function DateTimePicker({ value, onChange, placeholder = 'Seleccionar fecha y hora' }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timeStr, setTimeStr] = useState(value ? format(value, 'HH:mm') : '')

  const handleTimeChange = (newTimeStr: string) => {
    setTimeStr(newTimeStr)

    if (value && newTimeStr) {
      try {
        const [hours, minutes] = newTimeStr.split(':').map(Number)
        const newDate = new Date(value)
        newDate.setHours(hours, minutes)
        onChange(newDate)
      } catch {}
    }
  }

  const handleDateSelect = (date: Date | null) => {
    if (date && timeStr) {
      try {
        const [hours, minutes] = timeStr.split(':').map(Number)
        date.setHours(hours, minutes)
        onChange(date)
      } catch {}
    } else if (date) {
      onChange(date)
    }
    setShowCalendar(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left text-sm outline-none transition-colors focus:border-[var(--accent)] ${
          !value ? 'text-[var(--text-muted)]' : ''
        }`}
      >
        {value ? format(value, "d MMM yyyy, HH:mm", { locale: es }) : placeholder}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-lg animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                <Calendar className="h-3.5 w-3.5" />
                Fecha
              </label>
              {showCalendar ? (
                <CalendarPicker value={value} onChange={handleDateSelect} onClose={() => setShowCalendar(false)} />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCalendar(true)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm text-[var(--text)] hover:border-[var(--accent)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {value ? format(value, "d MMM yyyy", { locale: es }) : 'Seleccionar fecha'}
                </button>
              )}
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                <Clock className="h-3.5 w-3.5" />
                Hora
              </label>
              {showTimePicker ? (
                <TimePicker value={timeStr} onChange={handleTimeChange} onClose={() => setShowTimePicker(false)} />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTimePicker(true)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm text-[var(--text)] hover:border-[var(--accent)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {timeStr || 'Seleccionar hora'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setIsOpen(false)
            setShowCalendar(false)
            setShowTimePicker(false)
          }}
        />
      )}
    </div>
  )
}
