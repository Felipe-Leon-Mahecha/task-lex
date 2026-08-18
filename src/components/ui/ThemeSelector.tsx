import { Check } from 'lucide-react'
import { useMemo, useState, useCallback } from 'react'
import { useSettingsStore } from '../../store/settings'
import { APP_THEMES, ACCENT_THEMES, applyAppTheme, applyAccentTheme } from '../../lib/themes'
import type { AppThemeCategory, AccentThemeCategory } from '../../lib/themes'

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  s /= 100
  v /= 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

function generateCustomAppColors(hue: number, sat: number, val: number) {
  const [r, g, b] = hsvToRgb(hue, sat, val)
  const hex = rgbToHex(r, g, b)
  const bg = rgbToHex(...hsvToRgb(hue, Math.min(30, sat), Math.max(8, val * 0.12)))
  const surface = rgbToHex(...hsvToRgb(hue, Math.min(35, sat), Math.max(12, val * 0.16)))
  const surface2 = rgbToHex(...hsvToRgb(hue, Math.min(40, sat), Math.max(16, val * 0.2)))
  const text = rgbToHex(...hsvToRgb(hue, Math.min(20, sat * 0.3), Math.min(95, val * 0.95)))
  const textMuted = rgbToHex(...hsvToRgb(hue, Math.min(25, sat * 0.4), Math.min(70, val * 0.7)))
  const border = rgbToHex(...hsvToRgb(hue, Math.min(40, sat), Math.max(20, val * 0.25)))
  return { bg, surface, surface2, text, textMuted, accent: hex, border }
}

export default function ThemeSelector() {
  const appThemeId = useSettingsStore((s) => s.appThemeId)
  const accentThemeId = useSettingsStore((s) => s.accentThemeId)
  const setAppThemeId = useSettingsStore((s) => s.setAppThemeId)
  const setAccentThemeId = useSettingsStore((s) => s.setAccentThemeId)

  const [activeTab, setActiveTab] = useState<'app' | 'accent'>('app')

  const savedCustom = useMemo(() => {
    try {
      const raw = localStorage.getItem('task-lex-custom-app-hsv')
      return raw ? JSON.parse(raw) as { h: number; s: number; v: number } : { h: 250, s: 70, v: 90 }
    } catch {
      return { h: 250, s: 70, v: 90 }
    }
  }, [])
  const [customHue, setCustomHue] = useState(savedCustom.h)
  const [customSat, setCustomSat] = useState(savedCustom.s)
  const [customVal, setCustomVal] = useState(savedCustom.v)

  const applyCustomApp = useCallback((h: number, s: number, v: number) => {
    const colors = generateCustomAppColors(h, s, v)
    localStorage.setItem('task-lex-custom-app-hsv', JSON.stringify({ h, s, v }))
    localStorage.setItem('task-lex-custom-app-colors', JSON.stringify(colors))
    const root = document.documentElement
    root.style.setProperty('--bg', colors.bg)
    root.style.setProperty('--surface', colors.surface)
    root.style.setProperty('--surface-2', colors.surface2)
    root.style.setProperty('--text', colors.text)
    root.style.setProperty('--text-muted', colors.textMuted)
    root.style.setProperty('--border', colors.border)
    root.style.removeProperty('--bg-gradient-size')
    root.style.removeProperty('--bg-gradient-animation')
    root.classList.remove('pastel-shine')
  }, [])

  const handleAppThemeChange = (themeId: string) => {
    setAppThemeId(themeId)
    if (themeId === 'custom-app') {
      applyCustomApp(customHue, customSat, customVal)
    } else {
      applyAppTheme(themeId)
    }
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
      custom: [],
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
                {category === 'custom' ? (
                  <div className="rounded-xl border border-[var(--border)] p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)] w-12">Tono</span>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={customHue}
                        onChange={(e) => {
                          const h = Number(e.target.value)
                          setCustomHue(h)
                          if (appThemeId === 'custom-app') applyCustomApp(h, customSat, customVal)
                        }}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))` }}
                      />
                      <span className="text-xs text-[var(--text)] w-8 text-right">{customHue}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)] w-12">Saturación</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={customSat}
                        onChange={(e) => {
                          const s = Number(e.target.value)
                          setCustomSat(s)
                          if (appThemeId === 'custom-app') applyCustomApp(customHue, s, customVal)
                        }}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-600"
                      />
                      <span className="text-xs text-[var(--text)] w-8 text-right">{customSat}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)] w-12">Brillo</span>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        value={customVal}
                        onChange={(e) => {
                          const v = Number(e.target.value)
                          setCustomVal(v)
                          if (appThemeId === 'custom-app') applyCustomApp(customHue, customSat, v)
                        }}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-600"
                      />
                      <span className="text-xs text-[var(--text)] w-8 text-right">{customVal}%</span>
                    </div>
                    <div
                      className="h-8 rounded-lg border"
                      style={{ backgroundColor: generateCustomAppColors(customHue, customSat, customVal).accent }}
                    />
                    <button
                      onClick={() => handleAppThemeChange('custom-app')}
                      className={`w-full rounded-lg border p-2 text-xs font-medium transition-colors ${
                        appThemeId === 'custom-app'
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--text-muted)]'
                      }`}
                    >
                      {appThemeId === 'custom-app' ? 'Seleccionado' : 'Usar este color'}
                    </button>
                  </div>
                ) : (
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
                )}
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
