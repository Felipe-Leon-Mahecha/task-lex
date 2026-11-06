import type { CSSProperties, ReactNode } from 'react'
import { useThemeStore } from '../../store/theme'
import { hexToRgba } from '../../lib/image'
import type { SectionId } from '../../types/task'

export default function SectionShell({
  sectionId,
  children,
}: {
  sectionId: SectionId
  children: ReactNode
}) {
  const theme = useThemeStore((s) => s.themes[sectionId])
  const vars = {
    '--bg': theme.background,
    '--surface': theme.surface,
    '--accent': theme.accent,
    '--text': theme.text,
    '--text-muted': theme.textMuted,
    '--border': theme.border,
    '--radius': `${theme.borderRadius}px`,
  } as CSSProperties

  const backgroundStyle: CSSProperties | undefined = theme.backgroundImage
    ? {
        backgroundImage: `linear-gradient(${hexToRgba(theme.background, 0.58)}, ${hexToRgba(
          theme.background,
          0.58,
        )}), url("${theme.backgroundImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : undefined

  return (
    <div
      style={vars}
      data-section={sectionId}
      className="section-canvas relative isolate -mx-4 -my-4 flex min-h-[calc(100dvh-4rem)] flex-col bg-[var(--bg)] text-[var(--text)] md:-mx-8 md:-my-8"
    >
      {/* El fondo de sección ocupa todo el lienzo; las vistas se dibujan encima sin una tarjeta envolvente. */}
      {backgroundStyle && <div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={backgroundStyle} />}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
    </div>
  )
}
