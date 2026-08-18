import { Suspense, lazy, useEffect, useRef, type TouchEvent } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import FocusMode from './components/ui/FocusMode'
import Tutorial from './components/ui/Tutorial'
import UpdateModal from './components/ui/UpdateModal'
import SplashScreen from './components/ui/SplashScreen'
import Toast from './components/ui/Toast'
import FoxPanel from './components/ui/FoxPanel'
import { useAuthStore } from './store/auth'
import { useUIStore } from './store/ui'
import { useSectionsStore } from './store/sections'
import { useTutorialStore } from './store/tutorial'
import { useSettingsStore } from './store/settings'
import { useTasksStore } from './store/tasks'
import { applyTheme } from './lib/themes'
import { scheduleDailyReminders } from './lib/notifications'
import { updateWidgetData } from './lib/widget'
import { initNetworkListener } from './store/offline'
import { checkAutoBackup } from './lib/backup'
import { LocalNotifications } from '@capacitor/local-notifications'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function sameDay(a: Date, b: Date) {
  const x = startOfDay(a)
  const y = startOfDay(b)
  return x.getTime() === y.getTime()
}

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Section = lazy(() => import('./pages/Section'))
const Archive = lazy(() => import('./pages/Archive'))
const Settings = lazy(() => import('./pages/Settings'))
const Credits = lazy(() => import('./pages/Credits'))
const Opiniones = lazy(() => import('./pages/Opiniones'))
const Stats = lazy(() => import('./pages/Stats'))

function PageFallback() {
  return <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">Cargando...</div>
}

export default function App() {
  const user = useAuthStore((s) => s.user)
  const demo = useAuthStore((s) => s.demo)
  const loading = useAuthStore((s) => s.loading)
  const focusOpen = useUIStore((s) => s.focusOpen)
  const closeFocus = useUIStore((s) => s.closeFocus)
  const openSidebar = useUIStore((s) => s.openSidebar)
  const updateModalOpen = useUIStore((s) => s.updateModalOpen)
  const closeUpdateModal = useUIStore((s) => s.closeUpdateModal)
  const sections = useSectionsStore((s) => s.sections)
  const tasks = useTasksStore((s) => s.tasks)
  const touchX = useRef<number | null>(null)
  const touchY = useRef<number | null>(null)
  const appThemeId = useSettingsStore((s) => s.appThemeId)
  const accentThemeId = useSettingsStore((s) => s.accentThemeId)

  useEffect(() => {
    // Apply saved theme
    applyTheme(appThemeId, accentThemeId)
  }, [appThemeId, accentThemeId])

  // Schedule daily reminders when tasks change
  useEffect(() => {
    if (user && !demo) {
      scheduleDailyReminders(tasks)
    }
  }, [tasks, user, demo])

  // Update widget when tasks change
  useEffect(() => {
    if (user && !demo) {
      // Calculate current streak
      const doneOnDay = (d: Date) => tasks.some((t) => t.status === 'done' && t.completedAt && sameDay(t.completedAt, d))
      let streak = 0
      const cursor = startOfDay(new Date())
      if (!doneOnDay(cursor)) cursor.setDate(cursor.getDate() - 1)
      while (doneOnDay(cursor)) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      }
      updateWidgetData(tasks, streak)
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

  // Handle deep links (flux://create, flux://dashboard, flux://open)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const handleDeepLink = (url: string) => {
      try {
        const parsed = new URL(url)
        const path = parsed.hostname || parsed.pathname.replace('/', '')
        if (path === 'create') {
          window.dispatchEvent(new CustomEvent('tasklex:new-task'))
        } else if (path === 'dashboard') {
          window.location.hash = '#/'
        } else if (path === 'open') {
          window.location.hash = '#/'
        }
      } catch {}
    }

    CapApp.addListener('appUrlOpen', ({ url }: { url: string }) => {
      handleDeepLink(url)
    })
  }, [])

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
        window.dispatchEvent(new CustomEvent('tasklex:new-task'))
      }
      // Ctrl/Cmd + /: Open tutorial
      else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        useTutorialStore.getState().start()
      }
      // Escape: Close modals
      else if (e.key === 'Escape') {
        if (focusOpen) {
          closeFocus()
        }
        useUIStore.getState().closeSidebar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusOpen])

  if (loading) {
    return <PageFallback />
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
    if (x0 <= 40 && dx > 70 && dx > Math.abs(dy) * 1.2) openSidebar()
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
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {sections.map((sec) => (
                <Route key={sec.id} path={`/s/${sec.id}`} element={<Section sectionId={sec.id} />} />
              ))}
              <Route path="/trabajo" element={<Navigate to="/s/trabajo" replace />} />
              <Route path="/universidad" element={<Navigate to="/s/universidad" replace />} />
              <Route path="/diario" element={<Navigate to="/s/diario" replace />} />
              <Route path="/archivo" element={<Archive />} />
              <Route path="/opiniones" element={<Opiniones />} />
              <Route path="/ajustes" element={<Settings />} />
              <Route path="/estadisticas" element={<Stats />} />
              <Route path="/creditos" element={<Credits />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <FocusMode open={focusOpen} onClose={closeFocus} />
      <Tutorial />
      <UpdateModal forceOpen={updateModalOpen} onClose={closeUpdateModal} />
      <Toast />
      <FoxPanel />
    </div>
    </>
  )
}
