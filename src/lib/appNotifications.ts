export type AppNoticeKind = 'success' | 'info' | 'warning' | 'error'

export interface AppNotice {
  title: string
  message: string
  kind?: AppNoticeKind
  duration?: number
}

export function notifyApp(notice: AppNotice) {
  if (typeof window === 'undefined' || !notice.message.trim()) return
  window.dispatchEvent(new CustomEvent<AppNotice>('tasklex:notify', { detail: notice }))
}
