import {
  Anchor,
  BookOpen,
  CarFront,
  Clapperboard,
  CloudLightning,
  Code2,
  Crown,
  Eye,
  Flame,
  Flower2,
  Gamepad2,
  Ghost,
  Gauge,
  Leaf,
  Music2,
  Orbit,
  Palette,
  Shield,
  Snowflake,
  Sparkles,
  Star,
  Swords,
  TreePine,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import type { ThemeEntry } from '../../lib/seasons/catalog'

type DecorationFamily = 'pursuit' | 'ink' | 'horror' | 'racing' | 'fire' | 'ice' | 'water' | 'storm' | 'space' | 'music' | 'art' | 'history' | 'nature' | 'technology' | 'fantasy' | 'hero' | 'playful'

type FamilyStyle = {
  className: string
  accent: string
  icons: [LucideIcon, LucideIcon, LucideIcon]
}

const FAMILY_STYLES: Record<DecorationFamily, FamilyStyle> = {
  pursuit: { className: 'pursuit', accent: '#fa354d', icons: [CarFront, Gauge, Shield] },
  ink: { className: 'ink', accent: '#e2b363', icons: [Sparkles, Star, Sparkles] },
  horror: { className: 'horror', accent: '#ed4856', icons: [Ghost, Eye, Sparkles] },
  racing: { className: 'racing', accent: '#64c9ff', icons: [Gauge, Zap, CarFront] },
  fire: { className: 'fire', accent: '#ff7338', icons: [Flame, Sparkles, Zap] },
  ice: { className: 'ice', accent: '#a5e8ff', icons: [Snowflake, Star, Sparkles] },
  water: { className: 'water', accent: '#56d7ee', icons: [Waves, Sparkles, Anchor] },
  storm: { className: 'storm', accent: '#ffe079', icons: [CloudLightning, Zap, Star] },
  space: { className: 'space', accent: '#b9a4ff', icons: [Orbit, Star, Sparkles] },
  music: { className: 'music', accent: '#ff76c8', icons: [Music2, Sparkles, Star] },
  art: { className: 'art', accent: '#e4ca8b', icons: [Palette, Sparkles, Star] },
  history: { className: 'history', accent: '#e5c07a', icons: [Crown, BookOpen, Shield] },
  nature: { className: 'nature', accent: '#8be0a0', icons: [Leaf, Flower2, TreePine] },
  technology: { className: 'technology', accent: '#70f2d4', icons: [Code2, Zap, Sparkles] },
  fantasy: { className: 'fantasy', accent: '#e7bb70', icons: [Swords, Crown, Sparkles] },
  hero: { className: 'hero', accent: '#ffc879', icons: [Shield, Star, Zap] },
  playful: { className: 'playful', accent: '#ffd166', icons: [Gamepad2, Star, Clapperboard] },
}

function familyFor(entry: ThemeEntry): DecorationFamily {
  const { key, frank, type } = entry
  const words = `${key} ${frank} ${type}`.toLowerCase()

  if (key === 'nfs-most-wanted-2005') return 'pursuit'
  if (frank === 'bendy') return 'ink'
  if (['obras de arte', 'filosofia', 'ajedrez', 'estilos', 'colores'].includes(frank)) return 'art'
  if (['fnaf', 'poppy playtime', 'creepypastas', 'the forest', 'terrifier', 'granny', 'hello neighbor', 'villanos', 'coraje', 'death note', 'coraline', 'luigi'].some((name) => frank.includes(name)) || /horror|zombie|monster|slender|rake|eyeless|laughing jack|batman que rie|venom/.test(words)) return 'horror'
  if (frank === 'nfs' || /racing|kart|rocket league|cars/.test(words)) return 'racing'
  if (/fuego|volcan|erupcion/.test(words)) return 'fire'
  if (/hielo|ice|avalancha/.test(words)) return 'ice'
  if (/agua|tsunami|subnautica|pirata|bajoterra/.test(words)) return 'water'
  if (/tormenta|huracan|tornado|electrica|rayman/.test(words)) return 'storm'
  if (/star wars|espacio|galaxy|estrellada|futuro|astral|space/.test(words)) return 'space'
  if (/rock|reggaeton|musica|fnf|shapes beats|linkin park|disturbed|rammstein|avenged|three days|device/.test(words)) return 'music'
  if (/obras de arte|filosofia|ajedrez|estilos|color(es)?|prisma|amatista|esmeralda|rubi|zafiro|obsidiana|dorado|plateado|cobre|bronce/.test(words)) return 'art'
  if (/historia|china|egipto|grecia|roma|edad media|viking|renacimiento|guerra|piratas|vaqueros/.test(words)) return 'history'
  if (/naturaleza|animales|pokemon|monstruos|prehistoria|dinosaur|dragon|selva|plants vs|pvz|spyro/.test(words)) return 'nature'
  if (/programacion|hacking|tecnologia|cyber|transformers|ben 10|roblox|geometry dash|minecraft/.test(words)) return 'technology'
  if (/harry potter|zelda|link|fantasia|dragones|clash|one piece|naruto|dragon ball|medieval|super smash|mortal kombat|god of war/.test(words)) return 'fantasy'
  if (/dc|marvel|batman|superman|spider man|deadpool|iron man|superheroe/.test(words)) return 'hero'
  if (/arte|pintura|klimt|mona lisa|guernica|grito|joven de la perla|persistencia/.test(words)) return 'art'
  if (/rick y morty|looney tunes|simpson|scooby|bob esponja|brawl|fortnite|toy story|cuphead|flappy|happy wheels|among us|fall guys|mario|sonic|crash|gumball|hora de aventura|un show|steven universe/.test(words)) return 'playful'

  if (type === 'Música') return 'music'
  if (type === 'Época') return 'history'
  return 'playful'
}

function stableVariant(key: string): number {
  let hash = 0
  for (let index = 0; index < key.length; index++) hash = (hash * 31 + key.charCodeAt(index)) | 0
  return Math.abs(hash) % 3
}

export default function SeasonCardDecor({ entry }: { entry: ThemeEntry }) {
  const family = familyFor(entry)
  const style = FAMILY_STYLES[family]
  const variant = stableVariant(entry.key)
  const [PrimaryIcon, SecondaryIcon, AccentIcon] = style.icons

  if (family === 'pursuit') return <div className="season-nfs-police-frame" aria-hidden="true" />

  if (family === 'ink') {
    return (
      <svg aria-hidden="true" className="season-ink-decor pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 600 180" preserveAspectRatio="none">
        <path d="M0 0h152v12c-17 3-8 24-21 29-14 5-17-13-19-23-3-13-15-11-16 0-1 12 3 23-8 26-13 4-15-15-17-25-3-12-15-10-16 2-1 10 1 20-9 22-13 3-15-12-16-22-2-13-15-13-16 1-1 10 2 19-9 22-12 3-18-11-18-23-1-10-9-11-12 0-3 9-1 18-10 20H0Z" fill="#080808" opacity=".68" />
        <path d="M600 180H462v-10c14-3 9-20 20-24 12-4 14 10 16 19 2 10 13 10 15-1 2-8-1-17 9-20 11-3 13 10 15 18 2 10 13 9 14-2 1-8-1-16 8-19 11-4 14 10 16 19 2 9 12 9 14-1 2-8-1-16 8-19H600Z" fill="#080808" opacity=".62" />
        <ellipse cx="205" cy="148" rx="47" ry="16" fill="#080808" opacity=".42" />
        <ellipse cx="410" cy="22" rx="35" ry="12" fill="#080808" opacity=".38" />
      </svg>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`season-theme-decor season-theme-decor--${style.className} season-theme-decor--v${variant}`}
      style={{ '--season-decor-accent': style.accent } as CSSProperties}
    >
      <span className="season-theme-decor__glow" />
      <PrimaryIcon className="season-theme-decor__icon season-theme-decor__icon--main" strokeWidth={1.7} />
      <SecondaryIcon className="season-theme-decor__icon season-theme-decor__icon--small" strokeWidth={1.8} />
      <AccentIcon className="season-theme-decor__spark" strokeWidth={1.8} />
      <span className="season-theme-decor__edge-light" />
    </div>
  )
}
