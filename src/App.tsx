import { Suspense, lazy, useEffect, useMemo, useRef, useState, Component, type ReactNode, type TouchEvent } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Tutorial from './components/ui/Tutorial'
import UpdateModal from './components/ui/UpdateModal'
import SplashScreen from './components/ui/SplashScreen'
import NotificationCenter from './components/ui/NotificationCenter'
import FoxPanel from './components/ui/FoxPanel'
import AlarmOverlay from './components/ui/AlarmOverlay'
import GlobalTaskCreator from './components/task/GlobalTaskCreator'
import { checkAlarms, type FiredAlarm } from './lib/notifications'
import { checkForUpdate, UpdateAvailableModal, type UpdateInfo } from './components/ui/UpdateModal'
import { APP_VERSION, canAccessSeasons } from './lib/appInfo'
import { useAuthStore } from './store/auth'
import { useUIStore } from './store/ui'
import { useSectionsStore } from './store/sections'
import { useTutorialStore } from './store/tutorial'
import { useSettingsStore } from './store/settings'
import { useTasksStore } from './store/tasks'
import { applyTheme } from './lib/themes'
import { scheduleDailyReminders } from './lib/notifications'
import { scheduleSeasonReminders } from './lib/seasons/reminders'
import { initNetworkListener } from './store/offline'
import { checkAutoBackup } from './lib/backup'
import { evaluateAchievements } from './lib/achievements'
import { LocalNotifications } from '@capacitor/local-notifications'
import { getSkinById } from './lib/foxSkins'
import { getQuackingtonSkinById } from './lib/quackingtonSkins'
import { syncMascotWidget } from './lib/nativeWidget'
import { useFoxSkinsStore } from './store/foxSkins'
import HalloweenAmbience, { HalloweenFooter } from './components/seasons/HalloweenAmbience'
import { notifyApp } from './lib/appNotifications'
import { playAppSound, playAppStartupSound } from './lib/soundEffects'



const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Section = lazy(() => import('./pages/Section'))
const Archive = lazy(() => import('./pages/Archive'))
const Settings = lazy(() => import('./pages/Settings'))
const Credits = lazy(() => import('./pages/Credits'))
const Opiniones = lazy(() => import('./pages/Opiniones'))
const Stats = lazy(() => import('./pages/Stats'))
const Privacidad = lazy(() => import('./pages/Privacidad'))
const Help = lazy(() => import('./pages/Help'))
const Inbox = lazy(() => import('./pages/Inbox'))
const DailyPlan = lazy(() => import('./pages/DailyPlan'))
const WeeklyPlan = lazy(() => import('./pages/WeeklyPlan'))
const Temporadas = lazy(() => import('./pages/Temporadas'))
const Notas = lazy(() => import('./pages/Notas'))
const Nota = lazy(() => import('./pages/Nota'))
const FoxShop = lazy(() => import('./components/ui/FoxShop'))
const Updates = lazy(() => import('./pages/Updates'))
const DesktopAuth = lazy(() => import('./pages/DesktopAuth'))
const windowsRewardChecks = new Set<string>()

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full items-center justify-center bg-[var(--bg)] p-6 text-center">
          <div>
            <p className="text-base font-bold text-[var(--text)]">Algo salió mal</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Reabre la app para continuar con tus tareas.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-[var(--accent)] px-5 py-2 text-sm font-bold text-[var(--bg)]"
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function PageFallback() {
  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="animate-pulse h-4 w-32 rounded bg-[var(--surface-2)]" />
      <div className="animate-pulse h-8 w-48 rounded bg-[var(--surface-2)]" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="animate-pulse h-4 w-24 rounded bg-[var(--surface-2)]" />
            <div className="animate-pulse h-3 w-full rounded bg-[var(--surface-2)]" />
            <div className="animate-pulse h-3 w-3/4 rounded bg-[var(--surface-2)]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  useEffect(() => {
    const timer = window.setTimeout(playAppStartupSound, 900)
    return () => window.clearTimeout(timer)
  }, [])
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const demo = useAuthStore((s) => s.demo)
  const loading = useAuthStore((s) => s.loading)
  const openSidebar = useUIStore((s) => s.openSidebar)
  const updateModalOpen = useUIStore((s) => s.updateModalOpen)
  const closeUpdateModal = useUIStore((s) => s.closeUpdateModal)
  const sections = useSectionsStore((s) => s.sections)
  const tasks = useTasksStore((s) => s.tasks)
  const pendingCountForWidget = tasks.reduce((count, task) => count + (task.status !== 'done' && !task.archived ? 1 : 0), 0)
  const widgetTasks = useMemo(() => tasks
    .filter((task) => task.status !== 'done' && !task.archived)
    .sort((a, b) => (a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER)
      || ({ alta: 0, media: 1, baja: 2 }[a.priority] - { alta: 0, media: 1, baja: 2 }[b.priority])
      || a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, 3)
    .map((task) => ({
      id: task.id,
      title: task.title,
      sectionId: task.sectionId,
      section: sections.find((section) => section.id === task.sectionId)?.label ?? 'Tarea',
      when: task.dueDate ? new Intl.DateTimeFormat('es-CO', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(task.dueDate) : '',
    })), [tasks, sections])
  const equippedSkin = useFoxSkinsStore((s) => s.equipped)
  const activePet = useFoxSkinsStore((s) => s.pet)
  const duckSkin = useFoxSkinsStore((s) => s.quackingtonSkin)
  const seenCompletedTasksRef = useRef<Set<string> | null>(null)
  const achievementUserRef = useRef<string | null>(null)
  const achievementActiveSinceRef = useRef(0)
  const touchX = useRef<number | null>(null)
  const touchY = useRef<number | null>(null)
  const appThemeId = useSettingsStore((s) => s.appThemeId)
  const accentThemeId = useSettingsStore((s) => s.accentThemeId)
  const largeText = useSettingsStore((s) => s.largeText)
  const highContrast = useSettingsStore((s) => s.highContrast)
  const notificationsOn = useSettingsStore((s) => s.notificationsOn)
  const dailyReminderFrequency = useSettingsStore((s) => s.dailyReminderFrequency)
  const claimWindowsWelcomeReward = useFoxSkinsStore((s) => s.claimWindowsWelcomeReward)

  useEffect(() => {
    if (!user || demo || Capacitor.isNativePlatform()) return
    const isWindows = /Windows/i.test(navigator.userAgent)
    const desktopBridge = (window as Window & { quackerDesktop?: { isApp?: boolean } }).quackerDesktop
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || desktopBridge?.isApp === true
    if (!isWindows || !isInstalled || windowsRewardChecks.has(user.uid)) return
    windowsRewardChecks.add(user.uid)
    let active = true
    void claimWindowsWelcomeReward().then((result) => {
      if (!result) windowsRewardChecks.delete(user.uid)
      if (!active || !result?.claimed) return
      notifyApp({
        title: '¡Bienvenido a Quacker para Windows!',
        message: 'Te regalamos 500 monedas para personalizar a tu mascota. Ya están en tu cuenta.',
        kind: 'success',
        duration: 9000,
      })
    })
    return () => { active = false }
  }, [user?.uid, demo, claimWindowsWelcomeReward])

  useEffect(() => {
    const cleanupCompletedTasks = () => {
      const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000
      useTasksStore.getState().tasks
        .filter((task) => !task.archived && task.status === 'done' && task.completedAt && task.completedAt.getTime() <= cutoff)
        .forEach((task) => useTasksStore.getState().updateTask(task.id, { archived: true }))
    }
    cleanupCompletedTasks()
    const timer = window.setInterval(cleanupCompletedTasks, 60 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    applyTheme(appThemeId, accentThemeId)
  }, [appThemeId, accentThemeId])

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? '112.5%' : ''
    document.documentElement.classList.toggle('high-contrast', highContrast)
  }, [largeText, highContrast])

  useEffect(() => {
    let cancelled = false
    const skin = activePet === 'quackington'
      ? getQuackingtonSkinById(duckSkin)
      : getSkinById(equippedSkin)
    const imageUrl = skin?.image ?? (activePet === 'quackington' ? '/quarkington/Skins/sir-quackington.webp' : '/fox/fox (IdleDefault).png')
    const petName = skin?.name ?? (activePet === 'quackington' ? 'Sir Quackington' : 'Fox')
    if (!cancelled) void syncMascotWidget({ pendingCount: pendingCountForWidget, petName, imageUrl, tasks: widgetTasks })
    return () => { cancelled = true }
  }, [pendingCountForWidget, activePet, equippedSkin, duckSkin, widgetTasks])

  // Schedule daily reminders when tasks change
  useEffect(() => {
    if (user && !demo) {
      scheduleDailyReminders(tasks)
    }
  }, [tasks, user, demo, notificationsOn, dailyReminderFrequency])

  // Schedule season reminders (1st and 15th of each month) for the owner
  useEffect(() => {
    if (canAccessSeasons(user?.email) && !demo) {
      scheduleSeasonReminders()
    }
  }, [user, demo])

  const [alarm, setAlarm] = useState<FiredAlarm | null>(null)
  const alarmRef = useRef<FiredAlarm | null>(null)
  const [update, setUpdate] = useState<UpdateInfo | null>(null)
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return
    let alive = true
    checkForUpdate(APP_VERSION)
      .then((info) => {
        if (alive && info) setUpdate(info)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  useEffect(() => {
    const tick = () => {
      try {
        if (alarmRef.current) return
        const hit = checkAlarms(useTasksStore.getState().tasks)
        if (hit) {
          alarmRef.current = hit
          setAlarm(hit)
        }
      } catch {}
    }
    tick()
    const t = setInterval(tick, 15000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  useEffect(() => {
    if (!user || demo || tasks.length === 0) return
    const completedNow = new Set(tasks.filter((task) => task.status === 'done').map((task) => task.id))
    if (achievementUserRef.current !== user.uid || seenCompletedTasksRef.current === null) {
      achievementUserRef.current = user.uid
      achievementActiveSinceRef.current = Date.now()
      seenCompletedTasksRef.current = completedNow
      return
    }
    const newlyCompleted = tasks.some((task) => task.status === 'done' && task.completedAt &&
      !seenCompletedTasksRef.current!.has(task.id) && new Date(task.completedAt).getTime() >= achievementActiveSinceRef.current)
    seenCompletedTasksRef.current = completedNow
    if (!newlyCompleted) return
    const fresh = evaluateAchievements(tasks)
    for (const a of fresh) {
      window.dispatchEvent(new CustomEvent('tasklex:achievement', { detail: a }))
      window.dispatchEvent(new Event('tasklex:achievement-pending'))
    }
  }, [tasks, user, demo])

  useEffect(() => {
    if (!user || demo) return
    let seen = false
    try {
      seen = localStorage.getItem('task-lex-tutorial') === '1'
    } catch {}
    if (seen) return
    const t = setTimeout(() => useTutorialStore.getState().start(), 700)
    return () => clearTimeout(t)
  }, [user, demo])

  // Initialize network listener
  useEffect(() => {
    initNetworkListener()
    checkAutoBackup()
  }, [])

  // Handle notification actions
  useEffect(() => {
    const setupNotificationListener = async () => {
      try {
        await LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
          const actionId = event.actionId
          const taskId = event.notification.extra?.taskId as string
          
          if (taskId) {
            const tasks = useTasksStore.getState()
            const task = tasks.tasks.find((t) => t.id === taskId)
            
            if (task) {
              if (actionId === 'complete') {
                tasks.updateTask(taskId, { status: 'done' })
              } else if (actionId === 'snooze') {
                // Snooze for 10 minutes
                const newDueDate = new Date(Date.now() + 10 * 60 * 1000)
                tasks.updateTask(taskId, { dueDate: newDueDate })
              }
            }
          }
        })
      } catch (error) {
        console.error('Error setting up notification listener:', error)
      }
    }

    setupNotificationListener()
  }, [])

  // Handle Android app shortcuts and widget deep links.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const handleDeepLink = (url: string) => {
      try {
        const parsed = new URL(url)
        const path = parsed.hostname || parsed.pathname.replace('/', '')
        if (path === 'task') {
          const taskId = parsed.searchParams.get('id')
          const sectionId = parsed.searchParams.get('sectionId')
          if (taskId && sectionId) {
            localStorage.setItem('quacker_pending_native_action', `open-task|${encodeURIComponent(taskId)}|${encodeURIComponent(sectionId)}`)
            window.dispatchEvent(new Event('quacker:native-action-pending'))
          }
          return
        }
        const actions: Record<string, string> = { create: 'create-task', note: 'create-note', focus: 'focus', dashboard: 'dashboard', open: 'dashboard' }
        const action = actions[path]
        if (action) {
          localStorage.setItem('quacker_pending_native_action', action)
          window.dispatchEvent(new Event('quacker:native-action-pending'))
        }
      } catch {}
    }

    const listener = CapApp.addListener('appUrlOpen', ({ url }: { url: string }) => handleDeepLink(url))
    void CapApp.getLaunchUrl().then((launch) => { if (launch?.url) handleDeepLink(launch.url) })
    return () => { void listener.then((handle) => handle.remove()) }
  }, [])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const listener = CapApp.addListener('backButton', () => {
      if (location.pathname.startsWith('/notas/')) {
        navigate('/notas', { state: { folderId: location.state?.folderId ?? null } })
      } else if (location.pathname !== '/') {
        navigate(-1)
      } else {
        void CapApp.exitApp()
      }
    })
    return () => { void listener.then((handle) => handle.remove()) }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (loading || (!user && !demo)) return
    const processPendingAction = () => {
      const action = localStorage.getItem('quacker_pending_native_action')
      if (!action) return
      localStorage.removeItem('quacker_pending_native_action')
      if (action.startsWith('open-task|')) {
        const [, taskId, sectionId] = action.split('|').map(decodeURIComponent)
        window.location.hash = sectionId === 'inbox'
          ? `#/bandeja?task=${encodeURIComponent(taskId)}`
          : `#/s/${encodeURIComponent(sectionId)}?task=${encodeURIComponent(taskId)}`
        return
      }
      if (action === 'focus') {
        try {
          const hidden = JSON.parse(localStorage.getItem('quacker-dashboard-hidden') ?? '[]') as string[]
          localStorage.setItem('quacker-dashboard-hidden', JSON.stringify(hidden.filter((widget) => widget !== 'timer')))
        } catch {}
        window.dispatchEvent(new CustomEvent('tasklex:ensure-focus-timer'))
      }
      if (action === 'create-note') window.location.hash = '#/notas'
      else window.location.hash = '#/'
      window.setTimeout(() => {
        if (action === 'create-task') window.dispatchEvent(new CustomEvent('tasklex:global-new-task'))
        else if (action === 'create-note') window.dispatchEvent(new CustomEvent('tasklex:quick-create-note'))
        else if (action === 'focus') window.dispatchEvent(new CustomEvent('tasklex:start-focus-timer'))
      }, 350)
    }
    processPendingAction()
    window.addEventListener('quacker:native-action-pending', processPendingAction)
    return () => window.removeEventListener('quacker:native-action-pending', processPendingAction)
  }, [loading, user, demo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
      if (typing) return
      
      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        document.getElementById('tasklex-search')?.focus()
      }
      // Ctrl/Cmd + N: New task
      else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('tasklex:global-new-task'))
      }
      // Ctrl/Cmd + /: Open tutorial
      else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        useTutorialStore.getState().start()
      }
      // Escape: Close modals
      else if (e.key === 'Escape') {
        useUIStore.getState().closeSidebar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loading) {
    return <PageFallback />
  }

  if (location.pathname === '/actualizaciones') {
    return <Suspense fallback={<PageFallback />}><Updates /></Suspense>
  }

  if (location.pathname === '/desktop-auth') {
    return <Suspense fallback={<PageFallback />}><DesktopAuth /></Suspense>
  }

  if (!user && !demo) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Login />
      </Suspense>
    )
  }

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX
    touchY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: TouchEvent) => {
    const x0 = touchX.current
    const y0 = touchY.current
    touchX.current = null
    touchY.current = null
    if (x0 == null || y0 == null) return
    const dx = e.changedTouches[0].clientX - x0
    const dy = e.changedTouches[0].clientY - y0
    if (x0 <= 40 && dx > 70 && dx > Math.abs(dy) * 1.2) {
      playAppSound('sidebar-open', 0.18)
      openSidebar()
    }
  }

  return (
    <>
      <SplashScreen />
      <div className="flex h-full bg-[var(--bg)] text-[var(--text)]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Suspense fallback={<PageFallback />}>
            <div key={location.pathname} className="page-enter">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {sections.map((sec) => (
                <Route key={sec.id} path={`/s/${sec.id}`} element={<Section sectionId={sec.id} />} />
              ))}
              <Route path="/trabajo" element={<Navigate to="/s/trabajo" replace />} />
              <Route path="/universidad" element={<Navigate to="/s/universidad" replace />} />
              <Route path="/diario" element={<Navigate to="/s/diario" replace />} />
              <Route path="/archivo" element={<Archive />} />
              <Route path="/notas" element={<Notas />} />
              <Route path="/notas/:id" element={<Nota />} />
              <Route path="/tienda" element={<FoxShop />} />
              <Route path="/opiniones" element={<Opiniones />} />
              <Route path="/temporadas" element={<Temporadas />} />
              <Route path="/ajustes" element={<Settings />} />
              <Route path="/estadisticas" element={<Stats />} />
              <Route path="/creditos" element={<Credits />} />
              <Route path="/actualizaciones" element={<Updates />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/ayuda" element={<Help />} />
              <Route path="/bandeja" element={<Inbox />} />
              <Route path="/plan-dia" element={<DailyPlan />} />
              <Route path="/semana" element={<WeeklyPlan />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </div>
          </Suspense>
          <HalloweenFooter />
        </main>
      </div>
      <Tutorial />
      <UpdateModal forceOpen={updateModalOpen} onClose={closeUpdateModal} />
      <NotificationCenter />
      <GlobalTaskCreator />
      <HalloweenAmbience />
      {location.pathname !== '/temporadas' && <FoxPanel />}
      {alarm && (
        <AlarmOverlay
          alarm={alarm}
          onClose={() => {
            alarmRef.current = null
            setAlarm(null)
          }}
        />
      )}
      {update && !alarm && <UpdateAvailableModal info={update} onClose={() => setUpdate(null)} />}
    </div>
    </>
  )
}
