import { Capacitor } from '@capacitor/core'

export async function startVoiceRecognition(): Promise<string> {
  if (Capacitor.getPlatform() === 'android') {
    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition')

    const perm = await SpeechRecognition.checkPermissions()
    if (perm.speechRecognition !== 'granted') {
      await SpeechRecognition.requestPermissions()
    }

    const result = await SpeechRecognition.start({
      language: 'es-CO',
      maxResults: 1,
      popup: true,
      partialResults: false,
    })

    if (result.matches && result.matches.length > 0) {
      return result.matches[0]
    }
    throw new Error('no-speech')
  }

  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'))
      return
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()
    let gotResult = false

    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      if (event.results && event.results.length > 0) {
        gotResult = true
        resolve(event.results[0][0].transcript)
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        reject(new Error('no-speech'))
      } else {
        reject(new Error(event.error))
      }
    }

    recognition.onend = () => {
      if (!gotResult) {
        setTimeout(() => {
          if (!gotResult) reject(new Error('no-speech'))
        }, 300)
      }
    }

    try {
      recognition.start()
    } catch {
      reject(new Error('Failed to start'))
    }
  })
}

export function isVoiceRecognitionSupported(): boolean {
  if (Capacitor.getPlatform() === 'android') return true
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}
