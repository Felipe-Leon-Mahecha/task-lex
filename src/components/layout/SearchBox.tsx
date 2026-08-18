import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Filter, SearchX } from 'lucide-react'
import { useTasksStore } from '../../store/tasks'
import { useSectionsStore } from '../../store/sections'
import type { Priority } from '../../types/task'

export default function SearchBox() {
  const tasks = useTasksStore((s) => s.tasks)
  const sections = useSectionsStore((s) => s.sections)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [hasDueDate, setHasDueDate] = useState<boolean | null>(null)
  const navigate = useNavigate()
  const labelOf = (id: string) => sections.find((s) => s.id === id)?.label ?? id

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    tasks.forEach((t) => t.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [tasks])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks
      .filter((t) => {
        // Text search
        if (q) {
          const hay = [
            t.title,
            t.description,
            t.tags.join(' '),
            ...t.subtasks.map((s) => s.text),
            ...t.notesLinks.map((n) => n.content),
          ]
            .join(' ')
            .toLowerCase()
          if (!hay.includes(q)) return false
        }

        // Priority filter
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false

        // Tag filter
        if (tagFilter && !t.tags.includes(tagFilter)) return false

        // Due date filter
        if (hasDueDate !== null) {
          if (hasDueDate && !t.dueDate) return false
          if (!hasDueDate && t.dueDate) return false
        }

        return true
      })
      .slice(0, 8)
  }, [query, tasks, priorityFilter, tagFilter, hasDueDate])

  const select = (sectionId: string) => {
    setQuery('')
    setFocused(false)
    navigate(`/s/${sectionId}`)
  }

  const clearFilters = () => {
    setPriorityFilter('all')
    setTagFilter('')
    setHasDueDate(null)
  }

  const hasActiveFilters = priorityFilter !== 'all' || tagFilter || hasDueDate !== null

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
        className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-16 text-sm outline-none transition-colors focus:border-[var(--accent)]"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`text-[var(--text-muted)] hover:text-[var(--accent)] ${hasActiveFilters ? 'text-[var(--accent)]' : ''}`}
          title="Filtros"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {showFilters && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Filtros</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[10px] text-[var(--accent)] hover:underline">
                Limpiar
              </button>
            )}
          </div>

          <div>
            <label className="text-[10px] text-[var(--text-muted)]">Prioridad</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs outline-none focus:border-[var(--accent)]"
            >
              <option value="all">Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[var(--text-muted)]">Tag</label>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs outline-none focus:border-[var(--accent)]"
            >
              <option value="">Todos</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[var(--text-muted)]">Fecha</label>
            <select
              value={hasDueDate === null ? 'all' : hasDueDate ? 'with' : 'without'}
              onChange={(e) => {
                const val = e.target.value
                setHasDueDate(val === 'all' ? null : val === 'with')
              }}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs outline-none focus:border-[var(--accent)]"
            >
              <option value="all">Todas</option>
              <option value="with">Con fecha</option>
              <option value="without">Sin fecha</option>
            </select>
          </div>
        </div>
      )}

      {focused && (query.trim() || hasActiveFilters) && !showFilters && (
        <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          {results.length === 0 ? (
            <p className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-muted)]">
              <SearchX className="h-4 w-4 shrink-0" />
              Sin resultados
            </p>
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
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{t.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {t.tags.length > 0 && (
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {t.tags[0]}{t.tags.length > 1 ? ` +${t.tags.length - 1}` : ''}
                      </span>
                    )}
                    {t.dueDate && (
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
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
