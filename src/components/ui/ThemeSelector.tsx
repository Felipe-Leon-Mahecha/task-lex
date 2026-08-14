import { Check, Lock, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSettingsStore } from '../../store/settings'
import { useTasksStore } from '../../store/tasks'
import { useAuthStore } from '../../store/auth'
import { APP_THEMES, checkAccentThemeUnlocks, applyAppTheme, applyAccentTheme } from '../../lib/themes'
import type { AppThemeCategory, AccentThemeCategory } from '../../lib/themes'

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
  const setAppThemeId = useSettingsStore((s) => s.setAppThemeId)
  const setAccentThemeId = useSettingsStore((s) => s.setAccentThemeId)
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
    if (theme && (theme.isUnlocked || theme.category === 'base' || theme.category === 'custom')) {
      setAccentThemeId(themeId)
      applyAccentTheme(themeId)
    }
  }

  // Group app themes by category
  const appThemesByCategory = useMemo(() => {
    const categories: Record<AppThemeCategory, typeof APP_THEMES> = {
      base: [],
      pastel: [],
      premium: [],
    }
    APP_THEMES.forEach((theme) => {
      categories[theme.category].push(theme)
    })
    return categories
  }, [])

  // Group accent themes by category
  const accentThemesByCategory = useMemo(() => {
    const categories: Record<AccentThemeCategory, any[]> = {
      base: [],
      exclusive: [],
      custom: [],
    }
    availableAccentThemes.forEach((theme) => {
      categories[theme.category].push(theme)
    })
    return categories
  }, [availableAccentThemes])

  const categoryLabels: Record<AppThemeCategory | AccentThemeCategory, string> = {
    base: 'Base',
    pastel: 'Pastel',
    premium: 'Premium',
    exclusive: 'Exclusivo',
    custom: 'Personalizado',
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Personalizar tema</h3>

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
        <div className="space-y-6">
          {(Object.keys(appThemesByCategory) as AppThemeCategory[]).map((category) => {
            const themes = appThemesByCategory[category]
            if (themes.length === 0) return null
            return (
              <div key={category}>
                <p className="mb-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {categoryLabels[category]}
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {themes.map((theme) => {
                    const isSelected = appThemeId === theme.id
                    // Premium (Plata/Oro/Diamante/Prisma/Aurora) usa la clase
                    // CSS de animación para pintarse — no bgGradient/color sólido.
                    // Pastel SÍ usa su propio bgGradient (además de la clase
                    // pastel-shine, que solo le da el shimmer, no el color).
                    const isPremiumEffect = Boolean(theme.accentGradient || theme.accentConic)
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
                          className={`h-11 rounded-lg border p-1.5 ${theme.animationClass ?? ''}`}
                          style={{
                            backgroundColor: isPremiumEffect ? undefined : theme.colors.bg,
                            backgroundImage: isPremiumEffect ? undefined : theme.bgGradient,
                            backgroundSize: theme.bgGradient ? '220% 100%' : undefined,
                            borderColor: theme.colors.border,
                            ...(isPremiumEffect
                              ? ({
                                  '--app-accent-gradient': theme.accentGradient,
                                  '--app-accent-conic': theme.accentConic,
                                } as React.CSSProperties)
                              : {}),
                          }}
                        >
                          <div
                            className="h-1.5 w-3/5 rounded-full"
                            style={{ backgroundColor: isPremiumEffect ? 'rgba(255,255,255,0.55)' : theme.colors.surface2 }}
                          />
                          <div
                            className="mt-1 h-1.5 w-2/5 rounded-full"
                            style={{ backgroundColor: isPremiumEffect ? 'rgba(255,255,255,0.35)' : theme.colors.textMuted }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs font-medium">{theme.name}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Accent Themes Tab */}
      {activeTab === 'accent' && (
        <div className="space-y-6">
          {(Object.keys(accentThemesByCategory) as AccentThemeCategory[]).map((category) => {
            const themes = accentThemesByCategory[category]
            if (themes.length === 0) return null
            return (
              <div key={category}>
                <p className="mb-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {categoryLabels[category]}
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {themes.map((theme) => {
                    const isSelected = accentThemeId === theme.id
                    const isLocked = !theme.isUnlocked && theme.category !== 'base' && theme.category !== 'custom'

                    // Custom color picker
                    if (theme.category === 'custom') {
                      return (
                        <div key={theme.id} className="rounded-xl border border-[var(--border)] p-2">
                          <input
                            type="color"
                            value={theme.colors.accent}
                            onChange={(e) => {
                              const hex = e.target.value
                              setAccentThemeId('custom')
                              const root = document.documentElement
                              root.style.setProperty('--accent', hex)
                              root.style.setProperty('--accent-strong', hex)
                            }}
                            className="h-9 w-full rounded cursor-pointer"
                          />
                          <p className="mt-1.5 text-xs font-medium">{theme.name}</p>
                          <input
                            type="text"
                            value={theme.colors.accent}
                            onChange={(e) => {
                              const hex = e.target.value
                              if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                setAccentThemeId('custom')
                                const root = document.documentElement
                                root.style.setProperty('--accent', hex)
                                root.style.setProperty('--accent-strong', hex)
                              }
                            }}
                            className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--text)]"
                            placeholder="#000000"
                            maxLength={7}
                          />
                        </div>
                      )
                    }

                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleAccentThemeChange(theme.id)}
                        disabled={isLocked}
                        className={`relative rounded-xl border p-2 text-left transition-colors ${
                          isLocked
                            ? 'cursor-not-allowed border-[var(--border)] opacity-55'
                            : isSelected
                              ? 'border-[var(--accent)]'
                              : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        {isSelected && !isLocked && (
                          <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-[var(--accent)]" />
                        )}
                        <div
                          className={theme.animationClass ? `h-9 rounded-lg ${theme.animationClass}` : 'h-9 rounded-lg'}
                          style={{
                            backgroundColor: theme.animationClass ? undefined : theme.colors.accent,
                            ...(theme.animationClass
                              ? ({
                                  '--accent-gradient': theme.gradient,
                                  '--accent-conic': theme.conic,
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
                          ) : theme.category === 'base' ? (
                            'Base'
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
