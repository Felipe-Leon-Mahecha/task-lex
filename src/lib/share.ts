import { Share } from '@capacitor/share'

export async function shareTask(title: string, description: string) {
  try {
    const text = description ? `${title}\n\n${description}` : title
    await Share.share({
      title: 'Flux - Tarea',
      text: text,
      dialogTitle: 'Compartir tarea',
    })
  } catch (error) {
    console.error('Error sharing task:', error)
  }
}
