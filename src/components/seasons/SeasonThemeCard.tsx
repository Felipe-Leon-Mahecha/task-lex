import type { CSSProperties, ReactNode } from 'react'
import type { ThemeEntry } from '../../lib/seasons/catalog'
import { hexOf, hexToRgba2, isMultiColored, primaryOf } from '../../lib/seasons/catalog'
import { SpecialSeal, ThemeBadge, TierChip } from './SeasonBadge'
import type { SpecialKey } from '../../lib/seasons/catalog'

type Props = {
  entry?: ThemeEntry
  special?: SpecialKey
  count: number
  year?: number
  locked?: boolean
  active?: boolean
  badgeSize?: number
  footer?: ReactNode
  className?: string
}

export default function SeasonThemeCard({ entry, special, count, year, locked, active, badgeSize = 76, footer, className = '' }: Props) {
  const accent = entry ? hexOf(primaryOf(entry)) : '#a78bfa'
  const prisma = !!entry && isMultiColored(entry)
  const title = entry?.name ?? (special ? ({ halloween: 'Halloween', navidad: 'Navidad', sanvalentin: 'San Valentín', amoramistad: 'Amor y Amistad', pascua: 'Pascua', cumple: 'Mi cumpleaños', independencia: 'Independencia', acciongracias: 'Acción de Gracias' } as Record<SpecialKey, string>)[special] : 'Temporada')

  return (
    <div
      className={`season-collection-card group relative flex min-h-[188px] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[1.35rem] border p-3 text-center transition-all duration-300 ${active ? 'is-active' : ''} ${locked ? 'is-locked' : ''} ${className}`}
      style={{
        '--season-card-accent': accent,
        '--season-card-glow': hexToRgba2(accent, 0.25),
        borderColor: active ? accent : `${accent}72`,
        background: prisma
          ? 'linear-gradient(145deg, color-mix(in srgb, var(--surface) 91%, #9b8cff), color-mix(in srgb, var(--surface) 96%, #ff9bc8))'
          : `linear-gradient(150deg, color-mix(in srgb, ${accent} 17%, var(--surface)), var(--surface) 68%)`,
        boxShadow: active ? `0 0 0 2px ${hexToRgba2(accent, 0.28)}, 0 14px 34px ${hexToRgba2(accent, 0.2)}` : `0 8px 22px ${hexToRgba2(accent, 0.08)}`,
      } as CSSProperties}
    >
      <span className="season-card-sheen pointer-events-none absolute inset-0" aria-hidden />
      <span className="pointer-events-none absolute -right-8 -top-9 h-24 w-24 rounded-full blur-2xl" style={{ background: hexToRgba2(accent, 0.23) }} aria-hidden />
      <span className="relative z-[1] grid place-items-center transition-transform duration-300 group-hover:scale-[1.04]" style={{ filter: locked ? 'grayscale(1) opacity(.6)' : undefined }}>
        {entry ? <ThemeBadge entry={entry} count={count || 1} size={badgeSize} year={year} /> : special ? <SpecialSeal kind={special} count={count} size={badgeSize} year={year} /> : null}
      </span>
      <span className="relative z-[1] w-full min-w-0">
        <span className="block line-clamp-2 min-h-[2.1rem] text-xs font-extrabold leading-tight text-[var(--text)]">{title}</span>
        {entry && <span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-[.15em] text-[var(--text-muted)]">{entry.group}</span>}
      </span>
      <span className="relative z-[1] min-h-[18px]">
        {locked ? <span className="rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Por descubrir</span> : count > 0 ? <TierChip count={count} /> : footer}
      </span>
    </div>
  )
}
