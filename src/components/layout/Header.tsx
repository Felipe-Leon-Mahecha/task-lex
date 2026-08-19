import { useState } from 'react'
import { LogOut, Menu, Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useUIStore } from '../../store/ui'
import { useOfflineStore } from '../../store/offline'
import SearchBox from './SearchBox'
import Modal from '../ui/Modal'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const demo = useAuthStore((s) => s.demo)
  const signOut = useAuthStore((s) => s.signOut)
  const openSidebar = useUIStore((s) => s.openSidebar)
  const openFocus = useUIStore((s) => s.openFocus)
  const isOnline = useOfflineStore((s) => s.isOnline)
  const pendingOperations = useOfflineStore((s) => s.pendingOperations)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const status = demo ? 'Modo local' : isOnline ? 'Sincronizado' : 'Offline'
  const hasPending = pendingOperations.length > 0

  return (
    <>
      <header className="flex items-center gap-3 border-b border-[var(--border)] px-3 pb-3 pt-7 sm:gap-4 sm:px-8">
        <button
          onClick={openSidebar}
          title="Abrir menú"
          data-tut="menu"
          className="rounded-full p-2.5 text-[var(--text)] hover:bg-[var(--surface-2)] sm:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-7 w-7" />
        </button>
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <SearchBox />
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-400" />
            )}
            {status}
          </span>
          {hasPending && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--accent)]">
              <RefreshCw className="h-3 w-3 animate-spin" />
              {pendingOperations.length} pendiente{pendingOperations.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {user && (
          <button
            onClick={() => setLogoutOpen(true)}
            title="Cerrar sesión"
            data-tut="logout"
            className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={openFocus}
          title="Modo foco"
          data-tut="focus"
          className="rounded-full p-2 text-[var(--accent)] hover:bg-[var(--surface-2)]"
          aria-label="Modo foco"
        >
          <Clock className="h-5 w-5" />
        </button>
      </header>
      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Cerrar sesión"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            ¿Seguro que quieres cerrar sesión?
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                signOut()
                setLogoutOpen(false)
              }}
              className="btn-primary justify-center"
            >
              Cerrar sesión
            </button>
            <button
              onClick={() => setLogoutOpen(false)}
              className="rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
