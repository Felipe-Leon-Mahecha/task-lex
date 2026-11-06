import { playAppSound } from './soundEffects'

/** Task and interface sounds use the downloaded, CC0 audio files in public/sounds. */
export function playTaskComplete() {
  playAppSound('task-complete', 0.16)
}

export function playNewTask() {
  playAppSound('ui-click', 0.1)
}

export function playDeleteTask() {
  playAppSound('task-delete', 0.2)
}

export function playNotification() {
  playAppSound('notification', 0.16)
}
