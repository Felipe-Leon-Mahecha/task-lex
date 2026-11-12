import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCacheUid, getUid } from '../lib/session'
import { loadThemeCache, saveThemeCache } from '../lib/userData'
import { saveSettings } from '../lib/taskDb'

interface SettingsState {
  dailyGoal: number
  focusMinutes: number
  shortBreak: number
  notificationsOn: boolean
  appThemeId: string
  accentThemeId: string
  calendarSync: boolean
  dailyReminderFrequency: number
  soundsEnabled: boolean
  soundVolume: number
  autoBackup: boolean
  backupFrequency: number
  foxEnabled: boolean
  foxRandomMessages: boolean
  foxExpressions: boolean
  petQuotes: boolean
  alarmTone: { name: string; path: string } | null
  compactTasks: boolean
  largeText: boolean
  highContrast: boolean
  seasonalEffects: boolean
  seasonalSpiders: boolean
  seasonalWeather: boolean
  petAnchored: boolean
  petPosition: { x: number; y: number } | null
  setAlarmTone: (tone: { name: string; path: string } | null) => void
  setCompactTasks: (on: boolean) => void
  setLargeText: (on: boolean) => void
  setHighContrast: (on: boolean) => void
  setSeasonalEffects: (on: boolean) => void
  setSeasonalSpiders: (on: boolean) => void
  setSeasonalWeather: (on: boolean) => void
  setPetAnchored: (anchored: boolean) => void
  setPetPosition: (position: { x: number; y: number } | null) => void
  setPetQuotes: (on: boolean) => void
  setDailyGoal: (n: number) => void
  setFocusMinutes: (n: number) => void
  setShortBreak: (n: number) => void
  setNotificationsOn: (on: boolean) => void
  setAppThemeId: (id: string) => void
  setAccentThemeId: (id: string) => void
  setCalendarSync: (enabled: boolean) => void
  setDailyReminderFrequency: (freq: number) => void
  setSoundsEnabled: (enabled: boolean) => void
  setSoundVolume: (volume: number) => void
  setAutoBackup: (enabled: boolean) => void
  setBackupFrequency: (freq: number) => void
  setFoxEnabled: (enabled: boolean) => void
  setFoxRandomMessages: (enabled: boolean) => void
  setFoxExpressions: (enabled: boolean) => void
}

function pushToCloud(s: SettingsState) {
  const uid = getUid()
  if (!uid) return
  saveSettings(uid, {
    appThemeId: s.appThemeId,
    accentThemeId: s.accentThemeId,
    calendarSync: s.calendarSync,
    dailyGoal: s.dailyGoal,
    focusMinutes: s.focusMinutes,
    shortBreak: s.shortBreak,
    notificationsOn: s.notificationsOn,
    autoBackup: s.autoBackup,
    backupFrequency: s.backupFrequency,
  }).catch(() => {})
}

function initialTheme(): { appThemeId: string; accentThemeId: string } {
  const cached = loadThemeCache(getCacheUid())
  return {
    appThemeId: cached?.appThemeId ?? 'cielo',
    accentThemeId: cached?.accentThemeId ?? 'dorado',
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      dailyGoal: 5,
      focusMinutes: 25,
      shortBreak: 5,
      notificationsOn: true,
      appThemeId: initialTheme().appThemeId,
      accentThemeId: initialTheme().accentThemeId,
      calendarSync: false,
      dailyReminderFrequency: 2,
      soundsEnabled: true,
      soundVolume: 65,
      autoBackup: false,
      backupFrequency: 7,
      foxEnabled: true,
      foxRandomMessages: true,
      foxExpressions: true,
      petQuotes: true,
      alarmTone: null,
      compactTasks: true,
      largeText: false,
      highContrast: false,
      seasonalEffects: true,
      seasonalSpiders: true,
      seasonalWeather: true,
      petAnchored: true,
      petPosition: null,
      setPetAnchored: (petAnchored) => set({ petAnchored }),
      setPetPosition: (petPosition) => set({ petPosition }),
      setSeasonalEffects: (on) => set({ seasonalEffects: on }),
      setSeasonalSpiders: (on) => set({ seasonalSpiders: on }),
      setSeasonalWeather: (on) => set({ seasonalWeather: on }),
      setAlarmTone: (tone) => set({ alarmTone: tone }),
      setCompactTasks: (on) => set({ compactTasks: on }),
      setLargeText: (on) => set({ largeText: on }),
      setHighContrast: (on) => set({ highContrast: on }),
      setPetQuotes: (on) => set({ petQuotes: on }),
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
          saveThemeCache(getUid() ?? getCacheUid(), next.appThemeId, next.accentThemeId)
          return next
        }),
      setAccentThemeId: (id) =>
        set((s) => {
          const next = { ...s, accentThemeId: id }
          pushToCloud(next)
          saveThemeCache(getUid() ?? getCacheUid(), next.appThemeId, next.accentThemeId)
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
      setSoundVolume: (volume) => set({ soundVolume: Math.max(0, Math.min(100, Math.round(volume))) }),
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
      setFoxEnabled: (enabled) =>
        set((s) => ({ ...s, foxEnabled: enabled })),
      setFoxRandomMessages: (enabled) =>
        set((s) => ({ ...s, foxRandomMessages: enabled })),
      setFoxExpressions: (enabled) =>
        set((s) => ({ ...s, foxExpressions: enabled })),
    }),
    {
      name: 'task-lex-settings',
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<SettingsState>
        return version < 2 ? { ...state, compactTasks: true } as SettingsState : state as SettingsState
      },
    },
  ),
)
