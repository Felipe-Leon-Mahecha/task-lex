import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import { Award, ArrowLeft, ArrowRight, ChevronRight, Clock3, Coins, Dices, ImagePlus, Lock, Medal, Shuffle, Sparkles, Star, Trash2, Trophy, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useSeasonsStore } from '../store/seasons'
import { SpecialSeal, ThemeBadge, TierChip } from '../components/seasons/SeasonBadge'
import QuizModal from '../components/seasons/QuizModal'
import SeasonRouletteModal from '../components/seasons/SeasonRouletteModal'
import SeasonRevealModal from '../components/seasons/SeasonRevealModal'
import SeasonThemeCard from '../components/seasons/SeasonThemeCard'
import Modal from '../components/ui/Modal'
import { canAccessSeasons } from '../lib/appInfo'
import { celebrate } from '../lib/celebrate'
import { playSeasonRevealSound, startSeasonRouletteSound } from '../lib/soundEffects'
import { useFoxSkinsStore, useInfiniteCoins } from '../store/foxSkins'
import {
  ALL_SPECIALS,
  CATALOG,
  characterCandidates,
  hexToRgba2,
  eligibleForMonth,
  MESES,
  shade,
  specialLabel,
  specialsOf,
  themeById,
  type SpecialKey,
  type ThemeEntry,
} from '../lib/seasons/catalog'
import { clearSeasonBackground, saveSeasonBackground, saveSeasonBgOpacity, useSeasonBackground, useSeasonBgOpacity } from '../lib/seasons/background'
import { seasonAccentOf, seasonAccentTextOf } from '../lib/seasons/visual'

type Tab = 'temporada' | 'insignias' | 'especiales'

const SPECIAL_KEYS: SpecialKey[] = ALL_SPECIALS

const EMPTY_SP = { count: 0, themeId: null as string | null, year: 0, month: 0 }
const IDLE_SEASON_BADGES = CATALOG.filter((_, index) => index % 24 === 0).slice(0, 16)

function oddsContributionCost(count: number) {
  return count < 3 ? 50 + Math.max(0, count) * 20 : 90 + (count - 2) * 40
}

async function imageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Elige un archivo de imagen.')
  if (file.size > 15 * 1024 * 1024) throw new Error('La imagen debe pesar menos de 15 MB.')

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1440 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('No se pudo procesar la imagen.')
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.78))
  if (!blob) throw new Error('No se pudo procesar la imagen.')
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('No se pudo leer la imagen.'))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(blob)
  })
}

export default function Temporadas() {
  const user = useAuthStore((s) => s.user)
  const canUseSeasons = canAccessSeasons(user?.email)
  const current = useSeasonsStore((s) => s.current)
  const insignias = useSeasonsStore((s) => s.insignias)
  const specials = useSeasonsStore((s) => s.specials)
  const monthlyOdds = useSeasonsStore((s) => s.monthlyOdds)
  const ensureMonthlyOdds = useSeasonsStore((s) => s.ensureMonthlyOdds)
  const setMonthlyOdds = useSeasonsStore((s) => s.setMonthlyOdds)
  const reSortsLeft = useSeasonsStore((s) => s.reSortsLeft)
  const previewSeason = useSeasonsStore((s) => s.previewSeason)
  const drawSeason = useSeasonsStore((s) => s.drawSeason)
  const drawCharacter = useSeasonsStore((s) => s.drawCharacter)
  const setCharacter = useSeasonsStore((s) => s.setCharacter)
  const clearCharacter = useSeasonsStore((s) => s.clearCharacter)
  const consumeReSort = useSeasonsStore((s) => s.consumeReSort)
  const confirmSeason = useSeasonsStore((s) => s.confirmSeason)
  const finalizeSeasonIfExpired = useSeasonsStore((s) => s.finalizeSeasonIfExpired)
  const purchaseSeasonOdds = useFoxSkinsStore((s) => s.purchaseSeasonOdds)
  const coins = useFoxSkinsStore((s) => s.coins)
  const infiniteCoins = useInfiniteCoins()

  const [tab, setTab] = useState<Tab>('temporada')
  const [today, setToday] = useState(() => new Date())
  const [notify, setNotify] = useState<ThemeEntry | null>(null)
  const [rouletteEntry, setRouletteEntry] = useState<ThemeEntry | null>(null)
  const [rouletteOpen, setRouletteOpen] = useState(false)
  const [rouletteConsumesResort, setRouletteConsumesResort] = useState(false)
  const [roulettePeriod, setRoulettePeriod] = useState<{ month: number; year: number } | null>(null)
  const [seasonReveal, setSeasonReveal] = useState<{ entry: ThemeEntry; month: number; year: number } | null>(null)
  const [detail, setDetail] = useState<ThemeEntry | null>(null)
  const [specialOpen, setSpecialOpen] = useState<SpecialKey | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [missingOpen, setMissingOpen] = useState(false)
  const [backgroundError, setBackgroundError] = useState('')
  const [bgOpen, setBgOpen] = useState(false)
  const [oddsOpen, setOddsOpen] = useState(false)
  const [selectedOddsTheme, setSelectedOddsTheme] = useState<string | null>(null)
  const [oddsConfirmOpen, setOddsConfirmOpen] = useState(false)
  const [oddsBusy, setOddsBusy] = useState(false)
  const [oddsMessage, setOddsMessage] = useState('')
  const [showBackgroundTip, setShowBackgroundTip] = useState(false)
  const seasonBackground = useSeasonBackground()
  const bgOpacity = useSeasonBgOpacity()
  const bgFileRef = useRef<HTMLInputElement>(null)
  const rouletteSoundStopRef = useRef<(() => void) | null>(null)
  const roulettePool = useMemo(() => eligibleForMonth(today.getMonth() + 1), [today.getMonth()])
  const oddsPeriod = `${today.getFullYear()}-${today.getMonth() + 1}`
  const oddsForMonth = monthlyOdds?.period === oddsPeriod ? monthlyOdds : null
  const oddsRanking = useMemo(() => {
    const pool = eligibleForMonth(today.getMonth() + 1)
    if (!oddsForMonth || pool.length === 0) return []
    const nowIdx = today.getFullYear() * 12 + today.getMonth() + 1
    const weighted = pool.map((entry) => {
      const previous = insignias[entry.key]
      const lastIdx = previous ? previous.lastYear * 12 + previous.lastMonth : -1
      const gap = lastIdx < 0 ? Number.POSITIVE_INFINITY : nowIdx - lastIdx
      const score = (oddsForMonth.baseScores[entry.key] ?? 40) + (oddsForMonth.boosts[entry.key] ?? 0)
      return { entry, score, weight: score * (gap > 6 ? 1 : 0.04) }
    })
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0)
    return weighted.map((item) => ({ ...item, percent: totalWeight > 0 ? item.weight / totalWeight * 100 : 0 }))
      .sort((a, b) => b.percent - a.percent || a.entry.name.localeCompare(b.entry.name))
  }, [oddsForMonth, today, insignias])
  const selectedOdds = oddsRanking.find((item) => item.entry.key === selectedOddsTheme) ?? null
  const selectedOddsCost = oddsContributionCost(selectedOdds ? oddsForMonth?.contributions[selectedOdds.entry.key] ?? 0 : 0)

  useEffect(() => {
    ensureMonthlyOdds(today.getMonth() + 1, today.getFullYear())
    finalizeSeasonIfExpired()
    const timer = window.setInterval(() => {
      setToday(new Date())
      finalizeSeasonIfExpired()
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [ensureMonthlyOdds, finalizeSeasonIfExpired, today.getMonth() + 1, today.getFullYear()])

  if (!canUseSeasons) {
    return (
      <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-10 text-center">
        <Lock className="h-10 w-10 text-[var(--text-muted)]" />
        <p className="font-semibold text-[var(--text)]">Sección exclusiva</p>
        <p className="max-w-xs text-sm text-[var(--text-muted)]">
          Temporadas e insignias no están habilitadas para esta cuenta.
        </p>
      </div>
    )
  }

  const currentEntry = current ? themeById(current.themeId) : undefined
  const charCands = currentEntry ? characterCandidates(currentEntry) : []

  const entries = Object.entries(insignias)
    .map(([key, ins]) => ({ entry: themeById(key), ins }))
    .filter((x): x is { entry: ThemeEntry; ins: { count: number; lastMonth: number; lastYear: number } } => !!x.entry)
    .sort((a, b) => b.ins.count - a.ins.count || a.entry.name.localeCompare(b.entry.name))

  const unlockedSpecials = SPECIAL_KEYS.filter((k) => (specials[k] ?? EMPTY_SP).count > 0)
  const total = entries.length
  const missing = CATALOG.filter((e) => !insignias[e.key]).sort((a, b) => a.name.localeCompare(b.name))
  const pct = Math.round((total / CATALOG.length) * 100)

  const specialDetail = specialOpen ? (specials[specialOpen] ?? EMPTY_SP) : null
  const specialTheme = specialDetail?.themeId ? themeById(specialDetail.themeId) : undefined

  const announce = (entry: ThemeEntry) => {
    setNotify(entry)
    celebrate(90)
    setTab('temporada')
  }

  const confirmOddsPurchase = async () => {
    if (!selectedOdds || !oddsForMonth || oddsBusy) return
    setOddsBusy(true)
    setOddsMessage('')
    try {
      if (user) {
        const updated = await purchaseSeasonOdds(selectedOdds.entry.key, today.getMonth() + 1, today.getFullYear(), oddsForMonth.baseScores)
        if (!updated) throw new Error('No se pudo completar el aporte. Revisa tu saldo y vuelve a intentarlo.')
        setMonthlyOdds(updated)
      } else {
        const spent = await useFoxSkinsStore.getState().spendCoins(selectedOddsCost)
        if (!spent) throw new Error('No tienes suficientes monedas para este aporte.')
        setMonthlyOdds({
          ...oddsForMonth,
          boosts: { ...oddsForMonth.boosts, [selectedOdds.entry.key]: (oddsForMonth.boosts[selectedOdds.entry.key] ?? 0) + selectedOddsCost * 4 },
          contributions: { ...oddsForMonth.contributions, [selectedOdds.entry.key]: (oddsForMonth.contributions[selectedOdds.entry.key] ?? 0) + 1 },
        })
      }
      setOddsConfirmOpen(false)
      setOddsMessage(`¡La probabilidad de ${selectedOdds.entry.name} aumentó!`)
    } catch (error) {
      setOddsMessage(error instanceof Error ? error.message : 'No se pudo actualizar la probabilidad.')
    } finally {
      setOddsBusy(false)
    }
  }

  const startRoulette = useCallback((entry: ThemeEntry | null, consumesResort: boolean, month: number, year: number) => {
    if (!entry) return
    rouletteSoundStopRef.current?.()
    rouletteSoundStopRef.current = startSeasonRouletteSound()
    setRouletteEntry(entry)
    setRouletteConsumesResort(consumesResort)
    setRoulettePeriod({ month, year })
    setRouletteOpen(true)
  }, [])

  const handleInitialDraw = () => {
    const d = new Date()
    startRoulette(previewSeason(d.getMonth() + 1, d.getFullYear()), false, d.getMonth() + 1, d.getFullYear())
  }

  const handleResortSuccess = () => {
    const d = new Date()
    startRoulette(previewSeason(d.getMonth() + 1, d.getFullYear()), true, d.getMonth() + 1, d.getFullYear())
  }

  const finishRoulette = useCallback(() => {
    if (!rouletteEntry) return
    const d = new Date()
    const month = roulettePeriod?.month ?? d.getMonth() + 1
    const year = roulettePeriod?.year ?? d.getFullYear()
    const entry = drawSeason(month, year, rouletteEntry.key)
    rouletteSoundStopRef.current?.()
    rouletteSoundStopRef.current = null
    if (entry) {
      playSeasonRevealSound()
      if (rouletteConsumesResort) consumeReSort()
      announce(entry)
      setSeasonReveal({ entry, month, year })
      setShowBackgroundTip(!seasonBackground)
    }
    setRouletteOpen(false)
    setRouletteEntry(null)
    setRouletteConsumesResort(false)
    setRoulettePeriod(null)
  }, [rouletteEntry, rouletteConsumesResort, roulettePeriod, drawSeason, consumeReSort, seasonBackground])

  const handleQuizFail = () => {
    consumeReSort()
  }

  const handleBackgroundFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    setBackgroundError('')
    try {
      const dataUrl = await imageFileToDataUrl(file)
      if (!saveSeasonBackground(dataUrl)) throw new Error('No se pudo guardar. Prueba con una imagen más pequeña.')
      setShowBackgroundTip(false)
    } catch (error) {
      setBackgroundError(error instanceof Error ? error.message : 'No se pudo cargar la imagen.')
    }
  }

  const base = currentEntry ? seasonAccentOf(currentEntry) : undefined
  const accentText = base ? seasonAccentTextOf(base) : undefined
  const pageStyle = currentEntry && base
    ? ({
        '--accent': base,
        '--accent-strong': shade(base),
        '--accent-text': accentText,
      } as CSSProperties)
    : undefined
  const isResortWindow = !!current && current.year === today.getFullYear() && current.month === today.getMonth() + 1 && today.getDate() <= 3 && current.confirmed === false
  const isPending = !!current && current.confirmed === false
  const monthLabel = current ? MESES[current.month - 1] : ''
  const special = current ? specialsOf(current.month) : []
  const currentCount = current ? insignias[current.themeId]?.count ?? 0 : 0

  const tabs: { id: Tab; label: string; icon: typeof Star }[] = [
    { id: 'temporada', label: 'Temporada', icon: Sparkles },
    { id: 'insignias', label: `Insignias · ${total}`, icon: Medal },
    { id: 'especiales', label: `Especiales · ${unlockedSpecials.length}/${SPECIAL_KEYS.length}`, icon: Award },
  ]

  return (
    <div className="season-page relative isolate -mx-4 -my-4 min-h-[calc(100dvh-4rem)] overflow-hidden md:-mx-8 md:-my-8" style={pageStyle}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: seasonBackground ? bgOpacity : 1,
          backgroundImage: seasonBackground
            ? `url("${seasonBackground}")`
            : currentEntry && base
              ? `radial-gradient(ellipse at 12% 0%, ${hexToRgba2(base, 0.42)}, transparent 50%), radial-gradient(ellipse at 88% 100%, ${hexToRgba2(base, 0.32)}, transparent 52%)`
              : 'radial-gradient(ellipse at 12% 0%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 54%), radial-gradient(ellipse at 90% 100%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 48%)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      {!currentEntry && (
        <div className="season-idle-badge-rain pointer-events-none absolute inset-x-0 top-0 z-[1] h-[100dvh] overflow-hidden" aria-hidden>
          {IDLE_SEASON_BADGES.map((entry, index) => {
            const duration = 15 + (index % 6) * 4.5
            const delay = -((index * 3.7) % duration)
            const size = 34 + (index % 3) * 9
            const drift = index % 2 === 0 ? 45 + (index % 4) * 18 : -45 - (index % 4) * 18
            const rotation = index % 3 === 0 ? (index % 2 === 0 ? '360deg' : '-360deg') : index % 3 === 1 ? '65deg' : '-110deg'
            const style = {
              left: `${4 + ((index * 37) % 92)}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              '--season-fall-drift': `${drift}px`,
              '--season-fall-rotation': rotation,
              opacity: 0.18 + (index % 3) * 0.035,
            } as CSSProperties
            return <div key={entry.key} className="season-idle-fall-badge" style={style}><ThemeBadge entry={entry} count={1} size={size} /></div>
          })}
        </div>
      )}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
        <Link to="/" aria-label="Volver al dashboard" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="text-2xl font-bold tracking-tight">Temporadas</h1>
        </div>
        {currentEntry && <div className="relative shrink-0">
          {showBackgroundTip && !seasonBackground && <div className="season-background-tip absolute right-12 top-1/2 z-40 w-[min(270px,calc(100vw-6rem))] -translate-y-1/2 rounded-2xl border p-3 pr-9 text-left shadow-xl" style={{ borderColor: base ? hexToRgba2(base, 0.55) : undefined, background: base ? `linear-gradient(135deg, color-mix(in srgb, var(--surface) 92%, ${base}), var(--surface))` : 'var(--surface)' }}>
            <span className="season-background-tip-arrow" style={{ borderLeftColor: base ?? 'var(--border)' }} aria-hidden />
            <button type="button" onClick={() => setShowBackgroundTip(false)} className="absolute right-2 top-2 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]" aria-label="Cerrar consejo"><X className="h-3.5 w-3.5" /></button>
            <p className="text-xs font-extrabold text-[var(--text)]">¡Dale estilo a tu temporada!</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--text-muted)]">Pon una imagen de tu tema como fondo. Toca aquí para personalizarla.</p>
            <ArrowRight className="mt-1 h-3.5 w-3.5 rotate-[-25deg]" style={{ color: base }} aria-hidden />
          </div>}
          <button
            type="button"
            onClick={() => { setShowBackgroundTip(false); setBackgroundError(''); setBgOpen(true) }}
            title="Fondo de la temporada"
            aria-label="Cambiar fondo de la temporada"
            className={`grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] shadow-sm transition-transform hover:scale-105 active:scale-95 ${showBackgroundTip && !seasonBackground ? 'season-background-tip-target' : ''}`}
          ><ImagePlus className="h-5 w-5" /></button>
        </div>}
      </div>

      <div className={`mb-5 grid ${isResortWindow ? 'grid-cols-3' : 'grid-cols-2'} gap-2 border-y border-[var(--border)]/70 py-3 sm:gap-5 sm:py-4`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
            <Medal className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold leading-none text-[var(--text)]">
              {total}<span className="text-sm font-semibold text-[var(--text-muted)]">/{CATALOG.length}</span>
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Insignias</p>
          </div>
        </div>
        <div className="flex items-center gap-2 border-x border-[var(--border)]/70 px-2 sm:gap-3 sm:px-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
            <Trophy className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold leading-none text-[var(--text)]">{pct}%</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Colección</p>
          </div>
        </div>
        {isResortWindow && <div className="flex items-center gap-2 sm:gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
            <Dices className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold leading-none text-[var(--text)]">{reSortsLeft}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Este mes</p>
          </div>
        </div>}
      </div>

      <div className="mb-5 flex gap-1 border-b border-[var(--border)]/70">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-xs font-semibold transition-colors sm:text-sm ${
              tab === id
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {tab === 'temporada' && (
        <div key="tab-temporada" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {currentEntry && current ? (
            <div className="relative mx-auto max-w-5xl py-5 sm:py-10">
              {isResortWindow && reSortsLeft > 0 && (
                <div className="season-reroll-reminder mb-4 grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border px-3 py-2.5 sm:gap-3 sm:px-4" style={{ borderColor: base ? hexToRgba2(base, 0.45) : undefined, background: base ? `linear-gradient(105deg, ${hexToRgba2(base, 0.16)}, color-mix(in srgb, var(--surface) 94%, ${base}))` : undefined }}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg sm:h-9 sm:w-9" style={{ color: base, background: base ? hexToRgba2(base, 0.18) : undefined }}>
                    <Clock3 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold leading-tight text-[var(--text)] sm:text-sm">¡Aún puedes cambiar tu temporada!</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-[var(--text-muted)] sm:text-xs">
                      Te quedan <strong className="text-[var(--text)]">{4 - today.getDate()} día{4 - today.getDate() === 1 ? '' : 's'}</strong> para re-sortear. El plazo termina el 3 de {monthLabel}; después ya no podrás cambiarla.
                    </p>
                  </div>
                  <button type="button" onClick={() => setQuizOpen(true)} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[10px] font-extrabold transition hover:brightness-110 sm:gap-2 sm:px-3 sm:text-xs" style={{ color: base, border: `1px solid ${base ? hexToRgba2(base, 0.48) : 'var(--border)'}`, background: base ? hexToRgba2(base, 0.13) : 'var(--surface)' }}>
                    <Shuffle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Resortear · {reSortsLeft}
                  </button>
                </div>
              )}
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40"
                style={{ background: base ? `radial-gradient(circle, ${hexToRgba2(base, 0.8)}, transparent 70%)` : undefined }}
              />
              {notify?.key === currentEntry.key && (
                <span className="absolute right-4 top-4 z-10 rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                  Nueva
                </span>
              )}
              <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                <div className="shrink-0" style={notify?.key === currentEntry.key ? { animation: 'new-insignia-pulse 1.8s ease-out 3' } : {}}>
                  <ThemeBadge entry={currentEntry} count={currentCount} size={168} year={current.year} />
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="eyebrow">
                    Temporada · {monthLabel} {current.year}
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl">
                    {currentEntry.name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {currentEntry.type} · {currentEntry.group}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                    {special.map((sp) => (
                      <span key={sp} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: base ? hexToRgba2(base, 0.22) : undefined }}>
                        {specialLabel(sp)}
                      </span>
                    ))}
                    {current.character ? (
                      <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: base ? hexToRgba2(base, 0.22) : undefined }}>
                        <Star className="h-3 w-3" /> {current.character}
                      </span>
                    ) : (
                      charCands.length > 0 && (
                        <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
                          Sin personaje todavía
                        </span>
                      )
                    )}
                    <TierChip count={currentCount} />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    {isResortWindow && reSortsLeft > 0 && (
                      <>
                        <button className="btn-primary" onClick={() => setQuizOpen(true)}>
                          <Shuffle className="h-4 w-4" />
                          Sortear de nuevo ({reSortsLeft})
                        </button>
                        <button type="button" onClick={() => { setSelectedOddsTheme(null); setOddsMessage(''); setOddsOpen(true) }} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                          <Dices className="h-4 w-4" /> Probabilidades
                        </button>
                      </>
                    )}
                    {isPending && isResortWindow && <button className="rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10" onClick={() => { confirmSeason(); announce(currentEntry) }}>Confirmar temporada</button>}
                    {currentEntry.key === 'creepypastas' && charCands.length > 0 ? (
                      <label className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)]">
                        Elegir creepypasta
                        <select
                          value={current.character ?? ''}
                          onChange={(event) => setCharacter(event.target.value || null)}
                          className="max-w-40 bg-transparent text-sm font-semibold outline-none"
                          aria-label="Elegir creepypasta para la temporada"
                        >
                          <option value="">Elige uno</option>
                          {charCands.map((candidate) => <option key={candidate.key} value={candidate.name}>{candidate.name}</option>)}
                        </select>
                      </label>
                    ) : charCands.length > 0 && (
                      <button
                        onClick={drawCharacter}
                        className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                      >
                        Sortear personaje
                      </button>
                    )}
                    {current.character && currentEntry.key !== 'creepypastas' && (
                      <button
                        onClick={clearCharacter}
                        className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)]"
                      >
                        Quitar personaje
                      </button>
                    )}
                  </div>
                  {isResortWindow ? (
                    <p className="mt-3 text-xs text-[var(--text-muted)]">
                      Te quedan {reSortsLeft} re-sorteo{reSortsLeft === 1 ? '' : 's'} este mes. Puedes confirmar ahora o esperar al cierre del plazo.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative isolate flex min-h-[54vh] flex-col items-center justify-center gap-5 overflow-hidden py-12 text-center sm:min-h-[58vh] sm:py-16">
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="season-idle-halo absolute left-1/2 top-1/2 h-[min(72vw,440px)] w-[min(72vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-full" />
              </div>
              <div className="relative z-[1] flex flex-col items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/35 bg-[var(--surface)]/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.22em] text-[var(--accent)] backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" /> Nuevo ciclo · {MESES[today.getMonth()]} {today.getFullYear()}
                </span>
                <div className="season-idle-emblem relative grid h-24 w-24 place-items-center rounded-[2rem] border border-[var(--accent)]/35 bg-[var(--surface)]/65 text-[var(--accent)] shadow-[0_0_60px_color-mix(in_srgb,var(--accent)_24%,transparent)] backdrop-blur-sm">
                  <span className="absolute inset-2 rounded-[1.55rem] border border-[var(--accent)]/20" />
                  <Sparkles className="relative h-10 w-10" strokeWidth={1.5} />
                  <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-xl border border-[var(--accent)]/35 bg-[var(--surface)] text-[var(--accent)]"><Dices className="h-4 w-4" /></span>
                </div>
                <div>
                  <p className="eyebrow">La ruleta está lista</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-[var(--text)] sm:text-4xl">Un nuevo mundo te espera</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
                    Sortea el tema que acompañará tus objetivos este mes. Cada elección suma una insignia a tu colección.
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => { setSelectedOddsTheme(null); setOddsMessage(''); setOddsOpen(true) }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--accent)]/40 bg-[var(--surface)]/80 px-5 text-sm font-bold text-[var(--accent)] transition hover:-translate-y-0.5 hover:bg-[var(--accent)]/10">
                    <Dices className="h-4 w-4" /> Probabilidades del mes
                  </button>
                  <button className="season-draw-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 text-sm font-black text-white" onClick={handleInitialDraw}>
                    <Shuffle className="h-4 w-4" /> Sortear temporada <Sparkles className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1 grid max-w-lg grid-cols-3 gap-4 border-t border-[var(--border)]/60 px-2 pt-4 text-[10px] text-[var(--text-muted)] sm:gap-9 sm:text-xs">
                  <span className="flex flex-col items-center gap-1"><Dices className="h-4 w-4 text-[var(--accent)]" />Tema sorpresa</span>
                  <span className="flex flex-col items-center gap-1"><Medal className="h-4 w-4 text-[var(--accent)]" />Insignia nueva</span>
                  <span className="flex flex-col items-center gap-1"><Sparkles className="h-4 w-4 text-[var(--accent)]" />Tu mes, tu historia</span>
                </div>
              </div>
            </div>
          )}

          <Modal open={oddsOpen} onClose={() => setOddsOpen(false)} title={`Probabilidades · ${monthLabel} ${today.getFullYear()}`} className="!max-w-2xl">
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 p-3.5">
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">Este mes los pesos de los temas se barajan de nuevo. La lista muestra una estimación real del sorteo: los aportes cuestan monedas, aumentan el peso de ese tema y nunca garantizan que salga.</p>
              </div>
              {oddsRanking.length > 0 ? (
                <div className="max-h-[min(48dvh,26rem)] space-y-2 overflow-y-auto pr-1">
                  {oddsRanking.map((item, index) => {
                    const contribution = oddsForMonth?.contributions[item.entry.key] ?? 0
                    const boost = oddsForMonth?.boosts[item.entry.key] ?? 0
                    const selected = selectedOddsTheme === item.entry.key
                    return <button key={item.entry.key} type="button" onClick={() => setSelectedOddsTheme(item.entry.key)} className={`w-full rounded-2xl border p-3 text-left transition ${selected ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_12%,transparent)]' : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/45'}`}>
                      <span className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[10px] font-black" style={{ color: item.entry.primary, background: `color-mix(in srgb, ${item.entry.primary} 18%, var(--surface))` }}>{index + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-[var(--text)]">{item.entry.name}</span>
                          <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">{boost > 0 ? `Aporte acumulado: +${boost} de peso · ${contribution} ${contribution === 1 ? 'aporte' : 'aportes'}` : 'Aún sin aportes'}</span>
                        </span>
                        <span className="shrink-0 text-right text-sm font-black tabular-nums text-[var(--accent)]">{item.percent.toFixed(1)}%</span>
                      </span>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]"><span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(item.percent > 0 ? 1 : 0, item.percent)}%`, background: item.entry.primary }} /></span>
                    </button>
                  })}
                </div>
              ) : <p className="py-8 text-center text-sm text-[var(--text-muted)]">Preparando las probabilidades de este mes…</p>}
              {selectedOdds && <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text)]"><Coins className="h-4 w-4 text-[var(--accent)]" />Aumentar probabilidad de {selectedOdds.entry.name}</div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">Próximo aporte: <strong className="text-[var(--text)]">{selectedOddsCost} monedas</strong>. Cada aporte suma {selectedOddsCost * 4} puntos de peso y el precio sube para ese mismo tema.</p>
                <button type="button" onClick={() => setOddsConfirmOpen(true)} disabled={!infiniteCoins && coins < selectedOddsCost} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-xs font-extrabold text-[var(--bg)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"><Coins className="h-4 w-4" />{infiniteCoins ? 'Sumar probabilidad' : `Sumar probabilidad · ${selectedOddsCost}`}</button>
                {!infiniteCoins && coins < selectedOddsCost && <p className="mt-2 text-center text-[10px] font-semibold text-amber-400">Te faltan {selectedOddsCost - coins} monedas.</p>}
              </div>}
              {oddsMessage && <p role="status" className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-3 text-center text-xs font-semibold text-[var(--accent)]">{oddsMessage}</p>}
            </div>
          </Modal>

          <Modal open={oddsConfirmOpen} onClose={() => { if (!oddsBusy) setOddsConfirmOpen(false) }} title="Confirmar aporte" className="!max-w-md">
            {selectedOdds && <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 p-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ color: selectedOdds.entry.primary, background: `color-mix(in srgb, ${selectedOdds.entry.primary} 18%, var(--surface))` }}><Dices className="h-5 w-5" /></span>
                <div className="min-w-0"><p className="truncate text-sm font-extrabold text-[var(--text)]">{selectedOdds.entry.name}</p><p className="text-xs text-[var(--text-muted)]">Tema de {monthLabel}</p></div>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">¿Quieres gastar <strong className="text-[var(--text)]">{selectedOddsCost} monedas</strong> para aumentar su probabilidad en el sorteo de este mes?</p>
              <div className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-3 py-2.5 text-xs"><span className="text-[var(--text-muted)]">Probabilidad estimada</span><span className="font-black tabular-nums text-[var(--text)]">{selectedOdds.percent.toFixed(1)}% <ChevronRight className="inline h-3.5 w-3.5" /> {((selectedOdds.weight + selectedOddsCost * 4) / (oddsRanking.reduce((sum, item) => sum + item.weight, 0) + selectedOddsCost * 4) * 100).toFixed(1)}%</span></div>
              <p className="text-[10px] leading-relaxed text-[var(--text-muted)]">La temporada se sigue sorteando al azar; el aporte mejora esta oportunidad, pero no asegura el resultado. El costo del siguiente aporte para este tema será mayor.</p>
              {oddsMessage && <p role="alert" className="rounded-xl border border-red-400/25 bg-red-400/5 p-2.5 text-xs font-semibold text-red-400">{oddsMessage}</p>}
              <div className="flex justify-end gap-2 pt-1"><button type="button" disabled={oddsBusy} onClick={() => setOddsConfirmOpen(false)} className="min-h-10 rounded-xl border border-[var(--border)] px-4 text-xs font-bold text-[var(--text-muted)]">Cancelar</button><button type="button" disabled={oddsBusy || (!infiniteCoins && coins < selectedOddsCost)} onClick={() => void confirmOddsPurchase()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-xs font-extrabold text-[var(--bg)] disabled:opacity-50">{oddsBusy ? 'Actualizando…' : <><Coins className="h-4 w-4" />Aceptar</>}</button></div>
            </div>}
          </Modal>

          <Modal open={bgOpen} onClose={() => setBgOpen(false)} title="Fondo de la temporada">
            <div className="flex flex-col gap-4">
              <div
                aria-hidden
                className="h-28 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-cover bg-center"
                style={
                  seasonBackground
                    ? { backgroundImage: `url("${seasonBackground}")`, opacity: bgOpacity }
                    : { background: 'var(--surface-2)' }
                }
              />
              {!seasonBackground && (
                <p className="text-center text-xs text-[var(--text-muted)]">Sin imagen. Sube una para decorar esta sección.</p>
              )}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">Transparencia</label>
                  <span className="text-xs font-bold text-[var(--text)]">{Math.round(bgOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={Math.round(bgOpacity * 100)}
                  onChange={(e) => saveSeasonBgOpacity(Number(e.target.value) / 100)}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
              {backgroundError && <p role="alert" className="text-xs font-semibold text-red-500">{backgroundError}</p>}
              <input
                ref={bgFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBackgroundFile}
              />
              <div className="flex flex-wrap justify-end gap-2">
                {seasonBackground && (
                  <button
                    type="button"
                    onClick={() => {
                      clearSeasonBackground()
                      setBackgroundError('')
                    }}
                    className="mr-auto flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text-muted)] transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Quitar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => bgFileRef.current?.click()}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                >
                  {seasonBackground ? 'Cambiar imagen' : 'Elegir imagen'}
                </button>
                <button type="button" onClick={() => setBgOpen(false)} className="btn-primary">
                  Listo
                </button>
              </div>
            </div>
          </Modal>

        </div>
      )}

      {tab === 'insignias' && (
        <div key="tab-insignias" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-5 border-b border-[var(--border)]/70 pb-4">
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-[var(--text)]">
                {total} de {CATALOG.length} insignias
              </p>
              <p className="font-bold text-[var(--accent)]">{pct}%</p>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <button
            onClick={() => setMissingOpen(true)}
            className="mb-5 flex w-full items-center gap-3 border-b border-dashed border-[var(--border)] px-1 py-4 text-left transition-colors hover:text-[var(--accent)]"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)]">
              <Lock className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Colección</p>
              {missing.length === 0 ? (
                <p className="text-sm font-bold text-[var(--text)]">¡Completaste todas las insignias!</p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  Te faltan <span className="font-bold text-[var(--text)]">{missing.length}</span> insignias por conseguir
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          </button>

          {total === 0 ? (
              <div className="flex flex-col items-center gap-2 py-14 text-center">
              <Sparkles className="h-8 w-8 text-[var(--accent)]" />
              <p className="font-semibold text-[var(--text)]">Sin insignias todavía</p>
              <p className="text-sm text-[var(--text-muted)]">Sortea una temporada y empezá a coleccionar.</p>
              <button className="btn-primary mt-2" onClick={() => { setTab('temporada'); }}>
                Ir a sortear
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {entries.map(({ entry, ins }) => {
                const isFresh = notify?.key === entry.key
                return (
                  <button
                    key={entry.key}
                    id={isFresh ? 'fresh-insignia' : undefined}
                    onClick={() => setDetail(entry)}
                    className="group relative min-w-0 rounded-[1.35rem] text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    aria-label={`${entry.name}, insignia ${ins.count} veces sorteada`}
                  >
                    {isFresh && (
                      <span className="absolute right-2 top-2 z-10 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black shadow-lg">
                        Nueva
                      </span>
                    )}
                    <SeasonThemeCard entry={entry} count={ins.count} year={ins.lastYear} badgeSize={72} active={isFresh} className="min-h-[190px]" />
                  </button>
                )
              })}
            </div>
          )}

        </div>
      )}

      {tab === 'especiales' && (
        <div key="tab-especiales" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            Las temporadas especiales caen solas cuando sorteás en su mes. Toca una para ver su historia.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {SPECIAL_KEYS.map((k) => {
              const sp = specials[k] ?? EMPTY_SP
              const locked = sp.count === 0
              return (
                <button
                  key={k}
                  onClick={() => setSpecialOpen(k)}
                  className="group min-w-0 rounded-[1.5rem] text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <SeasonThemeCard special={k} count={sp.count} year={sp.year || undefined} locked={locked} badgeSize={88} className="min-h-[204px] !p-4" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Insignia">
        {detail &&
          (() => {
            const ins = insignias[detail.key]
            return (
              <div className="flex flex-col items-center gap-3">
                <ThemeBadge entry={detail} count={ins?.count ?? 1} size={140} year={ins?.lastYear} />
                <h3 className="text-lg font-bold text-[var(--text)]">{detail.name}</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {detail.type} · {detail.group}
                </p>
                <TierChip count={ins?.count ?? 1} />
                {ins && (
                  <p className="text-center text-xs text-[var(--text-muted)]">
                    Sorteada {ins.count} vez{ins.count === 1 ? '' : 'es'} · última en {MESES[ins.lastMonth - 1]}{' '}
                    {ins.lastYear}
                  </p>
                )}
              </div>
            )
          })()}
      </Modal>

      <Modal open={!!specialOpen} onClose={() => setSpecialOpen(null)} title={specialOpen ? specialLabel(specialOpen) : ''}>
        {specialOpen &&
          specialDetail &&
          (() => (
            <div className="flex flex-col items-center gap-3">
              <SpecialSeal kind={specialOpen} count={specialDetail.count} size={120} year={specialDetail.year} />
              {specialDetail.count === 0 ? (
                <p className="text-center text-sm text-[var(--text-muted)]">
                  Todavía no viviste esta temporada especial. Sorteá en su mes para conseguirla.
                </p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  Esta temporada especial se ha vivido {specialDetail.count} vez{specialDetail.count === 1 ? '' : 'es'}.
                </p>
              )}
              {specialTheme && (
                <>
                  <p className="eyebrow">Tema de esa temporada</p>
                  <ThemeBadge entry={specialTheme} count={insignias[specialTheme.key]?.count ?? 1} size={110} showName year={specialDetail.year} />
                  <p className="text-xs text-[var(--text-muted)]">
                    {MESES[specialDetail.month - 1]} {specialDetail.year}
                  </p>
                </>
              )}
            </div>
          ))()}
      </Modal>

      <QuizModal
        open={quizOpen}
        entry={currentEntry ?? null}
        onClose={() => setQuizOpen(false)}
        onSuccess={handleResortSuccess}
        onFail={handleQuizFail}
      />

      <SeasonRouletteModal
        open={rouletteOpen}
        target={rouletteEntry}
        pool={roulettePool}
        onComplete={finishRoulette}
        onClose={() => {
          rouletteSoundStopRef.current?.()
          rouletteSoundStopRef.current = null
          setRouletteOpen(false)
          setRouletteEntry(null)
          setRouletteConsumesResort(false)
          setRoulettePeriod(null)
        }}
      />

      <SeasonRevealModal
        open={!!seasonReveal}
        entry={seasonReveal?.entry ?? null}
        month={seasonReveal?.month ?? today.getMonth() + 1}
        year={seasonReveal?.year ?? today.getFullYear()}
        count={seasonReveal ? insignias[seasonReveal.entry.key]?.count ?? 0 : 0}
        rerollsLeft={reSortsLeft}
        canConfirm={isResortWindow}
        canReroll={isResortWindow}
        onContinue={() => setSeasonReveal(null)}
        onConfirm={() => {
          confirmSeason()
          setSeasonReveal(null)
        }}
        onReroll={() => {
          setSeasonReveal(null)
          setQuizOpen(true)
        }}
      />

      <Modal open={missingOpen} onClose={() => setMissingOpen(false)} title="Insignias que faltan">
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {missing.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Sparkles className="h-8 w-8 text-[var(--accent)]" />
              <p className="font-semibold text-[var(--text)]">Colección completa</p>
              <p className="text-sm text-[var(--text-muted)]">
                Conseguiste las {CATALOG.length} insignias del catálogo.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-[var(--text-muted)]">
                Te faltan {missing.length} de {CATALOG.length} insignias. Se consiguen sorteando temporadas.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {missing.map((e) => (
                  <SeasonThemeCard key={e.key} entry={e} count={1} locked badgeSize={54} className="min-h-[154px] !rounded-xl !p-2" />
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>
      </div>
    </div>
  )
}
