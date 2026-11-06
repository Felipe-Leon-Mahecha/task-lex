import { importSeasonsData, useSeasonsStore } from '../../store/seasons'

export function exportSeasonsJSON() {
  const s = useSeasonsStore.getState()
  const payload = {
    current: s.current,
    insignias: s.insignias,
    specials: s.specials,
    monthlyOdds: s.monthlyOdds,
    reSortsLeft: s.reSortsLeft,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-lex-temporadas-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importSeasonsJSON(file: File): Promise<{ ok: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as {
          current?: unknown
          insignias?: unknown
          specials?: unknown
          monthlyOdds?: unknown
          reSortsLeft?: unknown
        }
        if (!data || typeof data !== 'object' || (!data.current && !data.insignias)) {
          resolve({ ok: false, message: 'Ese archivo no parece de Temporadas.' })
          return
        }

        importSeasonsData({
          current: (data.current ?? null) as Parameters<typeof importSeasonsData>[0]['current'],
          insignias: data.insignias as Parameters<typeof importSeasonsData>[0]['insignias'],
          specials: data.specials as Parameters<typeof importSeasonsData>[0]['specials'],
          monthlyOdds: data.monthlyOdds as Parameters<typeof importSeasonsData>[0]['monthlyOdds'],
          reSortsLeft: typeof data.reSortsLeft === 'number' ? data.reSortsLeft : undefined,
        })

        resolve({ ok: true, message: 'Temporadas importadas. ¡Listas!' })
      } catch {
        resolve({ ok: false, message: 'No se pudo leer el archivo.' })
      }
    }
    reader.onerror = () => resolve({ ok: false, message: 'Error al leer el archivo.' })
    reader.readAsText(file)
  })
}
