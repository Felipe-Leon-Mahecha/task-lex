// Web Audio API for custom sounds without external files
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

export function playTaskComplete() {
  try {
    const ctx = audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1) // E5
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2) // G5
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch (error) {
    console.error('Error playing task complete sound:', error)
  }
}

export function playNewTask() {
  try {
    const ctx = audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(440, ctx.currentTime) // A4
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime + 0.05) // C5
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  } catch (error) {
    console.error('Error playing new task sound:', error)
  }
}

export function playDeleteTask() {
  try {
    const ctx = audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(330, ctx.currentTime) // E4
    oscillator.frequency.setValueAtTime(220, ctx.currentTime + 0.1) // A3
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  } catch (error) {
    console.error('Error playing delete task sound:', error)
  }
}

export function playNotification() {
  try {
    const ctx = audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  } catch (error) {
    console.error('Error playing notification sound:', error)
  }
}
