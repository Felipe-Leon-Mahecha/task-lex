export type ThemeAnimationClass =
  | 'theme-shine-gold'
  | 'theme-shine-silver'
  | 'theme-shine-diamond'
  | 'theme-shine-wave'
  | 'theme-pulse'
  | 'theme-glow'

export interface AppTheme {
  id: string
  name: string
  colors: {
    bg: string
    surface: string
    surface2: string
    text: string
    textMuted: string
    border: string
  }
  isDefault?: boolean
  animationClass?: ThemeAnimationClass
}

export interface AccentTheme {
  id: string
  name: string
  type: 'base' | 'pastel' | 'exclusive' | 'animated'
  colors: {
    accent: string
    accentStrong: string
  }
  gradient?: {
    from: string
    to: string
    angle?: number
  }
  unlockRequirement?: {
    type: 'tasks' | 'streak'
    value: number
  }
  isUnlocked?: boolean
  animationClass?: ThemeAnimationClass
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'dark',
    name: 'Oscuro',
    isDefault: true,
    colors: {
      bg: '#121212',
      surface: '#1c1c1c',
      surface2: '#242424',
      text: '#f5f0e6',
      textMuted: '#9c9c9c',
      border: '#2c2c2c',
    },
  },
  {
    id: 'light',
    name: 'Claro',
    colors: {
      bg: '#f5f0e6',
      surface: '#ebe5d8',
      surface2: '#e0d9c9',
      text: '#121212',
      textMuted: '#6b6b6b',
      border: '#d4cbb8',
    },
  },
  {
    id: 'midnight',
    name: 'Medianoche',
    colors: {
      bg: '#0a0a0a',
      surface: '#151515',
      surface2: '#1a1a1a',
      text: '#f5f0e6',
      textMuted: '#9c9c9c',
      border: '#1f1f1f',
    },
  },
  {
    id: 'deep-blue',
    name: 'Azul Profundo',
    colors: {
      bg: '#0d1b2a',
      surface: '#1b263b',
      surface2: '#253347',
      text: '#e0e1dd',
      textMuted: '#778da9',
      border: '#1b263b',
    },
  },
  {
    id: 'forest-dark',
    name: 'Bosque Oscuro',
    colors: {
      bg: '#1a2f1a',
      surface: '#2d4a2d',
      surface2: '#3d5c3d',
      text: '#e8f5e8',
      textMuted: '#8fb58f',
      border: '#2d4a2d',
    },
  },
  {
    id: 'purple-dark',
    name: 'Púrpura Oscuro',
    colors: {
      bg: '#1a1025',
      surface: '#2d1f40',
      surface2: '#3d2a55',
      text: '#f0e6f5',
      textMuted: '#a880b8',
      border: '#2d1f40',
    },
  },
]

export const ACCENT_THEMES: AccentTheme[] = [
  // Base accent themes
  {
    id: 'gold',
    name: 'Dorado',
    type: 'base',
    colors: {
      accent: '#e0b563',
      accentStrong: '#f4d9a6',
    },
  },
  {
    id: 'blue',
    name: 'Azul',
    type: 'base',
    colors: {
      accent: '#4a90e2',
      accentStrong: '#7ab3f0',
    },
    animationClass: 'theme-shine-wave',
  },
  {
    id: 'green',
    name: 'Verde',
    type: 'base',
    colors: {
      accent: '#50c878',
      accentStrong: '#7ed99a',
    },
    animationClass: 'theme-pulse',
  },
  {
    id: 'red',
    name: 'Rojo',
    type: 'base',
    colors: {
      accent: '#e74c3c',
      accentStrong: '#f07a6a',
    },
    animationClass: 'theme-glow',
  },
  {
    id: 'purple',
    name: 'Púrpura',
    type: 'base',
    colors: {
      accent: '#9b59b6',
      accentStrong: '#b07cc6',
    },
    animationClass: 'theme-shine-wave',
  },
  // Pastel accent themes
  {
    id: 'pastel-blue',
    name: 'Azul Pastel',
    type: 'pastel',
    colors: {
      accent: '#a8d8ea',
      accentStrong: '#c4e5f2',
    },
    unlockRequirement: { type: 'tasks', value: 10 },
  },
  {
    id: 'pastel-pink',
    name: 'Rosa Pastel',
    type: 'pastel',
    colors: {
      accent: '#f8b4d9',
      accentStrong: '#fcd4e8',
    },
    unlockRequirement: { type: 'tasks', value: 10 },
  },
  {
    id: 'pastel-green',
    name: 'Verde Pastel',
    type: 'pastel',
    colors: {
      accent: '#b8e6b8',
      accentStrong: '#d4f2d4',
    },
    unlockRequirement: { type: 'tasks', value: 10 },
  },
  {
    id: 'pastel-purple',
    name: 'Púrpura Pastel',
    type: 'pastel',
    colors: {
      accent: '#d8b4e0',
      accentStrong: '#ebd4f0',
    },
    unlockRequirement: { type: 'tasks', value: 10 },
  },
  // Exclusive accent themes (unlockable by streak)
  {
    id: 'silver',
    name: 'Plata',
    type: 'exclusive',
    colors: {
      accent: '#E8E8E8',
      accentStrong: '#FFFFFF',
    },
    unlockRequirement: { type: 'streak', value: 7 },
    animationClass: 'theme-shine-silver',
  },
  {
    id: 'gold-premium',
    name: 'Oro Premium',
    type: 'exclusive',
    colors: {
      accent: '#FFD700',
      accentStrong: '#FFEC8B',
    },
    unlockRequirement: { type: 'streak', value: 30 },
    animationClass: 'theme-shine-gold',
  },
  {
    id: 'diamond',
    name: 'Diamante',
    type: 'exclusive',
    colors: {
      accent: '#A9CBE6',
      accentStrong: '#DCEEFA',
    },
    unlockRequirement: { type: 'streak', value: 60 },
    animationClass: 'theme-shine-diamond',
  },
  {
    id: 'prism',
    name: 'Prisma',
    type: 'exclusive',
    colors: {
      accent: '#FF69B4',
      accentStrong: '#FFB6C1',
    },
    unlockRequirement: { type: 'streak', value: 100 },
    animationClass: 'theme-pulse',
  },
  // Animated gradient accent themes (premium, unlockable for fmleonm19@gmail.com)
  {
    id: 'ocean',
    name: 'Océano',
    type: 'animated',
    colors: {
      accent: '#4FC3F7',
      accentStrong: '#81D4FA',
    },
    gradient: {
      from: '#0288D1',
      to: '#4FC3F7',
      angle: 135,
    },
    unlockRequirement: { type: 'streak', value: 50 },
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    type: 'animated',
    colors: {
      accent: '#FF8A65',
      accentStrong: '#FFAB91',
    },
    gradient: {
      from: '#FF7043',
      to: '#FFAB91',
      angle: 135,
    },
    unlockRequirement: { type: 'streak', value: 50 },
  },
  {
    id: 'forest',
    name: 'Bosque',
    type: 'animated',
    colors: {
      accent: '#66BB6A',
      accentStrong: '#81C784',
    },
    gradient: {
      from: '#43A047',
      to: '#66BB6A',
      angle: 135,
    },
    unlockRequirement: { type: 'streak', value: 50 },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    type: 'animated',
    colors: {
      accent: '#AB47BC',
      accentStrong: '#BA68C8',
    },
    gradient: {
      from: '#7B1FA2',
      to: '#AB47BC',
      angle: 135,
    },
    unlockRequirement: { type: 'streak', value: 50 },
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    type: 'animated',
    colors: {
      accent: '#9575CD',
      accentStrong: '#B39DDB',
    },
    gradient: {
      from: '#5E35B1',
      to: '#9575CD',
      angle: 135,
    },
    unlockRequirement: { type: 'streak', value: 50 },
  },
  {
    id: 'peach',
    name: 'Durazno',
    type: 'animated',
    colors: {
      accent: '#F48FB1',
      accentStrong: '#F8BBD0',
    },
    gradient: {
      from: '#EC407A',
      to: '#F48FB1',
      angle: 135,
    },
    unlockRequirement: { type: 'streak', value: 50 },
  },
  {
    id: 'mint',
    name: 'Menta',
    type: 'animated',
    colors: {
      accent: '#4DB6AC',
      accentStrong: '#80CBC4',
    },
    gradient: {
      from: '#009688',
      to: '#4DB6AC',
      angle: 135,
    },
    unlockRequirement: { type: 'streak', value: 50 },
  },
  {
    id: 'sky',
    name: 'Cielo',
    type: 'animated',
    colors: {
      accent: '#64B5F6',
      accentStrong: '#90CAF9',
    },
    gradient: {
      from: '#1E88E5',
      to: '#64B5F6',
      angle: 135,
    },
    unlockRequirement: { type: 'streak', value: 50 },
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
  root.style.setProperty('--border', theme.colors.border)
}

const ALL_ANIMATION_CLASSES: ThemeAnimationClass[] = [
  'theme-shine-gold',
  'theme-shine-silver',
  'theme-shine-diamond',
  'theme-shine-wave',
  'theme-pulse',
  'theme-glow',
]

/**
 * Aplica la clase de animación del tema al elemento que pinta el fondo
 * animado (por defecto el `<html>`, pásale otro elemento si el fondo vive
 * en un contenedor propio, ej. la tarjeta de "Personalizar acento").
 */
export function applyAccentAnimation(
  accentThemeId: string,
  target: HTMLElement = document.documentElement
) {
  const theme = ACCENT_THEMES.find((t) => t.id === accentThemeId)
  target.classList.remove(...ALL_ANIMATION_CLASSES)
  if (theme?.animationClass) {
    target.classList.add(theme.animationClass)
  }
}

export function applyAccentTheme(accentThemeId: string) {
  const theme = ACCENT_THEMES.find((t) => t.id === accentThemeId)
  if (!theme) return

  const root = document.documentElement
  root.style.setProperty('--accent', theme.colors.accent)
  root.style.setProperty('--accent-strong', theme.colors.accentStrong)
  
  // Apply gradient: si el tema define uno se usa tal cual, si no, se deriva
  // de sus propios colores para que theme-shine-wave/pulse/glow igual funcionen.
  if (theme.gradient) {
    root.style.setProperty('--gradient-from', theme.gradient.from)
    root.style.setProperty('--gradient-to', theme.gradient.to)
    root.style.setProperty('--gradient-angle', `${theme.gradient.angle || 135}deg`)
    root.style.setProperty('--has-gradient', '1')
  } else {
    root.style.setProperty('--gradient-from', theme.colors.accent)
    root.style.setProperty('--gradient-to', theme.colors.accentStrong)
    root.style.setProperty('--has-gradient', theme.animationClass ? '1' : '0')
  }

  applyAccentAnimation(accentThemeId)
}

export function applyTheme(appThemeId: string, accentThemeId: string) {
  applyAppTheme(appThemeId)
  applyAccentTheme(accentThemeId)
}

export function checkAccentThemeUnlocks(completedTasks: number, currentStreak: number, userEmail?: string): AccentTheme[] {
  const isPremiumUser = userEmail === 'fmleonm19@gmail.com'
  
  return ACCENT_THEMES.map((theme) => ({
    ...theme,
    isUnlocked: isPremiumUser || theme.type === 'base' 
      ? true 
      : theme.unlockRequirement?.type === 'tasks'
        ? completedTasks >= theme.unlockRequirement.value
        : currentStreak >= (theme.unlockRequirement?.value || 0),
  }))
}
