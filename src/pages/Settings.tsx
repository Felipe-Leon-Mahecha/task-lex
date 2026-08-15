import { useRef, useState, type ChangeEvent } from 'react'
import { Bell, BellOff, Calendar, Download, Palette, Play, Upload, Trash2, Volume2, VolumeX } from 'lucide-react'
import { exportJSON, importJSON } from '../lib/backup'
import { disableAllReminders, requestPermission } from '../lib/notifications'
import { requestCalendarPermissions } from '../lib/calendar'
import { useSectionsStore } from '../store/sections'
import { useSettingsStore } from '../store/settings'
import { useTutorialStore } from '../store/tutorial'
import { ICON_MAP } from '../lib/sections'
import Modal from '../components/ui/Modal'
import IconPicker from '../components/layout/IconPicker'
import ThemeSelector from '../components/ui/ThemeSelector'

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const sections = useSectionsStore((s) => s.sections)
  const renameSection = useSectionsStore((s) => s.renameSection)
  const removeSection = useSectionsStore((s) => s.removeSection)
  const setSectionIcon = useSectionsStore((s) => s.setIcon)
  const [iconEditor, setIconEditor] = useState<string | null>(null)
  const [pendingIcon, setPendingIcon] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)
  const [themeModalOpen, setThemeModalOpen] = useState(false)
  const dailyGoal = useSettingsStore((s) => s.dailyGoal)
  const focusMinutes = useSettingsStore((s) => s.focusMinutes)
  const shortBreak = useSettingsStore((s) => s.shortBreak)
  const notificationsOn = useSettingsStore((s) => s.notificationsOn)
  const dailyReminderFrequency = useSettingsStore((s) => s.dailyReminderFrequency)
  const calendarSync = useSettingsStore((s) => s.calendarSync)
  const soundsEnabled = useSettingsStore((s) => s.soundsEnabled)
  const autoBackup = useSettingsStore((s) => s.autoBackup)
  const backupFrequency = useSettingsStore((s) => s.backupFrequency)
  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal)
  const setFocusMinutes = useSettingsStore((s) => s.setFocusMinutes)
  const setShortBreak = useSettingsStore((s) => s.setShortBreak)
  const setNotificationsOn = useSettingsStore((s) => s.setNotificationsOn)
  const setDailyReminderFrequency = useSettingsStore((s) => s.setDailyReminderFrequency)
  const setCalendarSync = useSettingsStore((s) => s.setCalendarSync)
  const setSoundsEnabled = useSettingsStore((s) => s.setSoundsEnabled)
  const setAutoBackup = useSettingsStore((s) => s.setAutoBackup)
  const setBackupFrequency = useSettingsStore((s) => s.setBackupFrequency)

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

  const toggleCalendarSync = async (on: boolean) => {
    if (on) {
      const hasPermission = await requestCalendarPermissions()
      if (hasPermission) {
        setCalendarSync(true)
      }
    } else {
      setCalendarSync(false)
    }
  }

  const handleDeleteSection = (id: string) => {
    setSectionToDelete(id)
    setDeleteOpen(true)
  }

  const confirmDeleteSection = () => {
    if (sectionToDelete) {
      removeSection(sectionToDelete)
      setSectionToDelete(null)
    }
    setDeleteOpen(false)
  }

  return (
    <div>
      <p className="eyebrow">Ajustes</p>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Configuración</h1>

      <div className="card mb-4 max-w-lg p-5">
        <p className="text-sm font-semibold">Guía rápida</p>
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
        {notificationsOn && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4">
            <div>
              <p className="text-sm">Recordatorios diarios</p>
              <p className="text-xs text-[var(--text-muted)]">Veces al día para recordar tareas activas.</p>
            </div>
            <select
              value={dailyReminderFrequency}
              onChange={(e) => setDailyReminderFrequency(Number(e.target.value))}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value={1}>1 vez</option>
              <option value={2}>2 veces</option>
              <option value={3}>3 veces</option>
              <option value={4}>4 veces</option>
              <option value={5}>5 veces</option>
            </select>
          </div>
        )}
      </div>

      <div className="card mb-4 max-w-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Sincronización con calendario</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Sincroniza tareas con fecha a Google Calendar.
            </p>
          </div>
          <button
            onClick={() => toggleCalendarSync(!calendarSync)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              calendarSync
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            <Calendar className="h-4 w-4" />
            {calendarSync ? 'Activada' : 'Apagada'}
          </button>
        </div>
      </div>

      <div className="card mb-4 max-w-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Sonidos</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Reproduce sonidos al crear, completar o eliminar tareas.
            </p>
          </div>
          <button
            onClick={() => setSoundsEnabled(!soundsEnabled)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              soundsEnabled
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {soundsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundsEnabled ? 'Activados' : 'Apagados'}
          </button>
        </div>
      </div>

      <div className="card mb-4 max-w-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold">Backup automático</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Exporta automáticamente tus datos a JSON.
            </p>
          </div>
          <button
            onClick={() => setAutoBackup(!autoBackup)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              autoBackup
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {autoBackup ? 'Activado' : 'Apagado'}
          </button>
        </div>
        {autoBackup && (
          <div className="flex items-center gap-3">
            <label className="text-xs text-[var(--text-muted)]">Frecuencia (días):</label>
            <input
              type="number"
              min="1"
              max="30"
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(parseInt(e.target.value) || 7)}
              className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}
      </div>

      <div className="card mb-4 max-w-lg p-5">
        <button
          onClick={() => setThemeModalOpen(true)}
          className="btn-primary w-full"
        >
          <Palette className="h-4 w-4" /> Personalizar tema de la app
        </button>
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
                    onClick={() => handleDeleteSection(sec.id)}
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

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar apartado"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            ¿Eliminar el apartado "{sections.find((s) => s.id === sectionToDelete)?.label ?? ''}" y sus tareas? Esta acción no se puede deshacer.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={confirmDeleteSection}
              className="btn-primary justify-center"
            >
              Eliminar
            </button>
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        title="Personalizar tema"
      >
        <ThemeSelector />
      </Modal>
    </div>
  )
}
