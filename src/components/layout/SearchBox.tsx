import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useTasksStore } from '../../store/tasks'
import { useSectionsStore } from '../../store/sections'

export default function SearchBox() {
  const tasks = useTasksStore((s) => s.tasks)
  const sections = useSectionsStore((s) => s.sections)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const labelOf = (id: string) => sections.find((s) => s.id === id)?.label ?? id

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return tasks
      .filter((t) => {
        const hay = [
          t.title,
          t.description,
          t.tags.join(' '),
          ...t.subtasks.map((s) => s.text),
          ...t.notesLinks.map((n) => n.content),
        ]
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
      .slice(0, 8)
  }, [query, tasks])

  const select = (sectionId: string) => {
    setQuery('')
    setFocused(false)
    navigate(`/s/${sectionId}`)
  }

  return (
    <div className="relative w-full" data-tut="search">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        id="tasklex-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Buscar tarea, nota o tag..."
        className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-8 text-sm outline-none transition-colors focus:border-[var(--accent)]"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {focused && query.trim() && (
        <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--text-muted)]">Sin resultados</p>
          ) : (
            results.map((t) => (
              <button
                key={t.id}
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(t.sectionId)
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-[var(--surface-2)]"
              >
                <span className="truncate">{t.title}</span>
                <span className="shrink-0 rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                  {labelOf(t.sectionId)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
