import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, KeyRound, LogOut, Shield, Trash2, User, UserX, Cloud, Database } from 'lucide-react'
import Modal from './Modal'
import { useAuthStore } from '../../store/auth'
import { deleteAccount, clearLocalData } from '../../lib/deleteAccount'
import { exportJSON, lastBackupAt } from '../../lib/backup'
import { useOfflineStore } from '../../store/offline'
import { lastCloudSyncAt } from '../../lib/syncStatus'

export default function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user)
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset)
  const signOut = useAuthStore((s) => s.signOut)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)
  const isOnline = useOfflineStore((s) => s.isOnline)
  const pendingOperations = useOfflineStore((s) => s.pendingOperations.length)
  const [lastBackup, setLastBackup] = useState<number | null>(() => lastBackupAt())
  const [lastSync, setLastSync] = useState<number | null>(() => lastCloudSyncAt(user?.uid))

  useEffect(() => {
    const backup = () => setLastBackup(lastBackupAt())
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ uid: string; time: number }>).detail
      if (detail?.uid === user?.uid) setLastSync(detail.time)
    }
    window.addEventListener('tasklex:backup-exported', backup)
    window.addEventListener('tasklex:cloud-synced', sync)
    return () => { window.removeEventListener('tasklex:backup-exported', backup); window.removeEventListener('tasklex:cloud-synced', sync) }
  }, [user?.uid])

  const formatDate = (time: number | null) => time ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(time)) : 'Sin registro todavía'

  if (!user) return null
  const provider = user.providerData[0]?.providerId

  const doDelete = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    const res = await deleteAccount(user.uid)
    if (res === 'ok') {
      clearLocalData()
      window.location.reload()
      return
    }
    setBusy(false)
    setError(
      res === 'recent-login'
        ? 'Por seguridad tu sesión es demasiado antigua para borrar la cuenta. Cierra sesión, vuelve a entrar e inténtalo otra vez.'
        : 'No se pudo eliminar la cuenta. Revisa tu conexión e inténtalo de nuevo.',
    )
  }

  const copyUid = () => {
    setCopied(true)
    navigator.clipboard?.writeText(user.uid).catch(() => {})
    setTimeout(() => setCopied(false), 1500)
  }

  const doReset = async () => {
    if (busy) return
    setBusy(true)
    await sendPasswordReset(user.email ?? '')
    setBusy(false)
    setSent(true)
  }

  const close = () => {
    if (busy) return
    setConfirmDelete(false)
    setError(null)
    setSent(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={close} title="Mi cuenta">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)]">
            <User className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--text)]">{user.displayName ?? 'Sin nombre'}</p>
            <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <Shield className="h-3 w-3" />
              {provider === 'google.com' ? 'Cuenta con Google' : 'Correo y contraseña'}
            </p>
          </div>
        </div>

        <button
          onClick={copyUid}
          className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
        >
          <span className="truncate">ID: {user.uid}</span>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
        </button>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><p className="flex items-center gap-1.5 text-xs font-bold"><Cloud className="h-3.5 w-3.5 text-[var(--accent)]" />Sincronización</p><p className="mt-1 text-[10px] text-[var(--text-muted)]">{isOnline ? 'Conexión disponible' : 'Sin conexión'}{pendingOperations ? ` · ${pendingOperations} cambio${pendingOperations === 1 ? '' : 's'} pendiente${pendingOperations === 1 ? '' : 's'}` : ''}</p><p className="mt-1 text-[10px] text-[var(--text-muted)]">Última sincronización: {formatDate(lastSync)}</p></div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><p className="flex items-center gap-1.5 text-xs font-bold"><Database className="h-3.5 w-3.5 text-[var(--accent)]" />Copia de seguridad</p><p className="mt-1 text-[10px] text-[var(--text-muted)]">Última exportación: {formatDate(lastBackup)}</p></div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link to="/tienda?panel=temas" onClick={close} className="flex items-center justify-center rounded-xl border border-[var(--border)] px-3 py-2.5 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]">Temas y colores</Link>
          <button onClick={exportJSON} className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]">Exportar mis datos</button>
        </div>
        <p className="text-center text-[10px] text-[var(--text-muted)]">Incluye tareas, notas, apartados y preferencias.</p>

        {provider !== 'google.com' && (
          <button
            onClick={doReset}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" /> Cambiar contraseña
          </button>
        )}
        {sent && <p className="text-xs text-[var(--accent)]">Revisa tu correo: te enviamos el link de restablecimiento.</p>}

        <button
          onClick={() => {
            signOut()
            setConfirmDelete(false)
            onClose()
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
        )}

        {confirmDelete ? (
          <div className="space-y-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
            <p className="text-sm text-[var(--text-muted)]">
              Esta acción es <span className="font-bold text-red-400">definitiva</span>. Se borrarán tu cuenta, todas tus tareas,
              apartados, fotos adjuntas, monedas y skins. No habrá forma de recuperar nada.
            </p>
            <button
              onClick={doDelete}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white transition-opacity hover:bg-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> {busy ? 'Eliminando...' : 'Sí, eliminar todo definitivamente'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
              className="w-full rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/50 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
          >
            <UserX className="h-4 w-4" /> Eliminar cuenta
          </button>
        )}
      </div>
    </Modal>
  )
}
