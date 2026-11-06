import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useSeasonsStore } from '../../store/seasons'
import { hexToRgba2, isMultiColored, MESES, specialLabel, specialsOf, themeById } from '../../lib/seasons/catalog'
import { PRISMA_GRADIENT } from '../../lib/seasons/tiers'
import { ThemeBadge, TierChip } from './SeasonBadge'
import SeasonCardDecor from './SeasonCardDecor'
import { useSeasonBackground } from '../../lib/seasons/background'
import { seasonAccentOf } from '../../lib/seasons/visual'

export default function SeasonSummaryBox() {
  const current = useSeasonsStore((s) => s.current)
  const count = useSeasonsStore((s) => (current ? s.insignias[current.themeId]?.count ?? 0 : 0))
  const entry = current ? themeById(current.themeId) : undefined
  const seasonBackground = useSeasonBackground()

  if (!entry || !current) {
    return (
      <Link to="/temporadas" className="card mb-6 flex min-h-36 items-center justify-between gap-4 p-6 transition-colors hover:bg-[var(--surface-2)] sm:p-7">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--surface-2)]">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="eyebrow">Temporada</p>
            <p className="text-sm font-semibold text-[var(--text)]">Aún no hay temporada sorteada.</p>
          </div>
        </div>
      </Link>
    )
  }

  const monthLabel = MESES[current.month - 1]
  const monthSpecials = specialsOf(current.month)
  const base = seasonAccentOf(entry)
  const multi = isMultiColored(entry)

  return (
    <Link
      to="/temporadas"
      className="relative mb-6 block min-h-36 overflow-hidden rounded-2xl p-6 transition-transform hover:scale-[1.01] active:scale-[0.99] sm:p-7"
      style={{
        border: `1px solid ${hexToRgba2(base, 0.45)}`,
        backgroundImage: seasonBackground
          ? `linear-gradient(120deg, ${hexToRgba2(base, 0.34)}, rgba(12, 12, 16, 0.7)), url("${seasonBackground}")`
          : multi
            ? `linear-gradient(${hexToRgba2('#0f0f12', 0.55)}, ${hexToRgba2('#0f0f12', 0.7)}), ${PRISMA_GRADIENT}`
            : `linear-gradient(120deg, ${hexToRgba2(base, 0.2)}, ${hexToRgba2(base, 0.06)})`,
        backgroundSize: seasonBackground ? 'cover' : undefined,
        backgroundPosition: seasonBackground ? 'center' : undefined,
        backgroundColor: multi ? '#0f0f12' : 'var(--surface)',
        boxShadow: `0 10px 30px ${hexToRgba2(base, 0.2)}`,
      }}
    >
      <SeasonCardDecor entry={entry} />
      <div className="relative z-10 flex min-h-24 items-center gap-5">
        <ThemeBadge entry={entry} count={count} size={76} year={current.year} />
        <div className="min-w-0 flex-1 pr-8">
          <p className="eyebrow">
            TEMPORADA · {monthLabel} {current.year}
          </p>
          <h3 className="truncate text-lg font-bold tracking-tight text-[var(--text)]">{entry.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {monthSpecials.map((sp) => (
              <span
                key={sp}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: `${hexToRgba2(base, 0.2)}`, color: 'var(--text)' }}
              >
                {specialLabel(sp)}
              </span>
            ))}
            {current.character && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: `${hexToRgba2(base, 0.2)}`, color: 'var(--text)' }}
              >
                Personaje: {current.character}
              </span>
            )}
            <TierChip count={count} />
          </div>
        </div>
      </div>
    </Link>
  )
}
