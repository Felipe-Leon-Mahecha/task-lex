import { useEffect, useRef, useState, type CSSProperties, type DragEvent, type TouchEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Archive, Settings, X, Plus, Star, MessageSquareHeart, GripVertical, BarChart3, ShoppingBag, NotebookPen, CircleHelp, Inbox, CalendarDays, ChevronDown, type LucideIcon } from 'lucide-react'
import { useThemeStore } from '../../store/theme'
import { useUIStore } from '../../store/ui'
import { useSectionsStore } from '../../store/sections'
import { ICON_MAP } from '../../lib/sections'
import { hexToRgba } from '../../lib/image'
import { APP_NAME, APP_VERSION } from '../../lib/appInfo'
import type { ThemeConfig } from '../../types/task'
import NewSectionModal from './NewSectionModal'
import { claimableAchievements } from '../../lib/achievements'
import { playAppSound } from '../../lib/soundEffects'

type Themes = Record<string, ThemeConfig>

function sectionCardStyle(secId: string, themes: Themes, active: boolean): CSSProperties {
  const theme = themes[secId]
  const surface = theme?.surface ?? 'var(--surface)'
  const border = theme?.border ?? 'var(--border)'
  const radius = theme?.borderRadius ?? 16
  const text = theme?.text ?? 'var(--text)'
  if (theme?.backgroundImage) {
    return {
      backgroundImage: `linear-gradient(${hexToRgba(theme.background, 0.78)}, ${hexToRgba(
        theme.background,
        0.78,
      )}), url("${theme.backgroundImage}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      border: `1px solid ${active ? (theme?.accent ?? 'var(--accent)') : border}`,
      borderRadius: `${radius}px`,
      color: text,
      boxShadow: active ? `0 0 0 1px ${theme?.accent ?? 'var(--accent)'}` : undefined,
    }
  }
  return {
    background: surface,
    border: `1px solid ${active ? (theme?.accent ?? 'var(--accent)') : border}`,
    borderRadius: `${radius}px`,
    color: text,
    boxShadow: active ? `0 0 0 1px ${theme?.accent ?? 'var(--accent)'}` : undefined,
  }
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const themes = useThemeStore((s) => s.themes)
  const sections = useSectionsStore((s) => s.sections)
  const reorderSections = useSectionsStore((s) => s.reorderSections)
  const [dragId, setDragId] = useState<string | null>(null)
  const [hasAchievementReward, setHasAchievementReward] = useState(() => claimableAchievements().length > 0)
  const moreRoutes = ['/archivo', '/estadisticas', '/opiniones', '/ajustes', '/ayuda']
  const [moreOpen, setMoreOpen] = useState(() => moreRoutes.some((route) => location.pathname.startsWith(route)))

  useEffect(() => {
    if (moreRoutes.some((route) => location.pathname.startsWith(route))) setMoreOpen(true)
  }, [location.pathname])

  useEffect(() => {
    const refresh = () => setHasAchievementReward(claimableAchievements().length > 0)
    window.addEventListener('tasklex:achievement-pending', refresh)
    return () => window.removeEventListener('tasklex:achievement-pending', refresh)
  }, [])

  const onDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault()
    if (dragId && dragId !== targetId) reorderSections(dragId, targetId)
    setDragId(null)
  }

  const renderLink = (to: string, label: string, Icon: LucideIcon, end?: boolean, isDashboard?: boolean) => (
    <NavLink
      key={to}
      to={to}
      end={end ?? to === '/'}
      data-tut={to === '/notas' ? 'notes' : to === '/tienda' ? 'shop' : undefined}
      onClick={() => {
        if (to === '/notas') playAppSound('notes-open', 0.13)
        if (to === '/tienda') playAppSound('shop-open', 0.13)
        onNavigate?.()
      }}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
          isDashboard ? 'text-base font-semibold' : 'text-sm'
        } ${
          isActive
            ? 'bg-[var(--surface-2)] font-semibold text-[var(--accent)]'
            : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
        }`
      }
    >
      <span className="relative">
        <Icon className={`${isDashboard ? 'h-5 w-5' : 'h-4 w-4'}`} />
        {to === '/tienda' && hasAchievementReward && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500 ring-2 ring-[var(--bg)]" />}
      </span>
      {label}
    </NavLink>
  )

  return (
    <div className="flex flex-col gap-2">
      <p className="px-3 pb-0.5 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Mi día</p>
      {renderLink('/', 'Hoy', LayoutDashboard, true, true)}
      {renderLink('/bandeja', 'Bandeja de entrada', Inbox)}
      {renderLink('/semana', 'Mi semana', CalendarDays)}
      {renderLink('/notas', 'Notas', NotebookPen)}
      {sections.length > 0 && <p className="px-3 pb-0.5 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Mis espacios</p>}
      {sections.map((sec) => {
        const Icon = ICON_MAP[sec.icon] ?? Star
        return (
          <NavLink
            key={sec.id}
            to={`/s/${sec.id}`}
            onClick={onNavigate}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              setDragId(sec.id)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, sec.id)}
            onDragEnd={() => setDragId(null)}
            style={({ isActive }) => ({
              ...sectionCardStyle(sec.id, themes, isActive),
              ...(dragId === sec.id ? { opacity: 0.4 } : {}),
              ...(dragId && dragId !== sec.id ? { outline: `1px dashed ${themes[sec.id]?.accent ?? 'var(--accent)'}`, outlineOffset: -1 } : {}),
            })}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            <GripVertical className="h-4 w-4 shrink-0 opacity-40" />
            <Icon className="h-4 w-4 shrink-0" style={{ color: themes[sec.id]?.accent ?? 'var(--accent)' }} />
            <span className="truncate">{sec.label}</span>
          </NavLink>
        )
      })}
      <details open={moreOpen} onToggle={(event) => setMoreOpen(event.currentTarget.open)} className="mt-2">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)] [&::-webkit-details-marker]:hidden">
          <span>Más</span><ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
        </summary>
        <div className="mt-1 flex flex-col gap-1 pl-2">
          {renderLink('/archivo', 'Archivo', Archive)}
          {renderLink('/estadisticas', 'Estadísticas', BarChart3)}
          {renderLink('/tienda', 'Tienda de mascotas', ShoppingBag)}
          {renderLink('/opiniones', 'Opiniones', MessageSquareHeart)}
          {renderLink('/ajustes', 'Ajustes', Settings)}
          {renderLink('/ayuda', 'Centro de ayuda', CircleHelp)}
        </div>
      </details>
    </div>
  )
}

export default function Sidebar() {
  const open = useUIStore((s) => s.sidebarOpen)
  const close = useUIStore((s) => s.closeSidebar)
  const [newOpen, setNewOpen] = useState(false)
  const touchX = useRef<number | null>(null)
  const touchY = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

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
    if (dx < -70 && Math.abs(dx) > Math.abs(dy) * 1.2) close()
  }

  const openNew = () => {
    setNewOpen(true)
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 sm:hidden" onClick={close} />}
      <aside
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
        className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--border)] bg-[var(--bg)] p-4 transition-transform duration-200 sm:hidden"
      >
        <div className="mb-6 mt-2 flex shrink-0 items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-192.png" alt="Quacker" className="h-8 w-8 rounded-lg" />
            <span className="text-sm font-bold tracking-tight">Quacker</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={close}
              className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavList onNavigate={close} />
        </div>
        <button
          onClick={() => {
            setNewOpen(true)
            close()
          }}
          className="mt-3 flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--accent)] hover:bg-[var(--surface)]"
        >
          <Plus className="h-4 w-4" /> Nuevo apartado
        </button>
        <Link
          to="/creditos"
          onClick={close}
          className="mt-2 flex shrink-0 items-center justify-center gap-1 rounded-lg px-3 py-2 text-[11px] text-[var(--text-muted)] opacity-70 transition-opacity hover:opacity-100"
        >
          {APP_NAME} <span className="text-[var(--accent)]">v{APP_VERSION}</span> · Créditos
        </Link>
      </aside>
      <aside className="hidden w-64 shrink-0 flex-col gap-2 border-r border-[var(--border)] p-4 sm:flex">
        <div className="mb-4 mt-2 flex shrink-0 items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-192.png" alt="Quacker" className="h-8 w-8 rounded-lg" />
            <span className="text-sm font-bold tracking-tight">Quacker</span>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavList />
        </div>
        <button
          onClick={openNew}
          className="mt-2 flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--accent)] hover:bg-[var(--surface)]"
        >
          <Plus className="h-4 w-4" /> Nuevo apartado
        </button>
        <Link
          to="/creditos"
          className="mt-2 flex shrink-0 items-center justify-center gap-1 rounded-lg px-3 py-2 text-[11px] text-[var(--text-muted)] opacity-70 transition-opacity hover:opacity-100"
        >
          {APP_NAME} <span className="text-[var(--accent)]">v{APP_VERSION}</span> · Créditos
        </Link>
      </aside>
      <NewSectionModal open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  )
}
