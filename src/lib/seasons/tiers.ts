export interface TierInfo {
  index: number
  name: string
  numeral: string
  isMax: boolean
  hex: string
  gradient?: string
}

const TIER_NAMES = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Amatista']
const TIER_HEXES = ['#cd7f32', '#c9d4e0', '#f5c518', '#8be9fd', '#b57edc']
const ROMAN = ['I', 'II', 'III', 'IV', 'V']

export const PRISMA_GRADIENT = 'linear-gradient(120deg, #ff5c8a, #ffae00, #22e57f, #38bdf8, #a78bfa)'

export function tierOf(count: number): TierInfo | null {
  if (!count || count <= 0) return null
  if (count >= 6) {
    return {
      index: 5,
      name: 'Prisma',
      numeral: 'MAX',
      isMax: true,
      hex: '#ffffff',
      gradient: PRISMA_GRADIENT,
    }
  }
  const index = Math.min(count - 1, 4)
  return {
    index,
    name: TIER_NAMES[index],
    numeral: ROMAN[index],
    isMax: false,
    hex: TIER_HEXES[index],
  }
}