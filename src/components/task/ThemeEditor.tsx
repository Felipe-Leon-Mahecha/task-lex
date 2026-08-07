import { useRef, useState, type ChangeEvent } from 'react'
import Modal from '../ui/Modal'
import { defaultTheme, useThemeStore } from '../../store/theme'
import { compressImage } from '../../lib/image'
import type { SectionId, ThemeConfig } from '../../types/task'

const field =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]'

const fields: { key: keyof ThemeConfig; label: string }[] = [
  { key: 'background', label: 'Fondo' },
  { key: 'surface', label: 'Superficie' },
  { key: 'accent', label: 'Acento' },
  { key: 'text', label: 'Texto' },
  { key: 'textMuted', label: 'Texto secundario' },
  { key: 'border', label: 'Borde' },
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
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const data = await compressImage(file)
      setTheme(sectionId, { backgroundImage: data })
    } catch {
      setError('No se pudo procesar la imagen.')
    }
    setBusy(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Personalizar tema">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Nombre</label>
          <input
            value={theme.name}
            onChange={(e) => setTheme(sectionId, { name: e.target.value })}
            className={field}
          />
        </div>
        <div className="rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Fondo de imagen</span>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              Subir imagen
            </button>
          </div>
          {theme.backgroundImage ? (
            <>
              <img
                src={theme.backgroundImage}
                alt="Fondo"
                className="mt-2 h-24 w-full rounded-lg border border-[var(--border)] object-cover"
              />
              <button
                onClick={() => setTheme(sectionId, { backgroundImage: undefined })}
                className="mt-2 text-xs text-red-400 hover:underline"
              >
                Quitar fondo
              </button>
            </>
          ) : (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Sin imagen. Aparecerá detrás del panel y en el menú lateral.
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
          {busy && <p className="mt-2 text-xs text-[var(--text-muted)]">Procesando imagen...</p>}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
        {fields.map((f) => (
          <div key={f.key} className="flex items-center justify-between gap-3">
            <span className="text-sm">{f.label}</span>
            <label className="flex items-center gap-2">
              <input
                type="color"
                value={theme[f.key] as string}
                onChange={(e) => setTheme(sectionId, { [f.key]: e.target.value } as Partial<ThemeConfig>)}
                className="h-8 w-10 cursor-pointer rounded border border-[var(--border)] bg-transparent p-0"
              />
              <code className="text-xs text-[var(--text-muted)]">{theme[f.key] as string}</code>
            </label>
          </div>
        ))}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Redondez</span>
            <code className="text-xs text-[var(--text-muted)]">{theme.borderRadius}px</code>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            value={theme.borderRadius}
            onChange={(e) => setTheme(sectionId, { borderRadius: Number(e.target.value) })}
            className="mt-1 w-full accent-[var(--accent)]"
          />
        </div>
        <div className="rounded-lg border border-[var(--border)] p-3" style={{ background: theme.background }}>
          <p className="text-xs font-semibold" style={{ color: theme.text }}>
            Vista previa
          </p>
          <div
            className="mt-2 p-2"
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: theme.borderRadius,
            }}
          >
            <span className="text-xs" style={{ color: theme.accent }}>
              Eyebrow
            </span>
            <p className="mt-1 text-sm" style={{ color: theme.text }}>
              Tarea de ejemplo
            </p>
          </div>
        </div>
        <div className="flex justify-between pt-1">
          <button
            onClick={() => setTheme(sectionId, { ...defaultTheme })}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Restablecer
          </button>
          <button onClick={onClose} className="btn-primary">
            Listo
          </button>
        </div>
      </div>
    </Modal>
  )
}
