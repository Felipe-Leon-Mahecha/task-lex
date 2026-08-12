import { Haptics, ImpactStyle } from '@capacitor/haptics'

export async function hapticImpact(style: ImpactStyle = ImpactStyle.Medium) {
  try {
    await Haptics.impact({ style })
  } catch (error) {
    console.error('Error playing haptic feedback:', error)
  }
}

export async function hapticNotification() {
  try {
    await Haptics.notification()
  } catch (error) {
    console.error('Error playing haptic notification:', error)
  }
}

export async function hapticSelection() {
  try {
    await Haptics.selectionChanged()
  } catch (error) {
    console.error('Error playing haptic selection:', error)
  }
}
