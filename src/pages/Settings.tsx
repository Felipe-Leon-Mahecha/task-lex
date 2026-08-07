import { useRef, useState, type ChangeEvent } from 'react'
import { Bell, BellOff, Download, Palette, Play, Upload, Trash2 } from 'lucide-react'
import { exportJSON, importJSON } from '../lib/backup'
import { disableAllReminders, requestPermission } from '../lib/notifications'
import { useSectionsStore } from '../store/sections'
import { useSettingsStore } from '../store/settings'
import { useTutorialStore } from '../store/tutorial'
import { ICON_MAP } from '../lib/sections'
import Modal from '../components/ui/Modal'
import IconPicker from '../components/layout/IconPicker'

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const sections = useSectionsStore((s) => s.sections)
  const renameSection = useSectionsStore((s) => s.renameSection)
  const removeSection = useSectionsStore((s) => s.removeSection)
  const setSectionIcon = useSectionsStore((s) => s.setIcon)
  const [iconEditor, setIconEditor] = useState<string | null>(null)
  const [pendingIcon, setPendingIcon] = useState('')
  const dailyGoal = useSettingsStore((s) => s.dailyGoal)
  const focusMinutes = useSettingsStore((s) => s.focusMinutes)
  const shortBreak = useSettingsStore((s) => s.shortBreak)
  const notificationsOn = useSettingsStore((s) => s.notificationsOn)
  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal)
  const setFocusMinutes = useSettingsStore((s) => s.setFocusMinutes)
  const setShortBreak = useSettingsStore((s) => s.setShortBreak)
  const setNotificationsOn = useSettingsStore((s) => s.setNotificationsOn)

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const res = await importJSON(file)
    setMessage({ ok: res.ok, text: res.message })
    e.target.value = ''
  }

  const toggleNotifications = async (on: boolean) => {
    setNotificationsOn(on)
    if (on) {
      requestPermission().catch(() => {})
    } else {
      disableAllReminders()
    }
  }

  return (
    <div>
      <p className="eyebrow">Ajustes</p>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Configuración</h1>

      <div className="card mb-4 max-w-lg p-5">
        <p className="text-sm font-semibold">Guía rápida</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Lo esencial de Flux:</p>
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--text-muted)]">
          <li>• El botón ☰ abre el menú con tus apartados.</li>
          <li>• "+ Nuevo apartado" crea secciones temáticas con su propio estilo.</li>
          <li>• Dentro de un apartado, el "+" agrega tareas; filtra por prioridad y etiquetas.</li>
          <li>• El botón del reloj abre el temporizador con sonidos de foco (lluvia, violín, lo-fi).</li>
          <li>• Marca una meta diaria y mira tu avance en el Dashboard.</li>
          <li>• El buscador encuentra cualquier tarea al instante (atajo: tecla /).</li>
          <li>• Atajo de teclado: N abre una nueva tarea en el apartado actual.</li>
        </ul>
        <button onClick={() => useTutorialStore.getState().start()} className="btn-primary mt-4">
          <Play className="h-4 w-4" /> Ver tutorial animado
        </button>
      </div>

      <div className="card mb-4 max-w-lg p-5">
        <p className="text-sm font-semibold">Preferencias</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Meta diaria de tareas</p>
              <p className="text-xs text-[var(--text-muted)]">Cuántas tareas completas por día.</p>
            </div>
            <input
              type="number"
              min={0}
              max={50}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Foco (minutos)</p>
              <p className="text-xs text-[var(--text-muted)]">Duración de cada sesión de foco.</p>
            </div>
            <input
              type="number"
              min={1}
              max={120}
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number(e.target.value))}
              className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Descanso (minutos)</p>
              <p className="text-xs text-[var(--text-muted)]">Pausa entre sesiones de foco.</p>
            </div>
            <input
              type="number"
              min={1}
              max={60}
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      <div className="card mb-4 max-w-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Notificaciones</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Avisos de vencimientos y recordatorios. En el celular llegan como notificación nativa.
            </p>
          </div>
          <button
            onClick={() => toggleNotifications(!notificationsOn)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              notificationsOn
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {notificationsOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {notificationsOn ? 'Activadas' : 'Apagadas'}
          </button>
        </div>
      </div>

      <div className="card mb-4 max-w-lg p-5">
        <p className="text-sm font-semibold">Apartados</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Los apartados aparecen en el menú lateral. Puedes renombrarlos o eliminarlos.
        </p>
        <ul className="mt-4 space-y-2">
          {sections.map((sec) => {
            const Icon = ICON_MAP[sec.icon]
            return (
              <li key={sec.id} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />}
                  <input
                    key={sec.id}
                    defaultValue={sec.label}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (v && v !== sec.label) renameSection(sec.id, v)
                    }}
                    className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm outline-none transition-colors focus:border-[var(--border)] focus:bg-[var(--surface-2)]"
                  />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => {
                      setIconEditor(sec.id)
                      setPendingIcon(sec.icon)
                    }}
                    title="Cambiar ícono"
                    className="rounded p-2 text-[var(--text-muted)] hover:text-[var(--accent)]"
                  >
                    <Palette className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminar el apartado "${sec.label}" y sus tareas?`)) {
                        removeSection(sec.id)
                      }
                    }}
                    className="shrink-0 rounded p-2 text-[var(--text-muted)] hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="card max-w-lg p-5">
        <p className="text-sm font-semibold">Backup</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Exporta o importa todas tus tareas, apartados y temas en un archivo JSON.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={exportJSON} className="btn-primary">
            <Download className="h-4 w-4" /> Exportar JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--surface-2)]"
          >
            <Upload className="mr-1 inline h-4 w-4" /> Importar JSON
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onImport}
        />
        {message && (
          <p className={`mt-3 text-xs ${message.ok ? 'text-emerald-300' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
      </div>

      <Modal
        open={iconEditor !== null}
        onClose={() => setIconEditor(null)}
        title={iconEditor ? `Ícono de "${sections.find((s) => s.id === iconEditor)?.label ?? ''}"` : 'Ícono'}
      >
        <IconPicker value={pendingIcon} onChange={setPendingIcon} />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setIconEditor(null)}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (iconEditor) setSectionIcon(iconEditor, pendingIcon)
              setIconEditor(null)
            }}
            className="btn-primary"
          >
            Guardar
          </button>
        </div>
      </Modal>
    </div>
  )
}
