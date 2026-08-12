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
    ...(theme.backgroundImage
      ? {
          backgroundImage: `linear-gradient(${hexToRgba(theme.background, 0.58)}, ${hexToRgba(
            theme.background,
            0.58,
          )}), url("${theme.backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {}),
  } as CSSProperties

  return (
    <div
      style={vars}
      data-section={sectionId}
      className="flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
    >
      {/* Todo el contenido (header, tabs, filtros, vista) vive dentro de este único scroll interno.
          Ya no depende de un max-height calculado a mano en ListView: el contenedor mismo
          reparte el espacio y cualquier exceso se scrollea aquí, sin desbordar el cuadro. */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
    </div>
  )
}
