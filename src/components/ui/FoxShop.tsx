import { useEffect, useState } from 'react'
import { X, Check, Lock, ShoppingBag, Sparkles, Brain, Backpack, Crown, MessageCircleQuestion, ListTree, BatteryCharging, Target, Trophy } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { useFoxSkinsStore } from '../../store/foxSkins'
import { useAuthStore } from '../../store/auth'
import { useTasksStore } from '../../store/tasks'
import { ACHIEVEMENTS, unlockedAchievements, computeAchievementStats } from '../../lib/achievements'
import { FOX_SKINS, COIN_PACKS, getDailyRotation, getSeasonalPack, type FoxSkin, type SkinCategory } from '../../lib/foxSkins'

const SEASON_LABELS: Record<SkinCategory, string> = {
  normal: 'Skins',
  halloween: 'Pack Halloween',
  navidad: 'Pack Navidad',
  musical: 'Pack Musical',
}

const PREMIUM_FEATURES = [
  { icon: Brain, title: 'Planificador diario', desc: 'Fox organiza tu día con horarios sugeridos según tu energía' },
  { icon: MessageCircleQuestion, title: 'Consulta en lenguaje natural', desc: '"¿Qué tengo pendiente esta semana?" y Fox te responde' },
  { icon: ListTree, title: 'Desglose de tareas', desc: 'Tareas grandes divididas en pasos accionables automáticamente' },
  { icon: BatteryCharging, title: 'Check-in de energía', desc: 'Dile cómo te sientes y Fox sugiere la tarea ideal' },
  { icon: Target, title: 'Coaching personalizado', desc: 'Fox aprende tus patrones y te da consejos a medida' },
  { icon: Trophy, title: 'Logros y recompensas', desc: 'Celebra hitos, mantén rachas y desbloquea cosméticos' },
]

function CoinIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return <img src="/coins/moneda.png" alt="moneda" className={className} />
}

function SkinCard({ skin, equipped, unlocked, canAfford, onEquip, onBuy }: {
  skin: FoxSkin; equipped: boolean; unlocked: boolean; canAfford: boolean; onEquip: () => void; onBuy: () => void
}) {
  return (
    <div className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
      equipped ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]'
      : unlocked ? 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50'
      : 'border-[var(--border)] bg-[var(--surface)] opacity-75'
    }`}>
      <img src={skin.image} alt={skin.name} className="h-20 w-20 object-contain" loading="lazy" />
      <span className="text-xs font-medium text-[var(--text)]">{skin.name}</span>
      {equipped ? (
        <span className="flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--bg)]">
          <Check className="h-3 w-3" /> Equipada
        </span>
      ) : unlocked ? (
        <button onClick={onEquip} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[10px] font-medium text-[var(--text)] hover:bg-[var(--accent)] hover:text-[var(--bg)]">
          Equipar
        </button>
      ) : (
        <button onClick={onBuy} disabled={!canAfford} className="flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-semibold text-[var(--bg)] disabled:opacity-40">
          {canAfford ? <>{skin.cost} <CoinIcon className="h-3 w-3" /></> : <><Lock className="h-3 w-3" /> {skin.cost}</>}
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

export default function FoxShop({ onClose }: { onClose: () => void }) {
  const { equipped, unlocked, coins, premium, premiumUntil, equipSkin, unlockSkin } = useFoxSkinsStore()
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<'skins' | 'coins' | 'inventario' | 'logros'>('skins')
  const [buying, setBuying] = useState(false)
  const [purchaseMsg, setPurchaseMsg] = useState('')
  const dailyRotation = getDailyRotation()
  const seasonalPack = getSeasonalPack()
  const seasonalSkins = seasonalPack ? FOX_SKINS.filter((s) => s.category === seasonalPack) : []
  const mySkins = FOX_SKINS.filter((s) => unlocked.includes(s.id))
  const tasks = useTasksStore((s) => s.tasks)
  const unlockedIds = unlockedAchievements()
  const achStats = computeAchievementStats(tasks)

  const handleBuySkin = (skin: FoxSkin) => {
    if (unlocked.includes(skin.id)) {
      equipSkin(skin.id)
    } else {
      if (unlockSkin(skin.id)) equipSkin(skin.id)
    }
  }

  const handleCheckout = async (packId: string) => {
    if (!user) return
    setBuying(true)
    try {
      const host = Capacitor.getPlatform() === 'android' ? 'task-lex.vercel.app' : window.location.host
      const res = await fetch(`${window.location.protocol}//${host}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, uid: user.uid }),
      })
      const data = await res.json()
      if (data.url) {
        localStorage.setItem('task-lex-pending-purchase', JSON.stringify({ paymentLink: data.paymentLink, uid: user.uid }))
        if (Capacitor.getPlatform() === 'android') {
          await Browser.open({ url: data.url })
        } else {
          window.location.href = data.url
        }
      } else {
        setPurchaseMsg('')
        alert('No se pudo abrir el pago. Inténtalo de nuevo.')
      }
    } catch {
      alert('No se pudo conectar con la pasarela de pago. Revisa tu conexión.')
    } finally {
      setBuying(false)
    }
  }

  useEffect(() => {
    let busy = false
    const checkPending = async () => {
      if (busy || buying) return
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      const raw = localStorage.getItem('task-lex-pending-purchase')
      if (!raw) return
      let p: { paymentLink?: string; uid?: string }
      try {
        p = JSON.parse(raw)
      } catch {
        localStorage.removeItem('task-lex-pending-purchase')
        return
      }
      if (!p?.paymentLink || !user || p.uid !== user.uid) return
      busy = true
      try {
        const host = Capacitor.getPlatform() === 'android' ? 'task-lex.vercel.app' : window.location.host
        const res = await fetch(`${window.location.protocol}//${host}/api/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentLink: p.paymentLink, uid: user.uid }),
        })
        const data = await res.json()
        if (data.verified && !data.already) {
          localStorage.removeItem('task-lex-pending-purchase')
          setPurchaseMsg(data.credited === 'premium' ? 'Premium activado con éxito' : 'Monedas acreditadas con éxito')
          setTimeout(() => setPurchaseMsg(''), 6000)
        } else if (data.reason === 'link_no_encontrado' || data.reason === 'referencia_invalida') {
          localStorage.removeItem('task-lex-pending-purchase')
        } else if (data.verified && data.already) {
          localStorage.removeItem('task-lex-pending-purchase')
        }
      } catch {} finally {
        busy = false
      }
    }
    checkPending()
    window.addEventListener('pageshow', checkPending)
    document.addEventListener('visibilitychange', checkPending)
    return () => {
      window.removeEventListener('pageshow', checkPending)
      document.removeEventListener('visibilitychange', checkPending)
    }
  }, [user, buying])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[var(--accent)]" />
            <span className="text-sm font-bold">Flux Premium</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
              <CoinIcon /> {coins}
            </span>
            <button onClick={onClose} className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface)]">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-[var(--border)]">
          <button onClick={() => setTab('skins')} className={`flex-1 px-2 py-2.5 text-xs font-semibold transition-colors ${tab === 'skins' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Tienda
          </button>
          <button onClick={() => setTab('inventario')} className={`flex-1 px-2 py-2.5 text-xs font-semibold transition-colors ${tab === 'inventario' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <Backpack className="mr-1 inline h-3.5 w-3.5" /> Mi inventario ({mySkins.length})
          </button>
          <button onClick={() => setTab('coins')} className={`flex-1 px-2 py-2.5 text-xs font-semibold transition-colors ${tab === 'coins' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <CoinIcon className="mr-1 inline h-3 w-3" /> Monedas
          </button>
          <button onClick={() => setTab('logros')} className={`flex-1 px-2 py-2.5 text-xs font-semibold transition-colors ${tab === 'logros' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            <Trophy className="mr-1 inline h-3.5 w-3.5" /> Logros ({unlockedIds.length}/{ACHIEVEMENTS.length})
          </button>
        </div>

        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 110px)' }}>
          {purchaseMsg && (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-3 py-2 text-xs font-bold text-[var(--accent)]">
              <Check className="h-4 w-4" /> {purchaseMsg}
            </div>
          )}
          {tab === 'skins' ? (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))' }}>
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-xl" />
                <div className="pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                {premium ? (
                  <>
                    <Crown className="mx-auto h-10 w-10 text-[var(--bg)]" fill="currentColor" />
                    <p className="mt-2 text-lg font-extrabold uppercase tracking-wide text-[var(--bg)]">Ya eres Flux Premium</p>
                    <p className="mt-1 text-xs font-medium text-[var(--bg)]/80">
                      {premiumUntil
                        ? `Activo hasta el ${new Date(premiumUntil).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : 'Disfruta de todas las funciones desbloqueadas'}
                    </p>
                  </>
                ) : (
                  <>
                    <Sparkles className="mx-auto h-9 w-9 text-[var(--bg)]" />
                    <h2 className="mt-2 text-xl font-extrabold uppercase tracking-wide text-[var(--bg)]">Flux Premium</h2>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--bg)]/80">
                      Desbloquea a Fox a su máximo potencial con IA de productividad
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
                      className="relative flex flex-col items-center gap-1 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent)]/10 p-4 transition-all hover:bg-[var(--accent)]/20 active:scale-95 disabled:opacity-50"
                    >
                      <span className="absolute -top-2.5 right-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[var(--bg)]">Ahorra 37%</span>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">Anual</span>
                      <span className="text-xl font-extrabold text-[var(--accent)]">$59.900</span>
                      <span className="text-[10px] text-[var(--text-muted)]">COP al año</span>
                    </button>
                    <button
                      onClick={() => handleCheckout('premium-mensual')}
                      disabled={buying}
                      className="flex flex-col items-center gap-1 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:border-[var(--accent)]/60 active:scale-95 disabled:opacity-50"
                    >
                      <span className="text-xs font-semibold text-[var(--text-muted)]">Mensual</span>
                      <span className="text-xl font-extrabold text-[var(--text)]">$7.900</span>
                      <span className="text-[10px] text-[var(--text-muted)]">COP al mes</span>
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
                </>
              )}

              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Skins de hoy</span>
                <div className="grid grid-cols-3 gap-3">
                  {dailyRotation.map((skin) => (
                    <SkinCard key={skin.id} skin={skin} equipped={equipped === skin.id} unlocked={unlocked.includes(skin.id)} canAfford={coins >= skin.cost} onEquip={() => equipSkin(skin.id)} onBuy={() => handleBuySkin(skin)} />
                  ))}
                </div>
              </div>

              {seasonalSkins.length > 0 && (
                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{SEASON_LABELS[seasonalPack!]}</span>
                  <div className="grid grid-cols-3 gap-3">
                    {seasonalSkins.map((skin) => (
                      <SkinCard key={skin.id} skin={skin} equipped={equipped === skin.id} unlocked={unlocked.includes(skin.id)} canAfford={coins >= skin.cost} onEquip={() => equipSkin(skin.id)} onBuy={() => handleBuySkin(skin)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : tab === 'logros' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
                  <p className="text-lg font-extrabold text-[var(--accent)]">{achStats.totalCompleted}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Tareas completadas</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
                  <p className="text-lg font-extrabold text-[var(--accent)]">{achStats.streakDays}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Días de racha</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
                  <p className="text-lg font-extrabold text-[var(--accent)]">{achStats.focusMinutes}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Min de foco</p>
                </div>
              </div>
              <div className="space-y-2">
                {ACHIEVEMENTS.map((a) => {
                  const got = unlockedIds.includes(a.id)
                  return (
                    <div key={a.id} className={`flex items-center gap-3 rounded-xl border p-3 ${got ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--surface)] opacity-70'}`}>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${got ? 'bg-[var(--accent)]/15' : 'bg-[var(--surface-2)]'}`}>
                        {got ? <Trophy className="h-4.5 w-4.5 h-[18px] w-[18px] text-[var(--accent)]" /> : <Lock className="h-4 w-4 text-[var(--text-muted)]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--text)]">{a.title}</p>
                        <p className="truncate text-[11px] text-[var(--text-muted)]">{a.desc}</p>
                      </div>
                      {got ? (
                        <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                      ) : (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--surface-2)] px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)]">
                          +{a.reward} <CoinIcon className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : tab === 'inventario' ? (
            <div className="space-y-4">
              <p className="text-center text-xs text-[var(--text-muted)]">
                Tus skins desbloqueadas: {mySkins.length} de {FOX_SKINS.length}
              </p>
              {mySkins.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Backpack className="h-10 w-10 text-[var(--text-muted)]" />
                  <p className="text-sm font-semibold text-[var(--text)]">Tu inventario está vacío</p>
                  <p className="max-w-[260px] text-xs text-[var(--text-muted)]">Completa tareas o compra monedas para desbloquear tu primera skin</p>
                  <button onClick={() => setTab('skins')} className="mt-1 rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[var(--bg)]">
                    Ir a la tienda
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mySkins.map((skin) => (
                    <SkinCard key={skin.id} skin={skin} equipped={equipped === skin.id} unlocked canAfford onEquip={() => equipSkin(skin.id)} onBuy={() => equipSkin(skin.id)} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-xs text-[var(--text-muted)]">Compra monedas para desbloquear skins premium</p>
              <div className="grid grid-cols-2 gap-3">
                {COIN_PACKS.map((pack) => (
                  <CoinPackCard key={pack.id} pack={pack} onBuy={() => handleCheckout(pack.id)} disabled={buying} />
                ))}
              </div>
              <p className="text-center text-[10px] text-[var(--text-muted)]">Pagos seguros vía Bold</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
