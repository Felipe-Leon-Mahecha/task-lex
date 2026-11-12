export type HolidayPreview = 'auto' | 'month' | 'christmas24' | 'christmas25' | 'newyear'

const KEY = 'quacker-holiday-preview'
const EVENT = 'tasklex:holiday-preview'

export function getHolidayPreview(): HolidayPreview {
  try {
    const value = localStorage.getItem(KEY)
    if (value === 'month' || value === 'christmas24' || value === 'christmas25' || value === 'newyear') return value
  } catch {}
  return 'auto'
}

export function setHolidayPreview(value: HolidayPreview) {
  try { localStorage.setItem(KEY, value) } catch {}
  window.dispatchEvent(new Event(EVENT))
}

export const HOLIDAY_PREVIEW_EVENT = EVENT
