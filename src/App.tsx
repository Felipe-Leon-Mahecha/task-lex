import { Suspense, lazy, useEffect, useRef, type TouchEvent } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import FocusMode from './components/ui/FocusMode'
import Tutorial from './components/ui/Tutorial'
import { useAuthStore } from './store/auth'
import { useUIStore } from './store/ui'
import { useSectionsStore } from './store/sections'
import { useTutorialStore } from './store/tutorial'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Section = lazy(() => import('./pages/Section'))
const Archive = lazy(() => import('./pages/Archive'))
const Settings = lazy(() => import('./pages/Settings'))
const Credits = lazy(() => import('./pages/Credits'))
const Opiniones = lazy(() => import('./pages/Opiniones'))

function PageFallback() {
  return <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">Cargando...</div>
}

export default function App() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const demo = useAuthStore((s) => s.demo)
  const sections = useSectionsStore((s) => s.sections)
  const openSidebar = useUIStore((s) => s.openSidebar)
  const focusOpen = useUIStore((s) => s.focusOpen)
  const closeFocus = useUIStore((s) => s.closeFocus)
  const touchX = useRef<number | null>(null)
  const touchY = useRef<number | null>(null)

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
      if (typing) return
      if (e.key === '/' && !focusOpen) {
        e.preventDefault()
        document.getElementById('tasklex-search')?.focus()
      } else if (e.key.toLowerCase() === 'n' && !focusOpen) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('tasklex:new-task'))
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
              <Route path="/creditos" element={<Credits />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <FocusMode open={focusOpen} onClose={closeFocus} />
      <Tutorial />
    </div>
  )
}
