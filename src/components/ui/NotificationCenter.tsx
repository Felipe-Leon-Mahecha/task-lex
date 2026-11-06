import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, Info, Medal, TriangleAlert, Undo2, X } from 'lucide-react'
import { useUndoStore } from '../../store/undo'
import { useTasksStore } from '../../store/tasks'
import { ACHIEVEMENT_SKIN_REWARDS, type Achievement } from '../../lib/achievements'
import type { AppNotice, AppNoticeKind } from '../../lib/appNotifications'
import type { Task } from '../../types/task'
import { playAppSound } from '../../lib/soundEffects'

type NoticeAction = { label: string; run: () => void }
type Notice = Omit<AppNotice, 'kind'> & { id: string; kind: AppNoticeKind | 'achievement'; action?: NoticeAction }
type UndoAction = ReturnType<typeof useUndoStore.getState>['actions'][number]

const NOTICE_TTL = 6_800

export default function NotificationCenter() {
  const [notices, setNotices] = useState<Notice[]>([])
  const timers = useRef(new Map<string, number>())
  const seenUndoIds = useRef(new Set<number>())
  const actions = useUndoStore((s) => s.actions)
  const undoLast = useUndoStore((s) => s.undoLast)
  const addTask = useTasksStore((s) => s.addTask)
  const updateTask = useTasksStore((s) => s.updateTask)

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) window.clearTimeout(timer)
    timers.current.delete(id)
    setNotices((current) => current.filter((item) => item.id !== id))
  }, [])

  const push = useCallback((notice: Omit<Notice, 'id'>) => {
    playAppSound(notice.kind === 'achievement' ? 'season-reveal' : 'notification', notice.kind === 'achievement' ? 0.2 : 0.15)
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const item = { ...notice, id }
    const timer = window.setTimeout(() => dismiss(id), notice.duration ?? NOTICE_TTL)
    timers.current.set(id, timer)
    setNotices((current) => {
      const next = [item, ...current]
      for (const dropped of next.slice(3)) {
        const droppedTimer = timers.current.get(dropped.id)
        if (droppedTimer) window.clearTimeout(droppedTimer)
        timers.current.delete(dropped.id)
      }
      return next.slice(0, 3)
    })
  }, [dismiss])

  useEffect(() => {
    const onNotice = (event: Event) => {
      const detail = (event as CustomEvent<AppNotice>).detail
      if (detail?.message) push({ title: detail.title || 'Quacker', message: detail.message, kind: detail.kind ?? 'info', duration: detail.duration })
    }
    const onAchievement = (event: Event) => {
      const achievement = (event as CustomEvent<Achievement>).detail
      if (!achievement) return
      const skin = ACHIEVEMENT_SKIN_REWARDS[achievement.id]
      const reward = skin ? `Recompensa disponible: skin Fox ${skin === 'fantasma' ? 'Fantasma' : skin}.` : achievement.reward > 0 ? `Recompensa disponible: ${achievement.reward} monedas.` : '¡Nueva insignia para tu colección!'
      push({
        title: achievement.season?.label ? '¡Logro de temporada desbloqueado!' : '¡Logro desbloqueado!',
        message: `${achievement.season?.label ? `${achievement.season.label} · ` : ''}${achievement.title}. ${achievement.desc} ${reward} Ve a Tienda > Logros para reclamarlo.`,
        kind: 'achievement',
        duration: 8_500,
      })
    }
    window.addEventListener('tasklex:notify', onNotice)
    window.addEventListener('tasklex:achievement', onAchievement)
    return () => {
      window.removeEventListener('tasklex:notify', onNotice)
      window.removeEventListener('tasklex:achievement', onAchievement)
    }
  }, [push])

  useEffect(() => {
    const action = actions[0]
    if (!action || seenUndoIds.current.has(action.timestamp)) return
    seenUndoIds.current.add(action.timestamp)
    const names: Record<UndoAction['type'], string> = {
      complete: 'Tarea completada', archive: 'Tarea archivada', delete: 'Tarea eliminada', move: 'Tarea movida',
      'bulk-restore': 'Tareas restauradas', 'bulk-delete': 'Tareas eliminadas',
    }
    const count = action.previousTasks?.length ?? 1
    const title = names[action.type]
    const message = action.type.startsWith('bulk-') ? `${count} ${count === 1 ? 'tarea' : 'tareas'} ${action.type === 'bulk-delete' ? 'eliminada' : 'restaurada'}${count === 1 ? '' : 's'}.` : 'Puedes recuperar el cambio durante unos segundos.'
    push({
      title,
      message,
      kind: action.type === 'complete' ? 'success' : 'info',
      duration: 7_500,
      action: { label: 'Deshacer', run: () => {
        const previous = undoLast()
        if (!previous) return
        if (previous.type === 'bulk-delete' && previous.previousTasks?.length) {
          previous.previousTasks.forEach((task) => addTask(task))
        } else if (previous.type === 'bulk-restore' && previous.previousTasks?.length) {
          previous.previousTasks.forEach((task) => updateTask(task.id, task))
        } else if ((previous.type === 'delete' || previous.type === 'bulk-delete') && previous.previousState) {
          addTask(previous.previousState as Task)
        } else if ((previous.type === 'complete' || previous.type === 'archive' || previous.type === 'move') && previous.previousState) {
          updateTask(previous.taskId, previous.previousState)
        }
      } },
    })
  }, [actions, undoLast, addTask, updateTask, push])

  useEffect(() => () => {
    for (const timer of timers.current.values()) window.clearTimeout(timer)
    timers.current.clear()
  }, [])

  if (!notices.length || typeof document === 'undefined') return null

  const icons = {
    success: <CircleCheck className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <TriangleAlert className="h-5 w-5" />,
    error: <TriangleAlert className="h-5 w-5" />,
    achievement: <Medal className="h-6 w-6" />,
  }
  const colors: Record<Notice['kind'], string> = {
    success: 'border-emerald-400/45 text-emerald-300 bg-emerald-400/10',
    info: 'border-sky-400/40 text-sky-300 bg-sky-400/10',
    warning: 'border-amber-400/50 text-amber-300 bg-amber-400/10',
    error: 'border-rose-400/50 text-rose-300 bg-rose-400/10',
    achievement: 'border-amber-300/60 text-amber-200 bg-gradient-to-br from-amber-300/20 via-fuchsia-400/10 to-sky-400/15',
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[250] flex flex-col items-center gap-2 px-3 sm:items-end sm:px-5" aria-live="polite" aria-relevant="additions text">
      {notices.map((notice) => <article key={notice.id} role="status" className={`notification-enter pointer-events-auto relative flex w-full max-w-[min(30rem,calc(100vw-1.5rem))] items-start gap-3 overflow-hidden rounded-2xl border bg-[var(--surface)]/95 p-3.5 pr-10 text-[var(--text)] shadow-[0_18px_55px_rgba(0,0,0,.34)] backdrop-blur-xl sm:p-4 ${notice.kind === 'achievement' ? 'ring-1 ring-amber-200/20' : ''}`}>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${colors[notice.kind]}`}>{icons[notice.kind]}</span>
        <div className="min-w-0 flex-1 py-0.5">
          <p className={`text-[10px] font-extrabold uppercase tracking-[.16em] ${notice.kind === 'achievement' ? 'text-amber-200' : 'text-[var(--text-muted)]'}`}>{notice.kind === 'achievement' ? '¡Hito desbloqueado!' : notice.title}</p>
          {notice.kind === 'achievement' && <p className="mt-0.5 text-sm font-extrabold text-[var(--text)]">{notice.title}</p>}
          <p className="mt-1 break-words text-xs leading-relaxed text-[var(--text-muted)]">{notice.message}</p>
          {notice.action && <button type="button" onClick={() => { notice.action?.run(); dismiss(notice.id) }} className="mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 text-xs font-bold text-[var(--bg)] transition hover:brightness-110"><Undo2 className="h-3.5 w-3.5" />{notice.action.label}</button>}
        </div>
        <button type="button" onClick={() => dismiss(notice.id)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label="Cerrar aviso"><X className="h-4 w-4" /></button>
        <span aria-hidden className={`notification-progress absolute inset-x-0 bottom-0 h-0.5 ${notice.kind === 'achievement' ? 'bg-gradient-to-r from-amber-300 via-fuchsia-400 to-sky-300' : 'bg-[var(--accent)]'}`} style={{ animationDuration: `${notice.duration ?? NOTICE_TTL}ms` }} />
      </article>)}
    </div>, document.body,
  )
}
