import { useEffect, useMemo, useRef, useState } from 'react'
import { Bird, Check, Heart, Info, Lock, ShoppingBag, Sparkles, Brain, Backpack, Crown, MessageCircleQuestion, ListTree, BatteryCharging, Target, Trophy, ChevronLeft, ChevronRight, Medal, BadgeCheck, Palette } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { useLocation } from 'react-router-dom'
import { Browser } from '@capacitor/browser'
import { getLastEconomyError, useFoxSkinsStore, useInfiniteCoins } from '../../store/foxSkins'
import { useAuthStore } from '../../store/auth'
import { auth } from '../../lib/firebase'
import { apiUrl } from '../../lib/apiUrl'
import { scheduleFavoriteSkinNotice } from '../../lib/favoriteSkinNotice'
import { getWeekendDiscount } from '../../lib/shopDiscount'
import { useSettingsStore } from '../../store/settings'
import { notifyApp } from '../../lib/appNotifications'
import { canAccessSeasons } from '../../lib/appInfo'
import { useSeasonsStore } from '../../store/seasons'
import { CATALOG } from '../../lib/seasons/catalog'
import { playDuckPurchaseSound, playPremiumUnlockSound, playPurchaseSound } from '../../lib/soundEffects'
import SeasonThemeCard from '../seasons/SeasonThemeCard'
import Modal from './Modal'
import ThemeSelector from './ThemeSelector'

const PENDING_KEY = 'task-lex-pending-purchase'
const PENDING_TTL = 48 * 3600 * 1000

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null
    if (token) headers.Authorization = `Bearer ${token}`
  } catch {}
  return headers
}
import { useTasksStore } from '../../store/tasks'
import { ACHIEVEMENTS, ACHIEVEMENT_SKIN_REWARDS, claimableAchievements, claimedAchievements, claimAchievement, unlockedAchievements, computeAchievementStats, isHalloween2026, type AchievementStats } from '../../lib/achievements'
import { celebrate } from '../../lib/celebrate'
import { FOX_SKINS, COIN_PACKS, getDailyRotation, getDailySelection, getSeasonalPack, type FoxSkin, type SkinCategory } from '../../lib/foxSkins'
import { QUACKINGTON_SKINS, QUACKINGTON_COLLECTIBLE_SKINS, QUACKINGTON_SKIN_CATEGORIES, isQuackingtonSkinAvailable, type QuackingtonSkin, type QuackingtonSkinCategory } from '../../lib/quackingtonSkins'
import QuackingtonSkinPet from '../pet/QuackingtonSkinPet'
import { useDragScroll } from '../../hooks/useDragScroll'

function nearestCarouselCard(track: HTMLElement) {
  const cards = [...track.querySelectorAll<HTMLElement>('[data-carousel-card]')]
  if (!cards.length) return -1
  const center = track.getBoundingClientRect().left + track.clientWidth / 2
  return cards.reduce((best, card, index) => Math.abs(card.getBoundingClientRect().left + card.clientWidth / 2 - center) < Math.abs(cards[best].getBoundingClientRect().left + cards[best].clientWidth / 2 - center) ? index : best, 0)
}

function centerCarouselCard(track: HTMLElement, index: number, behavior: ScrollBehavior = 'smooth') {
  if (window.matchMedia('(min-width: 1024px)').matches) return
  const card = track.querySelectorAll<HTMLElement>('[data-carousel-card]')[index]
  if (!card) return
  const center = track.getBoundingClientRect().left + track.clientWidth / 2
  const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2
  track.scrollTo({ left: track.scrollLeft + cardCenter - center, behavior })
}

const SEASON_LABELS: Record<SkinCategory, string> = {
  normal: 'Skins',
  halloween: 'Pack Halloween',
  navidad: 'Pack Navidad',
  musical: 'Pack Musical',
}

const PREMIUM_FEATURES = [
  { icon: Brain, title: 'Asistente que actúa contigo', desc: 'Crea y actualiza tareas, notas y bloques de tu horario semanal; tú confirmas cada cambio' },
  { icon: MessageCircleQuestion, title: 'Chat con contexto de tu app', desc: 'Consulta pendientes, notas no privadas, secciones y rutina semanal' },
  { icon: ListTree, title: 'Organización flexible', desc: 'Crea apartados para tus listas, cambia sus nombres y organiza tareas entre ellos' },
  { icon: BatteryCharging, title: 'Planificación diaria', desc: 'Arma planes, desglosa tareas y sugiere por dónde empezar según tu energía' },
  { icon: Target, title: 'Ayuda en toda la app', desc: 'Te orienta en calendario, estadísticas, notas, temporizador, temas, tienda y logros' },
  { icon: Bird, title: 'Quackington incluido', desc: 'Al activar Premium se desbloquea el pato como mascota, sin compra aparte' },
  { icon: Trophy, title: 'Logros y recompensas', desc: 'Celebra hitos, mantén rachas y desbloquea cosméticos' },
]
const HALLOWEEN_MESSAGES = [
  'Una colección de miedo antes de que desaparezca entre sombras.',
  'Octubre se acaba: llévate tu estilo favorito para la noche.',
  'Solo por temporada. Elige tu criatura antes de que den las doce.',
  'Un toque oscuro para tu mascota, disponible durante octubre.',
]

const RARITY_COLORS: Record<string, string> = {
  Básico: '#7dd3fc', Especial: '#4ade80', Raro: '#fb923c', Épico: '#c084fc', Demon: '#f87171', Legendario: '#f5c542', Exclusivo: '#ffffff',
}

function rarityFrame(rarity?: string, equipped = false) {
  if (rarity === 'Exclusivo') return { className: 'rarity-exclusive', style: undefined }
  const color = rarity ? RARITY_COLORS[rarity] : undefined
  return { className: rarity === 'Legendario' ? 'rarity-legendary' : '', style: color ? { borderColor: color, ...(equipped ? { boxShadow: `0 0 0 1px ${color}55, 0 0 18px ${color}22` } : {}) } : undefined }
}

function CoinIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return <img src="/coins/moneda.png" alt="moneda" className={className} />
}

function SkinGiftInfo({ rarity }: { rarity?: string }) {
  const range = rarity === 'Exclusivo' ? '100–400' : rarity === 'Legendario' ? '50–300' : rarity === 'Demon' ? '10–200' : null
  if (!range) return null
  return <details className="absolute left-2 top-2 z-20">
    <summary title="Información del regalo" className="grid h-7 w-7 cursor-pointer list-none place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)]/95 text-[var(--text-muted)] shadow-sm hover:text-[var(--accent)]"><Info className="h-4 w-4" /></summary>
    <div className="absolute left-0 top-8 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs leading-relaxed text-[var(--text)] shadow-xl">Al tener equipada una skin {rarity?.toLowerCase()} cuando llegue el regalo, recibirás entre <strong>{range} monedas</strong>. Se puede reclamar uno cada 15 días por cuenta.</div>
  </details>
}

function SkinCard({ skin, equipped, unlocked, canAfford, onEquip, onBuy, discount, favorite, onToggleFavorite }: {
  skin: FoxSkin; equipped: boolean; unlocked: boolean; canAfford: boolean; onEquip: () => void; onBuy: () => void; discount?: { percent: number; price: number }; favorite: boolean; onToggleFavorite: () => void
}) {
  const frame = rarityFrame(skin.rarity, equipped)
  return (
    <div style={frame.style} className={`relative flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 shop-carousel-enter lg:gap-2 lg:p-2 ${skin.category === 'halloween' ? 'skin-halloween' : skin.category === 'navidad' ? 'skin-christmas' : ''} ${frame.className} ${
      equipped ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]'
      : unlocked ? 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50'
      : 'border-[var(--border)] bg-[var(--surface)] opacity-75'
    }`}>
      <SkinGiftInfo rarity={skin.rarity} />
      {skin.category === 'halloween' && <span className="absolute right-2 top-2 z-10 rounded-full bg-red-950 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-orange-200">Edición Halloween</span>}
      {skin.category === 'navidad' && <span className="absolute right-2 top-2 z-10 rounded-full bg-emerald-950 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-100">🎄 Navidad</span>}
      <div className="relative grid h-28 w-full place-items-center rounded-xl bg-[var(--bg)]/70 sm:h-32 lg:h-24">
        <img src={skin.image} alt={skin.name} draggable={false} className="h-24 w-24 select-none object-contain sm:h-28 sm:w-28 lg:h-20 lg:w-20" loading="lazy" />
        <button type="button" aria-label={favorite ? `Quitar ${skin.name} de favoritos` : `Añadir ${skin.name} a favoritos`} aria-pressed={favorite} onClick={onToggleFavorite} className={`absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full border border-white/20 shadow-lg transition hover:scale-110 ${favorite ? 'bg-rose-500 text-white' : 'bg-[var(--surface)]/90 text-rose-400'}`}><Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} /></button>
      </div>
      <span className="min-h-10 text-center text-sm font-semibold text-[var(--text)]">{skin.name}</span>
      {skin.rarity && <span className="-mt-2 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{skin.rarity}</span>}
      {equipped ? (
        <span className="flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--bg)]">
          <Check className="h-3 w-3" /> Equipada
        </span>
      ) : unlocked ? (
        <button onClick={onEquip} className="min-h-11 w-full rounded-xl bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--accent)] hover:text-[var(--bg)]">
          Equipar
        </button>
      ) : (
        <button onClick={onBuy} disabled={!canAfford} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--bg)] shadow-sm transition-transform hover:brightness-105 active:scale-[0.98] disabled:opacity-45">
          {canAfford ? <>Comprar · {discount ? <><span className="mr-1 line-through opacity-60">{skin.cost}</span>{discount.price} <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">−{discount.percent}%</span></> : skin.cost} <CoinIcon className="h-4 w-4" /></> : <><Lock className="h-4 w-4" /> {discount?.price ?? skin.cost} monedas</>}
        </button>
      )}
    </div>
  )
}

function CoinPackCard({ pack, onBuy, disabled }: { pack: typeof COIN_PACKS[number]; onBuy: () => void; disabled?: boolean }) {
  return (
    <button onClick={onBuy} disabled={disabled} className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 active:scale-95 disabled:opacity-50">
      <img src={pack.image} alt={pack.name} className="h-14 w-14 object-contain" />
      <span className="text-xs font-semibold text-[var(--text)]">{pack.name}</span>
      <span className="text-lg font-bold text-[var(--accent)]">${pack.price.toLocaleString('es-CO')} COP</span>
      <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
        {pack.coins} <CoinIcon className="h-3 w-3" />{pack.bonus ? ` +${pack.bonus} bonus` : ''}
      </span>
    </button>
  )
}

function DuckSkinCard({ skin, equipped, unlocked, canAfford, quackingtonOwned, onEquip, onBuy, discount, favorite, onToggleFavorite }: {
  skin: QuackingtonSkin
  equipped: boolean
  unlocked: boolean
  canAfford: boolean
  quackingtonOwned: boolean
  onEquip: () => void
  onBuy: () => void
  discount?: { percent: number; price: number }
  favorite: boolean
  onToggleFavorite: () => void
}) {
  const frame = rarityFrame(skin.rarity, equipped)
  return (
    <article style={frame.style} className={`relative flex min-w-0 flex-col rounded-2xl border p-3 transition-colors shop-carousel-enter sm:p-4 lg:p-2 ${frame.className} ${equipped ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]' : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50'}`}>
      <SkinGiftInfo rarity={skin.rarity} />
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-[var(--bg)]/80 p-2 lg:aspect-auto lg:h-32">
        <img src={skin.image} alt={skin.name} draggable={false} className="h-full w-full select-none object-contain" loading="lazy" />
        <button type="button" aria-label={favorite ? `Quitar ${skin.name} de favoritos` : `Añadir ${skin.name} a favoritos`} aria-pressed={favorite} onClick={onToggleFavorite} className={`absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full border border-white/20 shadow-lg transition hover:scale-110 ${favorite ? 'bg-rose-500 text-white' : 'bg-[var(--surface)]/90 text-rose-400'}`}><Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} /></button>
      </div>
      <div className="mt-3 flex-1 lg:mt-2">
        <p className="line-clamp-1 text-sm font-bold text-[var(--text)]">{skin.name}</p>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{skin.rarity} · {skin.animated ? 'Animado' : 'Estático'}</p>
      </div>
      {equipped ? (
        <span className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)]/15 px-3 py-2 text-xs font-bold text-[var(--accent)] lg:mt-2 lg:min-h-9"><Check className="h-4 w-4" /> En uso</span>
      ) : unlocked ? (
        <button onClick={onEquip} className="mt-3 min-h-11 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--accent)] hover:text-[var(--bg)] lg:mt-2 lg:min-h-9 lg:text-xs">Usar este estilo</button>
      ) : (
        <button onClick={onBuy} disabled={!canAfford || (!quackingtonOwned && skin.id !== 'animado')} className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-3 py-2.5 text-sm font-bold text-[var(--bg)] transition hover:brightness-105 disabled:opacity-45 lg:mt-2 lg:min-h-9 lg:py-1.5 lg:text-xs">
          {canAfford ? <>Comprar · {discount ? <><span className="mr-1 line-through opacity-60">{skin.cost}</span>{discount.price} <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">−{discount.percent}%</span></> : skin.cost} <CoinIcon className="h-4 w-4" /></> : <><Lock className="h-4 w-4" /> {discount?.price ?? skin.cost} monedas</>}
        </button>
      )}
    </article>
  )
}

function CollectionSkinTile({ skin, unlocked, favorite, onToggleFavorite }: { skin: { id: string; name: string; image: string; rarity?: string; category?: string; rewardOnly?: boolean; unlockHint?: string }; unlocked: boolean; favorite: boolean; onToggleFavorite: () => void }) {
  const frame = rarityFrame(skin.rarity)
  const halloween = skin.category === 'halloween'
  const christmas = skin.category === 'navidad' || skin.category === 'Navidad'
  const seasonal = halloween || christmas
  return <article style={frame.style} className={`relative overflow-hidden rounded-2xl border bg-[var(--surface)] p-3 ${frame.className} ${halloween ? 'bg-gradient-to-br from-[#1b0d14] to-[#3b1424]' : christmas ? 'bg-gradient-to-br from-[#10261c] to-[#174c3e]' : ''}`}>
    {seasonal && <span className="absolute right-2 top-1 z-10 text-sm" aria-hidden>{halloween ? '🦇' : '❄️'}</span>}
    <div className="grid aspect-square place-items-center rounded-xl bg-[var(--bg)]/50 p-2"><img src={skin.image} alt={skin.name} className={`h-full w-full object-contain ${unlocked ? '' : 'grayscale opacity-45'}`} loading="lazy" /></div>
    <p className="mt-2 truncate text-xs font-bold text-[var(--text)]">{skin.name}</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{unlocked ? 'Desbloqueada' : skin.rewardOnly ? skin.unlockHint ?? 'Recompensa especial' : skin.rarity ?? 'Estilo'}</p>
    <button type="button" aria-label={favorite ? `Quitar ${skin.name} de favoritos` : `Añadir ${skin.name} a favoritos`} aria-pressed={favorite} onClick={onToggleFavorite} className={`absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-white/20 shadow-lg transition hover:scale-110 ${favorite ? 'bg-rose-500 text-white' : 'bg-[var(--surface)]/90 text-rose-400'}`}><Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} /></button>
  </article>
}

function AchievementGallery({ unlockedIds, claimedIds, claimableIds, onClaimAchievement, onClaimMilestone, quackingtonSkinsUnlocked, collectibleDuckSkinsOwned, stats, canViewSeasons, seasonInsignias }: {
  unlockedIds: string[]
  claimedIds: string[]
  claimableIds: string[]
  onClaimAchievement: (id: string) => void
  onClaimMilestone: (id: string) => void
  quackingtonSkinsUnlocked: string[]
  collectibleDuckSkinsOwned: number
  stats: AchievementStats
  canViewSeasons: boolean
  seasonInsignias: Record<string, { count: number; lastYear: number; lastMonth: number }>
}) {
  const regular = ACHIEVEMENTS.filter((achievement) => !achievement.season).sort((a, b) => {
    const rank = (id: string) => claimableIds.includes(id) ? 0 : unlockedIds.includes(id) ? 1 : 2
    const order = rank(a.id) - rank(b.id)
    if (order !== 0) return order
    if (rank(a.id) < 2) return unlockedIds.indexOf(b.id) - unlockedIds.indexOf(a.id)
    return 0
  })
  const total = regular.length
  const earnedCount = claimedIds.filter((id) => regular.some((achievement) => achievement.id === id)).length
  const silverGoal = Math.ceil(total / 2)
  const milestones = [
    { id: 'pato-plateado', name: 'Pato plateado', title: 'Insignia de plata', detail: `${silverGoal} logros reclamados`, ready: earnedCount >= silverGoal, progress: Math.min(earnedCount, silverGoal), target: silverGoal, image: '/quarkington/Skins/Pato%20plateado.png', tone: 'from-slate-100/15 to-slate-400/5' },
    { id: 'pato-dorado', name: 'Pato dorado', title: 'Insignia de oro', detail: 'Todos los logros permanentes reclamados', ready: earnedCount >= total, progress: earnedCount, target: total, image: '/quarkington/Skins/Pato%20dorado.png', tone: 'from-amber-300/20 to-yellow-700/5' },
    { id: 'pato-prisma', name: 'Pato prisma', title: 'Insignia prisma', detail: 'Colección completa de Quackington', ready: collectibleDuckSkinsOwned >= QUACKINGTON_COLLECTIBLE_SKINS.length, progress: collectibleDuckSkinsOwned, target: QUACKINGTON_COLLECTIBLE_SKINS.length, image: '/quarkington/Skins/Pato%20prisma.png', tone: 'from-fuchsia-400/15 via-sky-300/10 to-amber-300/15' },
  ]
  const seasonal = isHalloween2026() ? ACHIEVEMENTS.filter((achievement) => achievement.season) : []

  const achievementRow = (achievement: typeof ACHIEVEMENTS[number]) => {
    const got = unlockedIds.includes(achievement.id)
    const canClaim = claimableIds.includes(achievement.id)
    const rewardSkin = ACHIEVEMENT_SKIN_REWARDS[achievement.id]
    const spiderGoal = achievement.id === 'fantasma-aplastador' ? 50 : 10
    const progress = achievement.season ? Math.min(stats.spiderCrushes, spiderGoal) : 0
    return <div key={achievement.id} className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 ${got ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--surface)]'}`}>
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${got ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
        {achievement.season ? <svg aria-hidden viewBox="0 0 40 40" className="h-7 w-7 text-violet-200" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 15-8-5m9 10-10 1m12 1-8 8m17-15 8-5m-9 10 10 1m-12 1 8 8M14 12 9 7m17 5 5-5M13 28l-4 5m18-5 4 5"/><ellipse cx="20" cy="20" rx="7" ry="8" fill="currentColor"/><circle cx="17.5" cy="18" r="1" fill="var(--surface)" stroke="none"/><circle cx="22.5" cy="18" r="1" fill="var(--surface)" stroke="none"/></svg> : got ? <BadgeCheck className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5"><p className="text-xs font-extrabold text-[var(--text)]">{achievement.title}</p>{achievement.season && <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-[9px] font-bold text-violet-300">{achievement.season.label}</span>}</div>
        <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--text-muted)]">{achievement.desc}</p>
        {achievement.season && <div className="mt-2 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]"><span className="block h-full rounded-full bg-gradient-to-r from-violet-400 to-rose-400 transition-[width]" style={{ width: `${Math.round(progress / spiderGoal * 100)}%` }} /></div><span className="shrink-0 text-[9px] font-bold text-[var(--text-muted)]">{progress}/{spiderGoal}</span></div>}
        {!got && achievement.season && !isHalloween2026() && <p className="mt-1 text-[9px] font-semibold text-[var(--text-muted)]">Temporada cerrada · {achievement.season.period}</p>}
      </div>
      <div className="shrink-0 text-right">
        {canClaim ? <button onClick={() => onClaimAchievement(achievement.id)} className="min-h-9 rounded-lg bg-[var(--accent)] px-2.5 text-[10px] font-extrabold text-[var(--bg)]">{rewardSkin ? 'Reclamar skin' : `Reclamar +${achievement.reward}`}</button> : got ? <Check className="ml-auto h-4 w-4 text-emerald-400" /> : <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2 py-1 text-[9px] font-bold text-[var(--text-muted)]">{rewardSkin ? 'Fox Fantasma' : `+${achievement.reward}`} {!rewardSkin && <CoinIcon className="h-3 w-3" />}</span>}
      </div>
    </div>
  }

  return <div className="space-y-5">
    {seasonal.length > 0 && <section className="space-y-2 rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/5 to-rose-500/5 p-3 sm:p-4"><div className="flex items-center gap-2"><Medal className="h-4 w-4 text-violet-300" /><div><h3 className="text-sm font-extrabold text-[var(--text)]">Logros de temporada</h3><p className="text-[10px] text-[var(--text-muted)]">Eventos por tiempo limitado; cada uno conserva su temporada y año.</p></div></div>{seasonal.map(achievementRow)}</section>}
    <section className="space-y-2"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-extrabold text-[var(--text)]">Logros de Quacker</h3><span className="text-[10px] text-[var(--text-muted)]">{earnedCount} conseguidos</span></div>{regular.map(achievementRow)}</section>
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="text-sm font-extrabold text-[var(--text)]">Insignias de colección</h3><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Plata y oro se obtienen con logros; prisma, al completar la colección de Quackington.</p></div><span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[10px] font-extrabold text-[var(--accent)]">{earnedCount}/{total}</span></div>
      <div className="grid gap-2 sm:grid-cols-3">{milestones.map((badge) => {
        const claimed = quackingtonSkinsUnlocked.includes(badge.id)
        return <article key={badge.id} className={`flex min-w-0 items-center gap-2.5 rounded-xl border border-[var(--border)] bg-gradient-to-br ${badge.tone} p-2.5`}>
          <img src={badge.image} alt={badge.name} className="h-14 w-14 shrink-0 object-contain" loading="lazy" />
          <div className="min-w-0 flex-1"><p className="text-[9px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{badge.title}</p><p className="truncate text-xs font-extrabold text-[var(--text)]">{badge.name}</p><p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{claimed ? 'Ya está en tu colección' : `${badge.progress}/${badge.target} · ${badge.detail}`}</p><button onClick={() => onClaimMilestone(badge.id)} disabled={!badge.ready || claimed} className="mt-1.5 min-h-7 rounded-lg bg-[var(--accent)] px-2 text-[9px] font-extrabold text-[var(--bg)] disabled:bg-[var(--surface-2)] disabled:text-[var(--text-muted)]">{claimed ? 'Desbloqueada' : badge.ready ? 'Reclamar insignia' : 'Sigue avanzando'}</button></div>
        </article>
      })}</div>
    </section>

    {canViewSeasons && <section className="space-y-3 rounded-2xl border border-sky-300/20 bg-gradient-to-br from-sky-400/5 to-violet-400/5 p-3 sm:p-4">
      <div className="flex items-center gap-2"><Medal className="h-4 w-4 text-sky-300" /><div><h3 className="text-sm font-extrabold text-[var(--text)]">Insignias de Temporada</h3><p className="text-[10px] text-[var(--text-muted)]">Tu colección del panel de Temporadas.</p></div></div>
      {Object.keys(seasonInsignias).length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{CATALOG.filter((entry) => seasonInsignias[entry.key]).map((entry) => {
        const badge = seasonInsignias[entry.key]
        return <SeasonThemeCard key={entry.key} entry={entry} count={badge.count} year={badge.lastYear} badgeSize={52} className="min-h-[164px] !rounded-xl !p-2" footer={<span className="text-[9px] font-semibold text-[var(--text-muted)]">{badge.count} {badge.count === 1 ? 'temporada' : 'temporadas'}</span>} />
      })}</div> : <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">Aún no tienes insignias de temporada. Confirma tu primera temporada para verla aquí.</p>}
    </section>}

  </div>
}

export default function FoxShop() {
  const location = useLocation()
  const { equipped, unlocked, coins, premium, premiumUntil, pet, quackingtonOwned, quackingtonSkin, quackingtonSkinsUnlocked, halloween2026SpiderCrushes, favoriteFoxSkins, favoriteQuackingtonSkins, toggleFavoriteSkin, equipSkin, unlockSkin, setPet, unlockQuackington, equipQuackingtonSkin, unlockQuackingtonSkin, grantQuackingtonSkin } = useFoxSkinsStore()
  const user = useAuthStore((s) => s.user)
  const canViewSeasons = canAccessSeasons(user?.email)
  const seasonInsignias = useSeasonsStore((s) => s.insignias)
  const notificationsOn = useSettingsStore((s) => s.notificationsOn)
  const infinite = useInfiniteCoins()
  const [tab, setTab] = useState<'skins' | 'coins' | 'patos' | 'fox' | 'inventario' | 'logros' | 'apariencia'>(() => new URLSearchParams(location.search).get('panel') === 'temas' ? 'apariencia' : 'skins')
  const [achievementModalOpen, setAchievementModalOpen] = useState(false)
  const [premiumInfoOpen, setPremiumInfoOpen] = useState(false)
  const [duckFilter, setDuckFilter] = useState<QuackingtonSkinCategory>('Todos')
  const [inventoryPet, setInventoryPet] = useState<'fox' | 'quackington'>('fox')
  const [inventoryRarity, setInventoryRarity] = useState('Todas')
  const [inventoryOrder, setInventoryOrder] = useState('default')
  const [inventoryPack, setInventoryPack] = useState('Todos')
  const [halloweenMessage] = useState(() => HALLOWEEN_MESSAGES[Math.floor(Math.random() * HALLOWEEN_MESSAGES.length)])
  const [buying, setBuying] = useState(false)
  const [redeemingPremium, setRedeemingPremium] = useState(false)
  const setPurchaseMsg = (message: string) => { if (message) notifyApp({ title: 'Tienda', message, kind: /no se pudo|no tienes|error/i.test(message) ? 'error' : 'success' }) }
  const setSkinGiftMsg = (message: string) => { if (message) notifyApp({ title: 'Regalo de tu mascota', message, kind: 'success' }) }
  const [claimableIds, setClaimableIds] = useState<string[]>(() => claimableAchievements())
  const visibleClaimableIds = isHalloween2026()
    ? claimableIds
    : claimableIds.filter((id) => !ACHIEVEMENTS.some((achievement) => achievement.id === id && achievement.season))
  const [foxDailyIndex, setFoxDailyIndex] = useState(0)
  const [duckDailyIndex, setDuckDailyIndex] = useState(0)
  const [rotationDay, setRotationDay] = useState(() => new Date().toDateString())
  const foxDailyCarousel = useDragScroll<HTMLDivElement>()
  const duckDailyCarousel = useDragScroll<HTMLDivElement>()
  const skinGiftTimerRef = useRef<number | null>(null)
  const [pendingSkin, setPendingSkin] = useState<{ kind: 'fox'; skin: FoxSkin; price: number } | { kind: 'duck'; skin: QuackingtonSkin; price: number } | null>(null)
  const dailyRotation = useMemo(() => getDailyRotation(), [rotationDay])
  const duckDailyRotation = useMemo(() => getDailySelection(QUACKINGTON_COLLECTIBLE_SKINS.filter((skin) => skin.id !== 'animado' && isQuackingtonSkinAvailable(skin)), 'quackington', 5), [rotationDay])
  const foxSale = getWeekendDiscount(new Date(), dailyRotation)
  const duckSale = getWeekendDiscount(new Date(), duckDailyRotation)
  const seasonalPack = useMemo(() => getSeasonalPack(), [rotationDay])
  const duckCollectionSkins = QUACKINGTON_SKINS.filter((skin) => !['pato-dorado', 'pato-plateado', 'pato-prisma'].includes(skin.id))
  const duckSkins = duckCollectionSkins.filter((skin) => duckFilter === 'Todos' || skin.category === duckFilter)
  const mySkins = FOX_SKINS.filter((s) => unlocked.includes(s.id))
  const inventoryFoxSkins = mySkins
    .filter((skin) => inventoryRarity === 'Todas' || skin.rarity === inventoryRarity)
    .filter((skin) => inventoryPack === 'Todos' || (inventoryPack === 'Halloween' ? skin.category === 'halloween' : inventoryPack === 'Navidad' ? skin.category === 'navidad' : inventoryPack === 'Musical' ? skin.category === 'musical' : skin.category === 'normal'))
    .sort((a, b) => inventoryOrder === 'cheap' ? a.cost - b.cost : inventoryOrder === 'expensive' ? b.cost - a.cost : inventoryOrder === 'rarity' ? (['Básico','Especial','Raro','Épico','Demon','Legendario','Exclusivo'].indexOf(a.rarity ?? '') - ['Básico','Especial','Raro','Épico','Demon','Legendario','Exclusivo'].indexOf(b.rarity ?? '')) : 0)
  const inventoryDuckSkins = QUACKINGTON_SKINS.filter((skin) => quackingtonSkinsUnlocked.includes(skin.id))
    .filter((skin) => inventoryRarity === 'Todas' || skin.rarity === inventoryRarity)
    .sort((a, b) => inventoryOrder === 'cheap' ? a.cost - b.cost : inventoryOrder === 'expensive' ? b.cost - a.cost : inventoryOrder === 'rarity' ? (['Básico','Especial','Raro','Épico','Demon','Legendario','Exclusivo'].indexOf(a.rarity ?? '') - ['Básico','Especial','Raro','Épico','Demon','Legendario','Exclusivo'].indexOf(b.rarity ?? '')) : 0)
  const tasks = useTasksStore((s) => s.tasks)
  const unlockedIds = unlockedAchievements()
  const claimedIds = claimedAchievements()
  const achStats = computeAchievementStats(tasks, halloween2026SpiderCrushes)
  const collectibleDuckSkinsOwned = QUACKINGTON_COLLECTIBLE_SKINS.filter((skin) => quackingtonSkinsUnlocked.includes(skin.id)).length
  const duckCollectionOwned = duckCollectionSkins.filter((skin) => quackingtonSkinsUnlocked.includes(skin.id)).length

  useEffect(() => {
    if (!user) return
    void scheduleFavoriteSkinNotice({
      uid: user.uid,
      enabled: notificationsOn,
      favoriteFoxIds: favoriteFoxSkins,
      favoriteDuckIds: favoriteQuackingtonSkins,
      quackingtonOwned,
    })
  }, [favoriteFoxSkins, favoriteQuackingtonSkins, notificationsOn, quackingtonOwned, user])

  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setHours(24, 0, 0, 50)
    const timer = window.setTimeout(() => setRotationDay(new Date().toDateString()), Math.max(1000, tomorrow.getTime() - Date.now()))
    return () => window.clearTimeout(timer)
  }, [rotationDay])

  useEffect(() => {
    const track = tab === 'fox' ? foxDailyCarousel.ref.current : tab === 'patos' ? duckDailyCarousel.ref.current : null
    const count = tab === 'fox' ? dailyRotation.length : duckDailyRotation.length
    if (!track || !count) return
    const frame = window.requestAnimationFrame(() => centerCarouselCard(track, count))
    return () => window.cancelAnimationFrame(frame)
  }, [tab, rotationDay, dailyRotation.length, duckDailyRotation.length, foxDailyCarousel.ref, duckDailyCarousel.ref])

  const syncDailyCarousel = (pet: 'fox' | 'duck') => {
    const track = pet === 'fox' ? foxDailyCarousel.ref.current : duckDailyCarousel.ref.current
    const count = pet === 'fox' ? dailyRotation.length : duckDailyRotation.length
    if (!track || !count) return
    const absoluteIndex = nearestCarouselCard(track)
    if (absoluteIndex < 0) return
    const index = absoluteIndex % count
    if (pet === 'fox') setFoxDailyIndex(index)
    else setDuckDailyIndex(index)
    if (absoluteIndex < count || absoluteIndex >= count * 2) centerCarouselCard(track, count + index, 'auto')
  }

  const moveDailyCarousel = (pet: 'fox' | 'duck', delta: number) => {
    const track = pet === 'fox' ? foxDailyCarousel.ref.current : duckDailyCarousel.ref.current
    const count = pet === 'fox' ? dailyRotation.length : duckDailyRotation.length
    const index = pet === 'fox' ? foxDailyIndex : duckDailyIndex
    if (!track || !count) return
    const next = (index + delta + count) % count
    if (pet === 'fox') setFoxDailyIndex(next)
    else setDuckDailyIndex(next)
    centerCarouselCard(track, count + next)
  }

  useEffect(() => {
    const refresh = () => setClaimableIds(claimableAchievements())
    window.addEventListener('tasklex:achievement-pending', refresh)
    return () => window.removeEventListener('tasklex:achievement-pending', refresh)
  }, [])

  useEffect(() => {
    if (!user) return
    let active = true
    const checkSkinGift = async () => {
      try {
        const response = await fetch(apiUrl('/api/claim-skin-gift'), { method: 'POST', headers: await authHeaders(), body: JSON.stringify({}) })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) return
        if (data.status === 'cooldown' && typeof data.nextAt === 'number' && active) {
          const wait = Math.min(Math.max(1000, data.nextAt - Date.now() + 500), 2147483000)
          skinGiftTimerRef.current = window.setTimeout(() => { void checkSkinGift() }, wait)
          return
        }
        if (data.status !== 'claimed') return
        useFoxSkinsStore.setState({ coins: data.coins })
        const giftedSkinName = data.pet === 'quackington'
          ? QUACKINGTON_SKINS.find((skin) => skin.id === data.skinId)?.name
          : FOX_SKINS.find((skin) => skin.id === data.skinId)?.name
        setSkinGiftMsg(`¡${giftedSkinName ?? 'Tu mascota'} te dejó un regalo! +${data.amount} monedas.`)
        celebrate(22)
        window.setTimeout(() => setSkinGiftMsg(''), 7000)
      } catch {}
    }
    const timer = window.setTimeout(() => { void checkSkinGift() }, 600)
    return () => {
      active = false
      window.clearTimeout(timer)
      if (skinGiftTimerRef.current !== null) window.clearTimeout(skinGiftTimerRef.current)
      skinGiftTimerRef.current = null
    }
  }, [user?.uid, pet, equipped, quackingtonSkin])

  const claimReward = async (id: string) => {
    const achievement = ACHIEVEMENTS.find((item) => item.id === id)
    if (!achievement || !claimableAchievements().includes(id)) return
    if (!(await useFoxSkinsStore.getState().addCoins(achievement.reward, id))) {
      setPurchaseMsg('No se pudo reclamar la recompensa. Inténtalo de nuevo.')
      return
    }
    claimAchievement(id)
    setClaimableIds(claimableAchievements())
    celebrate(24)
    window.dispatchEvent(new Event('tasklex:achievement-pending'))
    const skinReward = ACHIEVEMENT_SKIN_REWARDS[id]
    setPurchaseMsg(skinReward ? '¡Fox Fantasma se añadió a tu colección!' : `¡Recompensa reclamada! +${achievement.reward} monedas`)
    setTimeout(() => setPurchaseMsg(''), 4500)
  }

  const claimMilestoneSkin = async (skinId: string) => {
    if (await grantQuackingtonSkin(skinId)) {
      const skin = QUACKINGTON_SKINS.find((item) => item.id === skinId)
      if (skinId === 'pato-dorado') {
        setPurchaseMsg('¡Premio completo! Pato dorado, 3 skins aleatorias y 60 días de Premium.')
      } else {
        setPurchaseMsg(`${skin?.name ?? 'Recompensa'} añadida a tu inventario.`)
      }
      setTimeout(() => setPurchaseMsg(''), 4500)
    }
  }

  const handleBuySkin = (skin: FoxSkin, price = foxSale?.skinId === skin.id ? Math.round(skin.cost * (100 - foxSale.percent) / 100) : skin.cost) => {
    setPendingSkin({ kind: 'fox', skin, price })
  }

  const confirmBuySkin = async () => {
    if (!pendingSkin) return
    const purchase = pendingSkin.kind === 'fox'
      ? unlockSkin(pendingSkin.skin.id, pendingSkin.price)
      : unlockQuackingtonSkin(pendingSkin.skin.id, pendingSkin.price)
    const purchased = await purchase
    if (purchased) {
      playPurchaseSound()
      setPurchaseMsg(`${pendingSkin.skin.name} desbloqueada${pendingSkin.kind === 'duck' && !quackingtonOwned ? '; la podrás equipar cuando tengas a Sir Quackington' : ' y equipada'}`)
      setTimeout(() => setPurchaseMsg(''), 5000)
    } else {
      setPurchaseMsg(getLastEconomyError() ?? (infinite ? 'No se pudo validar la compra. Reintenta en un momento; tu saldo no se consume.' : 'No tienes suficientes monedas'))
      setTimeout(() => setPurchaseMsg(''), 5000)
    }
    setPendingSkin(null)
  }

  const handleBuyDuckSkin = (skin: QuackingtonSkin, price = duckSale?.skinId === skin.id ? Math.round(skin.cost * (100 - duckSale.percent) / 100) : skin.cost) => setPendingSkin({ kind: 'duck', skin, price })

  const handleBuyQuackington = async () => {
    if (await unlockQuackington()) {
      playDuckPurchaseSound()
      setPurchaseMsg('Sir Quackington se une a tu equipo')
      setTimeout(() => setPurchaseMsg(''), 6000)
    } else {
      setPurchaseMsg(getLastEconomyError() ?? (infinite ? 'No se pudo validar la compra. Reintenta en un momento; tu saldo no se consume.' : 'No tienes suficientes monedas'))
      setTimeout(() => setPurchaseMsg(''), 6000)
    }
  }

  const handleCheckout = async (packId: string) => {
    if (!user) return
    setBuying(true)
    try {
      const res = await fetch(apiUrl('/api/checkout'), {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ packId, uid: user.uid }),
      })
      const data = await res.json()
      if (data.url) {
        localStorage.setItem(PENDING_KEY, JSON.stringify({ paymentLink: data.paymentLink, uid: user.uid, at: Date.now() }))
        if (Capacitor.getPlatform() === 'android') {
          await Browser.open({ url: data.url })
        } else {
          window.location.href = data.url
        }
      } else {
        setPurchaseMsg('No se pudo abrir el pago. Inténtalo de nuevo.')
      }
    } catch {
      setPurchaseMsg('No se pudo conectar con la pasarela de pago. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setBuying(false)
    }
  }

  const handleRedeemPremium = async () => {
    if (!user || redeemingPremium) return
    setRedeemingPremium(true)
    try {
      const response = await fetch(apiUrl('/api/redeem-premium'), {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({}),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(String(data.error ?? 'No se pudo canjear Premium.'))
      useFoxSkinsStore.setState({ coins: data.coins, premium: true, premiumUntil: data.premiumUntil })
      playPremiumUnlockSound()
      setPurchaseMsg('¡Premium activado por 30 días! Se descontaron 1.800 monedas.')
    } catch (error) {
      setPurchaseMsg(error instanceof Error ? error.message : 'No se pudo canjear Premium.')
    } finally {
      setRedeemingPremium(false)
      setTimeout(() => setPurchaseMsg(''), 6000)
    }
  }

  useEffect(() => {
    let busy = false
    let retryTimer: number | null = null
    let retryCount = 0
    const checkPending = async () => {
      if (busy || buying) return
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      const raw = localStorage.getItem(PENDING_KEY)
      if (!raw) return
      let p: { paymentLink?: string; uid?: string; at?: number }
      try {
        p = JSON.parse(raw)
      } catch {
        localStorage.removeItem(PENDING_KEY)
        return
      }
      if (!p?.paymentLink || !user || p.uid !== user.uid || (typeof p.at === 'number' && Date.now() - p.at > PENDING_TTL)) {
        localStorage.removeItem(PENDING_KEY)
        return
      }
      busy = true
      try {
        const res = await fetch(apiUrl('/api/verify'), {
          method: 'POST',
          headers: await authHeaders(),
          body: JSON.stringify({ paymentLink: p.paymentLink, uid: user.uid }),
        })
        const data = await res.json()
        if (data.verified && !data.already) {
          localStorage.removeItem(PENDING_KEY)
          if (data.credited === 'premium') playPremiumUnlockSound()
          else if (data.credited === 'quackington') playDuckPurchaseSound()
          else playPurchaseSound()
          setPurchaseMsg(
            data.credited === 'premium'
              ? 'Premium activado con éxito'
              : data.credited === 'quackington'
                ? 'Sir Quackington se une a tu equipo'
                : 'Monedas acreditadas con éxito',
          )
          setTimeout(() => setPurchaseMsg(''), 6000)
        } else if (data.reason === 'referencia_invalida') {
          localStorage.removeItem(PENDING_KEY)
        } else if (data.verified && data.already) {
          localStorage.removeItem(PENDING_KEY)
        } else if (retryCount < 5) {
          retryTimer = window.setTimeout(() => { retryCount++; void checkPending() }, Math.min(60000, 5000 * 2 ** retryCount))
        }
      } catch {
        if (retryCount < 5) retryTimer = window.setTimeout(() => { retryCount++; void checkPending() }, Math.min(60000, 5000 * 2 ** retryCount))
      } finally {
        busy = false
      }
    }
    checkPending()
    window.addEventListener('pageshow', checkPending)
    document.addEventListener('visibilitychange', checkPending)
    const browserFinished = Browser.addListener('browserFinished', () => { void checkPending() })
    return () => {
      if (retryTimer !== null) window.clearTimeout(retryTimer)
      void browserFinished.then((listener) => listener.remove())
      window.removeEventListener('pageshow', checkPending)
      document.removeEventListener('visibilitychange', checkPending)
    }
  }, [user, buying])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
        <div className="relative flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 pb-14 sm:p-6 sm:pb-14">
          <div className="flex items-center gap-2">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent)]/15"><ShoppingBag className="h-5 w-5 text-[var(--accent)]" /></div>
            <div><h1 data-tut="shop-title" className="text-xl font-extrabold tracking-tight text-[var(--text)] sm:text-2xl">Tienda de Sr. Quackington</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 text-sm font-bold text-[var(--accent)]">
              <CoinIcon className="h-5 w-5" /> {infinite ? '∞' : coins} <span className="text-[var(--text-muted)]">monedas</span>
            </span>
          </div>
          <button type="button" onClick={() => setAchievementModalOpen(true)} aria-label="Abrir galería de logros e insignias" title="Galería de logros" className="absolute bottom-2.5 right-3 grid h-10 w-10 place-items-center rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-200/15 to-[var(--surface-2)] text-amber-200 shadow-[0_5px_20px_rgba(245,158,11,.12)] transition hover:-translate-y-0.5 hover:border-amber-200/70 hover:shadow-[0_8px_25px_rgba(245,158,11,.22)] sm:bottom-3 sm:right-4"><Medal className="h-5 w-5" /></button>
        </div>

        <div className="sticky top-0 z-20 shop-nav grid grid-cols-3 gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-1.5 shadow-md backdrop-blur-md">
          <button onClick={() => setTab('patos')} className={`shop-nav-duck flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-colors ${tab === 'patos' ? 'bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 text-amber-950 shadow-[0_0_18px_rgba(250,204,21,0.35)]' : 'text-amber-300 hover:bg-amber-400/10'}`}>
            <Bird className="h-4 w-4" /> Tienda de Quackington
          </button>
          <button onClick={() => setTab('fox')} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-colors ${tab === 'fox' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}>
            <Sparkles className="h-4 w-4" /> Estilos de Fox
          </button>
          <button onClick={() => setTab('skins')} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-colors ${tab === 'skins' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}>
            <ShoppingBag className="h-4 w-4" /> Tienda
          </button>
          <button onClick={() => setTab('coins')} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-colors ${tab === 'coins' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}>
            <CoinIcon className="h-4 w-4" /> Monedas
          </button>
          <button onClick={() => setTab('inventario')} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-colors ${tab === 'inventario' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}>
            <Backpack className="h-4 w-4" /> Inventario
          </button>
          <button onClick={() => setTab('logros')} className={`relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-colors ${tab === 'logros' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}>
            <Trophy className="mr-1 inline h-3.5 w-3.5" /> Logros ({unlockedIds.length}/{ACHIEVEMENTS.length})
            {visibleClaimableIds.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500 ring-2 ring-[var(--surface)]" />}
          </button>
          <button onClick={() => setTab('apariencia')} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-colors ${tab === 'apariencia' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}>
            <Palette className="h-4 w-4" /> Temas
          </button>
        </div>

        <div className="min-h-[55vh]">
          {tab === 'apariencia' ? (
            <section className="mx-auto max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
              <div className="mb-4 flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]"><Palette className="h-5 w-5" /></span><div><h2 className="text-lg font-extrabold text-[var(--text)]">Temas y acentos</h2><p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">Completa logros para ganar monedas, desbloquea la personalización y dale a Quacker el estilo que quieras.</p></div></div>
              <ThemeSelector />
            </section>
          ) : tab === 'skins' ? (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))' }}>
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-xl" />
                <div className="pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                <button onClick={() => setPremiumInfoOpen(true)} aria-label="Qué puede hacer el asistente Premium" title="Ver todo lo que incluye" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-black/10 text-[var(--bg)] transition hover:bg-black/20">
                  <Info className="h-4 w-4" />
                </button>
                {premium ? (
                  <>
                    <Crown className="mx-auto h-10 w-10 text-[var(--bg)]" fill="currentColor" />
                    <p className="mt-2 text-lg font-extrabold uppercase tracking-wide text-[var(--bg)]">Ya eres Quacker Premium</p>
                    <p className="mt-1 text-xs font-medium text-[var(--bg)]/80">
                      {premiumUntil
                        ? `Activo hasta el ${new Date(premiumUntil).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : 'Disfruta de todas las funciones desbloqueadas'}
                    </p>
                  </>
                ) : (
                  <>
                    <Sparkles className="mx-auto h-9 w-9 text-[var(--bg)]" />
                    <h2 className="mt-2 text-xl font-extrabold uppercase tracking-wide text-[var(--bg)]">Quacker Premium</h2>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--bg)]/80">
                      Una mascota inteligente que te ayuda a organizar la app. Premium también desbloquea a Quackington.
                    </p>
                  </>
                )}
              </div>

              {!premium && (
                <>
                  <div className="space-y-2">
                    {PREMIUM_FEATURES.map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15">
                          <Icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-[var(--accent)]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text)]">{title}</p>
                          <p className="text-[11px] leading-snug text-[var(--text-muted)]">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCheckout('premium-anual')}
                      disabled={buying}
                      className="relative flex flex-col items-center gap-1 overflow-hidden rounded-xl border-2 border-fuchsia-300/70 bg-gradient-to-br from-cyan-100/90 via-fuchsia-100/90 to-amber-100/90 p-4 text-slate-900 shadow-[0_0_20px_rgba(217,70,239,0.18)] transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
                    >
                      <span className="absolute right-2 top-2 rounded-full bg-white/75 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-fuchsia-800">Prisma · Ahorra 35%</span>
                      <img src="/coins/Icons/Premium%20PLUS.png" alt="Premium anual Prisma" className="h-20 w-20 rounded-xl object-cover shadow-sm" />
                      <span className="text-xs font-semibold text-slate-700">Premium anual</span>
                      <span className="text-xl font-extrabold text-fuchsia-800">$59.900</span>
                      <span className="text-[10px] text-slate-600">COP al año</span>
                    </button>
                    <button
                      onClick={() => handleCheckout('premium-mensual')}
                      disabled={buying}
                      className="flex flex-col items-center gap-1 rounded-xl border-2 border-amber-400/70 bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-100 p-4 text-amber-950 shadow-[0_0_18px_rgba(245,158,11,0.15)] transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
                    >
                      <span className="rounded-full bg-white/75 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-800">Dorado</span>
                      <img src="/coins/Icons/Premium.png" alt="Premium mensual dorado" className="h-20 w-20 rounded-xl object-cover shadow-sm" />
                      <span className="text-xs font-semibold text-amber-900">Premium mensual</span>
                      <span className="text-xl font-extrabold text-amber-800">$7.900</span>
                      <span className="text-[10px] text-amber-800/80">COP al mes</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleCheckout('premium-anual')}
                    disabled={buying}
                    className="w-full rounded-xl py-3.5 text-sm font-extrabold uppercase tracking-wide text-[var(--bg)] shadow-lg transition-transform hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))' }}
                  >
                    {buying ? 'Abriendo pago...' : 'Ser Premium'}
                  </button>
                  <p className="-mt-2 text-center text-[10px] text-[var(--text-muted)]">Pago único · Pagos seguros vía Bold</p>
                  <button
                    onClick={handleRedeemPremium}
                    disabled={!user || redeemingPremium || coins < 1800}
                    className="w-full rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-4 py-3 text-sm font-bold text-[var(--accent)] transition hover:bg-[var(--accent)]/20 disabled:opacity-50"
                  >
                    {redeemingPremium ? 'Canjeando…' : <>Canjear 30 días con 1.800 monedas <CoinIcon className="ml-1 inline h-4 w-4" /></>}
                  </button>
                  {!user && <p className="text-center text-[10px] text-[var(--text-muted)]">Inicia sesión para canjear con monedas.</p>}
                </>
              )}

              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{quackingtonOwned ? 'Mascota activa' : 'Tu mascota incluida'}</span>
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-20 shrink-0 place-items-center">{quackingtonOwned && pet === 'quackington' ? <QuackingtonSkinPet skinId={quackingtonSkin} size={76} effects idleQuotes={false} /> : <img src={FOX_SKINS.find((skin) => skin.id === equipped)?.image ?? FOX_SKINS[0].image} alt="Fox incluida" className="h-full w-full object-contain" loading="lazy" />}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-extrabold text-[var(--text)]">{quackingtonOwned && pet === 'quackington' ? 'Sir Quackington' : 'Fox'}</p>{!quackingtonOwned && <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-300">Incluida</span>}</div>
                      <p className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">{quackingtonOwned && pet === 'quackington' ? 'Tu compañero de pan te saluda, se mueve contigo y reacciona a lo que pasa.' : 'Fox viene incluida con Quacker. Personaliza sus estilos en la sección “Estilos de Fox”.'}</p>
                    </div>
                  </div>
                  {quackingtonOwned && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPet('fox')}
                        className={`rounded-xl py-2 text-xs font-semibold transition-colors ${
                          pet === 'fox' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)]/60'
                        }`}
                      >
                        {pet === 'fox' ? 'Fox equipada' : 'Equipar Fox'}
                      </button>
                      <button
                        onClick={() => setPet('quackington')}
                        className={`rounded-xl py-2 text-xs font-semibold transition-colors ${
                          pet === 'quackington' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)]/60'
                        }`}
                      >
                        {pet === 'quackington' ? 'Sir Quackington equipado' : 'Equipar Sir Quackington'}
                      </button>
                    </div>
                  )}
                </div>
                {!quackingtonOwned && <div className="mt-3 flex items-center gap-3 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-300/10 via-[var(--surface)] to-[var(--surface)] p-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-300/10"><QuackingtonSkinPet skinId={quackingtonSkin} size={44} effects={false} idleQuotes={false} /></div>
                  <div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-[var(--text)]">Sir Quackington · mascota opcional</p><p className="mt-0.5 text-[10px] leading-relaxed text-[var(--text-muted)]">Fox seguirá incluida. Si quieres, añade también a Quackington por 1.000 monedas o $12.900 COP.</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button onClick={handleBuyQuackington} disabled={infinite ? false : coins < 1000} className="min-h-9 rounded-lg bg-[var(--accent)] px-2 text-[10px] font-extrabold text-[var(--bg)] disabled:opacity-40">Desbloquear · 1.000 <CoinIcon className="ml-1 inline h-3.5 w-3.5" /></button>
                      <button onClick={() => handleCheckout('quackington')} disabled={buying} className="min-h-9 rounded-lg border border-amber-300/35 bg-amber-300/10 px-2 text-[10px] font-extrabold text-amber-200 disabled:opacity-50">Desbloquear · $12.900</button>
                    </div>
                  </div>
                </div>}
              </div>

            </div>
          ) : tab === 'patos' ? (
            <div className="space-y-5">
              <h2 className="text-center text-xl font-extrabold tracking-tight text-[var(--text)]">Skins de Quackington</h2>
              <p className="text-center text-xs font-semibold text-[var(--text-muted)]">{Math.max(0, duckCollectionOwned - 1)} de {duckCollectionSkins.length - 1} estilos desbloqueados</p>
              {!quackingtonOwned && (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">Puedes coleccionar estilos ahora y equiparlos cuando Sir Quackington se una a tu equipo.</p>
              )}
              {quackingtonOwned && <section aria-label="Selección diaria premium de estilos de pato" className="min-w-0 max-w-full overflow-hidden rounded-2xl border-2 border-amber-400/70 bg-gradient-to-br from-amber-400/10 via-[var(--surface-2)]/70 to-yellow-200/10 p-3 shadow-[0_0_22px_rgba(250,204,21,0.12)] sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div><h2 className="text-sm font-bold text-amber-300">Selección premium diaria · 5 estilos</h2><p className="mt-1 text-[11px] text-[var(--text-muted)] lg:hidden">Arrastra la cinta; al soltar, la skin más cercana queda centrada.</p>{duckSale && <span className="mt-1 inline-flex rounded-full bg-rose-500/15 px-2 py-1 text-[10px] font-bold text-rose-400">Oferta de fin de semana · −{duckSale.percent}%</span>}</div>
                  <div className="flex gap-1 lg:hidden">
                    <button aria-label="Estilo diario anterior" onClick={() => moveDailyCarousel('duck', -1)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"><ChevronLeft className="h-4 w-4" /></button>
                    <button aria-label="Siguiente estilo diario" onClick={() => moveDailyCarousel('duck', 1)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
                <div ref={duckDailyCarousel.ref} onPointerDown={duckDailyCarousel.onPointerDown} onClickCapture={duckDailyCarousel.onClickCapture} onScroll={() => syncDailyCarousel('duck')} className="flex snap-x snap-mandatory select-none cursor-grab gap-3 overflow-x-auto py-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:cursor-default lg:overflow-visible lg:snap-none" style={{ touchAction: 'pan-y' }}>
                  <div aria-hidden className="w-[10%] shrink-0 lg:hidden" />
                  {[...duckDailyRotation, ...duckDailyRotation, ...duckDailyRotation].map((skin, absoluteIndex) => { const sale = duckSale?.skinId === skin.id ? { percent: duckSale.percent, price: Math.round(skin.cost * (100 - duckSale.percent) / 100) } : undefined; return <div key={`${absoluteIndex}-${skin.id}`} data-carousel-card className={`${absoluteIndex >= duckDailyRotation.length ? 'lg:hidden ' : ''}min-w-0 shrink-0 basis-[80%] snap-center lg:basis-auto lg:snap-none`}><DuckSkinCard skin={skin} equipped={quackingtonSkin === skin.id} unlocked={quackingtonSkinsUnlocked.includes(skin.id)} canAfford={infinite || coins >= (sale?.price ?? skin.cost)} quackingtonOwned={quackingtonOwned} onEquip={() => equipQuackingtonSkin(skin.id)} onBuy={() => handleBuyDuckSkin(skin, sale?.price)} discount={sale} favorite={favoriteQuackingtonSkins.includes(skin.id)} onToggleFavorite={() => toggleFavoriteSkin('quackington', skin.id)} /></div> })}
                  <div aria-hidden className="w-[10%] shrink-0 lg:hidden" />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 lg:hidden"><span aria-live="polite" className="text-[10px] font-semibold text-[var(--text-muted)]">{duckDailyIndex + 1} de {duckDailyRotation.length}</span><div className="flex gap-1.5">{duckDailyRotation.map((skin, i) => <button key={skin.id} aria-label={`Centrar estilo diario ${i + 1}`} aria-current={i === duckDailyIndex ? 'true' : undefined} onClick={() => { setDuckDailyIndex(i); if (duckDailyCarousel.ref.current) centerCarouselCard(duckDailyCarousel.ref.current, duckDailyRotation.length + i) }} className={`h-1.5 rounded-full transition-all ${i === duckDailyIndex ? 'w-5 bg-[var(--accent)]' : 'w-1.5 bg-[var(--border)]'}`} />)}</div></div>
              </section>}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {QUACKINGTON_SKIN_CATEGORIES.map((category) => (
                  <button key={category} onClick={() => setDuckFilter(category)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${duckFilter === category ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                    {category}
                  </button>
                ))}
              </div>
              <section className="space-y-2"><h2 className="text-sm font-extrabold text-[var(--text)]">Favoritos de Quackington</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{QUACKINGTON_SKINS.filter((skin) => favoriteQuackingtonSkins.includes(skin.id)).map((skin) => <CollectionSkinTile key={skin.id} skin={skin} unlocked={quackingtonSkinsUnlocked.includes(skin.id)} favorite onToggleFavorite={() => toggleFavoriteSkin('quackington', skin.id)} />)}{favoriteQuackingtonSkins.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">Marca el corazón de una skin para guardarla aquí.</p>}</div></section>
              <section className="space-y-2"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-extrabold text-[var(--text)]">Colección de Quackington</h2><span className="text-[10px] text-[var(--text-muted)]">{Math.max(0, duckCollectionOwned - 1)}/{duckCollectionSkins.length - 1} desbloqueadas</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{duckSkins.map((skin) => <CollectionSkinTile key={skin.id} skin={skin} unlocked={quackingtonSkinsUnlocked.includes(skin.id)} favorite={favoriteQuackingtonSkins.includes(skin.id)} onToggleFavorite={() => toggleFavoriteSkin('quackington', skin.id)} />)}</div></section>
            </div>
          ) : tab === 'fox' ? (
            <div className="space-y-5">
              <h2 className="text-center text-xl font-extrabold tracking-tight text-[var(--text)]">Skins de Fox</h2>
              <p className="text-center text-xs font-semibold text-[var(--text-muted)]">{unlocked.length} de {FOX_SKINS.length} estilos desbloqueados</p>
              <section aria-label="Selección diaria de estilos de Fox" className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div><h2 className="text-sm font-bold text-[var(--text)]">Selección diaria · 4 estilos</h2><p className="mt-1 text-[11px] text-[var(--text-muted)] lg:hidden">Arrastra la cinta; al soltar, la skin más cercana queda centrada.</p>{foxSale && <span className="mt-1 inline-flex rounded-full bg-rose-500/15 px-2 py-1 text-[10px] font-bold text-rose-400">Oferta de fin de semana · −{foxSale.percent}%</span>}</div>
                  <div className="flex gap-1 lg:hidden">
                    <button aria-label="Estilo diario anterior" onClick={() => moveDailyCarousel('fox', -1)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"><ChevronLeft className="h-4 w-4" /></button>
                    <button aria-label="Siguiente estilo diario" onClick={() => moveDailyCarousel('fox', 1)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
                <div ref={foxDailyCarousel.ref} onPointerDown={foxDailyCarousel.onPointerDown} onClickCapture={foxDailyCarousel.onClickCapture} onScroll={() => syncDailyCarousel('fox')} className="flex snap-x snap-mandatory select-none cursor-grab gap-3 overflow-x-auto py-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:cursor-default lg:overflow-visible lg:snap-none" style={{ touchAction: 'pan-y' }}>
                  <div aria-hidden className="w-[10%] shrink-0 lg:hidden" />
                  {[...dailyRotation, ...dailyRotation, ...dailyRotation].map((skin, absoluteIndex) => { const sale = foxSale?.skinId === skin.id ? { percent: foxSale.percent, price: Math.round(skin.cost * (100 - foxSale.percent) / 100) } : undefined; return <div key={`${absoluteIndex}-${skin.id}`} data-carousel-card className={`${absoluteIndex >= dailyRotation.length ? 'lg:hidden ' : ''}min-w-0 shrink-0 basis-[80%] snap-center lg:basis-auto lg:snap-none`}><SkinCard skin={skin} equipped={equipped === skin.id} unlocked={unlocked.includes(skin.id)} canAfford={infinite || coins >= (sale?.price ?? skin.cost)} onEquip={() => equipSkin(skin.id)} onBuy={() => handleBuySkin(skin, sale?.price)} discount={sale} favorite={favoriteFoxSkins.includes(skin.id)} onToggleFavorite={() => toggleFavoriteSkin('fox', skin.id)} /></div> })}
                  <div aria-hidden className="w-[10%] shrink-0 lg:hidden" />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 lg:hidden"><span aria-live="polite" className="text-[10px] font-semibold text-[var(--text-muted)]">{foxDailyIndex + 1} de {dailyRotation.length}</span><div className="flex gap-1.5">{dailyRotation.map((skin, i) => <button key={skin.id} aria-label={`Centrar estilo diario ${i + 1}`} aria-current={i === foxDailyIndex ? 'true' : undefined} onClick={() => { setFoxDailyIndex(i); if (foxDailyCarousel.ref.current) centerCarouselCard(foxDailyCarousel.ref.current, dailyRotation.length + i) }} className={`h-1.5 rounded-full transition-all ${i === foxDailyIndex ? 'w-5 bg-[var(--accent)]' : 'w-1.5 bg-[var(--border)]'}`} />)}</div></div>
              </section>
              {seasonalPack && seasonalPack !== 'musical' && <section className={`relative overflow-hidden rounded-2xl p-4 text-center ${seasonalPack === 'halloween' ? 'border border-red-950 bg-gradient-to-br from-[#190b10] via-[#39121c] to-[#100b12] text-orange-100' : 'border border-emerald-900 bg-gradient-to-br from-[#10261c] via-[#174c3e] to-[#10231b] text-emerald-50'}`}>
                <span aria-hidden className="absolute left-3 top-2 text-2xl opacity-60">{seasonalPack === 'halloween' ? '🦇' : '❄️'}</span><span aria-hidden className="absolute right-3 top-2 text-2xl opacity-60">{seasonalPack === 'halloween' ? '🕸️' : '❄️'}</span>
                <p className="text-[10px] font-bold uppercase tracking-[.24em]">{seasonalPack === 'halloween' ? 'Edición Halloween · solo octubre' : 'Edición Navidad · solo diciembre'}</p><h2 className="mt-1 text-xl font-black">{SEASON_LABELS[seasonalPack]}</h2><p className="mt-1 text-xs opacity-75">{seasonalPack === 'halloween' ? halloweenMessage : 'Luces, nieve y estilos festivos en la selección diaria.'}</p>
              </section>}
              <section className="space-y-2"><h2 className="text-sm font-extrabold text-[var(--text)]">Tus favoritos de Fox</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{FOX_SKINS.filter((skin) => favoriteFoxSkins.includes(skin.id)).map((skin) => <CollectionSkinTile key={skin.id} skin={skin} unlocked={unlocked.includes(skin.id)} favorite onToggleFavorite={() => toggleFavoriteSkin('fox', skin.id)} />)}{favoriteFoxSkins.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">Guarda aquí los estilos que quieres encontrar.</p>}</div></section>
              <section className="space-y-2"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-extrabold text-[var(--text)]">Colección de Fox</h2><span className="text-[10px] text-[var(--text-muted)]">{unlocked.length}/{FOX_SKINS.length} desbloqueadas</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{FOX_SKINS.map((skin) => <CollectionSkinTile key={skin.id} skin={skin} unlocked={unlocked.includes(skin.id)} favorite={favoriteFoxSkins.includes(skin.id)} onToggleFavorite={() => toggleFavoriteSkin('fox', skin.id)} />)}</div></section>
            </div>
          ) : tab === 'logros' ? (
            <AchievementGallery unlockedIds={unlockedIds} claimedIds={claimedIds} claimableIds={visibleClaimableIds} onClaimAchievement={claimReward} onClaimMilestone={claimMilestoneSkin} quackingtonSkinsUnlocked={quackingtonSkinsUnlocked} collectibleDuckSkinsOwned={collectibleDuckSkinsOwned} stats={achStats} canViewSeasons={canViewSeasons} seasonInsignias={seasonInsignias} />
          ) : tab === 'inventario' ? (
            <div className="space-y-4">
              {(() => {
                const ownedCount = inventoryPet === 'fox' ? mySkins.length : Math.max(0, quackingtonSkinsUnlocked.length - 1)
                const totalCount = inventoryPet === 'fox' ? FOX_SKINS.length : QUACKINGTON_COLLECTIBLE_SKINS.length
                const percent = totalCount ? Math.round(ownedCount / totalCount * 100) : 0
                return <section className="rounded-2xl border border-[var(--accent)]/25 bg-gradient-to-br from-[var(--surface)] to-[var(--accent)]/10 p-4">
                  <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-extrabold text-[var(--text)]">Tu vitrina</p><p className="mt-1 text-xs text-[var(--text-muted)]">{ownedCount} de {totalCount} estilos desbloqueados · {percent}% de la colección</p></div><span className="text-xl font-black text-[var(--accent)]">{percent}%</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500" style={{ width: `${percent}%` }} /></div>
                </section>
              })()}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <select value={inventoryRarity} onChange={(e) => setInventoryRarity(e.target.value)} className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)]"><option>Todas</option>{['Básico','Especial','Raro','Épico','Demon','Legendario','Exclusivo'].map((rarity) => <option key={rarity}>{rarity}</option>)}</select>
                <select value={inventoryOrder} onChange={(e) => setInventoryOrder(e.target.value)} className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)]"><option value="default">Orden original</option><option value="cheap">Más baratas primero</option><option value="expensive">Más caras primero</option><option value="rarity">Por rareza</option></select>
                {inventoryPet === 'fox' && <select value={inventoryPack} onChange={(e) => setInventoryPack(e.target.value)} className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)]"><option>Todos</option><option>Normal</option><option>Halloween</option><option>Navidad</option><option>Musical</option></select>}
              </div>
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Ver inventario por mascota</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInventoryPet('fox')}
                    className={`rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                      inventoryPet === 'fox' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)]/60'
                    }`}
                  >
                    Fox
                  </button>
                  {quackingtonOwned ? (
                    <button
                      onClick={() => setInventoryPet('quackington')}
                      className={`rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                        inventoryPet === 'quackington' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)]/60'
                      }`}
                    >
                      Sir Quackington
                    </button>
                  ) : (
                    <button
                      onClick={() => setTab('skins')}
                      className="rounded-xl border border-dashed border-[var(--accent)]/50 bg-[var(--accent)]/10 py-2.5 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/20"
                    >
                      Desbloquear Sir Quackington
                    </button>
                  )}
                </div>
              </div>
              {inventoryPet === 'fox' ? <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Skins</span>
                {inventoryFoxSkins.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <Backpack className="h-10 w-10 text-[var(--text-muted)]" />
                    <p className="text-sm font-semibold text-[var(--text)]">{mySkins.length ? 'No hay skins con estos filtros' : 'No tienes skins todavía'}</p>
                    {mySkins.length ? <button onClick={() => { setInventoryRarity('Todas'); setInventoryPack('Todos'); setInventoryOrder('default') }} className="mt-1 rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[var(--bg)]">Quitar filtros</button> : <>
                      <p className="max-w-[260px] text-xs text-[var(--text-muted)]">Completa tareas o compra monedas para desbloquear tu primera skin.</p>
                      <button onClick={() => setTab('fox')} className="mt-1 rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[var(--bg)]">Ir a estilos de Fox</button>
                    </>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {inventoryFoxSkins.map((skin) => (
                      <SkinCard key={skin.id} skin={skin} equipped={equipped === skin.id} unlocked canAfford onEquip={() => equipSkin(skin.id)} onBuy={() => equipSkin(skin.id)} favorite={favoriteFoxSkins.includes(skin.id)} onToggleFavorite={() => toggleFavoriteSkin('fox', skin.id)} />
                    ))}
                  </div>
                )}
              </div> : <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Estilos de Sir Quackington</span>
                {inventoryDuckSkins.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--border)] py-7 text-center">
                    <Bird className="h-9 w-9 text-[var(--text-muted)]" />
                    <p className="text-sm font-semibold text-[var(--text)]">{quackingtonSkinsUnlocked.length > 1 ? 'No hay estilos del pato con estos filtros' : 'Aún no tienes estilos del pato'}</p>
                    {quackingtonSkinsUnlocked.length > 1 ? <button onClick={() => { setInventoryRarity('Todas'); setInventoryOrder('default') }} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--bg)]">Quitar filtro</button> : <button onClick={() => setTab('patos')} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--bg)]">Ver colección</button>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {inventoryDuckSkins.map((skin) => (
                      <DuckSkinCard
                        key={skin.id}
                        skin={skin}
                        equipped={quackingtonSkin === skin.id}
                        unlocked
                        canAfford
                        quackingtonOwned={quackingtonOwned}
                        onEquip={() => equipQuackingtonSkin(skin.id)}
                        onBuy={() => equipQuackingtonSkin(skin.id)}
                        favorite={favoriteQuackingtonSkins.includes(skin.id)}
                        onToggleFavorite={() => toggleFavoriteSkin('quackington', skin.id)}
                      />
                    ))}
                  </div>
                )}
              </div>}
            </div>
          ) : tab === 'coins' ? (
            <div className="space-y-4">
              <p className="text-center text-xs text-[var(--text-muted)]">Compra monedas para desbloquear skins premium</p>
              <div className="grid grid-cols-2 gap-3">
                {COIN_PACKS.map((pack) => (
                  <CoinPackCard key={pack.id} pack={pack} onBuy={() => handleCheckout(pack.id)} disabled={buying} />
                ))}
              </div>
              <p className="text-center text-[10px] text-[var(--text-muted)]">Pagos seguros vía Bold</p>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-[var(--text-muted)]">Selecciona una sección de la tienda.</div>
          )}
        </div>
      <Modal open={achievementModalOpen} onClose={() => setAchievementModalOpen(false)} title="Logros e insignias" className="max-w-4xl">
        <p className="mb-4 text-xs leading-relaxed text-[var(--text-muted)]">Tus hitos de colección, premios y logros de temporada están reunidos aquí.</p>
        <AchievementGallery unlockedIds={unlockedIds} claimedIds={claimedIds} claimableIds={visibleClaimableIds} onClaimAchievement={claimReward} onClaimMilestone={claimMilestoneSkin} quackingtonSkinsUnlocked={quackingtonSkinsUnlocked} collectibleDuckSkinsOwned={collectibleDuckSkinsOwned} stats={achStats} canViewSeasons={canViewSeasons} seasonInsignias={seasonInsignias} />
      </Modal>
      <Modal open={premiumInfoOpen} onClose={() => setPremiumInfoOpen(false)} title="Tu asistente Quacker Premium" className="max-w-xl">
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-amber-300/25 bg-gradient-to-br from-amber-400/15 via-[var(--surface)] to-violet-500/10 p-5 sm:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-amber-300/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/20"><Sparkles className="h-6 w-6" /></div>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.18em] text-amber-300">Tu compañero de organización</span>
              <h3 className="mt-2 text-lg font-black leading-tight text-[var(--text)] sm:text-xl">Menos vueltas. Más cosas hechas.</h3>
              <p className="mt-2 max-w-prose text-xs leading-relaxed text-[var(--text-muted)]">Quacker entiende el contexto de tu espacio y convierte tus indicaciones en cambios concretos. Siempre revisas la propuesta antes de aplicarla.</p>
            </div>
          </div>
          <div className="relative mt-4 flex flex-wrap gap-2">{['Tareas', 'Notas', 'Mi semana', 'Tus mascotas'].map((item) => <span key={item} className="rounded-full border border-[var(--border)] bg-[var(--bg)]/60 px-2.5 py-1 text-[10px] font-semibold text-[var(--text-muted)]">{item}</span>)}</div>
        </div>
        <div className="mb-3 flex items-end justify-between gap-3"><div><h3 className="text-xs font-extrabold uppercase tracking-[.14em] text-[var(--text)]">Qué puedes hacer con Premium</h3><p className="mt-1 text-[10px] text-[var(--text-muted)]">Tu asistente trabaja contigo en toda la app.</p></div><span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[9px] font-bold text-[var(--accent)]">8 herramientas</span></div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ['Tareas y listas', 'Crear apartados para tus listas y tareas; editar título, descripción, fecha, prioridad o ubicación.'],
            ['Notas', 'Crear notas y editar notas normales. El contenido de notas privadas nunca se comparte con la IA.'],
            ['Mi semana', 'Añadir o actualizar bloques de rutina con días y horas.'],
            ['Mascotas y skins', 'Cambiar entre Fox y Quackington y equipar una skin que ya tengas desbloqueada.'],
            ['Planificación', 'Armar el plan del día, desglosar tareas y sugerir por dónde empezar según tu energía.'],
            ['Consultas', 'Preguntar por pendientes, estadísticas, secciones, notas y horario semanal.'],
            ['Acompañamiento', 'Recibir ideas y orientación sobre calendario, temporizador, temas, tienda, inventario y logros.'],
            ['Quackington', 'Al activar Premium se desbloquea el pato para tu cuenta, sin pagar su compra aparte.'],
          ].map(([title, detail], index) => {
            const Icon = PREMIUM_FEATURES[index]?.icon ?? Sparkles
            return <div key={title} className="flex min-w-0 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:border-[var(--accent)]/35"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]"><Icon className="h-[18px] w-[18px]" /></span><div className="min-w-0"><p className="text-xs font-bold text-[var(--text)]">{title}</p><p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{detail}</p></div></div>
          })}
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="h-3.5 w-3.5" /></span><p className="text-[11px] leading-relaxed text-[var(--text-muted)]"><strong className="text-[var(--text)]">Tú tienes la última palabra.</strong> Quacker no elimina contenido, no compra artículos ni gasta monedas. Los cambios propuestos requieren tu confirmación.</p></div>
      </Modal>
      <Modal open={!!pendingSkin} onClose={() => setPendingSkin(null)} title="Confirmar compra" className="max-w-md">
        {pendingSkin && <>
          <div className="flex items-start gap-4">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-[var(--surface)]"><img src={pendingSkin.skin.image} alt="" className="h-20 w-20 object-contain" /></div>
            <div className="min-w-0 pt-1">
              <p className="eyebrow">{pendingSkin.kind === 'duck' ? 'Estilo de Sir Quackington' : 'Skin de Fox'}</p>
              <h2 className="mt-1 text-lg font-extrabold text-[var(--text)]">¿Quieres esta skin?</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{pendingSkin.skin.name}</p>
              <p className="mt-3 flex items-center gap-2 text-base font-bold text-[var(--accent)]">{pendingSkin.price} <CoinIcon className="h-5 w-5" /></p>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-[var(--surface)] p-3 text-sm text-[var(--text-muted)]">Se descontarán {pendingSkin.price} monedas de tu saldo. Esta compra no se puede deshacer.{pendingSkin.kind === 'duck' && !quackingtonOwned ? ' Podrás equipar este estilo cuando tengas a Sir Quackington.' : ''}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => setPendingSkin(null)} className="min-h-12 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]">Cancelar</button>
            <button onClick={confirmBuySkin} className="min-h-12 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-[var(--bg)] transition hover:brightness-105">Confirmar compra</button>
          </div>
        </>}
      </Modal>
    </div>
  )
}
