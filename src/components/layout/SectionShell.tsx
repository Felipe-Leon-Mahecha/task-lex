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
      className="h-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text)] md:p-6"
    >
      {children}
    </div>
  )
}
