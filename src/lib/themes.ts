export type ThemeAnimationClass =
  | 'theme-shine-gold'
  | 'theme-shine-silver'
  | 'theme-shine-diamond'
  | 'theme-shine-wave'
  | 'theme-pulse'
  | 'theme-glow'
  | 'pastel-shine'

export type AppThemeCategory = 'base' | 'pastel' | 'custom'
export type AccentThemeCategory = 'base' | 'custom'

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
  // Categoría Base - Nuevos (4 temas)
  {
    id: 'medianoche',
    name: 'Medianoche',
    category: 'base',
    colors: {
      bg: '#0e0e14',
      surface: '#16161f',
      surface2: '#1e1e2a',
      text: '#ececf6',
      textMuted: '#9898b0',
      accent: '#7c6ef0',
      border: '#2a2a3a',
    },
  },
  {
    id: 'calido',
    name: 'Cálido',
    category: 'base',
    colors: {
      bg: '#171008',
      surface: '#221710',
      surface2: '#2d1e14',
      text: '#faf2e8',
      textMuted: '#c4a888',
      accent: '#e8a040',
      border: '#3a2a18',
    },
  },
  {
    id: 'artico',
    name: 'Ártico',
    category: 'base',
    colors: {
      bg: '#0c1218',
      surface: '#111a24',
      surface2: '#152230',
      text: '#eaf0f6',
      textMuted: '#94a8be',
      accent: '#58b0e8',
      border: '#1e3040',
    },
  },
  {
    id: 'carbon',
    name: 'Carbono',
    category: 'base',
    colors: {
      bg: '#111111',
      surface: '#1a1a1a',
      surface2: '#222222',
      text: '#e8e8e8',
      textMuted: '#888888',
      accent: '#e0e0e0',
      border: '#2e2e2e',
    },
  },
  // Categoría Pastel - Nuevos (4 temas)
  {
    id: 'medianoche-pastel',
    name: 'Medianoche - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #f0eefc, #e0dcf6, #f0eefc)',
    colors: {
      bg: '#f0eefc',
      surface: '#f7f5fd',
      surface2: '#eae6f8',
      text: '#2a2644',
      textMuted: '#7a72a0',
      accent: '#8a7cf0',
      border: '#dcd6f2',
    },
    animationClass: 'pastel-shine',
  },
  {
    id: 'calido-pastel',
    name: 'Cálido - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #fff8ee, #ffedd4, #fff8ee)',
    colors: {
      bg: '#fff8ee',
      surface: '#fffcf5',
      surface2: '#fff0de',
      text: '#4a3820',
      textMuted: '#b89868',
      accent: '#f0b060',
      border: '#f5e4c4',
    },
    animationClass: 'pastel-shine',
  },
  {
    id: 'artico-pastel',
    name: 'Ártico - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #eef4fa, #dceaf6, #eef4fa)',
    colors: {
      bg: '#eef4fa',
      surface: '#f5f9fd',
      surface2: '#e4eef8',
      text: '#1e3040',
      textMuted: '#6888a8',
      accent: '#68b8e8',
      border: '#c8ddf0',
    },
    animationClass: 'pastel-shine',
  },
  {
    id: 'carbon-pastel',
    name: 'Carbono - Pastel',
    category: 'pastel',
    bgGradient: 'linear-gradient(120deg, #f0f0f0, #e4e4e4, #f0f0f0)',
    colors: {
      bg: '#f0f0f0',
      surface: '#f8f8f8',
      surface2: '#e8e8e8',
      text: '#2a2a2a',
      textMuted: '#707070',
      accent: '#606060',
      border: '#d4d4d4',
    },
    animationClass: 'pastel-shine',
  },
  // Categoría Personalizado
  {
    id: 'custom-app',
    name: 'Personalizado',
    category: 'custom',
    colors: {
      bg: '#0e0e14',
      surface: '#16161f',
      surface2: '#1e1e2a',
      text: '#ececf6',
      textMuted: '#9898b0',
      accent: '#7c6ef0',
      border: '#2a2a3a',
    },
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
  {
    id: 'coral',
    name: 'Coral',
    category: 'base',
    colors: {
      accent: '#FF6B6B',
      accentStrong: '#E05555',
    },
  },
  {
    id: 'lima',
    name: 'Lima',
    category: 'base',
    colors: {
      accent: '#A8D948',
      accentStrong: '#8FBF38',
    },
  },
  {
    id: 'cian',
    name: 'Cian',
    category: 'base',
    colors: {
      accent: '#00CED1',
      accentStrong: '#00A8AD',
    },
  },
  {
    id: 'magenta',
    name: 'Magenta',
    category: 'base',
    colors: {
      accent: '#D63384',
      accentStrong: '#B8296F',
    },
  },
  {
    id: 'dorado-claro',
    name: 'Dorado claro',
    category: 'base',
    colors: {
      accent: '#FFD700',
      accentStrong: '#DAA520',
    },
  },
  // Categoría Personalizado
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

  if (appThemeId === 'custom-app') {
    const saved = localStorage.getItem('task-lex-custom-app-colors')
    if (saved) {
      const c = JSON.parse(saved)
      root.style.setProperty('--bg', c.bg)
      root.style.setProperty('--surface', c.surface)
      root.style.setProperty('--surface-2', c.surface2)
      root.style.setProperty('--text', c.text)
      root.style.setProperty('--text-muted', c.textMuted)
      root.style.setProperty('--border', c.border)
      root.style.removeProperty('--bg-gradient-size')
      root.style.removeProperty('--bg-gradient-animation')
      root.classList.remove('pastel-shine')
      return
    }
  }

  root.style.setProperty('--bg', theme.colors.bg)
  root.style.setProperty('--surface', theme.colors.surface)
  root.style.setProperty('--surface-2', theme.colors.surface2)
  root.style.setProperty('--text', theme.colors.text)
  root.style.setProperty('--text-muted', theme.colors.textMuted)
  root.style.setProperty('--border', theme.colors.border)

  // Gradiente de fondo para temas Pastel
  if (theme.bgGradient) {
    root.style.setProperty('--bg', theme.bgGradient)
    root.style.setProperty('--bg-gradient-size', '220% 100%')
    root.style.setProperty('--bg-gradient-animation', 'pastel-shine 16s ease-in-out infinite')
  } else {
    root.style.removeProperty('--bg-gradient-size')
    root.style.removeProperty('--bg-gradient-animation')
  }

  // Apply animation class
  root.classList.remove('pastel-shine')
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
}

export function applyTheme(appThemeId: string, accentThemeId: string) {
  applyAppTheme(appThemeId)
  applyAccentTheme(accentThemeId)
}
