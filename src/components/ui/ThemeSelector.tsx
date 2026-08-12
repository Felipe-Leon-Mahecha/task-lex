import { Check, Lock, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSettingsStore } from '../../store/settings'
import { useTasksStore } from '../../store/tasks'
import { useAuthStore } from '../../store/auth'
import { APP_THEMES, checkAccentThemeUnlocks, applyAppTheme, applyAccentTheme } from '../../lib/themes'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function sameDay(a: Date, b: Date) {
  const x = startOfDay(a)
  const y = startOfDay(b)
  return x.getTime() === y.getTime()
}

export default function ThemeSelector() {
  const appThemeId = useSettingsStore((s) => s.appThemeId)
  const accentThemeId = useSettingsStore((s) => s.accentThemeId)
  const autoDarkMode = useSettingsStore((s) => s.autoDarkMode)
  const setAppThemeId = useSettingsStore((s) => s.setAppThemeId)
  const setAccentThemeId = useSettingsStore((s) => s.setAccentThemeId)
  const setAutoDarkMode = useSettingsStore((s) => s.setAutoDarkMode)
  const user = useAuthStore((s) => s.user)

  const [activeTab, setActiveTab] = useState<'app' | 'accent'>('app')

  const tasks = useTasksStore((s) => s.tasks)
  const completedTasks = tasks.filter((t) => t.status === 'done').length

  // Calculate current streak (same logic as Dashboard)
  const currentStreak = useMemo(() => {
    const doneOnDay = (d: Date) => tasks.some((t) => t.status === 'done' && t.completedAt && sameDay(t.completedAt, d))
    let streak = 0
    const cursor = startOfDay(new Date())
    if (!doneOnDay(cursor)) cursor.setDate(cursor.getDate() - 1)
    while (doneOnDay(cursor)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  }, [tasks])

  const availableAccentThemes = checkAccentThemeUnlocks(completedTasks, currentStreak, user?.email || undefined)

  const handleAppThemeChange = (themeId: string) => {
    setAppThemeId(themeId)
    applyAppTheme(themeId)
  }

  const handleAccentThemeChange = (themeId: string) => {
    const theme = availableAccentThemes.find((t) => t.id === themeId)
    if (theme && (theme.isUnlocked || theme.type === 'base')) {
      setAccentThemeId(themeId)
      applyAccentTheme(themeId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Personalizar tema</h3>
        <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={autoDarkMode}
            onChange={(e) => setAutoDarkMode(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border)] bg-[var(--surface-2)] accent-[var(--accent)]"
          />
          Modo oscuro automático
        </label>
      </div>

      {/* Segmented tabs */}
      <div className="relative flex rounded-[10px] bg-[var(--surface-2)] p-[3px]">
        <div
          className="absolute top-[3px] bottom-[3px] w-[calc(50%-3px)] rounded-lg bg-[var(--surface)] transition-[left] duration-200 ease-out"
          style={{ left: activeTab === 'app' ? '3px' : 'calc(50%)' }}
        />
        <button
          onClick={() => setActiveTab('app')}
          className={`relative z-10 flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors ${
            activeTab === 'app' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
          }`}
        >
          Tema de la app
        </button>
        <button
          onClick={() => setActiveTab('accent')}
          className={`relative z-10 flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors ${
            activeTab === 'accent' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
          }`}
        >
          Color de acento
        </button>
      </div>

      {/* App Themes Tab */}
      {activeTab === 'app' && (
        <div className="grid grid-cols-3 gap-2.5">
          {APP_THEMES.map((theme) => {
            const isSelected = appThemeId === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => handleAppThemeChange(theme.id)}
                className={`relative rounded-xl border p-2 text-left transition-colors ${
                  isSelected ? 'border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                {isSelected && (
                  <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-[var(--accent)]" />
                )}
                <div
                  className="h-11 rounded-lg border p-1.5"
                  style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}
                >
                  <div className="h-1.5 w-3/5 rounded-full" style={{ backgroundColor: theme.colors.surface2 }} />
                  <div className="mt-1 h-1.5 w-2/5 rounded-full" style={{ backgroundColor: theme.colors.textMuted }} />
                </div>
                <p className="mt-1.5 text-xs font-medium">{theme.name}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Accent Themes Tab */}
      {activeTab === 'accent' && (
        <div className="grid grid-cols-3 gap-2.5">
          {availableAccentThemes.map((theme) => {
            const isSelected = accentThemeId === theme.id
            const isLocked = !theme.isUnlocked && theme.type !== 'base'
            return (
              <button
                key={theme.id}
                onClick={() => handleAccentThemeChange(theme.id)}
                disabled={isLocked}
                className={`rounded-xl border p-2 text-left transition-colors ${
                  isLocked
                    ? 'cursor-not-allowed border-[var(--border)] opacity-55'
                    : isSelected
                      ? 'border-[var(--accent)]'
                      : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div
                  className={theme.animationClass ? `h-9 rounded-lg ${theme.animationClass}` : 'h-9 rounded-lg'}
                  style={{
                    backgroundColor: theme.animationClass ? undefined : theme.colors.accent,
                    ...(theme.animationClass
                      ? ({
                          '--gradient-from': theme.gradient?.from ?? theme.colors.accent,
                          '--gradient-to': theme.gradient?.to ?? theme.colors.accentStrong,
                        } as React.CSSProperties)
                      : {}),
                  }}
                />
                <p className="mt-1.5 text-xs font-medium">{theme.name}</p>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                  {isLocked && theme.unlockRequirement ? (
                    <>
                      <Lock className="h-2.5 w-2.5" />
                      {theme.unlockRequirement.type === 'tasks'
                        ? `${theme.unlockRequirement.value} tareas`
                        : `${theme.unlockRequirement.value} días racha`}
                    </>
                  ) : theme.type === 'base' ? (
                    'Base'
                  ) : theme.type === 'pastel' ? (
                    'Pastel'
                  ) : (
                    <>
                      <Sparkles className="h-2.5 w-2.5" />
                      Exclusivo
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
