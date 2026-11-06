import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CATALOG } from './lib/seasons/catalog'
import { ThemeBadge } from './components/seasons/SeasonBadge'
import './styles/global.css'

function BadgeGallery() {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '')
  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('es')
    if (!value) return CATALOG
    return CATALOG.filter((entry) => `${entry.name} ${entry.group} ${entry.type}`.toLocaleLowerCase('es').includes(value))
  }, [query])

  return (
    <main className="min-h-screen bg-[#111116] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Galería de insignias</h1>
            <p className="mt-1 text-sm text-white/60">Vista previa de las medallas y el arte actual de Temporadas.</p>
          </div>
          <label className="w-full sm:w-80">
            <span className="sr-only">Buscar tema o saga</span>
            <input
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-amber-300"
              placeholder="Buscar tema o saga…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </header>
        <p className="mb-5 text-xs text-white/50">{filtered.length} de {CATALOG.length} temas</p>
        <section className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {filtered.map((entry) => (
            <article key={entry.key} title={`${entry.name} · ${entry.group}`} className="flex min-w-0 flex-col items-center">
              <ThemeBadge entry={entry} count={1} size={112} showName />
              <span className="mt-1 max-w-full truncate text-[10px] text-white/45">{entry.group}</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<BadgeGallery />)
