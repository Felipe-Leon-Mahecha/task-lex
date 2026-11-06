import { useRef, useState, type ChangeEvent } from 'react'
import { Check, ImagePlus, Palette, RotateCcw, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { defaultTheme, useThemeStore } from '../../store/theme'
import { compressImage, hexToRgba } from '../../lib/image'
import type { SectionId, ThemeConfig } from '../../types/task'
import { useSectionsStore } from '../../store/sections'

const fields: { key: keyof ThemeConfig; label: string }[] = [
  { key: 'background', label: 'Base' },
  { key: 'surface', label: 'Superficie' },
  { key: 'accent', label: 'Acento' },
  { key: 'text', label: 'Texto' },
  { key: 'textMuted', label: 'Texto suave' },
  { key: 'border', label: 'Bordes' },
]

export default function ThemeEditor({
  sectionId,
  open,
  onClose,
}: {
  sectionId: SectionId
  open: boolean
  onClose: () => void
}) {
  const theme = useThemeStore((s) => s.themes[sectionId])
  const setTheme = useThemeStore((s) => s.setTheme)
  const sectionName = useSectionsStore((s) => s.sections.find((section) => section.id === sectionId)?.label ?? '')
  const renameSection = useSectionsStore((s) => s.renameSection)
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Elige un archivo de imagen para usarlo como fondo.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const data = await compressImage(file)
      setTheme(sectionId, { backgroundImage: data })
    } catch {
      setError('No se pudo procesar la imagen. Prueba con otra.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Diseño del apartado" className="w-[min(100%,42rem)] max-w-2xl p-3 sm:p-6">
      <div className="min-w-0 space-y-5 overflow-hidden">
        <section className="space-y-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-3.5">
          <div><h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Nombre del apartado</h3><p className="mt-1 text-[11px] text-[var(--text-muted)]">Cambia el título que aparece en la parte superior.</p></div>
          <input value={sectionName} onChange={(event) => renameSection(sectionId, event.target.value)} aria-label="Nombre del apartado" placeholder="Ej. Mi espacio creativo" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]" />
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/[0.06] p-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]"><Palette className="h-5 w-5" /></span>
          <div><p className="text-sm font-bold text-[var(--text)]">Dale identidad a este espacio</p><p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">Los cambios se guardan automáticamente y solo afectan este apartado.</p></div>
        </div>

        <section aria-label="Vista previa del tema" className="relative isolate aspect-[16/7] min-h-36 w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 sm:p-5">
          {theme.backgroundImage && <img src={theme.backgroundImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />}
          <div className="absolute inset-0 -z-10" style={{ background: `linear-gradient(${hexToRgba(theme.background, theme.backgroundImage ? 0.45 : 1)}, ${hexToRgba(theme.background, theme.backgroundImage ? 0.7 : 1)})` }} />
          <div className="flex h-full flex-col justify-between">
            <div className="flex min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border px-2.5 py-2 sm:px-3" style={{ borderColor: hexToRgba(theme.border, 0.8), background: hexToRgba(theme.surface, 0.78), backdropFilter: 'blur(12px)' }}>
              <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.18em]" style={{ color: theme.accent }}>APARTADO</p><p className="truncate text-sm font-extrabold" style={{ color: theme.text }}>{sectionName || 'Mi espacio'}</p></div>
              <span className="max-w-[42%] shrink-0 truncate rounded-full px-2 py-1 text-[8px] font-bold sm:px-2.5 sm:text-[9px]" style={{ background: theme.accent, color: theme.background }}>+ Nueva tarea</span>
            </div>
            <div className="space-y-1.5 pt-3">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: theme.textMuted }}>ASÍ SE VERÁ TU LISTA</p>
              <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: theme.text }}><span className="h-2 w-2 rounded-full" style={{ background: theme.accent }} />Preparar la semana</div>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: theme.text }}><span className="h-2 w-2 rounded-full" style={{ background: theme.textMuted }} />Revisar pendientes</div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
          <section className="space-y-2.5">
            <div className="flex items-end justify-between gap-3"><div><h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Imagen de fondo</h3><p className="mt-1 text-[11px] text-[var(--text-muted)]">La imagen cubre el fondo de toda la pantalla.</p></div>{theme.backgroundImage && <button type="button" onClick={() => setTheme(sectionId, { backgroundImage: undefined })} className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-rose-400 transition hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" />Quitar</button>}</div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/70 px-3 py-2.5 text-xs font-bold text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/[0.06] disabled:opacity-60"><ImagePlus className="h-4 w-4 text-[var(--accent)]" />{busy ? 'Preparando imagen…' : theme.backgroundImage ? 'Cambiar imagen' : 'Elegir imagen'}</button>
            {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
          </section>
        </div>

        <section className="space-y-3">
          <div><h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Paleta de color</h3><p className="mt-1 text-[11px] text-[var(--text-muted)]">Ajusta cada color y revisa el resultado arriba.</p></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {fields.map(({ key, label }) => (
              <label key={key} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 transition hover:border-[var(--accent)]/50">
                <input type="color" aria-label={label} value={theme[key] as string} onChange={(event) => setTheme(sectionId, { [key]: event.target.value } as Partial<ThemeConfig>)} className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
                <span className="min-w-0"><span className="block text-xs font-bold text-[var(--text)]">{label}</span></span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
          <div className="flex items-center justify-between gap-3"><div><h3 className="text-xs font-bold text-[var(--text)]">Esquinas</h3><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Define qué tan redondeados se ven los elementos.</p></div><span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)]">{theme.borderRadius}px</span></div>
          <input type="range" min={0} max={24} value={theme.borderRadius} onChange={(event) => setTheme(sectionId, { borderRadius: Number(event.target.value) })} aria-label="Redondez de las esquinas" className="mt-3 w-full accent-[var(--accent)]" />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)]"><span>Rectas</span><span>Suaves</span></div>
        </section>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => setTheme(sectionId, { ...defaultTheme })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"><RotateCcw className="h-3.5 w-3.5" />Restablecer apartado</button>
          <button type="button" onClick={onClose} className="btn-primary min-h-11 justify-center rounded-xl px-5"><Check className="h-4 w-4" />Listo</button>
        </div>
      </div>
    </Modal>
  )
}
