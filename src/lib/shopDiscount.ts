export type WeekendDiscount = { skinId: string; percent: number; period: string } | null

function easterSunday(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  return new Date(year, month - 1, ((h + l - 7 * m + 114) % 31) + 1)
}

function colombianHolidayDays(year: number): Set<string> {
  const days = new Set<string>()
  const add = (date: Date, mondayTransfer = false) => {
    const moved = new Date(date)
    if (mondayTransfer && moved.getDay() !== 1) moved.setDate(moved.getDate() + ((8 - moved.getDay()) % 7))
    days.add(`${moved.getFullYear()}-${moved.getMonth()}-${moved.getDate()}`)
  }
  for (const [month, date] of [[0, 1], [4, 1], [6, 20], [7, 7], [11, 8], [11, 25]]) add(new Date(year, month, date))
  for (const [month, date] of [[0, 6], [2, 19], [5, 29], [7, 15], [9, 12], [10, 1], [10, 11]]) add(new Date(year, month, date), true)
  const easter = easterSunday(year)
  for (const daysAfter of [-3, -2, 43, 64, 71]) {
    const day = new Date(easter); day.setDate(day.getDate() + daysAfter)
    add(day, daysAfter > 0)
  }
  return days
}

export function getWeekendDiscount<T extends { id: string }>(date: Date, skins: readonly T[]): WeekendDiscount {
  if (!skins.length) return null
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dow = today.getDay()
  const holidays = colombianHolidayDays(today.getFullYear())
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  const friday = new Date(today); friday.setDate(today.getDate() - ((dow + 2) % 7))
  const saturday = new Date(today); saturday.setDate(today.getDate() - ((dow + 1) % 7))
  let start: Date, end: Date
  const fridayHoliday = holidays.has(key(friday))
  const monday = new Date(saturday); monday.setDate(saturday.getDate() + 2)
  const mondayHoliday = holidays.has(key(monday))
  if (dow === 5 && fridayHoliday) { start = new Date(friday); end = new Date(friday); end.setDate(end.getDate() + 2) }
  else if (dow === 6 || dow === 0) { start = fridayHoliday ? new Date(friday) : new Date(saturday); end = new Date(saturday); end.setDate(end.getDate() + (mondayHoliday ? 2 : 1)) }
  else if (dow === 1 && mondayHoliday) { start = new Date(saturday); end = new Date(monday) }
  else return null
  if (today < start || today > end) return null
  const period = key(start)
  let seed = 0
  for (const char of period) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0
  const skinId = skins[seed % skins.length].id
  const percent = [10, 15, 20, 25, 30, 40][(seed >>> 8) % 6]
  return { skinId, percent, period }
}
