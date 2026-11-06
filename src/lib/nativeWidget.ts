import { Capacitor, registerPlugin } from '@capacitor/core'

interface QuackerWidgetPlugin {
  syncWidget(options: { pendingCount: number; petName: string; imageBase64: string; tasksJson: string }): Promise<{ updated: boolean }>
}

export interface NativeWidgetTask {
  id: string
  title: string
  sectionId: string
  section: string
  when: string
}

const QuackerWidget = registerPlugin<QuackerWidgetPlugin>('QuackerWidget')
let latestSync = 0

async function imageToBase64(imageUrl: string): Promise<string> {
  try {
    const image = new Image()
    image.src = imageUrl
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('No se pudo cargar la mascota'))
    })
    const canvas = document.createElement('canvas')
    canvas.width = 192
    canvas.height = 192
    const context = canvas.getContext('2d')
    if (!context) return ''
    context.clearRect(0, 0, 192, 192)
    const scale = Math.min(192 / image.naturalWidth, 192 / image.naturalHeight)
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    context.drawImage(image, (192 - width) / 2, (192 - height) / 2, width, height)
    return canvas.toDataURL('image/png').split(',')[1] ?? ''
  } catch {
    return ''
  }
}

export async function syncMascotWidget(data: {
  pendingCount: number
  petName: string
  imageUrl: string
  tasks: NativeWidgetTask[]
}): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  const requestId = ++latestSync
  const imageBase64 = await imageToBase64(data.imageUrl)
  if (requestId !== latestSync) return
  try {
    await QuackerWidget.syncWidget({
      pendingCount: data.pendingCount,
      petName: data.petName,
      imageBase64,
      tasksJson: JSON.stringify(data.tasks),
    })
  } catch {
    // The app continues to work normally if the Android launcher has no widget placed.
  }
}
