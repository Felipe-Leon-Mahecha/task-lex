import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUid } from '../lib/session'
import { saveSettings } from '../lib/taskDb'

interface SettingsState {
  dailyGoal: number
  focusMinutes: number
  shortBreak: number
  notificationsOn: boolean
  setDailyGoal: (n: number) => void
  setFocusMinutes: (n: number) => void
  setShortBreak: (n: number) => void
  setNotificationsOn: (on: boolean) => void
}

function pushToCloud(s: SettingsState) {
  const uid = getUid()
  if (!uid) return
  saveSettings(uid, {
    dailyGoal: s.dailyGoal,
    focusMinutes: s.focusMinutes,
    shortBreak: s.shortBreak,
    notificationsOn: s.notificationsOn,
  }).catch(() => {})
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      dailyGoal: 5,
      focusMinutes: 25,
      shortBreak: 5,
      notificationsOn: true,
      setDailyGoal: (n) =>
        set((s) => {
          const next = { ...s, dailyGoal: Math.min(50, Math.max(0, Math.round(n))) }
          pushToCloud(next)
          return next
        }),
      setFocusMinutes: (n) =>
        set((s) => {
          const next = { ...s, focusMinutes: Math.min(120, Math.max(1, Math.round(n))) }
          pushToCloud(next)
          return next
        }),
      setShortBreak: (n) =>
        set((s) => {
          const next = { ...s, shortBreak: Math.min(60, Math.max(1, Math.round(n))) }
          pushToCloud(next)
          return next
        }),
      setNotificationsOn: (on) =>
        set((s) => {
          const next = { ...s, notificationsOn: on }
          pushToCloud(next)
          return next
        }),
    }),
    { name: 'task-lex-settings' },
  ),
)
