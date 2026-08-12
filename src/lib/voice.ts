export function startVoiceRecognition(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'))
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      resolve(transcript)
    }

    recognition.onerror = (event: any) => {
      reject(new Error(event.error))
    }

    recognition.onend = () => {
      if (!recognition.result) {
        reject(new Error('No result'))
      }
    }

    recognition.start()
  })
}

export function isVoiceRecognitionSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}
