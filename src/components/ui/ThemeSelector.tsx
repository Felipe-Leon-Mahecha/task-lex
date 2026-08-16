import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSettingsStore } from '../../store/settings'
import { APP_THEMES, ACCENT_THEMES, applyAppTheme, applyAccentTheme } from '../../lib/themes'
import type { AppThemeCategory, AccentThemeCategory } from '../../lib/themes'

export default function ThemeSelector() {
  const appThemeId = useSettingsStore((s) => s.appThemeId)
  const accentThemeId = useSettingsStore((s) => s.accentThemeId)
  const setAppThemeId = useSettingsStore((s) => s.setAppThemeId)
  const setAccentThemeId = useSettingsStore((s) => s.setAccentThemeId)

  const [activeTab, setActiveTab] = useState<'app' | 'accent'>('app')

  const handleAppThemeChange = (themeId: string) => {
    setAppThemeId(themeId)
    applyAppTheme(themeId)
  }

  const handleAccentThemeChange = (themeId: string) => {
    setAccentThemeId(themeId)
    applyAccentTheme(themeId)
  }

  // Group app themes by category
  const appThemesByCategory = useMemo(() => {
    const categories: Record<AppThemeCategory, typeof APP_THEMES> = {
      base: [],
      pastel: [],
    }
    APP_THEMES.forEach((theme) => {
      categories[theme.category].push(theme)
    })
    return categories
  }, [])

  // Group accent themes by category
  const accentThemesByCategory = useMemo(() => {
    const categories: Record<AccentThemeCategory, typeof ACCENT_THEMES> = {
      base: [],
      custom: [],
    }
    ACCENT_THEMES.forEach((theme) => {
      categories[theme.category].push(theme)
    })
    return categories
  }, [])

  const categoryLabels: Record<AppThemeCategory | AccentThemeCategory, string> = {
    base: 'Base',
    pastel: 'Pastel',
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
                            backgroundColor: theme.colors.bg,
                            backgroundImage: theme.bgGradient,
                            backgroundSize: theme.bgGradient ? '220% 100%' : undefined,
                            borderColor: theme.colors.border,
                          }}
                        >
                          <div
                            className="h-1.5 w-3/5 rounded-full"
                            style={{ backgroundColor: theme.colors.surface2 }}
                          />
                          <div
                            className="mt-1 h-1.5 w-2/5 rounded-full"
                            style={{ backgroundColor: theme.colors.textMuted }}
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
                        className={`rounded-xl border p-2 text-left transition-colors ${
                          isSelected
                            ? 'border-[var(--accent)]'
                            : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        {isSelected && (
                          <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-[var(--accent)]" />
                        )}
                        <div
                          className="h-9 rounded-lg"
                          style={{
                            backgroundColor: theme.colors.accent,
                          }}
                        />
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
    </div>
  )
}
