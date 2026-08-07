import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ICON_MAP, SECTION_ICONS } from '../../lib/sections'

export default function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (key: string) => void
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SECTION_ICONS
    return SECTION_ICONS.filter((i) => i.label.toLowerCase().includes(q) || i.key.includes(q))
  }, [query])

  return (
    <div>
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ícono (perro, dinero...)"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-8 pr-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
        />
      </div>
      <div className="max-h-56 overflow-y-auto pr-1">
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-7">
          {filtered.map(({ key, label }) => {
            const Icon = ICON_MAP[key]
            return (
              <button
                key={key}
                type="button"
                title={label}
                onClick={() => onChange(key)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                  value === key
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[#121212]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <p className="py-4 text-center text-xs text-[var(--text-muted)]">Sin íconos para esa búsqueda.</p>
        )}
      </div>
    </div>
  )
}
