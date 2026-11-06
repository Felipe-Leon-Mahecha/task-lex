import { Medal, RotateCcw, Sparkles, Star } from 'lucide-react'
import type { ThemeEntry } from '../../lib/seasons/catalog'
import { hexToRgba2, MESES, shade } from '../../lib/seasons/catalog'
import { seasonAccentOf } from '../../lib/seasons/visual'
import { ThemeBadge } from './SeasonBadge'
import Modal from '../ui/Modal'

function seasonMessage(entry: ThemeEntry, month: number): string {
  const frank = entry.frank
  if (frank === 'nfs' || frank === 'gta' || /need for speed|underground|most wanted|street/i.test(entry.name)) {
    return 'Prepara los motores, personaliza tu estilo y conquista la ciudad: este mes se vive al límite y con clase.'
  }
  if (frank.includes('creepypasta') || /horror|terror|halloween|granny|terrifier|coraline/i.test(`${entry.name} ${entry.group}`)) {
    return 'No apartes la mirada: cada pendiente es una pista y tú decides cómo termina esta historia.'
  }
  if (/minecraft/i.test(`${entry.name} ${entry.group}`)) {
    return 'Prepara tus herramientas: este mes toca construir buenos hábitos, bloque a bloque, hasta llegar a tu gran objetivo.'
  }
  if (/sonic/i.test(`${entry.name} ${entry.group}`)) {
    return 'Acelera con todo: encadena pequeños logros, supera tus propios récords y no pierdas el impulso.'
  }
  if (/mario/i.test(`${entry.name} ${entry.group}`)) {
    return '¡Nueva aventura desbloqueada! Supera cada nivel a tu ritmo y guarda energía para el gran jefe: tus metas.'
  }
  if (/pokemon/i.test(`${entry.name} ${entry.group}`)) {
    return 'Prepara tu equipo: explora nuevas rutinas, entrena tu constancia y hazte más fuerte con cada pequeño logro.'
  }
  if (/star wars/i.test(`${entry.name} ${entry.group}`)) {
    return 'La misión ya comenzó: enfoca tu energía, confía en tu entrenamiento y que la constancia te acompañe.'
  }
  if (/música|musica|rock|reggaetón|reggaeton|pop/i.test(`${entry.name} ${entry.group}`)) {
    return 'Súbele el volumen a tus planes: marca el ritmo, cumple tus metas y cierra el mes en alto.'
  }
  if (/obras de arte|arte/i.test(`${entry.name} ${entry.group}`)) {
    return 'Este mes, tus días son el lienzo: pinta cada uno con una decisión que te acerque a lo que quieres.'
  }
  if (/naturaleza|animales|dragones/i.test(`${entry.name} ${entry.group}`)) {
    return 'Ve a tu ritmo, echa raíces con buenos hábitos y deja que tus pequeños pasos florezcan.'
  }
  if (month === 10) return `Con ${entry.name} como protagonista, supera tus pendientes antes de que se conviertan en una historia de terror.`
  if (month === 12) return `Con ${entry.name} a tu lado, cierra el año con buenos hábitos y regálate un final que te haga sentir orgullo.`
  if (/juego|game|videojuego/i.test(`${entry.name} ${entry.group} ${entry.type}`)) {
    return `Elige tu misión, sube de nivel con cada hábito y demuestra hasta dónde puedes llegar en ${entry.name}.`
  }
  return `Este mes, ${entry.name} inspira el camino: convierte tus planes en pequeñas victorias y construye una historia que te enorgullezca.`
}

export default function SeasonRevealModal({
  open,
  entry,
  month,
  year,
  count,
  rerollsLeft,
  canConfirm,
  canReroll,
  onContinue,
  onConfirm,
  onReroll,
}: {
  open: boolean
  entry: ThemeEntry | null
  month: number
  year: number
  count: number
  rerollsLeft: number
  canConfirm: boolean
  canReroll: boolean
  onContinue: () => void
  onConfirm: () => void
  onReroll: () => void
}) {
  if (!open || !entry) return null
  const accent = seasonAccentOf(entry)

  return (
    <Modal open={open} onClose={onContinue} title="¡Sorteo completado!" className="!max-w-xl !overflow-hidden !p-0">
      <div className="relative -mt-1 overflow-hidden px-5 pb-5 pt-1 text-center sm:px-8 sm:pb-7">
        <div className="pointer-events-none absolute inset-0" aria-hidden style={{ background: `radial-gradient(ellipse at 50% 5%, ${hexToRgba2(accent, 0.3)}, transparent 57%), radial-gradient(ellipse at 50% 100%, ${hexToRgba2(accent, 0.12)}, transparent 54%)` }} />
        <div className="season-reveal-sparkles pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-[1]">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black tracking-[.24em]" style={{ color: accent, borderColor: hexToRgba2(accent, 0.45), background: hexToRgba2(accent, 0.1) }}>
            <Sparkles className="h-3.5 w-3.5" /> TEMPORADA {MESES[month - 1]?.toUpperCase()} · {year}
          </span>
          <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-3xl">{entry.name}</h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[.2em] text-[var(--text-muted)]">{entry.type} · {entry.group}</p>

          <div className="season-reveal-card relative mx-auto mt-5 flex min-h-[218px] max-w-[310px] flex-col items-center justify-center overflow-hidden rounded-[1.65rem] border px-5 py-4" style={{ borderColor: hexToRgba2(accent, 0.62), background: `linear-gradient(145deg, ${hexToRgba2(accent, 0.22)}, color-mix(in srgb, var(--surface) 92%, ${accent}))`, boxShadow: `0 18px 48px ${hexToRgba2(accent, 0.2)}, inset 0 1px 0 rgba(255,255,255,.16)` }}>
            <div className="pointer-events-none absolute inset-0" aria-hidden style={{ background: `linear-gradient(120deg, transparent 15%, rgba(255,255,255,.14) 48%, transparent 70%)` }} />
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl" aria-hidden style={{ background: hexToRgba2(accent, 0.48) }} />
            <div className="relative z-[1] season-reveal-badge" key={entry.key}>
              <ThemeBadge entry={entry} count={count} size={136} year={year} />
            </div>
            <div className="relative z-[1] mt-2 flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-extrabold uppercase tracking-[.16em]" style={{ color: accent, borderColor: hexToRgba2(accent, 0.38), background: hexToRgba2(shade(accent, 0.68), 0.42) }}>
              <Medal className="h-3 w-3" /> Tema sorteado
            </div>
            <Star className="absolute right-5 top-5 h-4 w-4 animate-pulse" style={{ color: hexToRgba2('#ffffff', 0.75) }} aria-hidden />
            <Star className="absolute bottom-6 left-5 h-3 w-3 animate-pulse" style={{ color: hexToRgba2(accent, 0.9), animationDelay: '.45s' }} aria-hidden />
          </div>

          <p className="mx-auto mt-5 max-w-md text-sm font-medium leading-relaxed text-[var(--text)] sm:text-base">{seasonMessage(entry, month)}</p>

          <div className="mx-auto mt-6 flex w-full max-w-sm flex-col gap-2">
            {canConfirm && (
              <button type="button" onClick={onConfirm} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-black transition hover:brightness-110 active:scale-[.98]" style={{ background: `linear-gradient(120deg, ${accent}, ${hexToRgba2(accent, 0.72)})`, boxShadow: `0 7px 22px ${hexToRgba2(accent, 0.3)}` }}>
                <Medal className="h-4 w-4" /> Confirmar temporada
              </button>
            )}
            <div className="flex justify-center gap-2">
              <button type="button" onClick={onContinue} className="min-h-11 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                Continuar
              </button>
              {canReroll && rerollsLeft > 0 && (
                <button type="button" onClick={onReroll} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-black transition hover:brightness-110 active:scale-[.98]" style={{ background: `linear-gradient(120deg, ${accent}, ${hexToRgba2(accent, 0.72)})`, boxShadow: `0 7px 22px ${hexToRgba2(accent, 0.3)}` }}>
                  <RotateCcw className="h-4 w-4" /> Resortear · {rerollsLeft}
                </button>
              )}
            </div>
          </div>
          {canReroll && rerollsLeft > 0 && <p className="mt-2 text-[10px] text-[var(--text-muted)]">Te quedan {rerollsLeft} intento{rerollsLeft === 1 ? '' : 's'} este mes.</p>}
        </div>
      </div>
    </Modal>
  )
}
