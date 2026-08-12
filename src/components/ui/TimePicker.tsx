import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Props {
  value: string // HH:mm format
  onChange: (value: string) => void
  onClose?: () => void
}

export default function TimePicker({ value, onChange, onClose }: Props) {
  const [hours, setHours] = useState(() => {
    if (value) {
      const [h] = value.split(':').map(Number)
      return h
    }
    return 0
  })
  const [minutes, setMinutes] = useState(() => {
    if (value) {
      const [, m] = value.split(':').map(Number)
      return m
    }
    return 0
  })

  const handleHoursChange = (delta: number) => {
    const newHours = (hours + delta + 24) % 24
    setHours(newHours)
    onChange(`${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
  }

  const handleMinutesChange = (delta: number) => {
    const newMinutes = (minutes + delta + 60) % 60
    setMinutes(newMinutes)
    onChange(`${String(hours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`)
  }

  const handleHoursDirect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val >= 0 && val <= 23) {
      setHours(val)
      onChange(`${String(val).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    }
  }

  const handleMinutesDirect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val >= 0 && val <= 59) {
      setMinutes(val)
      onChange(`${String(hours).padStart(2, '0')}:${String(val).padStart(2, '0')}`)
    }
  }

  return (
    <div className="w-full min-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-lg animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-center gap-4">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleHoursChange(1)}
            className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={0}
            max={23}
            value={String(hours).padStart(2, '0')}
            onChange={handleHoursDirect}
            className="w-12 bg-transparent text-center text-2xl font-semibold text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => handleHoursChange(-1)}
            className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <span className="text-2xl font-semibold text-[var(--text-muted)]">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleMinutesChange(1)}
            className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={0}
            max={59}
            value={String(minutes).padStart(2, '0')}
            onChange={handleMinutesDirect}
            className="w-12 bg-transparent text-center text-2xl font-semibold text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => handleMinutesChange(-1)}
            className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
        >
          Listo
        </button>
      )}
    </div>
  )
}
