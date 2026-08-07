import { useEffect, useState } from 'react'
import { LogOut, Menu, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useUIStore } from '../../store/ui'
import SearchBox from './SearchBox'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const demo = useAuthStore((s) => s.demo)
  const signOut = useAuthStore((s) => s.signOut)
  const openSidebar = useUIStore((s) => s.openSidebar)
  const openFocus = useUIStore((s) => s.openFocus)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  const status = demo ? 'Modo local' : online ? 'Sincronizado' : 'Offline'

  return (
    <header className="flex items-center gap-3 border-b border-[var(--border)] px-3 pb-3 pt-7 sm:gap-4 sm:px-8">
      <button
        onClick={openSidebar}
        title="Abrir menú"
        data-tut="menu"
        className="rounded-full p-2.5 text-[var(--text)] hover:bg-[var(--surface-2)] sm:hidden"
      >
        <Menu className="h-7 w-7" />
      </button>
      <div className="min-w-0 flex-1 sm:max-w-xs">
        <SearchBox />
      </div>
      <span className="hidden items-center gap-1.5 text-[11px] text-[var(--text-muted)] sm:flex">
        <span
          className={`h-2 w-2 rounded-full ${
            demo ? 'bg-[var(--accent)]' : online ? 'bg-emerald-400' : 'bg-red-400'
          }`}
        />
        {status}
      </span>
      {user && (
        <button
          onClick={() => signOut()}
          title="Cerrar sesión"
          data-tut="logout"
          className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={openFocus}
        title="Modo foco"
        data-tut="focus"
        className="rounded-full p-2 text-[var(--accent)] hover:bg-[var(--surface-2)]"
      >
        <Clock className="h-5 w-5" />
      </button>
    </header>
  )
}
