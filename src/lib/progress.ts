import type { Task } from '../types/task'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function completedTodayCount(tasks: Task[]): number {
  const today = startOfDay(new Date()).getTime()
  return tasks.filter(
    (t) => t.status === 'done' && t.completedAt && startOfDay(t.completedAt).getTime() === today,
  ).length
}
