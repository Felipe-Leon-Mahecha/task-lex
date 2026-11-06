import { useId } from 'react'
import { Heart, TreePine } from 'lucide-react'
import type { SpecialKey, ThemeEntry } from '../../lib/seasons/catalog'
import { hexToRgba2, isMultiColored, shade } from '../../lib/seasons/catalog'
import { artOf } from '../../lib/seasons/badgeArt'
import { PRISMA_GRADIENT, tierOf } from '../../lib/seasons/tiers'
import { seasonAccentOf } from '../../lib/seasons/visual'

function numeralStyle(tierHex: string, isMax: boolean) {
  return {
    background: tierHex,
    color: isMax ? '#ffffff' : '#1a1206',
    fontSize: 'inherit',
    lineHeight: 1,
  }
}

function badgeTexture(entry: ThemeEntry): string | undefined {
  if (entry.frank === 'bendy') return [
    'radial-gradient(ellipse at 8% 15%, rgba(17,14,13,.94) 0 10%, transparent 11%)',
    'radial-gradient(ellipse at 15% 20%, rgba(17,14,13,.9) 0 5%, transparent 6%)',
    'radial-gradient(ellipse at 12% 29%, rgba(17,14,13,.78) 0 3.5%, transparent 4.5%)',
    'radial-gradient(ellipse at 18% 11%, rgba(17,14,13,.72) 0 3%, transparent 4%)',
    'radial-gradient(ellipse at 92% 15%, rgba(17,14,13,.91) 0 9%, transparent 10%)',
    'radial-gradient(ellipse at 84% 21%, rgba(17,14,13,.88) 0 5.5%, transparent 6.5%)',
    'radial-gradient(ellipse at 89% 27%, rgba(17,14,13,.76) 0 3.5%, transparent 4.5%)',
    'radial-gradient(ellipse at 86% 10%, rgba(17,14,13,.74) 0 3%, transparent 4%)',
    'radial-gradient(ellipse at 89% 83%, rgba(17,14,13,.95) 0 11%, transparent 12%)',
    'radial-gradient(ellipse at 80% 75%, rgba(17,14,13,.9) 0 5%, transparent 6%)',
    'radial-gradient(ellipse at 83% 91%, rgba(17,14,13,.76) 0 3.5%, transparent 4.5%)',
    'radial-gradient(ellipse at 95% 77%, rgba(17,14,13,.7) 0 3%, transparent 4%)',
    'radial-gradient(ellipse at 13% 88%, rgba(17,14,13,.91) 0 8%, transparent 9%)',
    'radial-gradient(ellipse at 21% 81%, rgba(17,14,13,.84) 0 4.5%, transparent 5.5%)',
    'radial-gradient(ellipse at 7% 80%, rgba(17,14,13,.72) 0 3%, transparent 4%)',
    'radial-gradient(circle at 80% 14%, rgba(255,219,72,.9) 0 2.5%, transparent 3.5%)',
    'radial-gradient(circle at 18% 75%, rgba(255,219,72,.72) 0 2%, transparent 3%)',
  ].join(', ')
  if (entry.frank === 'creepypastas') return [
    'radial-gradient(ellipse at 12% 18%, rgba(128,12,27,.88) 0 8%, transparent 9%)',
    'radial-gradient(ellipse at 18% 27%, rgba(110,8,22,.84) 0 4%, transparent 5%)',
    'radial-gradient(ellipse at 88% 15%, rgba(145,15,31,.82) 0 7%, transparent 8%)',
    'radial-gradient(ellipse at 82% 23%, rgba(95,7,19,.82) 0 4%, transparent 5%)',
    'radial-gradient(ellipse at 89% 82%, rgba(133,10,25,.9) 0 9%, transparent 10%)',
    'radial-gradient(ellipse at 80% 75%, rgba(102,8,22,.82) 0 4%, transparent 5%)',
    'radial-gradient(ellipse at 13% 86%, rgba(123,9,24,.86) 0 7%, transparent 8%)',
    'radial-gradient(ellipse at 21% 79%, rgba(97,6,18,.78) 0 3%, transparent 4%)',
    'radial-gradient(circle at 16% 16%, rgba(210,34,48,.9) 0 1.6%, transparent 2.6%)',
    'radial-gradient(circle at 84% 12%, rgba(210,34,48,.88) 0 1.8%, transparent 2.8%)',
    'radial-gradient(circle at 91% 74%, rgba(210,34,48,.86) 0 1.7%, transparent 2.7%)',
    'radial-gradient(circle at 12% 81%, rgba(210,34,48,.84) 0 1.5%, transparent 2.5%)',
  ].join(', ')
  if (entry.frank === 'fnaf') return 'radial-gradient(ellipse at 15% 22%, rgba(161,31,40,.45), transparent 32%), radial-gradient(ellipse at 85% 80%, rgba(14,12,14,.7), transparent 38%), radial-gradient(circle at 79% 18%, rgba(218,58,60,.55) 0 3%, transparent 4%)'
  if (entry.frank === 'hazbin helluva' || entry.key === 'helluva-boss') return 'radial-gradient(circle at 15% 18%, rgba(255,210,72,.56) 0 3%, transparent 4%), radial-gradient(ellipse at 85% 78%, rgba(147,24,39,.5), transparent 40%)'
  if (entry.frank === 'nfs' || entry.frank === 'gta') return 'radial-gradient(ellipse at 16% 76%, rgba(255,255,255,.23), transparent 30%), radial-gradient(circle at 82% 22%, rgba(244,196,68,.38) 0 4%, transparent 5%)'
  if (entry.frank === 'elementos') return entry.key === 'fuego' ? 'radial-gradient(ellipse at 50% 100%, rgba(255,91,34,.62), transparent 66%)' : entry.key === 'agua' ? 'radial-gradient(ellipse at 50% 100%, rgba(55,185,237,.58), transparent 68%)' : 'radial-gradient(circle at 22% 20%, rgba(255,255,255,.36) 0 4%, transparent 5%), radial-gradient(circle at 80% 78%, rgba(255,255,255,.24) 0 5%, transparent 6%)'
  if (entry.frank === 'star wars') return 'radial-gradient(circle at 20% 22%, rgba(255,255,225,.8) 0 2%, transparent 3%), radial-gradient(circle at 82% 30%, rgba(117,195,240,.72) 0 2%, transparent 3%), radial-gradient(circle at 70% 78%, rgba(255,255,225,.65) 0 2%, transparent 3%)'
  return 'radial-gradient(circle at 16% 18%, rgba(255,255,255,.2) 0 2%, transparent 3%), radial-gradient(circle at 84% 80%, rgba(255,255,255,.14) 0 3%, transparent 4%)'
}

export function ThemeBadge({
  entry,
  count,
  size = 96,
  showName,
  year,
}: {
  entry: ThemeEntry
  count: number
  size?: number
  showName?: boolean
  year?: number
}) {
  const art = artOf(entry, count)
  const tier = tierOf(count)
  const multi = isMultiColored(entry)
  const base = seasonAccentOf(entry)
  const ring = entry.frank === 'creepypastas' ? base : tier?.hex ?? base
  const numeral = tier?.numeral ?? 'I'
  const numeralFontSize = Math.max(8, size * 0.075)
  const texture = badgeTexture(entry)
  const baseBackground = multi
    ? `linear-gradient(${hexToRgba2('#0f0f12', 0.35)}, ${hexToRgba2('#0f0f12', 0.55)}), ${PRISMA_GRADIENT}`
    : entry.frank === 'creepypastas'
      ? 'radial-gradient(circle at 50% 34%, #4c131b, #111114 76%)'
      : `radial-gradient(circle at 50% 32%, ${hexToRgba2(base, 0.72)}, ${shade(base, 0.55)})`
  const backgroundLayers = texture ? `${texture}, ${baseBackground}` : baseBackground

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: size }}>
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundImage: backgroundLayers,
          border: `${Math.max(3, size / 26)}px solid ${ring}`,
          boxShadow: tier?.isMax
            ? `0 0 ${Math.max(12, size / 6)}px ${hexToRgba2('#ffffff', 0.45)}, inset 0 0 ${size / 5}px ${hexToRgba2('#ffffff', 0.3)}`
            : `0 ${Math.max(4, size / 22)}px ${Math.max(12, size / 6)}px ${hexToRgba2(ring, 0.35)}`,
        }}
      >
        {art.kind === 'svg' ? (
          <art.Svg />
        ) : (
          <art.Icon
            className="h-[42%] w-[42%]"
            strokeWidth={1.6}
            style={{ color: multi ? '#ffffff' : 'rgba(255,255,255,0.92)' }}
          />
        )}
        {year !== undefined && <YearArc year={year} size={size} color={ring} />}
        <span
          className="absolute z-20 rounded-full font-black tracking-wide shadow-sm"
          style={{
            background: tier?.isMax ? PRISMA_GRADIENT : 'rgba(18,18,18,.88)',
            color: tier?.isMax ? '#fff' : ring,
            border: `1px solid ${hexToRgba2(ring, 0.72)}`,
            minWidth: 0,
            textAlign: 'center',
            fontSize: numeralFontSize,
            lineHeight: 1,
            padding: '2px 4px',
            right: size * 0.055,
            bottom: size * 0.07,
          }}
        >
          {numeral}
        </span>
      </div>
      {showName && (
        <span className="max-w-full truncate text-center text-xs font-semibold text-[var(--text)]">{entry.name}</span>
      )}
    </div>
  )
}

const SPECIAL_CONFIG: Record<SpecialKey, { ring: string; banner: string; label: string }> = {
  halloween: { ring: '#f97316', banner: '#ea580c', label: 'Halloween' },
  navidad: { ring: '#dc2626', banner: '#16a34a', label: 'Navidad' },
  sanvalentin: { ring: '#ec4899', banner: '#ec4899', label: 'San Valentín' },
  amoramistad: { ring: '#f43f5e', banner: '#e11d48', label: 'Amor y Amistad' },
  pascua: { ring: '#a78bfa', banner: '#8b5cf6', label: 'Pascua' },
  cumple: { ring: '#facc15', banner: '#eab308', label: 'Mi cumpleaños' },
  independencia: { ring: '#fbbf24', banner: '#1d4ed8', label: 'Independencia' },
  acciongracias: { ring: '#fb923c', banner: '#c2410c', label: 'Acción de Gracias' },
}

export function SpecialSeal({
  kind,
  count,
  size = 96,
  showName,
  year,
}: {
  kind: SpecialKey
  count: number
  size?: number
  showName?: boolean
  year?: number
}) {
  const tier = tierOf(count)
  const cfg = SPECIAL_CONFIG[kind]
  const ring = tier?.hex ?? cfg.ring
  const numeral = tier?.numeral ?? 'I'
  const bar = size * 0.2
  const fs = size * 0.12

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: size }}>
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 50% 32%, ${hexToRgba2(cfg.ring, 0.55)}, ${shade(cfg.ring, 0.6)})`,
          border: `${Math.max(3, size / 26)}px solid ${ring}`,
          boxShadow: tier?.isMax
            ? `0 0 ${Math.max(12, size / 6)}px ${hexToRgba2('#ffffff', 0.45)}, inset 0 0 ${size / 5}px ${hexToRgba2('#ffffff', 0.3)}`
            : `0 ${Math.max(4, size / 22)}px ${Math.max(12, size / 6)}px ${hexToRgba2(ring, 0.35)}`,
        }}
      >
        {kind === 'halloween' ? (
          <svg viewBox="0 0 48 48" className="h-[46%] w-[46%] drop-shadow">
            <rect x="22" y="3" width="4" height="9" rx="1.5" fill="#4d7c0f" />
            <ellipse cx="14" cy="26" rx="11" ry="16" fill="#f97316" />
            <ellipse cx="24" cy="26" rx="12" ry="17" fill="#fb923c" stroke="#ea580c" strokeWidth="1.5" />
            <ellipse cx="34" cy="26" rx="11" ry="16" fill="#f97316" />
            <ellipse cx="24" cy="26" rx="7" ry="9" fill="none" stroke="#c2410c" strokeWidth="2" />
            <path
              d="M17 21 l4 4 M31 21 l-4 4 M24 29 v5 M21 34 l2 -3 M27 34 l-2 -3"
              stroke="#7c2d12"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        ) : kind === 'navidad' ? (
          <TreePine className="h-[44%] w-[44%]" style={{ color: '#eaffef' }} strokeWidth={1.8} fill="#16a34a" />
        ) : kind === 'sanvalentin' || kind === 'amoramistad' ? (
          <Heart
            className="h-[42%] w-[42%]"
            style={{ color: '#fff' }}
            strokeWidth={1.6}
            fill={kind === 'amoramistad' ? '#fb7185' : '#fce7f3'}
          />
        ) : kind === 'pascua' ? (
          <svg viewBox="0 0 48 48" className="h-[46%] w-[46%] drop-shadow">
            <ellipse cx="24" cy="26" rx="13" ry="16" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="2" />
            <path d="M13 22 q5.5 -5 11 0 q5.5 5 11 0" stroke="#6d28d9" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M13.5 30 q5.2 5 10.5 0 q5.2 -5 10.5 0" stroke="#ec4899" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <circle cx="24" cy="14" r="2.4" fill="#f472b6" />
          </svg>
        ) : kind === 'cumple' ? (
          <svg viewBox="0 0 48 48" className="h-[46%] w-[46%] drop-shadow">
            <rect x="10" y="24" width="28" height="15" rx="3" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
            <path d="M10 29 h28" stroke="#fde68a" strokeWidth="3" />
            <rect x="15" y="15" width="3.4" height="9" rx="1.4" fill="#38bdf8" />
            <rect x="22.3" y="13" width="3.4" height="11" rx="1.4" fill="#f472b6" />
            <rect x="29.6" y="15" width="3.4" height="9" rx="1.4" fill="#4ade80" />
            <circle cx="16.7" cy="11.5" r="2" fill="#fef9c3" />
            <circle cx="24" cy="9.5" r="2" fill="#fde68a" />
            <circle cx="31.3" cy="11.5" r="2" fill="#fef9c3" />
          </svg>
        ) : kind === 'independencia' ? (
          <svg viewBox="0 0 48 48" className="h-[46%] w-[46%] drop-shadow">
            <rect x="14" y="6" width="3" height="36" rx="1.5" fill="#78350f" />
            <g stroke="#15151a" strokeWidth="1.6">
              <rect x="17" y="8" width="21" height="9" fill="#facc15" />
              <rect x="17" y="17" width="21" height="6.5" fill="#1d4ed8" />
              <rect x="17" y="23.5" width="21" height="6.5" fill="#dc2626" />
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 48 48" className="h-[46%] w-[46%] drop-shadow">
            <ellipse cx="15" cy="20" rx="7" ry="9" fill="#92400e" />
            <ellipse cx="33" cy="20" rx="7" ry="9" fill="#92400e" />
            <ellipse cx="24" cy="18" rx="6" ry="8" fill="#b45309" />
            <ellipse cx="24" cy="29" rx="9" ry="10" fill="#78350f" stroke="#451a03" strokeWidth="1.8" />
            <circle cx="20.5" cy="25" r="1.6" fill="#fff" />
            <circle cx="27.5" cy="25" r="1.6" fill="#fff" />
            <path d="M22 29 L26 29 L24 32.5 Z" fill="#fbbf24" />
            <path d="M24 32.5 q-1 4 -3.5 4.5 M24 32.5 q1 4 3.5 4.5" stroke="#dc2626" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </svg>
        )}
        {year !== undefined && year > 0 && <YearArc year={year} size={size} color={ring} />}
        <span
          className="absolute bottom-0 rounded-full px-2 font-black tracking-wide"
          style={{
            ...numeralStyle(tier?.gradient ?? cfg.banner, !!tier?.isMax),
            minWidth: bar,
            textAlign: 'center',
            paddingTop: Math.max(2, fs / 5),
            paddingBottom: Math.max(2, fs / 5),
            bottom: size * 0.05,
          }}
        >
          <span style={{ fontSize: fs }}>{numeral}</span>
        </span>
      </div>
      {showName && (
        <span className="max-w-full truncate text-center text-xs font-semibold text-[var(--text)]">{cfg.label}</span>
      )}
    </div>
  )
}

export function YearArc({ year, size, color }: { year: number; size: number; color: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const fs = Math.max(9, size * 0.11)
  return (
    <svg
      className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 overflow-visible"
      width={size}
      height={size * 0.28}
      viewBox="0 0 100 32"
      style={{ top: size * 0.035, transform: 'translateX(-50%)' }}
      aria-hidden
    >
      <defs>
        <path id={`yarc-${id}`} d="M 9 25 Q 50 1 91 25" fill="none" />
      </defs>
      <text fontSize={fs * 100 / size} fontWeight={900} letterSpacing={1.3} fill={color} fontFamily="Arial, sans-serif">
        <textPath href={`#yarc-${id}`} startOffset="50%" textAnchor="middle">
          {year}
        </textPath>
      </text>
    </svg>
  )
}

export function TierChip({ count }: { count: number }) {
  const tier = tierOf(count)
  if (!tier) return null
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={
        tier.isMax
          ? {
              background: PRISMA_GRADIENT,
              color: '#ffffff',
              boxShadow: `0 0 10px ${hexToRgba2('#ffffff', 0.4)}`,
            }
          : { background: `${tier.hex}26`, color: tier.hex }
      }
    >
      {tier.name}
      {tier.isMax ? '' : ` · ${tier.numeral}`}
    </span>
  )
}
