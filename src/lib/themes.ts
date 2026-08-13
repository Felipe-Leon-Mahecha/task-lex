export type ThemeAnimationClass =
  | 'theme-shine-gold'
  | 'theme-shine-silver'
  | 'theme-shine-diamond'
  | 'theme-shine-wave'
  | 'theme-pulse'
  | 'theme-glow'
  | 'pastel-shine'
  | 'metal-sheen'
  | 'diamond-spin'
  | 'prism-shift'
  | 'aurora-flow'
  | 'app-metal-sheen'
  | 'app-diamond-spin'
  | 'app-prism-shift'

export type AppThemeCategory = 'base' | 'pastel' | 'premium'
export type AccentThemeCategory = 'base' | 'exclusive' | 'custom'

export interface AppTheme {
  id: string
  name: string
  category: AppThemeCategory
  colors: {
    bg: string
    surface: string
    surface2: string
    text: string
    textMuted: string
    accent: string
    border: string
  }
  bgGradient?: string
  accentGradient?: string
  accentConic?: string
  accentText?: string
  animationClass?: ThemeAnimationClass
  isDefault?: boolean
}

export interface AccentTheme {
  id: string
  name: string
  category: AccentThemeCategory
  colors: {
    accent: string
    accentStrong: string
  }
  gradient?: string
  conic?: string
  textColor?: string
  animationClass?: ThemeAnimationClass
  unlockRequirement?: {
    type: 'tasks' | 'streak'
    value: number
  }
  isUnlocked?: boolean
}

export const APP_THEMES: AppTheme[] = [
  // Categoría Base (7 temas)
  {
    id: 'cielo',
    name: 'Cielo',
    category: 'base',
    isDefault: true,
    colors: {
      bg: '#0b1620',
      surface: '#101f2c',
      surface2: '#16293a',
      text: '#eaf4fb',
      textMuted: '#9db4c4',
      accent: '#4fb0e8',
      border: '#1e3a4e',
    },
  },
  {
    id: 'menta',
    name: 'Menta',
    category: 'base',
    colors: {
      bg: '#0a1a16',
      surface: '#0f251f',
      surface2: '#15302a',
      text: '#eafaf4',
      textMuted: '#9cc4b8',
      accent: '#3ecf8e',
      border: '#1c3a32',
    },
  },
  {
    id: 'bosque',
    name: 'Bosque',
    category: 'base',
    colors: {
      bg: '#0c160f',
      surface: '#122015',
      surface2: '#182b1c',
      text: '#eaf5ec',
      textMuted: '#a0bca8',
      accent: '#4f9d5c',
      border: '#21351f',
    },
  },
  {
    id: 'atardecer',
    name: 'Atardecer',
    category: 'base',
    colors: {
      bg: '#1a0f10',
      surface: '#241516',
      surface2: '#2f1c1d',
      text: '#fbeceb',
      textMuted: '#c99a97',
      accent: '#ef6f5a',
      border: '#3a2422',
    },
  },
  {
    id: 'durazno',
    name: 'Durazno',
    category: 'base',
    colors: {
      bg: '#1a130c',
      surface: '#251b11',
      surface2: '#302416',
      text: '#fbf0e6',
      textMuted: '#c7ab92',
      accent: '#f2a065',
      border: '#3a2a18',
    },
  },
  {
    id: 'lavanda',
    name: 'Lavanda',
    category: 'base',
    colors: {
      bg: '#150f1c',
      surface: '#1e1627',
      surface2: '#281d33',
      text: '#f2ecf9',
      textMuted: '#b6a5c9',
      accent: '#a479e0',
      border: '#33253f',
    },
  },
  {
    id: 'rojo',
    name: 'Rojo',
    category: 'base',
    colors: {
      bg: '#180d0d',
      surface: '#221111',
      surface2: '#2d1616',
      text: '#fbe9e9',
      textMuted: '#c99999',
      accent: '#e5514a',
      border: '#3a1e1e',
    },
  },
  // Categoría Pastel (7 temas)
  {
    id: 'cielo-pastel',
    name: 'Cielo - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #eaf6ff, #d9edfc, #eaf6ff)',
    colors: {
      bg: '#eaf6ff',
      surface: '#f5fbff',
      surface2: '#e7f3fb',
      text: '#1d3a4d',
      textMuted: '#63879c',
      accent: '#6fb3e0',
      border: '#cfe6f5',
    },
    animationClass: 'pastel-shine',
  },
  {
    id: 'menta-pastel',
    name: 'Menta - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #eafcf5, #d7f3e6, #eafcf5)',
    colors: {
      bg: '#eafcf5',
      surface: '#f4fdf9',
      surface2: '#e3f6ee',
      text: '#1c3d30',
      textMuted: '#5f9482',
      accent: '#5cc79a',
      border: '#cbeadb',
    },
    animationClass: 'pastel-shine',
  },
  {
    id: 'bosque-pastel',
    name: 'Bosque - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #eef8ee, #dcefdd, #eef8ee)',
    colors: {
      bg: '#eef8ee',
      surface: '#f5fbf5',
      surface2: '#e5f2e5',
      text: '#223a24',
      textMuted: '#6b8f6d',
      accent: '#6fac74',
      border: '#cfe6cf',
    },
    animationClass: 'pastel-shine',
  },
  {
    id: 'atardecer-pastel',
    name: 'Atardecer - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #fff0ee, #ffdcd6, #fff0ee)',
    colors: {
      bg: '#fff0ee',
      surface: '#fff6f4',
      surface2: '#ffe6e1',
      text: '#4a2620',
      textMuted: '#b0796d',
      accent: '#f28a72',
      border: '#f6d2c9',
    },
    animationClass: 'pastel-shine',
  },
  {
    id: 'durazno-pastel',
    name: 'Durazno - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #fff3e6, #ffe4c7, #fff3e6)',
    colors: {
      bg: '#fff3e6',
      surface: '#fff8ef',
      surface2: '#ffecd6',
      text: '#4a3420',
      textMuted: '#b6906a',
      accent: '#f0ab6e',
      border: '#f5dcb9',
    },
    animationClass: 'pastel-shine',
  },
  {
    id: 'lavanda-pastel',
    name: 'Lavanda - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #f4eefc, #e6d9f6, #f4eefc)',
    colors: {
      bg: '#f4eefc',
      surface: '#f9f5fd',
      surface2: '#ede2f8',
      text: '#392a4a',
      textMuted: '#8d78a8',
      accent: '#b78de5',
      border: '#e0cdf2',
    },
    animationClass: 'pastel-shine',
  },
  {
    id: 'rojo-pastel',
    name: 'Rojo - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #fff0ef, #ffdcda, #fff0ef)',
    colors: {
      bg: '#fff0ef',
      surface: '#fff6f5',
      surface2: '#ffe4e2',
      text: '#4a2422',
      textMuted: '#b57874',
      accent: '#ef7d76',
      border: '#f6cfcc',
    },
    animationClass: 'pastel-shine',
  },
  // Categoría Premium (5 temas)
  {
    id: 'plata',
    name: 'Plata',
    category: 'premium',
    colors: {
      bg: '#101114',
      surface: '#17181c',
      surface2: '#1f2126',
      text: '#f1f2f4',
      textMuted: '#a7abb3',
      accent: '#c9ced6',
      border: '#2a2c31',
    },
    accentGradient: 'linear-gradient(120deg, #c9ced6 0%, #f4f6f8 25%, #9ca3ad 50%, #f4f6f8 75%, #c9ced6 100%)',
    accentText: '#1a1a1a',
    animationClass: 'app-metal-sheen',
  },
  {
    id: 'oro',
    name: 'Oro',
    category: 'premium',
    colors: {
      bg: '#120e08',
      surface: '#1c150c',
      surface2: '#241a0f',
      text: '#f9f1e0',
      textMuted: '#c9b085',
      accent: '#d9a635',
      border: '#372a16',
    },
    accentGradient: 'linear-gradient(120deg, #a8791f 0%, #f5d78e 20%, #fff3c4 35%, #d9a635 50%, #fff3c4 65%, #f5d78e 80%, #a8791f 100%)',
    accentText: '#241a0a',
    animationClass: 'app-metal-sheen',
  },
  {
    id: 'diamante',
    name: 'Diamante',
    category: 'premium',
    colors: {
      bg: '#0a1014',
      surface: '#10181d',
      surface2: '#182229',
      text: '#eef8fc',
      textMuted: '#9fb9c4',
      accent: '#dff4ff',
      border: '#1e2c33',
    },
    accentConic: 'conic-gradient(from var(--angle), #dff4ff, #ffffff, #bfe8fb, #eafcff, #dff4ff)',
    accentText: '#0a1014',
    animationClass: 'app-diamond-spin',
  },
  {
    id: 'prisma',
    name: 'Prisma',
    category: 'premium',
    colors: {
      bg: '#0f0f16',
      surface: '#17171f',
      surface2: '#1f1f2b',
      text: '#f5f2fb',
      textMuted: '#b3aec4',
      accent: '#d3e0ff',
      border: '#2a2836',
    },
    accentGradient: 'linear-gradient(115deg, #ffd3e0, #d3e0ff, #d3fff0, #fff3d3, #e3d3ff, #ffd3e0)',
    accentText: '#1a1622',
    animationClass: 'app-prism-shift',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'premium',
    colors: {
      bg: '#060912',
      surface: '#0b1220',
      surface2: '#101a2c',
      text: '#eaf3fb',
      textMuted: '#8fa3bd',
      accent: '#38bdf8',
      border: '#16213a',
    },
    accentGradient: 'linear-gradient(120deg, #0ee6b7, #38bdf8, #7c6ff0, #0ee6b7)',
    accentText: '#041018',
    animationClass: 'aurora-flow',
  },
]

export const ACCENT_THEMES: AccentTheme[] = [
  // Categoría Base (8 colores planos, sin animación)
  {
    id: 'dorado',
    name: 'Dorado',
    category: 'base',
    colors: {
      accent: '#D9A02B',
      accentStrong: '#C58F22',
    },
  },
  {
    id: 'azul',
    name: 'Azul',
    category: 'base',
    colors: {
      accent: '#3E82F7',
      accentStrong: '#2F68D1',
    },
  },
  {
    id: 'verde',
    name: 'Verde',
    category: 'base',
    colors: {
      accent: '#34B36A',
      accentStrong: '#279257',
    },
  },
  {
    id: 'rojo',
    name: 'Rojo',
    category: 'base',
    colors: {
      accent: '#E5473F',
      accentStrong: '#C93A33',
    },
  },
  {
    id: 'purpura',
    name: 'Púrpura',
    category: 'base',
    colors: {
      accent: '#9B5DE0',
      accentStrong: '#8548C7',
    },
  },
  {
    id: 'rosa',
    name: 'Rosa',
    category: 'base',
    colors: {
      accent: '#F0629A',
      accentStrong: '#D94F85',
    },
  },
  {
    id: 'naranja',
    name: 'Naranja',
    category: 'base',
    colors: {
      accent: '#F0883D',
      accentStrong: '#D4712B',
    },
  },
  {
    id: 'turquesa',
    name: 'Turquesa',
    category: 'base',
    colors: {
      accent: '#2EC4C0',
      accentStrong: '#23A6A2',
    },
  },
  // Categoría Exclusivo (3 premium + 1 personalizado)
  {
    id: 'plata-accent',
    name: 'Plata',
    category: 'exclusive',
    colors: {
      accent: '#c9ced6',
      accentStrong: '#f4f6f8',
    },
    gradient: 'linear-gradient(120deg, #c9ced6 0%, #f4f6f8 25%, #9ca3ad 50%, #f4f6f8 75%, #c9ced6 100%)',
    textColor: '#1a1a1a',
    animationClass: 'metal-sheen',
    unlockRequirement: { type: 'streak', value: 7 },
  },
  {
    id: 'oro-accent',
    name: 'Oro',
    category: 'exclusive',
    colors: {
      accent: '#d9a635',
      accentStrong: '#f5d78e',
    },
    gradient: 'linear-gradient(120deg, #a8791f 0%, #f5d78e 20%, #fff3c4 35%, #d9a635 50%, #fff3c4 65%, #f5d78e 80%, #a8791f 100%)',
    textColor: '#241a0a',
    animationClass: 'metal-sheen',
    unlockRequirement: { type: 'streak', value: 30 },
  },
  {
    id: 'diamante-accent',
    name: 'Diamante',
    category: 'exclusive',
    colors: {
      accent: '#dff4ff',
      accentStrong: '#ffffff',
    },
    conic: 'conic-gradient(from var(--angle), #dff4ff, #ffffff, #bfe8fb, #eafcff, #dff4ff)',
    textColor: '#0a1014',
    animationClass: 'diamond-spin',
    unlockRequirement: { type: 'streak', value: 60 },
  },
  {
    id: 'custom',
    name: 'Personalizado',
    category: 'custom',
    colors: {
      accent: '#D9A02B',
      accentStrong: '#C58F22',
    },
  },
]

export function applyAppTheme(appThemeId: string) {
  const theme = APP_THEMES.find((t) => t.id === appThemeId)
  if (!theme) return

  const root = document.documentElement
  root.style.setProperty('--bg', theme.colors.bg)
  root.style.setProperty('--surface', theme.colors.surface)
  root.style.setProperty('--surface-2', theme.colors.surface2)
  root.style.setProperty('--text', theme.colors.text)
  root.style.setProperty('--text-muted', theme.colors.textMuted)
  root.style.setProperty('--accent', theme.colors.accent)
  root.style.setProperty('--border', theme.colors.border)

  // Apply bg gradient for pastel themes
  if (theme.bgGradient) {
    root.style.setProperty('--bg', theme.bgGradient)
    root.style.setProperty('--bg-gradient-size', '220% 100%')
    root.style.setProperty('--bg-gradient-animation', 'pastel-shine 16s ease-in-out infinite')
  } else {
    root.style.removeProperty('--bg-gradient-size')
    root.style.removeProperty('--bg-gradient-animation')
  }

  // Apply accent gradient/conic for premium themes
  if (theme.accentGradient) {
    root.style.setProperty('--accent-gradient', theme.accentGradient)
    root.style.setProperty('--accent-gradient-size', '250% 100%')
  } else if (theme.accentConic) {
    root.style.setProperty('--accent-conic', theme.accentConic)
  } else {
    root.style.removeProperty('--accent-gradient')
    root.style.removeProperty('--accent-conic')
  }

  if (theme.accentText) {
    root.style.setProperty('--accent-text', theme.accentText)
  } else {
    root.style.removeProperty('--accent-text')
  }

  // Apply animation class — solo clases de nivel APP, nunca toca las de Acento
  const APP_ANIMATION_CLASSES: ThemeAnimationClass[] = [
    'pastel-shine',
    'app-metal-sheen',
    'app-diamond-spin',
    'app-prism-shift',
    'aurora-flow',
  ]
  root.classList.remove(...APP_ANIMATION_CLASSES)
  if (theme.animationClass) {
    root.classList.add(theme.animationClass)
  }
}

export function applyAccentTheme(accentThemeId: string) {
  const theme = ACCENT_THEMES.find((t) => t.id === accentThemeId)
  if (!theme) return

  const root = document.documentElement
  root.style.setProperty('--accent', theme.colors.accent)
  root.style.setProperty('--accent-strong', theme.colors.accentStrong)

  // Apply gradient for exclusive themes
  if (theme.gradient) {
    root.style.setProperty('--accent-gradient', theme.gradient)
    root.style.setProperty('--accent-gradient-size', '250% 100%')
  } else if (theme.conic) {
    root.style.setProperty('--accent-conic', theme.conic)
  } else {
    root.style.removeProperty('--accent-gradient')
    root.style.removeProperty('--accent-gradient-size')
    root.style.removeProperty('--accent-conic')
  }

  // Apply text color for exclusive themes
  if (theme.textColor) {
    root.style.setProperty('--accent-text', theme.textColor)
  } else {
    root.style.removeProperty('--accent-text')
  }

  // Apply animation class — solo clases de nivel ACENTO, nunca toca las de App Theme
  const ACCENT_ANIMATION_CLASSES: ThemeAnimationClass[] = ['metal-sheen', 'diamond-spin']
  root.classList.remove(...ACCENT_ANIMATION_CLASSES)
  if (theme.animationClass) {
    root.classList.add(theme.animationClass)
  }
}

export function applyTheme(appThemeId: string, accentThemeId: string) {
  applyAppTheme(appThemeId)
  applyAccentTheme(accentThemeId)
}

export function checkAccentThemeUnlocks(completedTasks: number, currentStreak: number, userEmail?: string): AccentTheme[] {
  const isPremiumUser = userEmail === 'fmleonm19@gmail.com'

  return ACCENT_THEMES.map((theme) => ({
    ...theme,
    isUnlocked: isPremiumUser || theme.category === 'base' || theme.category === 'custom'
      ? true
      : theme.unlockRequirement?.type === 'tasks'
        ? completedTasks >= theme.unlockRequirement.value
        : currentStreak >= (theme.unlockRequirement?.value || 0),
  }))
}
