import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export default function Select({ value, onChange, options, placeholder = 'Seleccionar...', className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left text-sm outline-none transition-colors focus:border-[var(--accent)] ${
          !selectedOption ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'
        }`}
      >
        <span className="flex items-center justify-between">
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDown className={`ml-2 h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1 shadow-lg animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                option.value === value
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text)] hover:bg-[var(--surface)]'
              }`}
            >
              {option.label}
              {option.value === value && <Check className="ml-2 h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
