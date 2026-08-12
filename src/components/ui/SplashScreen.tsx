import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true)
      setTimeout(() => {
        setVisible(false)
      }, 500)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[var(--bg)] transition-opacity duration-500 ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)]/20 opacity-75" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 shadow-2xl animate-in zoom-in-95 duration-700">
            <img src="/icons/icon-192.png" alt="Flux" className="h-16 w-16" />
          </div>
        </div>
        <div className="space-y-2 text-center animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Flux</h1>
          <p className="text-sm text-[var(--text-muted)]">Organiza tu vida, eleva tu productividad</p>
        </div>
        <div className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full w-full animate-[loading_1.5s_ease-in-out] bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/60" />
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
