import { useSettingsStore } from '../store/settings'

export type AppSound = 'season-roulette' | 'season-reveal' | 'coin-reward' | 'task-complete' | 'ui-click' | 'notification' | 'purchase' | 'premium' | 'duck-purchase' | 'system-notification' | 'task-delete' | 'skin-favorite' | 'sidebar-open' | 'app-start' | 'notes-open' | 'shop-open'

const SOUND_FILES: Record<AppSound, string> = {
  'season-roulette': 'sound-10.mp3',
  'season-reveal': 'season-reveal.mp3',
  'coin-reward': 'coin-reward.mp3',
  'task-complete': 'sound-6.mp3',
  'ui-click': 'sound-1.mp3',
  notification: 'notification.mp3',
  purchase: 'sound-5.mp3',
  premium: 'sound-5.mp3',
  'duck-purchase': 'duck-purchase.mp3',
  'system-notification': 'notification-system.mp3',
  'task-delete': 'sound-11.mp3',
  'skin-favorite': 'sound-14.mp3',
  'sidebar-open': 'sound-15.mp3',
  'app-start': 'sound-7.mp3',
  'notes-open': 'sound-8.mp3',
  'shop-open': 'sound-9.mp3',
}

function soundUrl(sound: AppSound): string {
  return `${import.meta.env.BASE_URL}sounds/${SOUND_FILES[sound]}`
}

/** Plays downloaded CC0 SFX assets. The user's sound switch and volume control every effect. */
export function playAppSound(sound: AppSound, volume = 0.3, playbackRate = 1): HTMLAudioElement | null {
  if (typeof window === 'undefined' || !useSettingsStore.getState().soundsEnabled) return null

  const audio = new Audio(soundUrl(sound))
  audio.preload = 'auto'
  audio.volume = Math.max(0, Math.min(1, volume * useSettingsStore.getState().soundVolume / 100))
  audio.playbackRate = playbackRate
  void audio.play().catch(() => {
    // Browsers may block audio until the first user gesture. The next intentional action retries it.
  })
  return audio
}

/** Start sound on launch where autoplay is allowed; otherwise play once after the first gesture. */
export function playAppStartupSound() {
  if (typeof window === 'undefined' || !useSettingsStore.getState().soundsEnabled) return
  const audio = new Audio(soundUrl('app-start'))
  audio.volume = Math.max(0, Math.min(1, 0.16 * useSettingsStore.getState().soundVolume / 100))
  let started = false
  const cleanup = () => {
    document.removeEventListener('pointerdown', retry)
    document.removeEventListener('keydown', retry)
  }
  const retry = () => {
    if (started) return
    started = true
    cleanup()
    playAppSound('app-start', 0.16)
  }
  void audio.play().then(() => {
    started = true
    cleanup()
  }).catch(() => {
    document.addEventListener('pointerdown', retry, { once: true })
    document.addEventListener('keydown', retry, { once: true })
  })
}

export function startSeasonRouletteSound(): () => void {
  if (typeof window === 'undefined' || !useSettingsStore.getState().soundsEnabled) return () => undefined
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => undefined

  // The downloaded wheel cue is 3.2 s; gently slow it to follow the 4.2 s card roulette.
  const audio = playAppSound('season-roulette', 0.18, 0.78)
  if (!audio) return () => undefined
  const stop = () => {
    audio.pause()
    audio.currentTime = 0
  }
  audio.addEventListener('ended', stop, { once: true })
  return stop
}

export function playSeasonRevealSound() {
  playAppSound('season-reveal', 0.2)
}

export function playCoinPickupSound() {
  playAppSound('coin-reward', 0.13)
}

export function playBadgeUnlockSound() {
  playSeasonRevealSound()
}

export function playPurchaseSound() {
  playAppSound('purchase', 0.16)
}

export function playPremiumUnlockSound() {
  playAppSound('premium', 0.22)
}

export function playDuckPurchaseSound() {
  playAppSound('duck-purchase', 0.16)
}
