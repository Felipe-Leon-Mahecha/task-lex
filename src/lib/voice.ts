export function startVoiceRecognition(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'))
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    let gotResult = false
    
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      if (event.results && event.results.length > 0) {
        gotResult = true
        const transcript = event.results[0][0].transcript
        resolve(transcript)
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
          if (!gotResult) {
            reject(new Error('no-speech'))
          }
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
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}
