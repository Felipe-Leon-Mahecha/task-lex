import type { Task } from '../types/task'
import { startOfDay } from './dateUtils'

export function completedTodayCount(tasks: Task[]): number {
  const today = startOfDay(new Date()).getTime()
  return tasks.filter(
    (t) => t.status === 'done' && t.completedAt && startOfDay(t.completedAt).getTime() === today,
  ).length
}
