import type { ThemeEntry } from './catalog'
import { hexOf, primaryOf } from './catalog'

const SEASON_ACCENTS: Record<string, string> = {
  bendy: '#f4ca35',
  fnaf: '#f0b83f',
  'hazbin helluva': '#d93445',
  'poppy playtime': '#e54754',
  minecraft: '#55b947',
  mario: '#e52521',
  sonic: '#2678e8',
  zelda: '#c99b2e',
  pokemon: '#e52521',
  'gravity falls': '#d5ae36',
  'digital circus': '#d94aa9',
  creepypastas: '#971d2b',
  'terror retro': '#a92832',
  'obras de arte': '#c09a58',
  historia: '#b68a3d',
  rock: '#c54242',
  colores: '#a78bfa',
  estilos: '#34c6a0',
  'rick y morty': '#64b85b',
  'looney tunes': '#929ca5',
  'los simpson': '#f2c83b',
  'scooby doo': '#43885a',
  'ben 10': '#48a83f',
  'bob esponja': '#e5c535',
  piratas: '#347f9b',
  vaqueros: '#a97943',
  china: '#c53538',
  'the forest': '#4f6b42',
  'flappy bird': '#eacb36',
  'happy wheels': '#c2433e',
  'brawl stars': '#e5bd2d',
  fortnite: '#7351bd',
  roblox: '#d84b45',
  'one piece': '#c83f37',
  naruto: '#eb7934',
  'dragon ball': '#ed8c2a',
  'garten of banban': '#d84245',
  'tom y jerry': '#a77b55',
  'harry potter': '#b99346',
  shrek: '#6f9d43',
  'phineas y ferb': '#e47a35',
  transformers: '#c83935',
  'jurassic park': '#a83831',
  'mortal kombat': '#b83330',
  'god of war': '#a33132',
  subnautica: '#258da3',
  'toy story': '#e7b83a',
  cars: '#d83231',
  'star wars': '#477fbb',
}

export function seasonAccentOf(entry: ThemeEntry): string {
  return SEASON_ACCENTS[entry.frank] ?? hexOf(primaryOf(entry))
}

export function seasonAccentTextOf(accent: string): string {
  const value = accent.replace('#', '')
  const red = parseInt(value.slice(0, 2), 16)
  const green = parseInt(value.slice(2, 4), 16)
  const blue = parseInt(value.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
  return luminance > 0.62 ? '#15151a' : '#ffffff'
}
