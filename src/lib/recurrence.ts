import type { Recurrence } from '../types/task'

export function nextOccurrence(date: Date, recurrence: Recurrence): Date {
  const d = new Date(date)
  if (recurrence === 'daily') d.setDate(d.getDate() + 1)
  else if (recurrence === 'weekly') d.setDate(d.getDate() + 7)
  else if (recurrence === 'monthly') {
    const dayOfMonth = d.getDate()
    d.setDate(1)
    d.setMonth(d.getMonth() + 1)
    d.setDate(Math.min(dayOfMonth, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()))
  }
  return d
}
