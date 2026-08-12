import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fade, setFade] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true)
      setTimeout(() => {
        setVisible(false)
      }, 500)
    }, 2500)

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[var(--bg)] transition-opacity duration-500 ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Logo with enhanced animation */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)]/30 opacity-75" />
          {/* Middle ring */}
          <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)]" />
          {/* Main logo container */}
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/70 shadow-[0_0_40px_-10px_var(--accent)] animate-in zoom-in-95 duration-700">
            <img src="/icons/icon-192.png" alt="Flux" className="h-20 w-20 drop-shadow-lg" />
          </div>
        </div>

        {/* Text with staggered animation */}
        <div className="space-y-3 text-center animate-in slide-in-from-bottom-4 duration-700 delay-200">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text)] bg-gradient-to-r from-[var(--text)] to-[var(--text-muted)] bg-clip-text text-transparent">
            Flux
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium">Organiza tu vida, eleva tu productividad</p>
        </div>

        {/* Enhanced progress bar */}
        <div className="mt-2 w-48 space-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-400">
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)] shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent)] to-[var(--accent)]/70 transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-[var(--text-muted)]">{progress}%</p>
        </div>

        {/* Decorative particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-[var(--accent)]/40 animate-[float_3s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 right-1/4 h-1.5 w-1.5 rounded-full bg-[var(--accent)]/30 animate-[float_4s_ease-in-out_infinite_1s]" />
          <div className="absolute bottom-1/3 left-1/3 h-2 w-2 rounded-full bg-[var(--accent)]/35 animate-[float_3.5s_ease-in-out_infinite_0.5s]" />
          <div className="absolute bottom-1/4 right-1/3 h-1 w-1 rounded-full bg-[var(--accent)]/25 animate-[float_4.5s_ease-in-out_infinite_1.5s]" />
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
