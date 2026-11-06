import { useState } from 'react'
import { Menu, Wifi, WifiOff, RefreshCw, User } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useUIStore } from '../../store/ui'
import { useOfflineStore } from '../../store/offline'
import SearchBox from './SearchBox'
import AccountModal from '../ui/AccountModal'
import { playAppSound } from '../../lib/soundEffects'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const demo = useAuthStore((s) => s.demo)
  const openSidebar = useUIStore((s) => s.openSidebar)
  const isOnline = useOfflineStore((s) => s.isOnline)
  const pendingOperations = useOfflineStore((s) => s.pendingOperations)
  const [accountOpen, setAccountOpen] = useState(false)

  const status = demo ? 'Modo local' : isOnline ? 'Sincronizado' : 'Offline'
  const hasPending = pendingOperations.length > 0

  return (
    <>
      <header className="flex items-center gap-3 border-b border-[var(--border)] px-3 pb-3 pt-7 sm:gap-4 sm:px-8">
        <button
          onClick={() => { playAppSound('sidebar-open', 0.18); openSidebar() }}
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
            onClick={() => setAccountOpen(true)}
            title="Mi cuenta"
            data-tut="account"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            aria-label="Mi cuenta"
          >
            <User className="h-5 w-5" />
          </button>
        )}
      </header>
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  )
}
