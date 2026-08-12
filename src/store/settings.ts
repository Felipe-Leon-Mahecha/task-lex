import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUid } from '../lib/session'
import { saveSettings } from '../lib/taskDb'

interface SettingsState {
  dailyGoal: number
  focusMinutes: number
  shortBreak: number
  notificationsOn: boolean
  appThemeId: string
  accentThemeId: string
  autoDarkMode: boolean
  calendarSync: boolean
  dailyReminderFrequency: number
  soundsEnabled: boolean
  autoBackup: boolean
  backupFrequency: number
  setDailyGoal: (n: number) => void
  setFocusMinutes: (n: number) => void
  setShortBreak: (n: number) => void
  setNotificationsOn: (on: boolean) => void
  setAppThemeId: (id: string) => void
  setAccentThemeId: (id: string) => void
  setAutoDarkMode: (enabled: boolean) => void
  setCalendarSync: (enabled: boolean) => void
  setDailyReminderFrequency: (freq: number) => void
  setSoundsEnabled: (enabled: boolean) => void
  setAutoBackup: (enabled: boolean) => void
  setBackupFrequency: (freq: number) => void
}

function pushToCloud(s: SettingsState) {
  const uid = getUid()
  if (!uid) return
  saveSettings(uid, {
    appThemeId: s.appThemeId,
    accentThemeId: s.accentThemeId,
    autoDarkMode: s.autoDarkMode,
    calendarSync: s.calendarSync,
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
      appThemeId: 'dark',
      accentThemeId: 'gold',
      autoDarkMode: true,
      calendarSync: false,
      dailyReminderFrequency: 2,
      soundsEnabled: true,
      autoBackup: false,
      backupFrequency: 7,
      setDailyGoal: (n: number) =>
        set((s) => {
          const next = { ...s, dailyGoal: Math.min(50, Math.max(0, Math.round(n))) }
          pushToCloud(next)
          return next
        }),
      setFocusMinutes: (n: number) =>
        set((s) => {
          const next = { ...s, focusMinutes: Math.min(120, Math.max(1, Math.round(n))) }
          pushToCloud(next)
          return next
        }),
      setShortBreak: (n: number) =>
        set((s) => {
          const next = { ...s, shortBreak: Math.min(60, Math.max(1, Math.round(n))) }
          pushToCloud(next)
          return next
        }),
      setNotificationsOn: (on: boolean) =>
        set((s) => {
          const next = { ...s, notificationsOn: on }
          pushToCloud(next)
          return next
        }),
      setAppThemeId: (id) =>
        set((s) => {
          const next = { ...s, appThemeId: id }
          pushToCloud(next)
          return next
        }),
      setAccentThemeId: (id) =>
        set((s) => {
          const next = { ...s, accentThemeId: id }
          pushToCloud(next)
          return next
        }),
      setAutoDarkMode: (auto) =>
        set((s) => {
          const next = { ...s, autoDarkMode: auto }
          pushToCloud(next)
          return next
        }),
      setCalendarSync: (enabled) =>
        set((s) => {
          const next = { ...s, calendarSync: enabled }
          pushToCloud(next)
          return next
        }),
      setDailyReminderFrequency: (freq: number) =>
        set((s) => {
          const next = { ...s, dailyReminderFrequency: Math.min(5, Math.max(1, Math.round(freq))) }
          pushToCloud(next)
          return next
        }),
      setSoundsEnabled: (enabled) =>
        set((s) => {
          const next = { ...s, soundsEnabled: enabled }
          pushToCloud(next)
          return next
        }),
      setAutoBackup: (enabled) =>
        set((s) => {
          const next = { ...s, autoBackup: enabled }
          pushToCloud(next)
          return next
        }),
      setBackupFrequency: (freq) =>
        set((s) => {
          const next = { ...s, backupFrequency: Math.min(30, Math.max(1, Math.round(freq))) }
          pushToCloud(next)
          return next
        }),
    }),
    { name: 'task-lex-settings' },
  ),
)
