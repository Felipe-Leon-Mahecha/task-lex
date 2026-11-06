import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { emblemOf } from './emblem'
import type { ThemeEntry } from './catalog'

export type EmblemArt =
  | { kind: 'svg'; Svg: ComponentType }
  | { kind: 'icon'; Icon: LucideIcon }

const SVG_CLASS = 'h-[46%] w-[46%] drop-shadow'
const BLACK = '#15151a'
const WHITE = '#ffffff'

function Mark({ label }: { label?: string }) {
  if (!label) return null
  return (
    <g>
      <rect x="29" y="32" width="17" height="13" rx="3" fill="rgba(0,0,0,0.55)" />
      <text
        x="37.5"
        y="41"
        textAnchor="middle"
        fontSize="7.2"
        fontWeight="900"
        fill="#fff"
        fontFamily="Arial, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

function FreddyHead({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M18 4 Q18 2 20 2 H28 Q30 2 30 4 L31 13 H17 Z" fill={BLACK} stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 4 H28 L28.5 10 H19.5 Z" fill="#493020" />
      <path d="M12 11 H36 Q38 11 38 13 V15 H10 V13 Q10 11 12 11 Z" fill={BLACK} />
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <circle cx="12.5" cy="20" r="5.7" fill="#80502b" />
        <circle cx="35.5" cy="20" r="5.7" fill="#80502b" />
        <circle cx="12.5" cy="20" r="2.7" fill="#b77a43" />
        <circle cx="35.5" cy="20" r="2.7" fill="#b77a43" />
        <path d="M10 23 Q10 16 17 15 Q24 12 31 15 Q38 16 38 23 L37 32 Q35 42 24 44 Q13 42 11 32 Z" fill="#916035" />
      </g>
      <path d="M12 25 Q17 23 21 26 L20 29 Q16 28 12 30 Z M36 25 Q31 23 27 26 L28 29 Q32 28 36 30 Z" fill="#684326" />
      <path d="M14 30 Q17 27 21 29 L22 34 Q18 36 14 33 Z M34 30 Q31 27 27 29 L26 34 Q30 36 34 33 Z" fill="#a87545" />
      <ellipse cx="18" cy="24" rx="4.6" ry="5.2" fill={BLACK} />
      <ellipse cx="30" cy="24" rx="4.6" ry="5.2" fill={BLACK} />
      <circle cx="18" cy="24" r="2.5" fill="#5bd7e9" />
      <circle cx="30" cy="24" r="2.5" fill="#5bd7e9" />
      <circle cx="18" cy="24" r="1" fill={WHITE} />
      <circle cx="30" cy="24" r="1" fill={WHITE} />
      <ellipse cx="24" cy="32" rx="10" ry="7" fill="#e4c294" stroke={BLACK} strokeWidth="1.8" />
      <ellipse cx="24" cy="29" rx="4.4" ry="2.8" fill="#21150f" />
      <path d="M15 34 Q24 38 33 34 L31 40 Q24 43 17 40 Z" fill={BLACK} stroke={BLACK} strokeWidth="1.6" />
      <path d="M17 35 L21 35 L20 39 L18 39 Z M27 35 L31 35 L30 39 L28 39 Z" fill={WHITE} />
      <path d="M18 43 L21 43 L20 46 L18 46 Z M27 43 L30 43 L29 46 L27 46 Z" fill={WHITE} />
      <path d="M18 42 L17 46 M30 42 L31 46" fill="none" stroke="#302016" strokeWidth="1.7" strokeLinecap="round" />
      <Mark label={label} />
    </svg>
  )
}

function PaleBear({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <circle cx="12.5" cy="19" r="5.2" fill="#c3a3ac" />
        <circle cx="35.5" cy="19" r="5.2" fill="#c3a3ac" />
        <circle cx="12.5" cy="19" r="2.4" fill="#dcbec8" stroke="none" />
        <circle cx="35.5" cy="19" r="2.4" fill="#dcbec8" stroke="none" />
        <ellipse cx="24" cy="27" rx="15" ry="14" fill="#f2e7ec" />
      </g>
      <ellipse cx="24" cy="30.5" rx="9.6" ry="7.6" fill="#dcbec8" />
      <ellipse cx="24" cy="28" rx="5" ry="3.4" fill="#5d2135" />
      <ellipse cx="17" cy="22" r="4.6" fill={BLACK} />
      <ellipse cx="31" cy="22" r="4.6" fill={BLACK} />
      <circle cx="15.2" cy="19.4" r="2.3" fill={WHITE} />
      <circle cx="29.2" cy="19.4" r="2.3" fill={WHITE} />
      <circle cx="18.4" cy="23.4" r="1.5" fill={WHITE} />
      <circle cx="32.4" cy="23.4" r="1.5" fill={WHITE} />
      <path d="M16.6 33.4 Q24 37.4 31.4 33.4" stroke={BLACK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <Mark label={label} />
    </svg>
  )
}

function JBFlower() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse
          key={a}
          cx="24"
          cy="11.5"
          rx="5"
          ry="10"
          fill="#fbf6ec"
          stroke="#cbbb9f"
          strokeWidth="1"
          transform={`rotate(${a} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="9" fill="#ffcf4a" stroke={BLACK} strokeWidth="2.2" />
      <circle cx="24" cy="24" r="3.4" fill="#e08600" />
      <circle cx="21.6" cy="21.8" r="1.6" fill={WHITE} />
    </svg>
  )
}

function Creeper() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="11" y="11" width="26" height="26" rx="5" fill="#4fbf55" stroke={BLACK} strokeWidth="2.4" />
      <path d="M12.6 13 L22 13 L14 25 Z" fill="#8ee593" />
      <path d="M22 13 h13 v-0.5 Z" fill="#2f7d33" />
      <path d="M17 15.5 h5.4 v8 h-5.4 z" fill={BLACK} />
      <path d="M25.6 15.5 H31 v8 h-5.4 z" fill={BLACK} />
      <path d="M19 22.4 h3 v3 h-3 z" fill={BLACK} />
      <path d="M26 22.4 h3 v3 h-3 z" fill={BLACK} />
      <path d="M16.6 27.2 h14.8 v6.4 h-14.8 z" fill={BLACK} />
      <path d="M20.8 27.2 v6.4 M27.2 27.2 v6.4" stroke="#4fbf55" strokeWidth="1.8" />
    </svg>
  )
}

function MinecraftSword() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 7 H17 V12 H22 V17 H27 V22 H32 V27 H37 V32 H32 V37 H27 V32 H22 V27 H17 V22 H12 V17 H7 V12 H10 Z" fill="#4eafdf" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="miter" />
      <path d="M13 10 H17 V15 H22 V20 H27 V25 H32 V30 H28 V25 H23 V20 H18 V15 H13 Z" fill="#a6e8ff" />
      <path d="M10 29 L19 38 L15 42 L6 33 Z" fill="#8a5b39" stroke={BLACK} strokeWidth="2.3" strokeLinejoin="miter" />
      <path d="M11 30 L17 36 L15 38 L9 32 Z" fill="#bd8550" />
      <path d="M7 12 H11 M14 17 H18 M19 22 H23" stroke="#e7fbff" strokeWidth="2" />
    </svg>
  )
}

function PlumberCap({
  color,
  bord,
  letter,
  label,
}: {
  color: string
  bord: string
  letter: string
  label?: string
}) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <rect x="7" y="37" width="34" height="5.4" rx="2.7" fill={bord} />
        <path d="M10 37 q1 -22 14 -22 q13 0 14 22 z" fill={color} />
      </g>
      <path d="M13 27 q3 -9 9 -10.6 q-5 4.6 -5.6 10.6 z" fill={WHITE} opacity="0.22" />
      <rect x="12" y="28" width="24" height="4.4" rx="2.2" fill={bord} stroke={BLACK} strokeWidth="2" />
      <circle cx="24" cy="22" r="7.6" fill={WHITE} stroke={BLACK} strokeWidth="2.2" />
      <text
        x="24"
        y="26.4"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fill={color}
        fontFamily="Arial, sans-serif"
      >
        {letter}
      </text>
      <Mark label={label} />
    </svg>
  )
}

function BowserFace() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M11 25 L8 13 L15 19 Z" fill="#f7c948" />
        <path d="M37 25 L40 13 L33 19 Z" fill="#f7c948" />
        <ellipse cx="24" cy="27" rx="14.5" ry="15" fill="#63b93c" />
      </g>
      <path d="M12 24 q6 -10 16 -8 q-8 3 -10 9 z" fill="#8ad657" />
      <ellipse cx="24" cy="24" rx="9.4" ry="7" fill="#cdeaa8" />
      <path d="M14.6 22.6 q3.6 -7 9 -7 q5.4 0 9 7 q-9 4.6 -18 0 z" fill="#fdf6de" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="18" cy="23" rx="2.4" ry="2.9" fill={BLACK} />
      <ellipse cx="30" cy="23" rx="2.4" ry="2.9" fill={BLACK} />
      <circle cx="17.2" cy="21.6" r="0.9" fill={WHITE} />
      <circle cx="29.2" cy="21.6" r="0.9" fill={WHITE} />
      <ellipse cx="24" cy="29.5" rx="3.4" ry="2.3" fill={BLACK} />
      <circle cx="23" cy="28.7" r="0.9" fill="#6b6b6b" />
      <path d="M14 33.5 Q24 41.5 34 33.5 Q24 36.5 14 33.5 Z" fill="#2f5a1c" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M16.4 33.8 L19 37 L18.4 33.2 Z" fill={WHITE} />
      <path d="M31.6 33.8 L29 37 L29.6 33.2 Z" fill={WHITE} />
      <path d="M21.4 35.4 L24 39 L26.6 35.4 Z" fill={WHITE} />
      <path d="M15.4 24.5 q2.4 1.6 5.4 1.4 M32.6 24.5 q-2.4 1.6 -5.4 1.4" stroke={BLACK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function YoshiFace() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M24 5 c6 0 9 4.5 9 8.5 c4 -3.5 9 -1.5 10.5 3.5 c1.5 5 -1.5 8.5 -5 10 c1.5 4.5 -1 8.5 -6 9.5 c-6 1.5 -11 -1 -13.5 -5.5 c-2.5 2 -6 2 -8 -1 c-2 -3 0 -6 3.5 -7 c-1 -4 1 -8 5 -10.5 c-1 -4 1.5 -7.5 4.5 -7.5 z"
        fill="#5fbb3a"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M9 25 q6 -5 13 -1 q-1 7 -8 8 q-6 -1 -5 -7 z" fill="#fdf3e0" />
      <path d="M11.5 27.5 q4.5 -2 8.5 0 q-3 3 -8.5 0 z" fill="#e0563e" />
      <ellipse cx="16.6" cy="10.5" rx="4.4" ry="5.6" fill="#fff" stroke={BLACK} strokeWidth="2.2" />
      <ellipse cx="27.4" cy="8.5" rx="4.2" ry="5.4" fill="#fff" stroke={BLACK} strokeWidth="2.2" />
      <ellipse cx="16.8" cy="10.8" rx="1.8" ry="2.2" fill={BLACK} />
      <ellipse cx="27.6" cy="8.8" rx="1.7" ry="2.1" fill={BLACK} />
      <circle cx="16.2" cy="9.2" r="0.7" fill={WHITE} />
      <circle cx="27" cy="7.2" r="0.7" fill={WHITE} />
      <ellipse cx="35" cy="26" rx="7" ry="5.6" fill="#fdf3e0" stroke={BLACK} strokeWidth="2.2" />
      <circle cx="33.2" cy="26.4" r="0.8" fill={BLACK} />
      <circle cx="36.6" cy="26.4" r="0.8" fill={BLACK} />
      <path d="M19 34.5 Q24 38.5 29.5 34" stroke={BLACK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Barrel() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="10" y="12" width="28" height="24" rx="7.5" fill="#b3762f" stroke={BLACK} strokeWidth="2.4" />
      <path d="M11.6 18 q12.4 -3.5 24.8 0 l0 2 q-12.4 -3.5 -24.8 0 z" fill="#d59a53" />
      <rect x="8.4" y="22" width="31.2" height="3.4" rx="1.7" fill="#8a5a2b" stroke={BLACK} strokeWidth="1.8" />
      <rect x="8.4" y="28.4" width="31.2" height="3.4" rx="1.7" fill="#8a5a2b" stroke={BLACK} strokeWidth="1.8" />
      <text
        x="24"
        y="27.4"
        textAnchor="middle"
        fontSize="6.6"
        fontWeight="900"
        fill="#fff2d8"
        stroke="#4a2c11"
        strokeWidth="1.2"
        paintOrder="stroke"
        fontFamily="Arial, sans-serif"
      >
        DK
      </text>
    </svg>
  )
}

function HedgehogHead({
  body,
  accent,
  muzzle,
  label,
}: {
  body: string
  accent: string
  muzzle: string
  label?: string
}) {
  const pupil = body === BLACK ? '#e52e3d' : BLACK
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 24 L5 14 L16 17 L15 5 L24 14 L32 4 L33 16 L43 10 L38 23 Q41 31 36 38 Q31 43 23 42 Q14 41 10 34 Q7 29 12 24 Z" fill={body} stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M12 19 L17 21 M36 18 L32 21" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 21 Q18 16 24 20 Q30 16 36 21 L35 29 Q30 33 24 30 Q18 33 13 29 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.9" strokeLinejoin="round" />
      <ellipse cx="19.5" cy="24" rx="2.4" ry="4.1" fill={pupil} />
      <ellipse cx="29" cy="24" rx="2.4" ry="4.1" fill={pupil} />
      <circle cx="20.2" cy="22.5" r="1" fill={WHITE} />
      <circle cx="29.7" cy="22.5" r="1" fill={WHITE} />
      <ellipse cx="24" cy="34" rx="10" ry="6.8" fill={muzzle} stroke={BLACK} strokeWidth="1.8" />
      <path d="M21 30 Q24 27 27 30 Q26 33 24 33 Q22 33 21 30 Z" fill={BLACK} />
      <path d="M20 37 Q24 40 28 37" stroke={BLACK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {body === BLACK && <path d="M11 17 L6 14 M36 17 L41 13 M18 11 L16 7 M30 12 L31 7" stroke="#e52e3d" strokeWidth="2" strokeLinecap="round" />}
      <Mark label={label} />
    </svg>
  )
}

function Pikachu() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M13.5 16.5 L8 3 L20 10 Z" fill="#ffd23f" />
        <path d="M34.5 16.5 L40 3 L28 10 Z" fill="#ffd23f" />
        <ellipse cx="24" cy="28" rx="16" ry="13.5" fill="#ffd23f" />
      </g>
      <path d="M11.5 17.5 L9.5 8 L15.5 12.5 Z" fill="#2b2b33" />
      <path d="M36.5 17.5 L38.5 8 L32.5 12.5 Z" fill="#2b2b33" />
      <path d="M10 25 q6 -6 14 -6 q8 0 14 6 q-14 -4 -28 0 z" fill="#ffe27a" opacity="0.55" />
      <path d="M9 30.5 L6.5 36.5 L12.5 33.5 Z" fill="#ffd23f" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M39 30.5 L41.5 36.5 L35.5 33.5 Z" fill="#ffd23f" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="11" cy="30" r="3.6" fill="#ff5b4d" stroke={BLACK} strokeWidth="1.8" />
      <circle cx="37" cy="30" r="3.6" fill="#ff5b4d" stroke={BLACK} strokeWidth="1.8" />
      <ellipse cx="18" cy="24" rx="2.8" ry="3.2" fill={BLACK} />
      <ellipse cx="30" cy="24" rx="2.8" ry="3.2" fill={BLACK} />
      <circle cx="17" cy="22.4" r="1.1" fill={WHITE} />
      <circle cx="29" cy="22.4" r="1.1" fill={WHITE} />
      <path d="M24 27.2 l1.4 1.8 l1.4 -1.8 z" fill={BLACK} />
      <path d="M21.5 31 Q24 33.6 26.5 31" stroke={BLACK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M21.6 30.6 q2.4 -1.4 4.8 0 q-2.4 1.6 -4.8 0 z" fill="#8a4b1a" />
    </svg>
  )
}

function Gengar() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M12.5 19 L9 5 L19 13 Z" fill="#5a4bb0" />
        <path d="M35.5 19 L39 5 L29 13 Z" fill="#5a4bb0" />
        <path d="M10 24 q14 -8 28 0 q3 10 -3 15 q-3 3.4 -7 3 q-4 -.4 -4 -4.4 q0 -4 4 -4 q4 0 6 -2 q-9 -6.6 -20 -4 q-6 1.4 -9 4 q2 2 6 2 q4 0 4 4 q0 4 -4 4.4 q-4 .4 -7 -3 q-6 -5 -3 -15 z" fill="#7b64d6" />
      </g>
      <path d="M11.5 22 q5 -5 12.5 -5.6 q-6 3.6 -7.5 7.6 z" fill={WHITE} opacity="0.16" />
      <path d="M24 34 q4 0 4 4 q0 4 -4 4.4 q-4 -.4 -4 -4.4 q0 -4 4 -4 z" fill="#3c2b7a" />
      <ellipse cx="16.5" cy="18.5" rx="4.6" ry="5.2" fill="#ff3b4d" stroke={BLACK} strokeWidth="2" />
      <ellipse cx="31.5" cy="18.5" rx="4.6" ry="5.2" fill="#ff3b4d" stroke={BLACK} strokeWidth="2" />
      <circle cx="15" cy="16.5" r="1.6" fill={WHITE} />
      <circle cx="30" cy="16.5" r="1.6" fill={WHITE} />
      <path d="M19.5 15 L17.5 12.5 M28.5 15 L30.5 12.5" stroke={BLACK} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function Pokeball({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M24 8 a18 18 0 0 1 18 18 a18 18 0 0 1 -18 18 a18 18 0 0 1 -18 -18 a18 18 0 0 1 18 -18 z" fill={BLACK} />
      <circle cx="24" cy="26" r="15.8" fill="#f4f5f8" />
      <path d="M8.2 26 a15.8 15.8 0 0 1 31.6 0 Z" fill="#e52521" />
      <path d="M10 17.5 a15.8 15.8 0 0 1 20 -8 a15.8 15.8 0 0 0 -23.4 8 z" fill="#ff7a6e" opacity="0.75" />
      <rect x="7" y="24.2" width="34" height="3.6" fill="#3c3f47" />
      <circle cx="24" cy="26" r="5.4" fill="#e9ebef" stroke="#15151a" strokeWidth="2" />
      <circle cx="24" cy="26" r="2.2" fill="#f4f5f8" stroke="#15151a" strokeWidth="1.4" />
      <path d="M11.5 13.5 a15.8 15.8 0 0 1 6 -3.4 l-3.6 5.6 z" fill={WHITE} opacity="0.6" />
      <Mark label={label} />
    </svg>
  )
}

function Car({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <ellipse cx="24" cy="41" rx="19" ry="2.6" fill="#0a0e18" opacity="0.35" />
      <path
        d="M6 30 L12 16 Q14 12 19 12 H31 Q37 12 39 17 L43 30 Z"
        fill="#1d2434"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M15.5 17 H30 Q34 17 35.5 21 L36.5 25 H13 L14.5 20 Q14.8 17 15.5 17 Z" fill="#5fc9f2" />
      <path d="M15.5 17 L13 25 h5 l2.6 -8 z" fill="#a5e6ff" opacity="0.85" />
      <path d="M24 17.4 V25" stroke="#1d2434" strokeWidth="1.6" />
      <path d="M24 25 H37.5 q1.6 0 2.6 1.6 L42.6 29.6 H40 L37.4 27 H12.4 L10.6 31 H6.6 L10 26.4 Q10.6 25 12.4 25 Z" fill="#e8ecf2" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M9 25.6 H15 L13.4 27 H8 z" fill="#ffe27a" />
      <path d="M35 25.6 H39.5 L41.4 27 H37 z" fill="#ff5a4d" />
      <path d="M13.6 21.5 H36.5" stroke="#9fdcff" strokeWidth="1.4" opacity="0.6" />
      <circle cx="14" cy="33" r="5.4" fill="#14181f" stroke={BLACK} strokeWidth="2.2" />
      <circle cx="35" cy="33" r="5.4" fill="#14181f" stroke={BLACK} strokeWidth="2.2" />
      <circle cx="14" cy="33" r="1.9" fill="#7d8798" />
      <circle cx="35" cy="33" r="1.9" fill="#7d8798" />
      <Mark label={label} />
    </svg>
  )
}

function Peashooter({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <rect x="20" y="30" width="9" height="10" rx="4.5" fill="#3f9c46" />
        <path d="M20 36 q-7 4 -8 9 M29 36 q7 4 8 9" fill="none" strokeLinecap="round" />
        <circle cx="23" cy="13" r="9" fill="#57c25a" />
      </g>
      <path d="M18 7 q-4 3 -4 8 q3 -5 7 -6 z" fill="#8ede90" />
      <rect x="6.5" y="9.5" width="14" height="7" rx="3.5" fill="#4fbb52" stroke={BLACK} strokeWidth="2.4" />
      <rect x="2.5" y="8" width="6" height="10" rx="3" fill="#3f9c46" stroke={BLACK} strokeWidth="2.2" />
      <circle cx="20" cy="10" r="1.7" fill="#2f7d33" />
      <circle cx="26" cy="13" r="1.7" fill="#2f7d33" />
      <path d="M24 21 q-3 5 0 8 q3 -3 0 -8 z" fill="#2f7d33" />
      <Mark label={label} />
    </svg>
  )
}

function Triforce({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round">
        <path d="M24 9 L33.4 25.6 H14.6 Z" fill="#ffd95e" />
        <path d="M14.6 25.6 L24 42.2 H5.2 Z" fill="#ffc32b" />
        <path d="M33.4 25.6 L42.8 42.2 H24 Z" fill="#ffc32b" />
      </g>
      <path d="M24 9 L28 15.6 H20 Z" fill="#fff0b0" />
      <path d="M24 25.6 L24 42.2 H33.4 Z" fill="#ffde5a" />
      <circle cx="24" cy="24" r="3.2" fill="#fff6cf" stroke={BLACK} strokeWidth="1.8" />
      <Mark label={label} />
    </svg>
  )
}

function AngryBird() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 6 Q29 2 32 7 L30 12 Q37 10 41 17 L38 20 Q43 28 38 36 Q33 43 24 43 Q15 43 10 36 Q5 28 10 20 L7 17 Q11 10 18 12 L16 7 Q19 3 24 6 Z" fill="#d9362d" stroke={BLACK} strokeWidth="2.6"/><path d="M13 21 Q18 17 23 22 L22 26 L14 26 Z M26 22 Q31 17 36 21 L34 26 L27 26 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.8"/><circle cx="19" cy="23" r="1.6" fill={BLACK}/><circle cx="31" cy="23" r="1.6" fill={BLACK}/><path d="M12 19 L22 21 M36 19 L27 21" stroke={BLACK} strokeWidth="3" strokeLinecap="round"/><path d="M20 28 L28 28 L24 34 Z" fill="#f5c343" stroke={BLACK} strokeWidth="1.8"/><path d="M19 37 Q24 34 29 37" fill="none" stroke="#9b241f" strokeWidth="2"/><path d="M9 29 L5 27 M39 29 L43 27" stroke="#82211d" strokeWidth="2"/></svg> }
function ElixirDrop({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M24 5 c8 9 14 15 14 22.5 a14 14 0 0 1 -28 0 C10 20 16 14 24 5 Z"
        fill="#7d3ff2"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 5 c-6 8 -11 13 -11 20 a11 11 0 0 0 5 9 c-1 -6 2 -12 6 -16 z" fill="#b183ff" opacity="0.75" />
      <ellipse cx="18.5" cy="29" rx="3" ry="4.6" fill="#fff" opacity="0.55" />
      <circle cx="31" cy="24" r="2" fill="#e9d5ff" opacity="0.8" />
      <circle cx="28" cy="32" r="1.4" fill="#e9d5ff" opacity="0.6" />
      <Mark label={label} />
    </svg>
  )
}

function FallBean() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M24 5 c9.4 0 16 8.4 16 18.5 c0 5.6 -2 10.4 -5.4 13.4 L9.4 37 C6 34 8 23.5 24 5 Z"
        fill="#d8f2ff"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <ellipse cx="19" cy="19" rx="3.4" ry="4.6" fill={BLACK} />
      <ellipse cx="31" cy="19" rx="3.4" ry="4.6" fill={BLACK} />
      <circle cx="18" cy="17.4" r="1.2" fill={WHITE} />
      <circle cx="30" cy="17.4" r="1.2" fill={WHITE} />
      <path d="M18.5 26.5 Q24 24.5 29.5 26.5" stroke={BLACK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M9.4 37 h25.2" stroke={BLACK} strokeWidth="2" />
      <path d="M13 39 l3 6 M20 39 l3 6 M27 39 l3 6" stroke={BLACK} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function SmashBall({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <circle cx="24" cy="24" r="14.5" fill="#f4f8ff" stroke={BLACK} strokeWidth="2.4" />
      <path d="M12 13.5 a14.5 14.5 0 0 1 9 -3.2 q-8 5 -10 12 z" fill={WHITE} />
      <g stroke="#1c2333" strokeWidth="2.6" fill="none" strokeLinecap="round">
        <path d="M15 12.5 L18.5 18.5" />
        <path d="M33 12.5 L29.5 18.5" />
        <path d="M11 20 L16.5 21.5" />
        <path d="M37 20 L31.5 21.5" />
        <path d="M11.5 29 L17 27" />
        <path d="M36.5 29 L31 27" />
      </g>
      <circle cx="24" cy="24" r="3.6" fill={BLACK} />
      <circle cx="22.8" cy="22.8" r="1.3" fill={WHITE} opacity="0.8" />
      <Mark label={label} />
    </svg>
  )
}

function PineTree({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M24 4 L34 17 h-4.6 L37 26 h-5.6 L40 35.5 H8 L16.6 26 H11 L14.6 17 H10 Z"
        fill="#2f9c3f"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 4 L30 17 h-6 Z" fill="#67cf74" />
      <rect x="20.6" y="35" width="6.8" height="7" rx="1.5" fill="#7a4a22" stroke={BLACK} strokeWidth="2.2" />
      <Mark label={label} />
    </svg>
  )
}

function BatLogo({ label }: { label?: string }) { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><ellipse cx="24" cy="24" rx="21" ry="15" fill="#f0c42e" stroke={BLACK} strokeWidth="2.5"/><path d="M4 21 Q12 17 18 22 Q20 15 24 17 Q28 15 30 22 Q36 17 44 21 L40 25 L34 24 L33 31 L27 27 L24 34 L21 27 L15 31 L14 24 L8 25 Z" fill={BLACK} stroke={BLACK} strokeWidth="1.4" strokeLinejoin="round"/><Mark label={label}/></svg> }
function JokerCard() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="11" y="6" width="26" height="36" rx="4" fill="#fbfaf6" stroke={BLACK} strokeWidth="2.4" />
      <path d="M15 10 h18 v28 H15 z" fill="none" stroke="#1a5d2e" strokeWidth="1.4" />
      <text x="14.6" y="17" fontSize="9" fontWeight="900" fill="#1a5d2e" fontFamily="Arial, sans-serif">
        J
      </text>
      <text x="33.4" y="35" fontSize="9" fontWeight="900" fill="#1a5d2e" fontFamily="Arial, sans-serif" textAnchor="end">
        J
      </text>
      <text x="24" y="25.4" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1a5d2e" fontFamily="Arial, sans-serif">
        JOKER
      </text>
      <path d="M24 28 q5 2.4 9.5 0 q-3 7 -9.5 7 q-6.5 0 -9.5 -7 q4.5 2.4 9.5 0 z" fill="#1a5d2e" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="21.5" cy="31" r="1" fill={WHITE} />
      <circle cx="24" cy="32" r="1" fill={WHITE} />
      <circle cx="26.5" cy="31" r="1" fill={WHITE} />
      <path d="M20.5 28.6 q-1.4 -2.6 .6 -3.6 M27.5 28.6 q1.4 -2.6 -.6 -3.6" stroke="#1a5d2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="15.5" cy="36.5" r="1.6" fill="#c1272d" />
      <circle cx="32.5" cy="12" r="1.6" fill="#c1272d" />
    </svg>
  )
}

function SuperShield() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M24 4.5 L38 10 V23 C38 32 31.5 39.5 24 43.5 C16.5 39.5 10 32 10 23 V10 Z"
        fill="#1b3a70"
        stroke={BLACK}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M24 4.5 L38 10 V23 C38 32 31.5 39.5 24 43.5 C17 40 13.5 35.5 12 30.5 C20 35 32 30 32 18 V12 Z" fill="#2c5aa8" />
      <path d="M24 13.5 l8.5 13.4 h-17 z" fill="#ffd23f" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20.2 24.6 h7.6 l-1.8 3.2 h-4 z" fill="#ffd23f" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15.5 31.5 h17 q-4.5 6 -8.5 8 q-4 -2 -8.5 -8 z" fill="#ffd23f" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function Spider() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.6" fill="none" strokeLinecap="round">
        <path d="M17 27 L8 16 M31 27 L40 16" />
        <path d="M17 29 L7 25 M31 29 L41 25" />
        <path d="M17.5 32 L9 38 M30.5 32 L39 38" />
      </g>
      <ellipse cx="24" cy="34" rx="7.4" ry="6.6" fill={BLACK} />
      <circle cx="20" cy="33" r="1.5" fill="#c1272d" />
      <circle cx="28" cy="33" r="1.5" fill="#c1272d" />
      <path
        d="M24 15 c4 0 7 3.6 7 8 c0 3 -1.4 5.4 -3 6.4 L25.4 33 h-2.8 L20 29.4 c-1.6 -1 -3 -3.4 -3 -6.4 c0 -4.4 3 -8 7 -8 z"
        fill="#d63a3a"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 15 L20.6 18 M24 15 L27.4 18 M24 15 V18.6" stroke="#15151a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.6 21.5 L21.6 24 M29.4 21.5 L26.4 24 M24 20.5 V24.5" stroke="#15151a" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="21.6" cy="20.4" r="1.7" fill={WHITE} stroke="#15151a" strokeWidth="1.3" />
      <circle cx="26.4" cy="20.4" r="1.7" fill={WHITE} stroke="#15151a" strokeWidth="1.3" />
    </svg>
  )
}

function VenomFace() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M9 12 L18 8 L24 11 L30 8 L39 12 L37 31 Q34 41 24 44 Q14 41 11 31 Z" fill="#10131a" stroke={BLACK} strokeWidth="2.6"/><path d="M12 18 Q19 12 23 18 L20 25 L12 24 Z M36 18 Q29 12 25 18 L28 25 L36 24 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.7"/><path d="M12 28 Q24 24 36 28 L33 38 Q24 43 15 37 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.8"/><path d="M16 29 L20 29 L19 35 L16 34 Z M22 28 L26 28 L25 35 L22 35 Z M29 29 L33 29 L31 35 L29 35 Z" fill="#c8d0d3"/><path d="M25 34 Q31 36 33 43 Q28 42 26 45 Q25 40 23 38 Z" fill="#cf283d" stroke={BLACK} strokeWidth="1.5"/><path d="M8 23 L5 27 M40 23 L43 27" stroke="#dbe2e8" strokeWidth="1.4"/></svg> }
function BendyHead({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 9 L19 15 L14.5 21 Z" fill={BLACK} stroke={BLACK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M36 9 L29 15 L33.5 21 Z" fill={BLACK} stroke={BLACK} strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="24" cy="25" rx="13.5" ry="14" fill={BLACK} />
      <path d="M16.5 19.5 L22.5 23 L16.5 26.8 Z" fill={WHITE} />
      <path d="M31.5 19.5 L25.5 23 L31.5 26.8 Z" fill={WHITE} />
      <path d="M13.5 29.5 Q24 41 34.5 29.5 Q24 34.5 13.5 29.5 Z" fill={WHITE} />
      <path d="M19.5 31.2 L19.5 36.4 M24 32.4 L24 38 M28.5 31.2 L28.5 36.4" stroke={BLACK} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M22.4 38.6 q1.6 2.6 0 5.4 q-1.6 -2.8 0 -5.4 Z" fill={BLACK} />
      <circle cx="28.5" cy="40" r="1.1" fill={BLACK} />
      <path d="M15 12.5 q-2.5 6 -1 12" stroke={BLACK} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <Mark label={label} />
    </svg>
  )
}

function DeadpoolMask() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M12 8 Q24 3 36 8 L39 27 Q37 40 24 44 Q11 40 9 27 Z" fill="#d3262f" stroke={BLACK} strokeWidth="2.6"/><path d="M24 8 L24 41" stroke="#82141d" strokeWidth="2"/><path d="M12 16 Q18 10 23 18 L21 27 L13 28 Z M36 16 Q30 10 25 18 L27 27 L35 28 Z" fill={BLACK}/><path d="M14 19 Q18 16 21 20 L20 24 L14 25 Z M34 19 Q30 16 27 20 L28 24 L34 25 Z" fill={WHITE}/><path d="M11 13 L15 15 M37 13 L33 15 M12 31 L18 35 M36 31 L30 35" stroke="#f15c5f" strokeWidth="1.5"/><path d="M18 38 L22 40 M30 38 L26 40" stroke="#7b1118" strokeWidth="1.5"/></svg> }
function ArcReactor({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <circle cx="24" cy="24" r="14" fill="#e9e6e2" stroke={BLACK} strokeWidth="2.4" />
      <circle cx="24" cy="24" r="10.6" fill="#9fb6c4" stroke="#6d7a85" strokeWidth="1.6" />
      <path d="M24 13 L31 25 H17 Z" fill="#7fe3ff" stroke="#1c3a4a" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 25 L28 25 M20.5 26.5 L20.5 33 M27.5 26.5 L27.5 33" stroke="#eaf7ff" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <circle cx="24" cy="28" r="3.2" fill="#ff7a3c" stroke="#1c3a4a" strokeWidth="1.4" />
      <path d="M15 14.5 a14 14 0 0 1 5 -3 l-2.6 4.4 z" fill={WHITE} opacity="0.7" />
      <Mark label={label} />
    </svg>
  )
}

function SteveHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="12" y="8" width="24" height="27" fill="#a97f50" stroke={BLACK} strokeWidth="2.4" />
      <path d="M13.4 9.4 h21.2 v6.6 H13.4 z" fill="#4a3222" />
      <rect x="16.6" y="16.4" width="5.4" height="5.4" rx="1.2" fill="#fff" stroke={BLACK} strokeWidth="1.8" />
      <rect x="26" y="16.4" width="5.4" height="5.4" fill="#fff" stroke={BLACK} strokeWidth="1.8" />
      <rect x="18.6" y="24.6" width="10.8" height="5.6" fill="#5d4128" stroke={BLACK} strokeWidth="1.8" />
      <rect x="23" y="24.6" width="1.8" height="5.6" fill="#fff" />
      <rect x="20" y="18" width="1.8" height="2.6" fill="#2f6ecb" />
      <rect x="29.4" y="18" width="1.8" height="2.6" fill="#2f6ecb" />
      <rect x="12" y="35" width="24" height="5" fill="#4a3222" stroke={BLACK} strokeWidth="2.2" />
      <path d="M12 30 h24 v5 H12 z" fill="#8a6844" stroke={BLACK} strokeWidth="2" />
    </svg>
  )
}

function ButtonEye() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 17 Q10 7 24 6 Q38 7 40 17 L36 38 Q24 45 12 38 Z" fill="#3a81bd" stroke={BLACK} strokeWidth="2.4"/><path d="M12 18 Q16 13 24 13 Q32 13 36 18 L33 31 Q24 37 15 31 Z" fill="#e7d4b4" stroke={BLACK} strokeWidth="1.6"/><ellipse cx="24" cy="24" rx="7" ry="10" fill="#f5e8cc" stroke="#7b5c35" strokeWidth="1.6"/><path d="M21 24 H27 M21 20 L27 28 M21 28 L27 20" stroke="#77552e" strokeWidth="1.7" strokeLinecap="round"/><circle cx="24" cy="14" r="1.3" fill="#77552e"/><circle cx="24" cy="34" r="1.3" fill="#77552e"/><path d="M8 16 Q13 7 24 7 Q35 7 40 16" fill="none" stroke="#efbc45" strokeWidth="2"/></svg> }
function JackSkeleton() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M14 13 Q7 6 8 3 Q15 5 19 12 M34 13 Q41 6 40 3 Q33 5 29 12" fill="none" stroke={BLACK} strokeWidth="2.6" strokeLinecap="round"/><path d="M17 11 L19 5 L24 11 L29 5 L31 12" fill="none" stroke={BLACK} strokeWidth="2.2" strokeLinecap="round"/><ellipse cx="24" cy="24" rx="13" ry="16" fill="#f1f1ee" stroke={BLACK} strokeWidth="2.5"/><ellipse cx="18" cy="21" rx="3.4" ry="4.2" fill={BLACK}/><ellipse cx="30" cy="21" rx="3.4" ry="4.2" fill={BLACK}/><path d="M24 22 L21 29 L24 31 L27 29 Z" fill={BLACK}/><path d="M15 31 Q24 38 33 31 M16 31 L15 36 M20 33 L20 38 M24 34 V39 M28 33 L28 38 M32 31 L33 36" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round"/><path d="M19 41 L24 39 L29 41 L27 45 H21 Z" fill={BLACK}/></svg> }
function TopHat() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="15" y="6" width="18" height="17" fill={BLACK} stroke="#000" strokeWidth="2" />
      <rect x="5" y="21" width="38" height="6" rx="1.5" fill={BLACK} stroke="#000" strokeWidth="2" />
      <rect x="12.5" y="36" width="23" height="6.5" rx="1.5" fill={BLACK} stroke="#000" strokeWidth="2" />
      <rect x="21.5" y="11" width="5" height="8" fill="#c1272d" />
      <path d="M16.5 7 h15 v2 h-15 z" fill="#3b3b4a" />
    </svg>
  )
}

function Slime() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 29 Q10 13 21 14 Q26 4 33 12 Q41 15 40 29 L35 35 L31 42 L26 36 L20 43 L17 35 L11 37 Z" fill="#70c84f" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round"/><path d="M22 14 Q25 7 29 13 L27 18 Z" fill="#c2ee76"/><ellipse cx="18" cy="25" rx="4" ry="5" fill={WHITE} stroke={BLACK} strokeWidth="1.6"/><ellipse cx="31" cy="24" rx="4" ry="5" fill={WHITE} stroke={BLACK} strokeWidth="1.6"/><circle cx="19" cy="25" r="1.7" fill={BLACK}/><circle cx="30" cy="24" r="1.7" fill={BLACK}/><path d="M19 32 Q24 35 30 31" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round"/><path d="M9 30 L5 33 M39 30 L43 32" stroke="#c1ef79" strokeWidth="2" strokeLinecap="round"/><circle cx="14" cy="19" r="1.2" fill={WHITE}/></svg> }
function Book({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="8" y="8" width="32" height="32" rx="3" fill="#7a4a22" stroke={BLACK} strokeWidth="2.4" />
      <rect x="10.4" y="10.4" width="27.2" height="27.2" rx="1.6" fill="#f8edd4" />
      <path d="M24 10.4 v27.2" stroke="#a58a58" strokeWidth="1.6" />
      <path d="M13.4 15.5 h8.4 M13.4 20 h8.4 M13.4 24.5 h8.4 M13.4 29 h5.4" stroke="#a58a58" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M26.6 15.5 h8 M26.6 20 h8 M26.6 24.5 h8 M26.6 29 h8" stroke="#a58a58" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M24 6.5 h3.4 v3.6 H24 z" fill="#8a5a2b" stroke={BLACK} strokeWidth="1.8" />
      <Mark label={label} />
    </svg>
  )
}

function StarryMoon() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M28 6 a18 18 0 0 1 0 36 a14.4 14.4 0 0 0 0 -36 z" fill="#ffd23f" stroke={BLACK} strokeWidth="2.4" />
      <path d="M30.6 11 a11 11 0 0 1 0 12.6 a8 8 0 0 0 0 -12.6 z" fill="#ffe58a" />
      <g fill="#8bb7e2" stroke={BLACK} strokeWidth="1.4">
        <circle cx="9" cy="17" r="2.6" />
        <circle cx="11" cy="27" r="2.2" />
        <circle cx="8" cy="36" r="2.4" />
      </g>
      <path d="M20 7 q2.6 -2 5 0 q2.4 -2 5 0" stroke={WHITE} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M6 27.5 l1.6 3.4 l3.4 1.6 l-3.4 1.6 L6 37.5 l-1.6 -3.4 L1 32.5 l3.4 -1.6 z" fill="#fff6cf" stroke={BLACK} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="42" cy="12" r="2.4" fill="#fff6cf" stroke={BLACK} strokeWidth="1.4" />
      <circle cx="38" cy="43" r="1.9" fill="#fff6cf" stroke={BLACK} strokeWidth="1.4" />
      <circle cx="18" cy="43" r="1.6" fill="#fff6cf" stroke={BLACK} strokeWidth="1.4" />
    </svg>
  )
}

function MeltingClock() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <circle cx="24" cy="14" r="10" fill="#f8edd4" stroke={BLACK} strokeWidth="2.4" />
      <path d="M24 8.4 V14 L29 17.6" stroke={BLACK} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.6 23.6 q-4.6 6.4 -2.4 12 q1.6 4 5 5 q-1.4 -6 .4 -10.6 q1.8 -4.4 -3 -6.4 z" fill="#f8edd4" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M32.4 23.6 q3.4 5 2.6 8.4 q-1 4 -4.4 6.6 q2.6 -6 1.6 -9.4 z" fill="#f8edd4" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M12 41 q6 3 12 1 q6 2 12 -1 q-6 5 -12 3 q-6 2 -12 -3 z" fill="#f8edd4" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  )
}

function TwoFingers() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M24 8 c3.6 0 6 2.6 6 6.6 c0 3.6 -2 6 -4.6 7 c4.6 1 7 4 7 8 c0 4.6 -3.4 8 -8.4 8 c-5 0 -8.4 -3.4 -8.4 -8 c0 -4 2.4 -7 7 -8 c-2.6 -1 -4.6 -3.4 -4.6 -7 c0 -4 2.4 -6.6 6 -6.6 z"
        fill="#e8bd92"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 21.6 v9.4 M19.6 26 q4.4 2.4 8.8 0" stroke={BLACK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="14" r="1.5" fill={BLACK} />
      <path d="M22 12.4 h4" stroke={BLACK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20.6 31.6 q3.4 2.6 6.8 0" stroke="#b98b60" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20.6 14 q-1.6 2 -1.6 4.4 M27.4 14 q1.6 2 1.6 4.4" stroke="#b98b60" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Pearl() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M10 22 h28 q4.6 0 4.6 5 q0 9 -9.6 13 q-9.6 -4 -19 -8 q-4 -1.6 -4 -5 z"
        fill="#e9dff0"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M10 22 q8 -1.4 14 -3 q6 1.6 14 3 q-8 3.4 -14 3.4 q-6 0 -14 -3.4 z" fill="#b28fd0" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 18.6 L14.4 24 L19 23.4 Z" fill="#8f5fbb" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M32 18.6 L33.6 24 L29 23.4 Z" fill="#8f5fbb" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="24" cy="31.6" r="5" fill="#fff" stroke={BLACK} strokeWidth="2" />
      <circle cx="22.4" cy="29.8" r="1.8" fill="#f0f6ff" />
      <path d="M14 36 q10 5 20 0 q-10 6 -20 0 z" fill="#cbb6dd" opacity="0.7" />
    </svg>
  )
}

function Bull() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.6" fill="none" strokeLinecap="round">
        <path d="M17 22 q-7 -9 -15 -4" />
        <path d="M31 22 q7 -9 15 -4" />
      </g>
      <path
        d="M24 8 c7.4 0 12 4.6 12 10 c0 4 -1.6 7 -4 9 c-1.4 5 -4 8 -8 8 c-4 0 -6.6 -3 -8 -8 c-2.4 -2 -4 -5 -4 -9 c0 -5.4 4.6 -10 12 -10 z"
        fill="#efece6"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 8 q-6 0 -9.6 4.4 q4.6 -2 9.6 -2 q5 0 9.6 2 q-3.6 -4.4 -9.6 -4.4 z" fill="#d3cec6" />
      <ellipse cx="24" cy="33" rx="5.6" ry="4.4" fill="#f7f5f0" stroke={BLACK} strokeWidth="2.2" />
      <circle cx="21.6" cy="32.4" r="1.1" fill="#a49c8e" />
      <circle cx="26.4" cy="32.4" r="1.1" fill="#a49c8e" />
      <circle cx="18" cy="25" r="1.6" fill={BLACK} />
      <circle cx="30" cy="25" r="1.6" fill={BLACK} />
      <circle cx="17.6" cy="24.4" r="0.6" fill={WHITE} />
      <circle cx="29.6" cy="24.4" r="0.6" fill={WHITE} />
    </svg>
  )
}

function Column({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <rect x="13" y="7" width="22" height="5" rx="1.5" fill="#f6ecd8" />
        <rect x="17" y="12" width="14" height="25" fill="#f6ecd8" />
        <rect x="13" y="37" width="22" height="5" rx="1.5" fill="#f6ecd8" />
      </g>
      <rect x="19.4" y="12" width="3.6" height="25" fill="#dcc79f" />
      <rect x="25" y="12" width="3.6" height="25" fill="#dcc79f" />
      <path d="M14.4 16 h19.2" stroke="#c2ad86" strokeWidth="1.6" />
      <path d="M14.4 33 h19.2" stroke="#c2ad86" strokeWidth="1.6" />
      <Mark label={label} />
    </svg>
  )
}

function Castle({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M7 43 V20 H14 V11 H21 V17 H27 V11 H34 V20 H41 V43 Z" fill="#d9d3c8" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M8.4 21.4 H13.6 V43 H8.4 z" fill="#bdb6a9" />
      <path d="M34.4 21.4 H39.6 V43 H34.4 z" fill="#bdb6a9" />
      <path d="M15.4 12.4 H19.6 V17 H15.4 z M28.4 12.4 H32.6 V17 H28.4 z" fill="#8f96a3" />
      <rect x="20" y="32" width="8" height="11" rx="3.4" fill="#6b4a2c" stroke={BLACK} strokeWidth="2.2" />
      <path d="M21.4 39.4 L24 36.6 L26.6 39.4 Z" fill={BLACK} />
      <rect x="10" y="25" width="4" height="5" rx="1.6" fill="#3a4c6b" />
      <rect x="34" y="25" width="4" height="5" rx="1.6" fill="#3a4c6b" />
      <Mark label={label} />
    </svg>
  )
}

function VikingHelmet({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M15.5 22 Q8 21.5 5 11" />
        <path d="M32.5 22 Q40 21.5 43 11" />
      </g>
      <path
        d="M24 4 C32.4 4 36 9.6 36 17 L36 27 C36 32 30 35 24 35 C18 35 12 32 12 27 L12 17 C12 9.6 15.6 4 24 4 Z"
        fill="#a9aeb8"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 5.6 C20.4 5.6 17.8 9 17.4 13.4 q6.6 2.6 13.2 0 C30.2 9 27.6 5.6 24 5.6 z" fill="#cdd2da" />
      <path d="M17.4 13.4 q6.6 2.6 13.2 0" stroke={BLACK} strokeWidth="2" fill="none" />
      <path d="M12.6 19.6 q4 2 8 0 M27.4 19.6 q4 2 8 0" stroke={BLACK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M24 21 v13 M21 32 q3 2.4 6 0" stroke={BLACK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Mark label={label} />
    </svg>
  )
}

function ColorGem({ label, color = '#8b5cf6', facet = '#c4b5fd', shadow = '#6d42c4' }: { label?: string; color?: string; facet?: string; shadow?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M13 7 H35 L43 18 L24 42 L5 18 Z" fill={color} stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M13 7 L17 18 H5 Z" fill={facet} />
      <path d="M17 18 H31 L24 42 Z" fill={shadow} />
      <path d="M35 7 L31 18 H43 Z" fill={facet} />
      <path d="M13 7 L17 18 H31 L35 7 M17 18 L24 42 M31 18 L24 42" fill="none" stroke={BLACK} strokeWidth="1.7" />
      <path d="M14 10 L17 9 M34 10 L31 9" stroke={WHITE} strokeWidth="1.4" strokeLinecap="round" />
      <Mark label={label} />
    </svg>
  )
}

function PickaxeHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 12 Q20 5 34 10 L41 15 L36 22 Q28 16 17 20 L11 24 L7 18 Z" fill="#a9b8c7" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M23 18 L17 41" stroke="#8a5a2b" strokeWidth="6" strokeLinecap="round" />
      <path d="M23 18 L17 41" stroke="#d19a5f" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 12 L18 9 M34 10 L39 14" stroke={WHITE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CodeChip() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="8" y="9" width="32" height="30" rx="5" fill="#244b37" stroke={BLACK} strokeWidth="2.5" />
      <path d="M20 17 L14 24 L20 31 M28 17 L34 24 L28 31 M26 15 L22 33" fill="none" stroke="#66e58b" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 16 H8 M5 24 H8 M5 32 H8 M40 16 H43 M40 24 H43 M40 32 H43" stroke="#b4f4c4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function GuitarPick({ label, color = '#d52b36', accent = '#f06b55' }: { label?: string; color?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 16 Q24 2 40 16 Q37 34 24 43 Q11 34 8 16 Z" fill={color} stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M13 18 Q24 8 35 18 Q32 31 24 37 Q16 31 13 18 Z" fill={accent} />
      <path d="M24 17 V31 M19 21 L29 27 M29 21 L19 27" stroke="#f8e6c8" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 15 Q24 9 32 15 M14 22 L17 30 M34 22 L31 30" fill="none" stroke={BLACK} strokeWidth="1.2" opacity=".7" />
      <Mark label={label} />
    </svg>
  )
}

function HauntedEye({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M5 24 Q14 10 24 10 Q35 10 43 24 Q34 38 24 38 Q13 38 5 24 Z" fill="#242129" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 24 Q18 16 24 16 Q31 16 36 24 Q30 32 24 32 Q17 32 12 24 Z" fill="#eee9df" />
      <ellipse cx="25" cy="24" rx="5" ry="7" fill="#b51f32" />
      <ellipse cx="26" cy="24" rx="1.7" ry="5.2" fill={BLACK} />
      <circle cx="23" cy="21" r="1.2" fill={WHITE} />
      <Mark label={label} />
    </svg>
  )
}

function StyleTile({ label, variant = 'dots' }: { label?: string; variant?: 'gold' | 'dots' | 'particles' | 'cracks' | 'grid' | 'bw' }) {
  const colors = {
    gold: { base: '#17171a', accent: '#e6bc4b' },
    dots: { base: '#47217b', accent: '#d8a6ff' },
    particles: { base: '#162d50', accent: '#75c9ff' },
    cracks: { base: '#8c2029', accent: '#f0b1a4' },
    grid: { base: '#123f28', accent: '#56ff74' },
    bw: { base: '#27272b', accent: '#f2f0e9' },
  }[variant]
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="8" y="8" width="32" height="32" rx="6" fill={colors.base} stroke={BLACK} strokeWidth="2.5" />
      {variant === 'gold' ? (
        <g fill="none" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round">
          <path d="M13 14 L21 22 M20 11 L29 20 M29 11 L37 19 M12 27 L22 37 M24 26 L35 37" />
          <path d="M13 33 L18 38 M32 11 L37 15" strokeWidth="1.2" />
        </g>
      ) : variant === 'dots' ? (
        <g fill="none" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 15 Q22 7 29 16 Q36 25 22 30 Q12 34 18 39" />
          <circle cx="14" cy="24" r="1.2" fill="#f4c85b" stroke="none" />
          <circle cx="34" cy="30" r="1.4" fill="#f4c85b" stroke="none" />
          <circle cx="27" cy="11" r="1.2" fill="#f4c85b" stroke="none" />
        </g>
      ) : variant === 'particles' ? (
        <g fill={colors.accent}>
          <path d="M16 12 L17.5 16 L21 17.5 L17.5 19 L16 23 L14.5 19 L11 17.5 L14.5 16 Z" />
          <path d="M31 23 L32.2 26 L35 27 L32.2 28.2 L31 31 L29.8 28.2 L27 27 L29.8 26 Z" />
          <circle cx="25" cy="13" r="1.4" /><circle cx="14" cy="32" r="1.2" /><circle cx="36" cy="16" r="1.5" />
          <circle cx="24" cy="36" r="1.8" fill="#f4d576" />
        </g>
      ) : variant === 'cracks' ? (
        <path d="M12 12 L21 20 L17 25 L27 29 L22 36 M31 11 L27 19 L35 23 L30 31 L36 37 M14 31 L19 30" fill="none" stroke={colors.accent} strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter" />
      ) : variant === 'grid' ? (
        <g fill="none" stroke={colors.accent} strokeWidth="1.8">
          <path d="M14 9 V39 M22 9 V39 M30 9 V39 M38 9 V39 M9 14 H39 M9 22 H39 M9 30 H39 M9 38 H39" />
          <path d="M14 14 H22 V22 H14 Z M30 22 H38 V30 H30 Z" fill="#27a84d" />
        </g>
      ) : (
        <g fill="none" stroke={colors.accent} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 31 L19 14 L26 34 L36 17" />
          <path d="M12 36 L16 34 M29 12 L36 14" strokeWidth="1.8" />
        </g>
      )}
      <Mark label={label} />
    </svg>
  )
}

function HistoryMedal({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M14 5 H23 L27 19 H17 Z M25 5 H34 L31 19 H21 Z" fill="#9c2932" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="24" cy="29" r="12" fill="#d5a63b" stroke={BLACK} strokeWidth="2.5" />
      <circle cx="24" cy="29" r="8" fill="#f0d17a" />
      <path d="M24 22 L26 27 H31 L27 30 L29 35 L24 32 L19 35 L21 30 L17 27 H22 Z" fill="#8d6723" />
      <Mark label={label} />
    </svg>
  )
}

function ArtCanvas({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="8" y="7" width="32" height="30" rx="3" fill="#d8bd91" stroke={BLACK} strokeWidth="2.5" />
      <path d="M11 31 L20 18 L27 26 L33 16 L38 31 Z" fill="#526b87" />
      <circle cx="30" cy="14" r="3.2" fill="#e6b849" />
      <path d="M17 38 L13 44 M31 38 L35 44 M14 42 H34" stroke="#704b2b" strokeWidth="2.5" strokeLinecap="round" />
      <Mark label={label} />
    </svg>
  )
}

function Microphone({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="18" y="5" width="12" height="25" rx="6" fill="#4f8fe8" stroke={BLACK} strokeWidth="2.4" />
      <path d="M12 22 Q12 35 24 35 Q36 35 36 22 M24 35 V42 M17 42 H31" fill="none" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      <path d="M20 10 H28 M20 15 H28 M20 20 H28" stroke="#dceaff" strokeWidth="1.8" strokeLinecap="round" />
      <Mark label={label} />
    </svg>
  )
}

function ToyHand({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M16 40 Q12 38 13 32 L14 22 Q14 19 17 19 Q20 19 20 22 L20 27 L20 11 Q20 7 23 7 Q27 7 27 11 V25 L28 13 Q28 9 31 9 Q35 9 34 13 L33 27 L35 19 Q36 15 39 17 Q42 18 40 23 L37 35 Q35 41 29 42 Z" fill="#e7b96d" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 30 Q7 28 8 24 Q9 21 13 24 L17 28" fill="#e7b96d" stroke={BLACK} strokeWidth="2.2" />
      <Mark label={label} />
    </svg>
  )
}

function Revolver({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M7 16 H35 L41 20 V25 H31 L28 30 H18 L16 25 H7 Z" fill="#8a5a2b" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M15 25 H27 V31 Q25 34 22 31 L19 28 H15 Z" fill="#bd8a4e" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="18" cy="20.5" r="2" fill="#d6b777" />
      <circle cx="25" cy="20.5" r="2" fill="#d6b777" />
      <Mark label={label} />
    </svg>
  )
}

function PixelCube({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M24 7 L41 16 V34 L24 43 L7 34 V16 Z" fill="#44b9ef" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M24 7 V25 L7 16 Z" fill="#78d8ff" />
      <path d="M24 25 L41 16 V34 L24 43 Z" fill="#3186d5" />
      <path d="M24 25 V43 M7 16 L24 25 L41 16" fill="none" stroke={BLACK} strokeWidth="2" />
      <rect x="27" y="25.5" width="4.4" height="4.8" fill={BLACK} />
      <rect x="34" y="22" width="4.2" height="4.8" fill={BLACK} />
      <path d="M28 33 L37 29.5 V33.5 L28 38 Z" fill={BLACK} />
      <path d="M28 34.2 L36.4 31" stroke="#a9eaff" strokeWidth="1.3" />
      <Mark label={label} />
    </svg>
  )
}

function JesterBell({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 11 Q8 5 14 6 L23 14 Q29 7 35 7 Q41 8 37 14 L31 21 Q37 26 37 35 H11 Q11 26 17 21 Z" fill="#dc3d55" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M17 21 L14 10 L23 16 M31 21 L36 11 L27 16" fill="#ffd34e" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 32 Q24 27 33 32" fill="none" stroke="#f4d9d0" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="7" r="3" fill="#ffd34e" stroke={BLACK} strokeWidth="1.5" />
      <circle cx="37" cy="8" r="3" fill="#54c8df" stroke={BLACK} strokeWidth="1.5" />
      <Mark label={label} />
    </svg>
  )
}

function RaymanHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M9 18 L5 10 L13 13 L15 5 L21 12 Q27 9 33 13 L40 8 L38 17 Q43 22 39 31 L34 35 L14 35 L9 30 Q6 24 9 18Z" fill="#ee8c2c" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M12 20 Q17 16 22 20 L22 25 L13 25 Z M26 20 Q31 16 36 20 L35 25 L27 25 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="18" cy="21" r="1.5" fill={BLACK} />
      <circle cx="31" cy="21" r="1.5" fill={BLACK} />
      <path d="M21 23 Q24 20 28 23 L27 30 Q24 32 21 29Z" fill="#f2a458" stroke={BLACK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 31 Q24 35 32 30" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 34 Q24 31 37 34 L34 41 H14 Z" fill="#643b93" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M21 35 L24 37 L27 35" fill="none" stroke="#e9d9f8" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function GrannyPortrait() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M9 23 Q8 8 24 7 Q40 8 39 23 L36 38 Q24 44 12 38 Z" fill="#d8c9a9" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M9 20 Q12 7 24 8 Q36 7 39 20 L34 17 L31 22 L27 17 L23 22 L19 17 L15 22 Z" fill="#eee8d9" stroke={BLACK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 25 Q18 21 22 25 M26 25 Q30 21 34 25" fill="none" stroke="#5e2530" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="26" r="1.4" fill="#c83242" />
      <circle cx="30" cy="26" r="1.4" fill="#c83242" />
      <path d="M20 34 Q24 30 28 34 M18 38 L20 35 M30 38 L28 35" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round" />
      <path d="M6 19 L11 22 M42 19 L37 22" stroke="#b9a98b" strokeWidth="2" />
    </svg>
  )
}

function NeighborKey() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 22 L24 8 L40 22 V40 H8 Z" fill="#e8a33a" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 40 V28 H30 V40" fill="#7b4a32" stroke={BLACK} strokeWidth="2" />
      <path d="M31 13 L36 8 L42 14 L37 19 Z" fill="#b9d8e2" stroke={BLACK} strokeWidth="1.8" />
      <circle cx="37" cy="13.5" r="1.6" fill={BLACK} />
      <path d="M11 24 H37" stroke="#f8d16c" strokeWidth="2" />
    </svg>
  )
}

function StuntHelmet() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 29 Q8 11 24 9 Q40 10 40 29 H33 Q30 24 24 24 Q18 24 15 29 Z" fill="#e33c35" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M10 29 H40 L36 35 H13 Z" fill="#f5eee0" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 19 Q24 12 34 19 M17 36 L14 42 M31 36 L34 42" fill="none" stroke={BLACK} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M21 17 L24 14 L27 17 L24 20 Z" fill="#f2ce4b" />
    </svg>
  )
}

function NinjaMask() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 15 Q24 6 40 15 L37 35 Q24 43 11 35 Z" fill="#24232d" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11 19 Q24 14 37 19 L35 27 Q24 31 13 27 Z" fill="#e7e4dc" stroke={BLACK} strokeWidth="1.8" />
      <path d="M16 23 L21 24 M32 23 L27 24" stroke="#2b2933" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M12 14 L6 9 M36 14 L42 9" stroke="#e33e46" strokeWidth="3" strokeLinecap="round" />
      <path d="M15 32 Q24 36 33 32" fill="none" stroke="#6c657a" strokeWidth="1.8" />
    </svg>
  )
}

function StarWand() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M13 39 L31 17" stroke="#d75b9d" strokeWidth="5" strokeLinecap="round" />
      <path d="M33 5 L36 13 L44 16 L36 19 L33 27 L30 19 L22 16 L30 13 Z" fill="#ffd95b" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 8 L14 13 L19 15 L14 17 L12 22 L10 17 L5 15 L10 13 Z" fill="#f5a8d0" stroke={BLACK} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="37" cy="34" r="2" fill="#fff0a0" />
      <circle cx="30" cy="39" r="1.4" fill="#fff0a0" />
    </svg>
  )
}

function BlueCat() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 18 L8 7 L19 13 Q24 10 29 13 L40 7 L38 19 Q42 28 36 37 Q24 44 12 37 Q6 29 10 18 Z" fill="#57a9df" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11 13 L17 16 L10 18 Z M37 13 L31 16 L38 18 Z" fill="#f3b6b5" />
      <ellipse cx="18" cy="24" rx="3.2" ry="4" fill={WHITE} stroke={BLACK} strokeWidth="1.5" />
      <ellipse cx="30" cy="24" rx="3.2" ry="4" fill={WHITE} stroke={BLACK} strokeWidth="1.5" />
      <circle cx="19" cy="25" r="1.4" fill={BLACK} />
      <circle cx="29" cy="25" r="1.4" fill={BLACK} />
      <path d="M20 31 Q24 34 28 31 M14 29 L8 28 M14 32 L8 34 M34 29 L40 28 M34 32 L40 34" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PinkDog() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M11 21 Q5 14 8 9 Q15 9 19 17 Q24 14 29 17 Q35 9 41 10 Q43 18 37 23 Q40 32 34 38 Q24 43 14 38 Q8 32 11 21 Z" fill="#d98acb" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 16 Q13 13 17 20 L13 24 Z M38 17 Q35 14 31 20 L35 24 Z" fill="#a35e9d" />
      <ellipse cx="18" cy="25" rx="3.5" ry="4.6" fill={WHITE} stroke={BLACK} strokeWidth="1.6" />
      <ellipse cx="30" cy="25" rx="3.5" ry="4.6" fill={WHITE} stroke={BLACK} strokeWidth="1.6" />
      <circle cx="19" cy="26" r="1.5" fill={BLACK} />
      <circle cx="29" cy="26" r="1.5" fill={BLACK} />
      <ellipse cx="24" cy="32" rx="3.4" ry="2.3" fill="#442b49" />
      <path d="M20 36 Q24 39 28 36" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function LionHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M24 5 L29 10 L36 8 L38 15 L44 20 L40 26 L42 34 L34 36 L29 43 L23 40 L16 43 L13 36 L6 33 L9 26 L5 20 L11 15 L12 8 L20 10 Z" fill="#c57a22" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M14 18 Q24 12 34 18 L33 32 Q24 40 15 32 Z" fill="#e2ad58" stroke={BLACK} strokeWidth="2" />
      <path d="M17 23 L22 24 M31 23 L26 24" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M21 29 L24 27 L27 29 L24 32 Z" fill="#35251c" />
      <path d="M24 32 V35 M20 35 Q24 38 28 35" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 21 L10 18 M35 21 L38 18 M14 29 L10 31 M34 29 L38 31" stroke="#f0c878" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ApeHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 14 Q12 5 20 9 Q24 4 28 9 Q37 5 37 16 L41 25 Q41 39 24 42 Q7 39 7 25 Z" fill="#74401f" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M12 24 Q13 17 19 18 L24 21 L29 18 Q36 18 37 25 L34 34 Q24 40 14 34 Z" fill="#d3a170" stroke={BLACK} strokeWidth="1.8" />
      <ellipse cx="18" cy="23" rx="2.6" ry="2" fill={BLACK} />
      <ellipse cx="30" cy="23" rx="2.6" ry="2" fill={BLACK} />
      <path d="M21 29 Q24 27 27 29 L26 32 H22 Z" fill={BLACK} />
      <path d="M18 34 Q24 37 30 34" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round" />
      <path d="M9 19 Q5 17 7 13 M39 19 Q43 17 41 13" fill="none" stroke="#b57942" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function GodzillaHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 39 L12 22 L8 15 L17 16 L20 8 L25 15 L31 7 L33 17 L41 13 L37 23 L39 36 L30 41 L18 41 Z" fill="#526b62" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 24 Q23 20 35 24 L34 32 Q24 37 15 32 Z" fill="#a9bd9c" stroke={BLACK} strokeWidth="1.8" />
      <path d="M17 23 L22 24 M31 23 L27 24" stroke="#e5dc9d" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 31 L20 34 L22 31 L26 34 L29 31 L33 33" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 14 L17 17 M31 11 L32 17 M38 17 L34 20" stroke="#a7c1b1" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function MewtwoHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M16 13 Q17 6 24 6 Q31 6 32 13 L37 17 L34 25 L38 35 L29 39 L24 35 L19 39 L10 35 L14 25 L11 17 Z" fill="#c8bfd9" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 15 Q24 11 30 15 L34 23 L30 28 H18 L14 23 Z" fill="#eee8f2" />
      <path d="M17 21 Q21 17 23 21 L21 24 H17 Z M31 21 Q27 17 25 21 L27 24 H31 Z" fill="#7659a8" />
      <circle cx="20" cy="21" r="1.2" fill="#f4deff" />
      <circle cx="28" cy="21" r="1.2" fill="#f4deff" />
      <path d="M24 24 L26 29 L22 29 Z M20 33 Q24 35 28 33" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 6 V2 M21 3 H27" stroke="#a98ada" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function UmbreonHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M11 23 Q9 13 6 5 Q17 7 22 15 Q26 13 30 15 Q35 7 42 5 Q40 16 37 23 Q40 31 34 38 Q24 44 14 38 Q8 31 11 23 Z" fill="#24252b" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11 13 L16 17 L10 18 Z M38 13 L33 17 L39 18 Z" fill="#d5b63f" />
      <ellipse cx="18" cy="26" rx="3.1" ry="4.1" fill="#f5d44e" stroke="#111216" strokeWidth="1.5" />
      <ellipse cx="30" cy="26" rx="3.1" ry="4.1" fill="#f5d44e" stroke="#111216" strokeWidth="1.5" />
      <ellipse cx="18.5" cy="27" rx="1" ry="2" fill={BLACK} />
      <ellipse cx="29.5" cy="27" rx="1" ry="2" fill={BLACK} />
      <path d="M20 34 Q24 37 28 34" fill="none" stroke="#d5b63f" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="24" cy="16" r="3.1" fill="#e4c744" stroke={BLACK} strokeWidth="1.2" />
    </svg>
  )
}

function HistoryArtifact({ kind }: { kind: 'renaissance' | 'war' | 'cold-war' | 'philosophy' }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      {kind === 'renaissance' ? (
        <g>
          <path d="M10 35 Q14 18 24 13 Q34 18 38 35 Z" fill="#c88a39" stroke={BLACK} strokeWidth="2.3" />
          <path d="M15 31 Q19 21 24 19 Q29 21 33 31" fill="none" stroke="#f1cf83" strokeWidth="2" />
          <path d="M18 35 V29 Q24 23 30 29 V35" fill="#7c4932" stroke={BLACK} strokeWidth="1.5" />
          <circle cx="24" cy="12" r="4" fill="#e7c45b" stroke={BLACK} strokeWidth="1.4" />
          <path d="M7 39 H41" stroke="#745236" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ) : kind === 'war' ? (
        <g>
          <path d="M8 30 H40 L37 37 H12 Z" fill="#596c47" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M14 23 H31 Q36 23 38 29 H12 Z" fill="#879366" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M27 23 L38 19 H42" fill="none" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="17" cy="36" r="2.2" fill="#2e3229" /><circle cx="24" cy="36" r="2.2" fill="#2e3229" /><circle cx="31" cy="36" r="2.2" fill="#2e3229" />
          <path d="M15 27 H32" stroke="#c2c796" strokeWidth="1.3" />
        </g>
      ) : kind === 'cold-war' ? (
        <g>
          <circle cx="24" cy="24" r="17" fill="#d4c39a" stroke={BLACK} strokeWidth="2.4" />
          <path d="M24 8 A16 16 0 0 0 24 40 Z" fill="#9d2932" />
          <path d="M24 9 V39" stroke={BLACK} strokeWidth="1.7" />
          <path d="M16 19 L24 14 L32 19 V29 Q24 35 16 29 Z" fill="#e5d9bd" stroke={BLACK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M20 23 H28 M24 19 V27" stroke="#476078" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M9 38 H39 L36 34 H12 Z" fill="#b48c4c" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M15 34 V23 Q15 13 24 13 Q33 13 33 23 V34 Z" fill="#d8c8a4" stroke={BLACK} strokeWidth="2.2" />
          <path d="M17 23 Q20 20 23 23 M31 23 Q28 20 25 23" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round" />
          <path d="M24 24 L22 29 H26 Z M20 31 Q24 33 28 31" fill="none" stroke="#73553b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 10 H18 M30 10 H36" stroke="#d5ab54" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

function ProgramTerminal({ mode }: { mode: 'code' | 'hack' | 'future' }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="6" y="8" width="36" height="29" rx="4" fill={mode === 'future' ? '#26395c' : '#183a2a'} stroke={BLACK} strokeWidth="2.4" />
      <path d="M10 14 H38" stroke={mode === 'future' ? '#79aaff' : '#59e889'} strokeWidth="1.5" />
      {mode === 'code' ? (
        <g fill="none" stroke="#7ef0a1" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20 L15 24 L20 28 M28 20 L33 24 L28 28 M26 18 L22 30" />
        </g>
      ) : mode === 'hack' ? (
        <g>
          <path d="M12 19 L16 23 L12 27 M19 28 H25" fill="none" stroke="#74eb83" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 19 L35 23 L31 28" fill="none" stroke="#c6ee70" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="27" cy="23" r="1.4" fill="#f2d55c" />
        </g>
      ) : (
        <g fill="none" stroke="#8db9ff" strokeWidth="2">
          <circle cx="24" cy="24" r="8" /><circle cx="24" cy="24" r="4" />
          <path d="M24 15 V11 M24 37 V33 M15 24 H11 M37 24 H33 M18 18 L15 15 M33 33 L30 30 M30 18 L33 15 M15 33 L18 30" />
        </g>
      )}
      <path d="M19 38 V42 M29 38 V42 M15 42 H33" stroke="#a9b9c6" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="11" cy="11" r="1" fill="#ef6972" />
      <circle cx="15" cy="11" r="1" fill="#f3cb5b" />
    </svg>
  )
}

function UnShowDuo() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M7 20 L8 5 L17 15 Q23 12 27 17 L26 35 Q18 41 10 35 Z" fill="#4c9bd3" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M25 18 L32 8 L35 17 Q42 18 42 26 L38 37 Q31 40 25 35 Z" fill="#b87b40" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M10 20 Q17 16 24 20 L23 25 Q17 27 11 24 Z" fill="#f5e9d0" />
      <ellipse cx="16" cy="22" rx="1.8" ry="2.6" fill={BLACK} />
      <path d="M28 24 Q34 20 39 24 L38 28 Q33 30 28 27 Z" fill="#e9cba4" />
      <circle cx="33" cy="25" r="1.5" fill={BLACK} />
      <path d="M13 31 Q18 33 22 30 M30 33 Q34 35 38 32" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 38 H24 M26 40 H41" stroke="#e3c15d" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function MonaPortrait() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <rect x="6" y="5" width="36" height="38" rx="3" fill="#b98943" stroke={BLACK} strokeWidth="2.4" />
      <rect x="10" y="9" width="28" height="30" rx="1" fill="#526348" />
      <path d="M12 29 L18 21 L23 26 L29 17 L36 29 Z" fill="#77806a" />
      <path d="M18 24 Q18 15 24 15 Q30 15 30 24 L33 32 H15 Z" fill="#49352b" stroke="#211c18" strokeWidth="1.4" />
      <ellipse cx="24" cy="22" rx="4.8" ry="6.2" fill="#d8b88b" />
      <path d="M20 22 Q24 20 28 22 M21 26 Q24 28 27 26" fill="none" stroke="#38271f" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14 11 H34 M8 8 V40" stroke="#e7c279" strokeWidth="1.2" opacity=".8" />
    </svg>
  )
}

function ScreamMask() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 8 Q24 3 38 8 L36 29 Q33 40 24 43 Q15 40 12 29 Z" fill="#f1dfc4" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M13 13 Q19 8 24 10 Q30 8 35 13 L34 20 Q24 17 14 20 Z" fill="#e8a33e" />
      <ellipse cx="18" cy="22" rx="3.2" ry="4.5" fill="#20242c" />
      <ellipse cx="30" cy="22" rx="3.2" ry="4.5" fill="#20242c" />
      <ellipse cx="24" cy="32" rx="4.2" ry="6.2" fill="#20242c" />
      <path d="M7 12 Q12 9 15 12 M33 12 Q37 9 41 12" fill="none" stroke="#20242c" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 38 Q24 42 32 38" fill="none" stroke="#b9a98f" strokeWidth="1.4" />
    </svg>
  )
}

function KlimtKiss() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 6 H40 V42 H8 Z" fill="#c89a22" stroke={BLACK} strokeWidth="2.4" />
      <path d="M11 9 H37 V39 H11 Z" fill="#e6bd43" />
      <path d="M13 13 L19 10 L22 17 L16 20 Z M28 10 L35 13 L32 20 L26 17 Z M12 28 L19 25 L22 32 L15 36 Z M28 26 L36 29 L32 37 L26 33 Z" fill="#342522" />
      <path d="M20 15 Q26 12 30 18 Q33 22 30 27 L28 35 H18 L17 25 Q16 18 20 15 Z" fill="#d8a981" stroke="#38291e" strokeWidth="1.5" />
      <path d="M19 18 Q23 11 29 17 L32 23 Q26 21 24 25 Q20 23 17 25 Z" fill="#4c3127" />
      <path d="M21 27 Q24 29 27 27" fill="none" stroke="#6f3129" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="23" r="1.2" fill="#30211c" />
    </svg>
  )
}

function DrownedCartridge() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 7 H36 L40 13 V38 H8 V13 Z" fill="#344b3d" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 7 H36 L39 13 H9 Z" fill="#91a483" stroke={BLACK} strokeWidth="1.6" />
      <rect x="13" y="17" width="22" height="14" rx="2" fill="#27372f" />
      <path d="M17 25 Q24 17 31 25 Q24 31 17 25 Z" fill="#91b7a1" />
      <ellipse cx="24" cy="24" rx="3" ry="4" fill="#151c1a" />
      <path d="M16 35 Q24 32 32 35" fill="none" stroke="#c3d8cd" strokeWidth="1.5" />
      <path d="M14 39 L12 44 M34 39 L36 44" stroke="#55b5a0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function GhostTower() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M9 40 V18 L15 21 V15 L21 18 V11 L27 16 V7 L33 13 V20 L39 17 V40 Z" fill="#554a87" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M13 25 H17 V30 H13 Z M23 22 H27 V28 H23 Z M32 25 H36 V30 H32 Z" fill="#d9c9ff" />
      <path d="M18 40 V32 Q24 26 30 32 V40" fill="#211d38" />
      <path d="M7 15 Q12 11 16 15 M34 10 Q39 8 42 12" fill="none" stroke="#b8a9ea" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="38" cy="7" r="2" fill="#ebd6ff" />
    </svg>
  )
}

function SmileDogHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 18 Q5 11 8 6 Q15 7 19 15 Q24 11 29 15 Q34 7 40 8 Q43 15 37 21 L36 33 Q24 42 12 33 Z" fill="#c6c4bd" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 14 L17 19 L13 24 Z M38 15 L31 19 L35 24 Z" fill="#2a2930" />
      <ellipse cx="18" cy="24" rx="3.5" ry="4.2" fill="#e7e2d1" />
      <ellipse cx="30" cy="24" rx="3.5" ry="4.2" fill="#e7e2d1" />
      <circle cx="19" cy="25" r="1.4" fill={BLACK} />
      <circle cx="29" cy="25" r="1.4" fill={BLACK} />
      <path d="M15 31 Q24 28 33 31 L31 36 Q24 39 17 36 Z" fill="#34232a" />
      <path d="M17 31 L19 34 L21 31 L24 34 L27 31 L29 34 L32 31" fill="none" stroke={WHITE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function ClawSlash() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 39 Q12 24 22 8 Q25 5 25 9 Q22 24 15 41 Z" fill="#b7b6b0" stroke={BLACK} strokeWidth="2.1" strokeLinejoin="round" />
      <path d="M19 40 Q24 23 32 7 Q35 5 35 9 Q33 25 26 42 Z" fill="#c7c6c0" stroke={BLACK} strokeWidth="2.1" strokeLinejoin="round" />
      <path d="M30 40 Q35 23 41 11 Q44 9 43 13 Q42 28 37 42 Z" fill="#aaa9a2" stroke={BLACK} strokeWidth="2.1" strokeLinejoin="round" />
      <path d="M13 36 L37 29 M16 41 L39 34" stroke="#8f202c" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function EyelessMask() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M9 17 Q24 7 39 17 L36 35 Q24 43 12 35 Z" fill="#d8d2c6" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 21 Q18 17 22 21 L20 27 Q16 29 12 26 Z M36 21 Q30 17 26 21 L28 27 Q32 29 36 26 Z" fill="#163a59" />
      <path d="M16 22 L20 25 M32 22 L28 25" stroke="#66c9e8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 32 Q24 29 28 32 M17 36 L20 34 M31 36 L28 34" fill="none" stroke="#542831" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 16 L14 12 M39 16 L34 12" stroke="#9f2838" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LaughingClown() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 17 L7 8 L18 12 Q24 9 30 12 L41 8 L36 18 Q40 29 33 38 Q24 44 15 38 Q8 29 12 17 Z" fill="#e8e2d5" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 15 L7 8 L16 13 M38 15 L41 8 L32 13" fill="#d8384a" />
      <path d="M14 23 L20 25 M34 23 L28 25" stroke="#27202a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="13" cy="28" r="3" fill="#d8384a" />
      <circle cx="35" cy="28" r="3" fill="#d8384a" />
      <path d="M15 31 Q24 27 33 31 Q31 39 24 39 Q17 39 15 31 Z" fill="#35202a" />
      <path d="M18 32 L20 35 L22 32 L24 35 L26 32 L28 35 L30 32" fill="none" stroke={WHITE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function JeffMask() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 20 L7 8 L15 12 L20 6 L24 11 L30 6 L34 12 L42 8 L38 21 L39 32 Q34 43 24 44 Q14 42 9 32 Z" fill="#171519" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M13 18 Q24 12 35 18 L36 31 Q32 39 24 41 Q16 39 12 31 Z" fill="#f1eee8" stroke="#30252a" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 18 L9 10 L17 14 L21 8 L24 14 L30 8 L33 15 L40 10 L35 21 L31 18 L27 21 L23 18 L18 21 Z" fill="#171519" stroke={BLACK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 23 Q18 20 21 23 M27 23 Q30 20 33 23" fill="none" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="18" cy="24" rx="1.2" ry="1.8" fill="#a52332" /><ellipse cx="30" cy="24" rx="1.2" ry="1.8" fill="#a52332" />
      <path d="M12 30 Q24 38 36 29" fill="none" stroke="#a52332" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 29 L11 27 M16 33 L13 36 M34 30 L37 27 M32 34 L35 37" stroke="#751925" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function KnightChess() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M15 38 H34 L31 32 Q36 27 34 20 Q33 14 27 12 L28 6 L21 9 L17 6 L18 13 Q12 17 13 25 L17 31 Z" fill="#eee9dc" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round"/><path d="M18 18 Q22 13 29 17 L31 23 L26 26 L20 24 Z" fill="#29282c"/><circle cx="25" cy="18" r="1.5" fill="#d7ad49"/><path d="M19 27 L29 27 L31 34 H17 Z" fill="#b5a16f" stroke={BLACK} strokeWidth="1.8"/><path d="M12 38 H36 V43 H12 Z" fill="#dfd6c1" stroke={BLACK} strokeWidth="2"/><path d="M16 40 H32" stroke="#8c784e" strokeWidth="1.4"/></svg> }
function Wave({ label }: { label?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M5 31 q6 -9 12 0 t12 0 t12 0 t2 0 V43 H5 Z" fill="#2b6fb5" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M5 31 q6 -9 12 0 t12 0 t12 0" stroke={WHITE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M5 37 q6 -7 12 0 t12 0 t12 0 t2 0" stroke="#8fd0ff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="21" r="2.4" fill="#bfe3ff" stroke={BLACK} strokeWidth="1.6" />
      <circle cx="23" cy="15" r="3" fill="#eaf6ff" stroke={BLACK} strokeWidth="1.6" />
      <circle cx="34" cy="21" r="2.2" fill="#bfe3ff" stroke={BLACK} strokeWidth="1.6" />
      <Mark label={label} />
    </svg>
  )
}

function Hurricane() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="3.4" fill="none" strokeLinecap="round">
        <path d="M33 13 q5.4 3.4 7.4 11" />
        <path d="M39 29.4 q-.6 4.4 -3.4 7.4" />
        <path d="M29 40.6 q-4.6 1.4 -9 0" />
        <path d="M15.6 37 q-5 -3 -6.6 -9" />
        <path d="M10.4 22 q.6 -5.4 4.6 -9.6" />
      </g>
      <circle cx="24" cy="25" r="4.6" fill="#eef5ff" stroke={BLACK} strokeWidth="2.4" />
    </svg>
  )
}

function Tornado() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="3.4" fill="none" strokeLinecap="round">
        <path d="M19 8.4 h11" />
        <path d="M17.4 16.6 h13.6" />
        <path d="M16.4 24.8 h15.6" />
        <path d="M16.4 33 h15.6" />
        <path d="M19 41.2 h10" />
      </g>
      <path d="M19 8.4 h11" stroke="#c9d2dc" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16.4 33 h15.6" stroke="#c9d2dc" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Volcano() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M12 43 L23 21 L28 32 L33 26 L40 43 Z"
        fill="#6b5a3e"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M23 21 L26.4 29 L20 29 Z" fill="#9c8760" />
      <path d="M33 26 L36 34 L30 34 Z" fill="#9c8760" />
      <path d="M19 11 q4 -3.6 8 -1 q-3.6 1.4 -4.6 3.4 q-2 2 -3.4 -.4 q-1 -1 0 -2 z" fill="#b9c3cf" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M19 12 q3 6 0 12 q-4.6 -2 -4.6 -6 q0 -4 4.6 -6 z" fill="#ff7a3c" />
      <path d="M26.4 9 q4.4 -1 5 3 q-3 -1.6 -5 -3 z" fill="#b9c3cf" stroke={BLACK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M26.4 11 q2.6 5 0 10 q-3.6 -2 -3.6 -5 q0 -3 3.6 -5 z" fill="#ffb02e" />
      <circle cx="12" cy="12" r="2.6" fill="#ffb02e" stroke={BLACK} strokeWidth="1.6" />
      <path d="M12 16 v5" stroke="#ffb02e" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function Avalanche() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M6 43 L25 10 L32 24 L38 20 L43 43 Z"
        fill="#e7eef6"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M25 10 L32 24 L26 27 Z" fill="#b9c8d8" />
      <path d="M38 20 L43 43 L34 43 Z" fill="#cddcea" />
      <path d="M14 34 q5 -5 8 -4 M22 41 q4 -6 8 -7" stroke={WHITE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M6 34 L18 34 L14 43 Z" fill="#b9c8d8" />
      <rect x="4" y="42" width="40" height="4" rx="1" fill="#dbe6f0" stroke={BLACK} strokeWidth="2" />
      <circle cx="30" cy="7" r="2.4" fill="#fff" stroke={BLACK} strokeWidth="1.6" />
      <circle cx="37" cy="13" r="1.8" fill="#fff" stroke={BLACK} strokeWidth="1.6" />
    </svg>
  )
}

function Lightning() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M29.5 3 L13 25 h8.5 L18.5 45 L35.5 22 H27 Z"
        fill="#ffd23f"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24.5 11 L17 24.4 h7 L22.5 35 Z" fill="#fff0b0" />
      <path d="M9 12 L5 7 M40 34 l4 5" stroke="#ffb02e" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

function Snowflake() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke="#dfe9f7" strokeWidth="2.4" strokeLinecap="round">
        <path d="M24 5 V43 M24 11 l5.5 -3.4 M24 11 l-5.5 -3.4 M24 37 l5.5 3.4 M24 37 l-5.5 3.4" />
        <path d="M10.5 14.5 L37.5 33.5 M14 16 l-6 -1.6 M12.5 18.4 l6.5 1.6 M34 30 l-6 -1.6 M35.5 31.6 l6.5 1.6" />
        <path d="M10.5 33.5 L37.5 14.5 M14 32 l-6 1.6 M12.5 29.6 l6.5 -1.6 M34 18 l-6 1.6 M35.5 16.4 l6.5 -1.6" />
      </g>
      <circle cx="24" cy="24" r="3" fill="#f2f8ff" stroke="#9fb6cc" strokeWidth="1.6" />
    </svg>
  )
}

function Cuphead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g transform="rotate(20 35 11)" stroke={BLACK} strokeWidth="2" strokeLinejoin="round">
        <rect x="32" y="1.5" width="4.6" height="15" rx="2.3" fill="#fdf3e0" />
        <rect x="36.6" y="1.5" width="4.6" height="15" rx="2.3" fill="#d8402c" />
      </g>
      <path d="M12 13 h24 l-4.6 25 c-1.4 3.4 -13.4 3.4 -14.8 0 z" fill="#fdf3e0" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M16 18 q-2.6 10 -2 19 q4 1.6 8 1.6 q-4.6 -9 -6 -20.6 z" fill="#fff" opacity="0.75" />
      <ellipse cx="24" cy="13" rx="12.4" ry="3" fill="#fff" stroke={BLACK} strokeWidth="2.2" />
      <circle cx="19.4" cy="20.6" r="2" fill={BLACK} />
      <circle cx="28.6" cy="20.6" r="2" fill={BLACK} />
      <path d="M17.4 19 q2 -1.6 4 -.4 M30.6 19 q-2 -1.6 -4 -.4" stroke={BLACK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="25.4" rx="2.8" ry="2" fill="#e0563e" stroke={BLACK} strokeWidth="1.6" />
      <path d="M19 29 q5 3.4 10 0" stroke={BLACK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M12.4 15.6 q-4.4 5 -2.6 10.6" stroke={BLACK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function HollowKnight() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M17.5 17 L15 4 L22.5 11.5 Z" fill="#12161d" />
        <path d="M30.5 17 L33 4 L25.5 11.5 Z" fill="#12161d" />
        <ellipse cx="24" cy="27" rx="10.5" ry="14" fill="#12161d" />
      </g>
      <ellipse cx="20" cy="27.6" rx="2" ry="2.8" fill="#cfe9ff" />
      <ellipse cx="28" cy="27.6" rx="2" ry="2.8" fill="#cfe9ff" />
    </svg>
  )
}

function UndertaleSoul() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path
        d="M24 43 C 16 35 8.5 27.5 8.5 18.5 A 7.5 8 0 0 1 17.5 10.5 Q 21 12 24 15.5 Q 27 12 30.5 10.5 A 7.5 8 0 0 1 39.5 18.5 C 39.5 27.5 32 35 24 43 Z"
        fill="#ff2d55"
        stroke={BLACK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <ellipse cx="19" cy="17" rx="3.6" ry="2.8" fill="#ff8fa3" />
      <path d="M13.5 24 q3 -2.4 6.4 -1.4" stroke="#ffb3c0" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Crewmate() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M7 19 Q7 16 11 16 H15 V30 H11 Q7 30 7 27 Z" fill="#a91f2c" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M15 15 Q15 6 23 5 H28 Q37 5 37 15 V29 Q42 31 42 36 V38 Q42 42 38 42 H29 Q27 42 27 39 V36 H21 V39 Q21 42 18 42 H10 Q6 42 6 38 V35 Q6 31 12 29 V15 Z" fill="#e52f3a" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" />
      <path d="M22 11 Q23 9 27 9 H32 Q37 9 37 14 V21 Q37 25 32 25 H22 Q17 25 17 21 V16 Q17 12 22 11 Z" fill="#a9e4f5" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M20 13 Q22 11 26 12 L23 18 H18 Q18 15 20 13 Z" fill="#effcff" />
      <path d="M11 34 H16 M32 34 H37" stroke="#f7787d" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function Slenderman() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><g fill="none" stroke="#39383d" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 29 Q8 27 7 21 Q6 17 10 14 Q13 12 12 8"/><path d="M31 29 Q40 26 41 20 Q42 16 38 13 Q35 11 37 7"/><path d="M17 33 Q9 34 8 39 Q7 42 11 43"/><path d="M31 33 Q39 34 40 39 Q41 42 37 43"/><path d="M18 28 Q12 23 8 25 Q5 27 7 31"/><path d="M30 28 Q36 23 40 25 Q43 27 41 31"/></g><path d="M24 4 Q32 4 32 13 Q32 19 29 22 L31 27 H17 L19 22 Q16 19 16 13 Q16 4 24 4Z" fill="#f0eee9" stroke={BLACK} strokeWidth="2.3"/><path d="M19 9 Q24 6 29 9" fill="none" stroke="#d1cec7" strokeWidth="1.4" strokeLinecap="round"/><path d="M16 26 L24 30 L32 26 L38 42 H10 Z" fill="#15151a" stroke={BLACK} strokeWidth="2.3" strokeLinejoin="round"/><path d="M21 27 L24 30 L27 27 L26 37 L24 40 L22 37Z" fill="#a11e2b" stroke="#67141d" strokeWidth="1.2" strokeLinejoin="round"/><path d="M18 27 L24 31 L30 27" fill="none" stroke="#d4d1ca" strokeWidth="1.3" strokeLinejoin="round"/></svg> }
function Grinch() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M9 22 C 3.4 16 8.6 10 14 14 C 14 8 21 6 24 13 C 27 6 34 8 34 14 C 39.4 10 44.6 16 39 22 Z" fill="#79c03c" />
        <ellipse cx="24" cy="27" rx="13" ry="14.5" fill="#8ad04a" />
      </g>
      <path d="M14 15.5 q10 -4 20 0 q-10 -1.6 -20 0 z" fill="#b7e88f" />
      <ellipse cx="18.6" cy="24" rx="3.4" ry="2.6" fill="#f7f4e8" stroke={BLACK} strokeWidth="1.6" />
      <ellipse cx="29.4" cy="24" rx="3.4" ry="2.6" fill="#f7f4e8" stroke={BLACK} strokeWidth="1.6" />
      <circle cx="19.4" cy="24.2" r="1.3" fill={BLACK} />
      <circle cx="28.6" cy="24.2" r="1.3" fill={BLACK} />
      <path d="M14.6 21.4 L20 22.6 M33.4 21.4 L28 22.6" stroke={BLACK} strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="24" cy="29.4" rx="3.8" ry="2.4" fill="#ff8a50" stroke={BLACK} strokeWidth="1.6" />
      <path d="M18 34.4 Q24 38 30 34.4" stroke={BLACK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M20.6 34.6 L22.4 34.8 L21.6 38 L19.8 37.6 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M27.4 34.6 L25.6 34.8 L26.4 38 L28.2 37.6 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function Backrooms() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M11 8 L18 5 H31 L38 10 L40 31 L34 41 H13 L8 32 Z" fill="#d8b943" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round"/><path d="M13 12 L20 9 H30 L35 13 L36 30 L31 37 H16 L12 30 Z" fill="#e9d77f" stroke="#9b7826" strokeWidth="1.8"/><path d="M16 20 Q19 17 22 20 M27 20 Q30 17 33 20" fill="none" stroke="#473b28" strokeWidth="2.4" strokeLinecap="round"/><path d="M16 25 Q24 23 33 25 L31 29 Q24 32 17 29 Z" fill="#9b302b" stroke={BLACK} strokeWidth="1.4"/><path d="M18 26 L20 28 M23 26 L25 28 M28 26 L30 28" stroke="#f3e6a7" strokeWidth="1.3"/><path d="M12 15 L16 13 M35 15 L32 13 M13 33 L17 35 M34 33 L31 35" stroke="#f5e8a8" strokeWidth="1.2"/></svg> }
function BillCipher() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 6 L43 41 H5 Z" fill="#ffd43f" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round"/><path d="M24 6 L34 41 H43 Z" fill="#e9a91e"/><path d="M19 18 L24 16 L29 18 L31 28 L27 31 H21 L17 28 Z" fill="#fff0ba" stroke={BLACK} strokeWidth="1.7"/><ellipse cx="24" cy="24" rx="5" ry="6.5" fill={WHITE} stroke={BLACK} strokeWidth="1.5"/><ellipse cx="24" cy="24" rx="1.8" ry="3.6" fill={BLACK}/><path d="M17 16 Q24 12 31 16" fill="none" stroke={BLACK} strokeWidth="2.5"/><path d="M17 34 L12 38 M31 34 L36 38 M24 33 V40 M13 40 L10 43 M35 40 L38 43" stroke={BLACK} strokeWidth="2" strokeLinecap="round"/><path d="M19 9 L16 4 M29 9 L32 4" stroke="#c58a15" strokeWidth="1.6"/></svg> }
function BlitzHead() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M13 20 Q5 15 5 6 Q13 9 20 15 L28 14 Q35 7 43 6 Q42 16 35 21 L38 31 Q34 41 23 43 Q12 41 9 32 Z" fill="#e9e2d5" stroke={BLACK} strokeWidth="2.7"/><path d="M13 21 L21 19 L22 26 L13 28 Z M27 19 L36 21 L34 28 L27 26 Z" fill="#c92336" stroke={BLACK} strokeWidth="1.8"/><ellipse cx="17" cy="25" rx="2" ry="3" fill="#f6d94a"/><ellipse cx="31" cy="25" rx="2" ry="3" fill="#f6d94a"/><path d="M14 32 Q23 28 35 32 L30 39 L22 40 L16 37 Z" fill={BLACK}/><path d="M16 32 L20 32 L19 36 L16 35 Z M24 31 L28 31 L28 36 L24 36 Z M31 32 L34 32 L32 35 L30 35 Z" fill={WHITE}/><path d="M22 18 L19 21 M28 18 L31 21 M20 41 L18 45 M29 41 L31 45" fill="none" stroke="#7a1828" strokeWidth="2" strokeLinecap="round"/></svg> }
function DipperCap() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M9 28 Q10 9 24 8 Q38 9 39 28 Z" fill="#f4f0e4" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M8 27 Q23 23 40 27 Q42 28 40 31 Q24 35 7 31 Q5 29 8 27 Z" fill="#315f9d" stroke={BLACK} strokeWidth="2.4" />
      <path d="M24 14 L31 25 H17 Z" fill="#285d35" stroke={WHITE} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M22 22 L24 18 L26 22 M24 22 V25" stroke={WHITE} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M15 14 Q19 10 23 10" stroke={WHITE} strokeWidth="1.7" opacity=".7" strokeLinecap="round" />
    </svg>
  )
}

function AdventureDuo() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M4 23 Q4 8 13 8 Q22 8 22 23 L19 28 H7 Z" fill="#eee9dc" stroke={BLACK} strokeWidth="2.5"/><path d="M7 23 Q13 19 20 23 L20 29 H6 Z" fill="#e8bd42" stroke={BLACK} strokeWidth="1.5"/><circle cx="10" cy="22" r="1.1" fill={BLACK}/><circle cx="16" cy="22" r="1.1" fill={BLACK}/><path d="M25 20 Q31 13 39 17 Q46 20 43 31 Q41 40 33 41 Q25 39 23 31 Z" fill="#e8a03d" stroke={BLACK} strokeWidth="2.4"/><path d="M26 18 L22 8 L31 15 M38 16 L44 8 L42 21" fill="#e8a03d" stroke={BLACK} strokeWidth="2.1"/><circle cx="31" cy="25" r="1.4" fill={BLACK}/><circle cx="38" cy="25" r="1.4" fill={BLACK}/><path d="M30 31 Q35 35 40 31" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round"/><path d="M8 34 L17 34 L20 41 L6 41 Z" fill="#335b9a" stroke={BLACK} strokeWidth="1.7"/><path d="M28 39 L38 39" stroke="#9a5d2c" strokeWidth="2"/></svg> }
function RickMortyDuo() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M4 22 L6 15 L3 12 L9 13 L10 7 L14 12 L17 5 L20 13 L24 9 L25 19 Z" fill="#d6d8cf" stroke={BLACK} strokeWidth="2.3"/><path d="M5 23 Q8 17 16 17 Q23 17 25 24 L23 36 Q16 42 8 36 Z" fill="#d5d5cc" stroke={BLACK} strokeWidth="2.3"/><path d="M6 29 Q15 27 24 30 L21 35 Q15 38 9 35 Z" fill="#72a95a"/><path d="M11 24 Q14 22 17 24 M19 24 L22 25" stroke={BLACK} strokeWidth="2"/><path d="M27 22 Q30 15 37 17 Q44 19 44 29 L42 38 Q35 42 29 37 Z" fill="#f3c998" stroke={BLACK} strokeWidth="2.3"/><path d="M27 22 Q34 16 42 21 L43 25 Q35 23 29 27 Z" fill="#63452f" stroke={BLACK} strokeWidth="1.6"/><circle cx="33" cy="29" r="1.6" fill={BLACK}/><circle cx="39" cy="29" r="1.6" fill={BLACK}/><path d="M33 34 Q36 36 40 34" fill="none" stroke={BLACK} strokeWidth="1.7"/></svg> }
function BunnyHead() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M14 23 Q6 8 11 4 Q18 2 21 22 M28 22 Q30 3 37 4 Q43 8 34 24" fill="#a9adb0" stroke={BLACK} strokeWidth="2.5"/><path d="M13 9 Q15 9 17 19 M35 9 Q36 9 34 19" stroke="#e8dbe0" strokeWidth="3"/><ellipse cx="24" cy="30" rx="15" ry="13" fill="#d0d0cc" stroke={BLACK} strokeWidth="2.5"/><path d="M11 25 Q18 20 23 25 M25 25 Q31 20 37 25" fill="none" stroke={BLACK} strokeWidth="2.8" strokeLinecap="round"/><ellipse cx="18" cy="28" rx="2" ry="2.6" fill={BLACK}/><ellipse cx="30" cy="28" rx="2" ry="2.6" fill={BLACK}/><path d="M20 34 Q24 31 28 34 L26 37 H22 Z" fill="#d98593" stroke={BLACK} strokeWidth="1.5"/><path d="M24 37 V40 M24 39 Q19 42 16 39 M24 39 Q29 42 32 39" fill="none" stroke={BLACK} strokeWidth="1.6"/><path d="M13 35 L7 33 M13 38 L7 39 M35 35 L41 33 M35 38 L41 39" stroke="#6d7176" strokeWidth="1.2"/></svg> }
function Blixer() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M7 10 L20 15 L25 6 L29 15 L41 8 L36 21 L43 26 L35 30 L40 40 L28 36 L23 44 L19 35 L8 40 L12 29 L5 25 L13 21 Z" fill="#fc467e" stroke={BLACK} strokeWidth="2.7"/><path d="M12 20 L20 18 L24 22 L28 18 L36 20 L34 30 L28 34 L24 30 L20 34 L14 30 Z" fill={BLACK}/><path d="M15 22 L21 24 M33 22 L27 24" stroke="#fef2f4" strokeWidth="2.3" strokeLinecap="round"/><path d="M19 29 L24 32 L29 29" fill="none" stroke="#fe7ba3" strokeWidth="2"/><circle cx="24" cy="13" r="2" fill="#fff0a3"/></svg> }
function MiniPekkaPancake() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M13 17 L8 8 L19 12 M35 17 L40 8 L29 12" fill="#5962b3" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11 19 Q11 12 24 12 Q37 12 37 19 L35 35 Q24 42 13 35 Z" fill="#515d9c" stroke={BLACK} strokeWidth="2.5" />
      <path d="M14 20 Q24 15 34 20 L32 25 Q24 28 16 25 Z" fill="#7585c5" stroke={BLACK} strokeWidth="1.8" />
      <path d="M15 27 Q24 24 33 27 L31 34 Q24 38 17 34 Z" fill={BLACK} />
      <ellipse cx="19" cy="30" rx="2" ry="2.8" fill="#ff4dc4" /><ellipse cx="29" cy="30" rx="2" ry="2.8" fill="#ff4dc4" />
      <ellipse cx="24" cy="7" rx="12" ry="3.5" fill="#ffd56a" stroke={BLACK} strokeWidth="2" />
      <path d="M14 5 Q24 1 34 5" stroke="#fff0ae" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function DonutIcon() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M24 7 C35 7 42 14 41 25 C40 36 32 42 22 41 C11 40 6 32 7 22 C8 13 15 7 24 7 Z" fill="#f5bd39" stroke={BLACK} strokeWidth="2.6" />
      <path d="M11 18 Q15 11 24 12 Q32 12 37 18 Q33 22 29 20 Q24 18 20 22 Q15 25 10 23 Z" fill="#f58aba" stroke={BLACK} strokeWidth="2" />
      <ellipse cx="24" cy="27" rx="5" ry="4.6" fill="#f0c08d" stroke={BLACK} strokeWidth="2" />
      <path d="M16 16 l3 2 M27 14 l2 2 M33 18 l3 -1 M14 25 l3 -1" stroke="#fff3af" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function ScoobyHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M13 20 Q4 12 6 7 Q13 7 19 16 M35 19 Q43 10 41 6 Q34 8 29 16" fill="#86552e" stroke={BLACK} strokeWidth="2.4" />
      <ellipse cx="24" cy="27" rx="15" ry="15" fill="#a86b37" stroke={BLACK} strokeWidth="2.5" />
      <path d="M14 23 Q18 20 21 23 M27 23 Q31 20 34 23" stroke={BLACK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="17.5" cy="25" rx="2" ry="2.8" fill={BLACK} /><ellipse cx="30.5" cy="25" rx="2" ry="2.8" fill={BLACK} />
      <path d="M17 30 Q24 27 31 30 Q31 39 24 39 Q17 39 17 30 Z" fill="#d99a61" stroke={BLACK} strokeWidth="1.8" />
      <ellipse cx="24" cy="31" rx="3.6" ry="2.2" fill={BLACK} />
      <path d="M21 35 Q24 37 27 35" stroke={BLACK} strokeWidth="1.7" fill="none" />
      <path d="M14 15 L19 21 M35 15 L30 21" stroke="#3b7250" strokeWidth="3" />
    </svg>
  )
}

function Omnitrix() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 9 Q24 3 38 9 L42 34 Q24 45 6 34 Z" fill="#252a2e" stroke={BLACK} strokeWidth="2.5" />
      <path d="M12 13 Q24 8 36 13 L38 31 Q24 39 10 31 Z" fill="#46504c" stroke="#15151a" strokeWidth="2" />
      <circle cx="24" cy="24" r="10" fill="#62d83d" stroke={BLACK} strokeWidth="2.5" />
      <path d="M24 15 L29 24 L24 33 L19 24 Z" fill={BLACK} />
      <path d="M24 18 L27 24 L24 30 L21 24 Z" fill="#9cff72" />
      <path d="M7 17 H11 M37 17 H41 M8 29 H11 M37 29 H40" stroke="#96a19e" strokeWidth="2" />
    </svg>
  )
}

function PineappleHouse() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M24 16 C36 16 39 23 37 34 Q35 42 24 42 Q13 42 11 34 C9 23 12 16 24 16 Z" fill="#f4c637" stroke={BLACK} strokeWidth="2.5" />
      <path d="M19 17 Q15 7 19 5 L23 14 Q23 3 27 4 L27 14 Q32 6 35 8 L29 18" fill="#4f9d4b" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 25 l3 2 M29 22 l3 2 M14 33 l3 2 M29 34 l3 2 M22 21 l2 2" stroke="#b77a22" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="21" y="29" width="6" height="13" rx="3" fill="#70523a" stroke={BLACK} strokeWidth="1.8" />
      <path d="M21 34 Q24 31 27 34 M21 37 Q24 34 27 37" stroke="#4c392b" strokeWidth="1.4" fill="none" />
    </svg>
  )
}

function PirateShip() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M6 32 H42 L36 41 H14 Z" fill="#704528" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 31 L14 35 H39 L36 39 H14 Z" fill="#a56b35" />
      <path d="M24 7 V31 M35 13 V31" stroke={BLACK} strokeWidth="2.5" />
      <path d="M22 10 L10 27 H22 Z" fill="#f5ecd8" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M26 11 L39 27 H26 Z" fill="#f5ecd8" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 15 L41 25 H32 Z" fill="#c8413a" stroke={BLACK} strokeWidth="1.8" />
      <path d="M16 21 L23 14 L22 24 Z" fill={BLACK} />
      <circle cx="20" cy="19" r="1.5" fill={WHITE} />
      <path d="M5 44 Q13 40 21 44 Q29 40 37 44 Q41 42 44 43" stroke="#4e9dc0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function CowboyHat() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 31 Q24 28 40 31 Q45 33 42 36 Q24 43 6 36 Q3 34 8 31 Z" fill="#a66b35" stroke={BLACK} strokeWidth="2.5" />
      <path d="M13 31 Q14 12 23 10 Q34 11 36 31 Z" fill="#c58a4e" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M15 22 Q24 26 35 22 L36 29 Q24 33 14 29 Z" fill="#8a4d2b" stroke={BLACK} strokeWidth="2" />
      <path d="M19 14 Q23 11 27 13" stroke="#f0bf76" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="25.5" r="2.5" fill="#f0c04d" />
    </svg>
  )
}

function ChineseHouse() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M5 18 Q24 4 43 18 L39 22 Q24 13 9 22 Z" fill="#bd3137" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M8 17 L4 14 M40 17 L44 14 M24 8 V5" stroke="#edca57" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 21 H36 V39 H12 Z" fill="#e9d7b7" stroke={BLACK} strokeWidth="2.4" />
      <path d="M9 25 H39 M10 38 H38" stroke="#b72d35" strokeWidth="3" />
      <rect x="20" y="29" width="8" height="10" fill="#8a3028" stroke={BLACK} strokeWidth="1.8" />
      <circle cx="24" cy="33" r="1" fill="#f3cf52" />
      <path d="M15 25 V29 M33 25 V29" stroke="#a04435" strokeWidth="2" />
    </svg>
  )
}

function ChineseDragon() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M9 34 Q4 24 14 22 Q23 20 18 14 Q13 8 23 7 Q31 6 32 14 Q33 20 40 18" fill="none" stroke="#d63b2f" strokeWidth="7" strokeLinecap="round" />
      <path d="M8 34 Q4 24 14 22 Q23 20 18 14 Q13 8 23 7 Q31 6 32 14 Q33 20 40 18" fill="none" stroke="#f1b83e" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M34 16 Q38 10 43 14 L45 20 Q42 26 35 23 L31 20 Z" fill="#d63b2f" stroke={BLACK} strokeWidth="2" />
      <path d="M37 14 L39 8 M42 14 L46 10" stroke="#f1d177" strokeWidth="2" strokeLinecap="round" />
      <circle cx="41" cy="18" r="1.7" fill="#fff17b" />
      <path d="M36 22 Q40 25 44 22 M16 31 l-4 5 M25 19 l-4 5" stroke="#f1b83e" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ForestAxe() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M18 42 L28 10 Q29 7 32 9 L35 11 L25 43 Z" fill="#a96635" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 11 Q33 5 40 8 L44 14 Q40 20 30 18 L26 16 Z" fill="#b9c3c8" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 10 Q37 8 40 10 L35 15 L29 15 Z" fill="#e7ecee" />
      <path d="M20 31 L28 34" stroke="#713f25" strokeWidth="2" />
      <path d="M8 39 Q17 35 25 39" stroke="#73a84e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function FlappyBird() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 24 Q10 12 22 12 Q34 12 36 24 Q37 33 29 36 L15 35 Q9 32 10 24 Z" fill="#f6d342" stroke={BLACK} strokeWidth="2.5" />
      <path d="M14 28 Q20 20 27 27 Q23 33 16 33 Z" fill="#f5a833" stroke={BLACK} strokeWidth="1.8" />
      <circle cx="28" cy="20" r="5" fill={WHITE} stroke={BLACK} strokeWidth="1.8" />
      <circle cx="30" cy="20" r="2" fill={BLACK} />
      <path d="M32 26 L44 29 L33 33 Z" fill="#f08432" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 40 H40" stroke="#61b34c" strokeWidth="3" />
      <path d="M35 6 V21 M35 6 H43 V17 H35" fill="#7ac75a" stroke={BLACK} strokeWidth="2" />
    </svg>
  )
}

function HappyWheelsRider() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <circle cx="12" cy="35" r="8" fill="#333840" stroke={BLACK} strokeWidth="2.5" /><circle cx="36" cy="35" r="8" fill="#333840" stroke={BLACK} strokeWidth="2.5" />
      <circle cx="12" cy="35" r="3" fill="#cbd0d4" /><circle cx="36" cy="35" r="3" fill="#cbd0d4" />
      <path d="M12 35 L20 25 L31 35 H19 L16 27 M22 25 L29 21" stroke="#c84b43" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <circle cx="26" cy="11" r="6" fill="#f0c7a1" stroke={BLACK} strokeWidth="2" />
      <path d="M19 10 Q21 3 29 5 L33 11 L29 12 L27 8 L21 13 Z" fill="#e04a43" stroke={BLACK} strokeWidth="2" />
      <path d="M25 17 L21 26 L29 28 L31 20" fill="#4a91be" stroke={BLACK} strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M22 26 L16 32 M28 27 L35 31" stroke="#e3bb90" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M25 5 Q30 14 26 19 Q36 13 37 25 Q41 38 25 43 Q8 42 10 28 Q11 20 18 16 Q17 25 22 25 Q28 19 25 5 Z" fill="#f04b27" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M24 25 Q31 21 31 29 Q33 36 24 38 Q16 36 19 30 Q20 27 23 26 Q22 31 25 31 Z" fill="#ffc342" />
      <path d="M15 37 Q22 41 31 37" stroke="#ffda6b" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function WaterDrop() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M24 5 Q39 23 38 31 Q37 42 24 43 Q11 42 10 31 Q9 23 24 5 Z" fill="#38aee8" stroke={BLACK} strokeWidth="2.5" />
      <path d="M24 8 Q16 21 15 29 Q14 36 21 39 Q14 37 13 31 Q11 24 24 8 Z" fill="#a9e8ff" />
      <path d="M19 34 Q22 38 28 36" stroke={WHITE} strokeWidth="2" opacity=".85" fill="none" strokeLinecap="round" />
      <circle cx="31" cy="28" r="2" fill="#ddf7ff" opacity=".8" />
    </svg>
  )
}

function NeonShape() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M24 5 L42 15 V33 L24 43 L6 33 V15 Z" fill="#16151f" stroke="#20f6e8" strokeWidth="3" strokeLinejoin="round" />
      <path d="M24 12 L35 18 V30 L24 36 L13 30 V18 Z" fill="#aa3dff" stroke="#ff47cf" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M24 18 L30 21 V27 L24 30 L18 27 V21 Z" fill="#2cf5a5" stroke={WHITE} strokeWidth="1.5" />
      <path d="M8 8 L13 11 M40 8 L35 11 M8 40 L13 37 M40 40 L35 37" stroke="#f3fb65" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function VolcanicRock() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M6 38 L10 23 L17 20 L21 8 L28 16 L34 13 L42 38 Z" fill="#343139" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M21 9 L25 19 L19 26 L14 31 L17 21 Z M29 17 L35 21 L32 29 L27 25 Z" fill="#f07832" />
      <path d="M9 37 Q15 31 20 35 Q24 29 29 34 Q35 29 40 36" stroke="#ff9b35" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="34" r="1.5" fill="#ffdc64" /><circle cx="34" cy="32" r="1.5" fill="#ffdc64" />
    </svg>
  )
}

function SonicExeHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M9 14 L4 3 L17 10 L23 4 L26 11 L39 4 L35 16 Q42 20 40 29 Q38 39 24 42 Q10 40 8 29 Z" fill="#1563aa" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 23 Q19 19 23 24 L21 29 L14 29 Z M26 24 Q31 19 36 23 L34 29 L27 29 Z" fill={BLACK} />
      <circle cx="19" cy="26" r="1.6" fill="#ec2737" /><circle cx="31" cy="26" r="1.6" fill="#ec2737" />
      <path d="M13 33 Q24 29 36 33 Q33 39 24 39 Q16 39 13 33 Z" fill="#7c1b29" />
      <path d="M15 33 L21 33 L20 36 L16 36 Z M26 33 L32 33 L31 36 L27 36 Z" fill={WHITE} />
      <path d="M14 19 Q18 16 22 19 M27 19 Q32 16 36 19" stroke="#e52b40" strokeWidth="2.8" fill="none" />
    </svg>
  )
}

function TailsExeHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M18 15 L11 4 L9 18 M30 15 L39 4 L38 19" fill="#c97720" stroke={BLACK} strokeWidth="2.5" />
      <ellipse cx="24" cy="28" rx="14" ry="14" fill="#e8942b" stroke={BLACK} strokeWidth="2.5" />
      <ellipse cx="19" cy="25" rx="4" ry="6" fill={BLACK} /><ellipse cx="30" cy="25" rx="4" ry="6" fill={BLACK} />
      <circle cx="19" cy="25" r="1.7" fill="#f02031" /><circle cx="30" cy="25" r="1.7" fill="#f02031" />
      <path d="M15 34 Q24 29 34 34 Q31 41 24 41 Q17 40 15 34 Z" fill="#5f111c" />
      <path d="M18 34 L23 34 L22 38 L19 38 Z M26 34 L31 34 L29 38 L26 38 Z" fill={WHITE} />
      <path d="M12 13 L18 18 M37 12 L31 18" stroke="#871b25" strokeWidth="2" />
    </svg>
  )
}

function DamagedFreddy() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M17 7 Q17 4 20 4 H28 Q31 4 31 7 L32 14 H16 Z" fill={BLACK} stroke={BLACK} strokeWidth="1.8" />
      <path d="M11 12 H37 Q39 12 39 14 V16 H9 V14 Q9 12 11 12 Z" fill={BLACK} />
      <path d="M11 20 L9 8 L17 14 L22 12 L27 15 L38 7 L36 22 L40 29 L35 39 L24 44 L13 40 L8 30 Z" fill="#82502d" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 10 L16 16 L19 17 M37 10 L32 18 M10 23 L6 27 L10 29 M38 22 L42 26" fill="none" stroke="#d6b789" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 18 L19 21 L16 25 L12 23 Z M36 19 L31 22 L34 26 L38 24 Z" fill="#54351f" />
      <path d="M19 20 L24 22 L22 27 L17 26 Z" fill={BLACK} />
      <path d="M28 20 Q34 18 35 23 L35 28 L29 27 Z" fill="#34302b" />
      <circle cx="31" cy="23" r="2.1" fill="#4bb7dc" />
      <circle cx="31" cy="23" r=".9" fill={WHITE} />
      <path d="M18 19 L22 18 M28 18 L34 19" stroke="#392719" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 29 Q24 26 35 29 L33 38 L25 41 L16 38 Z" fill="#322219" stroke={BLACK} strokeWidth="1.6" />
      <path d="M16 29 L21 29 L20 34 L17 34 Z M23 28 L27 28 L26 34 L23 34 Z M29 29 L33 29 L31 35 L29 35 Z" fill={WHITE} />
      <path d="M19 40 L18 44 M30 40 L32 44 M12 32 L15 34 M36 32 L39 34" stroke="#2c2018" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function GlamrockFreddy() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 18 L10 6 L20 13 L28 13 L38 6 L36 20 L39 29 L34 40 L24 43 L13 39 L9 29 Z" fill="#b65b32" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 7 H28 Q30 7 30 9 V13 H17 Z" fill={BLACK} stroke={BLACK} strokeWidth="1.4" />
      <path d="M14 13 H32 V15 H14 Z" fill="#17171a" />
      <path d="M14 19 Q24 15 35 19 L33 23 Q24 20 15 24 Z" fill="#f0c64c" stroke={BLACK} strokeWidth="1.6" />
      <path d="M16 18 L19 15 M31 18 L34 15" stroke="#4bd6de" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="18" cy="26" rx="4" ry="4.6" fill={BLACK} /><ellipse cx="30" cy="26" rx="4" ry="4.6" fill={BLACK} />
      <circle cx="18" cy="26" r="1.6" fill="#64d8ef" /><circle cx="30" cy="26" r="1.6" fill="#64d8ef" />
      <path d="M11 27 Q15 25 18 28 L16 32 L12 31 Z M37 27 Q33 25 30 28 L32 32 L36 31 Z" fill="#cb2c35" stroke={BLACK} strokeWidth="1.4" />
      <path d="M16 33 Q24 29 32 33 L30 39 H18 Z" fill={BLACK} />
      <path d="M19 33 L23 33 L22 36 L19 36 Z M26 33 L30 33 L29 36 L26 36 Z" fill={WHITE} />
      <path d="M15 14 L17 8 M33 14 L31 8" stroke="#50d8df" strokeWidth="2" />
      <path d="M21 38 L24 35 L27 38 L24 41 Z" fill="#f5df4b" stroke={BLACK} strokeWidth="1.2" />
    </svg>
  )
}

function MimicEndoskeleton() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M11 11 L18 7 L22 10 L28 5 L35 10 L39 17 L36 23 L41 28 L36 35 L29 33 L24 41 L18 35 L11 38 L7 30 L12 24 L8 18 Z" fill="#aeb1b0" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M12 14 L18 11 L21 16 L15 21 Z M34 13 L29 11 L27 17 L33 21 Z" fill="#46474a" stroke={BLACK} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="17" cy="17" r="2" fill="#e33439" /><circle cx="17" cy="17" r=".8" fill="#ffd6a2" />
      <circle cx="30" cy="17" r="1.5" fill="#ddd2a2" />
      <path d="M14 25 L34 23 L34 32 L28 35 L23 32 L18 35 L13 31 Z" fill="#343539" stroke={BLACK} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M16 26 L20 26 L19 31 L16 31 Z M22 25 L26 25 L25 31 L22 31 Z M28 25 L32 25 L31 31 L28 31 Z" fill="#e7e3d8" />
      <path d="M10 21 L6 24 L10 27 M37 19 L42 22 L38 25 M19 36 L17 42 M31 35 L34 41" fill="none" stroke="#8e4c43" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="11" cy="17" r="1.2" fill="#d6d9d7" /><circle cx="37" cy="29" r="1.2" fill="#d6d9d7" />
    </svg>
  )
}

function SpringtrapHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M11 20 L9 3 L18 12 L22 5 L29 12 L39 4 L37 22 L40 30 L35 41 L24 44 L12 39 L8 30 Z" fill="#83814b" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11 6 L15 14 L11 18 L8 12 M38 7 L33 15 L37 18" fill="#5a5d39" stroke={BLACK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 16 L19 19 L16 22 M34 15 L30 19 L35 21" stroke="#cbc99c" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 22 L19 20 L22 25 L17 27 Z M28 21 L35 20 L34 27 L29 26 Z" fill={BLACK} />
      <circle cx="18" cy="24" r="1.7" fill="#f2d948" />
      <circle cx="32" cy="24" r="2.1" fill="#f2d948" />
      <circle cx="32" cy="24" r=".8" fill={WHITE} />
      <path d="M17 18 L21 20 M29 18 L34 18" stroke="#4e5032" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M14 30 L19 28 L22 31 L27 28 L34 30 L32 38 L24 42 L16 38 Z" fill="#3d392b" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 31 L20 30 L19 35 L16 35 Z M23 30 L27 30 L26 35 L23 35 Z M30 31 L33 31 L31 36 L29 35 Z" fill="#d4cfb5" />
      <path d="M10 28 L6 31 L10 33 M38 29 L42 32 L38 34 M19 39 L18 44 M29 39 L31 44 M21 14 L23 10" fill="none" stroke="#443f2b" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 25 L15 27 M34 25 L37 27 M25 34 L27 36" stroke="#c1b981" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function NightmareFreddy() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M18 6 Q18 3 21 3 H28 Q31 3 31 6 L32 13 H17 Z" fill="#171315" stroke={BLACK} strokeWidth="2" />
      <path d="M10 12 H38 Q40 12 40 14 V16 H8 V14 Q8 12 10 12 Z" fill="#21191a" />
      <path d="M11 19 L6 5 L17 12 L21 9 L25 12 L30 9 L41 5 L37 21 L41 31 L35 41 L24 45 L12 41 L7 30 Z" fill="#4c3021" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" />
      <path d="M8 9 L16 16 L13 20 M39 9 L32 16 L36 21" fill="none" stroke="#b18b55" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 21 L18 18 L22 22 L18 27 L12 26 Z M36 21 L30 18 L26 22 L30 27 L36 26 Z" fill={BLACK} />
      <path d="M17 22 L20 22 M28 22 L31 22" stroke="#ef4f3e" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="18" cy="23" r="1" fill="#ffd27b" />
      <circle cx="30" cy="23" r="1" fill="#ffd27b" />
      <path d="M13 29 Q24 26 35 29 L39 35 L34 41 L28 39 L24 43 L20 39 L14 41 L9 35 Z" fill="#171315" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13 30 L17 30 L16 36 L13 35 Z M19 29 L23 29 L22 36 L19 36 Z M26 29 L30 29 L29 36 L26 36 Z M32 30 L36 30 L35 36 L32 36 Z" fill={WHITE} />
      <path d="M11 33 L9 38 M37 33 L39 38 M17 39 L15 45 M31 39 L33 45" stroke="#c9b078" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M21 16 L18 19 M27 16 L30 19 M24 16 L22 20" stroke="#b78e57" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 28 L8 30 M44 28 L40 30" stroke="#a73935" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function BabyHead() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M9 15 Q4 8 10 5 Q17 2 21 10 M39 15 Q44 8 38 5 Q31 2 27 10" fill="#d83d36" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M10 17 Q10 5 24 5 Q38 5 38 17 L37 33 Q35 41 24 43 Q13 41 11 33 Z" fill="#eee9dc" stroke={BLACK} strokeWidth="2.6" />
      <path d="M11 17 Q14 7 24 7 Q34 7 37 17 L33 20 L29 15 L25 20 L21 15 L17 20 Z" fill="#db443a" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 23 Q18 20 22 23 M34 23 Q30 20 26 23" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="18.5" cy="26" rx="3.4" ry="4.2" fill="#f5f2e9" stroke={BLACK} strokeWidth="1.4" />
      <ellipse cx="29.5" cy="26" rx="3.4" ry="4.2" fill="#f5f2e9" stroke={BLACK} strokeWidth="1.4" />
      <circle cx="19" cy="26" r="2.2" fill="#66b96a" /><circle cx="29" cy="26" r="2.2" fill="#66b96a" />
      <circle cx="19" cy="26" r="1" fill={BLACK} /><circle cx="29" cy="26" r="1" fill={BLACK} />
      <circle cx="13.5" cy="30" r="2.8" fill="#dc4b4b" /><circle cx="34.5" cy="30" r="2.8" fill="#dc4b4b" />
      <path d="M22 30 Q24 28.5 26 30 L25 32 H23 Z" fill="#d4bdb1" stroke={BLACK} strokeWidth="1" />
      <path d="M19 33 Q24 35 29 33 L28 39 Q24 41 20 39 Z" fill="#b8343b" stroke={BLACK} strokeWidth="1.5" />
      <path d="M20 34 L24 35 L28 34" fill="none" stroke={WHITE} strokeWidth="1.5" />
      <path d="M13 19 L11 16 M17 19 L16 15 M31 19 L32 15 M35 19 L37 16" stroke={BLACK} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function PuppetFace() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 9 Q24 3 36 9 L38 30 Q37 40 24 44 Q11 40 10 30 Z" fill="#eeeae1" stroke={BLACK} strokeWidth="2.6" />
      <path d="M13 15 Q16 10 22 14 L21 26 Q18 29 14 26 Z M26 14 Q32 10 35 15 L34 26 Q30 29 27 26 Z" fill={BLACK} />
      <circle cx="18" cy="19" r="1.9" fill={WHITE} /><circle cx="30" cy="19" r="1.9" fill={WHITE} />
      <path d="M15 24 Q17 29 15 36 M20 26 Q21 32 20 39 M33 24 Q31 29 33 36 M28 26 Q27 32 28 39" fill="none" stroke="#655080" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="14" cy="29" r="3.1" fill="#ca3446" /><circle cx="34" cy="29" r="3.1" fill="#ca3446" />
      <path d="M21 31 Q24 29 27 31 L27 40 Q24 42 21 40 Z" fill={BLACK} />
      <path d="M12 10 L11 5 M36 10 L37 5" stroke="#33313c" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M13 38 L9 44 M35 38 L39 44" stroke={BLACK} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function BMWM3GTR() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M4 31 L9 20 L16 16 L31 16 L39 21 L44 31 L42 37 H6 Z" fill="#d9e0e5" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 20 L18 17.5 H30 L35 21 L35 26 H12 Z" fill="#315473" stroke={BLACK} strokeWidth="1.8" />
      <path d="M17 18 L22 18 L19 26 H14 Z M26 18 L31 18 L34 26 H23 Z" fill="#56a4d8" />
      <path d="M11 28 H38 L41 32 H7 Z" fill="#5c91b7" stroke={BLACK} strokeWidth="1.8" />
      <path d="M10 24 L15 19 H19 L15 28 H10 Z M22 18 H26 L22 28 H18 Z M30 19 H34 L30 28 H26 Z" fill="#f2f3f0" />
      <path d="M8 29 L12 29 L10 32 H7 Z M19 29 H23 L21 32 H17 Z M29 29 H33 L31 32 H27 Z" fill="#367caf" />
      <ellipse cx="38" cy="28" rx="1.5" ry="3.4" fill={BLACK} />
      <ellipse cx="41" cy="28" rx="1.2" ry="3" fill={BLACK} />
      <circle cx="25" cy="24" r="2.8" fill="#f4f6f7" stroke={BLACK} strokeWidth="1.2" />
      <path d="M22.5 24 H27.5 M25 21.3 V26.7" stroke="#4a94c5" strokeWidth="1.1" />
      <circle cx="12" cy="36" r="4" fill="#20232a" stroke={BLACK} strokeWidth="1.8" /><circle cx="36" cy="36" r="4" fill="#20232a" stroke={BLACK} strokeWidth="1.8" />
      <circle cx="12" cy="36" r="1.6" fill="#bac4cb" /><circle cx="36" cy="36" r="1.6" fill="#bac4cb" />
    </svg>
  )
}

function Porsche911Yellow() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M5 31 L8 24 Q11 20 18 19 L23 13 Q28 11 34 15 L39 21 L43 25 L44 33 H5 Z" fill="#f1cc24" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M20 19 L24 14 Q29 12 33 16 L37 21 Z" fill="#8bd3e6" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 25 Q12 22 18 23 M38 24 L42 25" stroke="#fff4a9" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M13 28 H31 L34 31 H11 Z" fill="#24252b" />
      <path d="M17 28 L20 31 M22 28 L25 31 M27 28 L30 31" stroke="#c3c8cb" strokeWidth="1.1" />
      <circle cx="14" cy="33" r="4.3" fill="#25272d" stroke={BLACK} strokeWidth="1.8" /><circle cx="36" cy="33" r="4.3" fill="#25272d" stroke={BLACK} strokeWidth="1.8" />
      <circle cx="14" cy="33" r="1.7" fill="#c8cdd0" /><circle cx="36" cy="33" r="1.7" fill="#c8cdd0" />
      <path d="M8 23 Q11 21 14 22" stroke="#fff5c4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NfsCar({ paint, stripe, police = false, style = 'gt', model }: { paint: string; stripe: string; police?: boolean; style?: 'gt' | 'porsche' | 'tuner' | 'muscle' | 'luxury' | 'drift' | 'hyper' | 'neon'; model?: 'skyline' | '350z' | 'rx7' | 'evo' | 'm6' | 'm3-gts' | 'r8' | 'lambo' | 'm5' | 'polestar' | 'mercedes190' }) {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d={style === 'muscle' ? 'M4 31 L9 19 L16 16 H33 L39 21 L44 31 V36 H4 Z' : style === 'hyper' ? 'M5 31 L12 20 L20 14 H30 L38 20 L43 31 V36 H5 Z' : style === 'porsche' ? 'M6 31 L11 20 Q15 15 24 15 H31 Q37 17 40 25 L43 31 V36 H5 Z' : 'M6 31 L11 20 L17 15 H31 L37 20 L42 31 V36 H6 Z'} fill={paint} stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={style === 'porsche' ? 'M15 21 Q18 17 24 17 H30 Q34 18 36 25 H12 Z' : style === 'hyper' ? 'M16 20 L21 16 H29 L34 20 L37 26 H12 Z' : 'M16 20 L19 17 H29 L33 20 L35 26 H13 Z'} fill="#8ed9ef" stroke={BLACK} strokeWidth="1.7" />
      <path d="M23 17 V26" stroke={BLACK} strokeWidth="1.4" />
      <path d="M8 28 H40 L42 33 H6 Z" fill={stripe} />
      {style === 'tuner' && <><path d="M8 16 H18 L17 19 H9 Z" fill={BLACK} /><path d="M9 14 H19" stroke="#c8d5dc" strokeWidth="2" /></>}
      {style === 'muscle' && <path d="M18 16 L20 12 H29 L31 16 Z" fill="#24272d" stroke={BLACK} strokeWidth="1.5" />}
      {style === 'drift' && <path d="M7 39 Q14 36 21 39 M27 39 Q34 36 41 39" stroke={stripe} strokeWidth="2" fill="none" strokeLinecap="round" />}
      {style === 'luxury' && <path d="M19 29 H29 L28 33 H20 Z" fill="#d9d4c9" stroke={BLACK} strokeWidth="1.2" />}
      {style === 'hyper' && <path d="M10 20 L14 13 H19 L16 21 M32 19 L35 13 H39 L37 22" fill={stripe} stroke={BLACK} strokeWidth="1.4" />}
      {style === 'neon' && <path d="M13 27 L19 20 M19 28 L25 20 M25 28 L31 20 M31 28 L37 20" stroke={stripe} strokeWidth="2" />}
      {model === 'skyline' && <><path d="M7 19 H16 L14 15 H9 Z" fill={BLACK} stroke={BLACK} strokeWidth="1.2" /><path d="M34 19 L36 12 H40 L41 22" fill={stripe} stroke={BLACK} strokeWidth="1.6" /><path d="M18 27 L21 20 M24 27 L27 20 M30 27 L33 20" stroke={stripe} strokeWidth="1.8" /></>}
      {model === '350z' && <><path d="M7 20 Q15 13 26 15 L34 19 H12 Z" fill={stripe} stroke={BLACK} strokeWidth="1.3" /><path d="M12 29 H36" stroke="#e44c35" strokeWidth="2" /><path d="M34 19 L38 16 L40 22" fill={paint} stroke={BLACK} strokeWidth="1.3" /></>}
      {model === 'rx7' && <><path d="M19 16 Q24 11 29 16 L28 19 H20 Z" fill="#24252b" stroke={BLACK} strokeWidth="1.3" /><circle cx="14" cy="27" r="2" fill="#f4da74" stroke={BLACK} strokeWidth="1" /><circle cx="34" cy="27" r="2" fill="#f4da74" stroke={BLACK} strokeWidth="1" /><path d="M11 30 H37" stroke={stripe} strokeWidth="2" /></>}
      {model === 'evo' && <><path d="M7 20 L11 14 H17 L18 20 M33 20 L35 14 H41 L41 22" fill={stripe} stroke={BLACK} strokeWidth="1.5" /><path d="M17 18 L20 15 H28 L31 18" fill="#24252b" stroke={BLACK} strokeWidth="1.3" /><path d="M12 28 H36" stroke={WHITE} strokeWidth="1.7" /></>}
      {model === 'm6' && <><path d="M21 29 H24 V33 H21 Z M26 29 H29 V33 H26 Z" fill="#d6d9d9" stroke={BLACK} strokeWidth="1" /><path d="M14 21 L18 17 H30 L34 21" fill={stripe} stroke={BLACK} strokeWidth="1.2" /><path d="M19 17 L17 21 M29 17 L31 21" stroke={WHITE} strokeWidth="1" /></>}
      {model === 'm3-gts' && <><path d="M20 17 L23 14 H27 L30 17 L33 27 H28 L26 20 H22 L20 27 H15 Z" fill={stripe} stroke={BLACK} strokeWidth="1.1" /><path d="M18 17 H30" stroke={WHITE} strokeWidth="1.4" /></>}
      {model === 'r8' && <><path d="M8 18 L12 12 H17 L15 22 M34 22 L32 12 H37 L41 18" fill={stripe} stroke={BLACK} strokeWidth="1.4" /><path d="M22 28 L24 22 L27 28 Z" fill="#f4e6c8" stroke={BLACK} strokeWidth="1" /></>}
      {model === 'lambo' && <><path d="M12 20 L18 15 H22 L17 23 M30 23 L26 15 H31 L37 20" fill={stripe} stroke={BLACK} strokeWidth="1.5" /><path d="M18 27 L21 21 H27 L30 27" fill="#25272c" stroke={BLACK} strokeWidth="1.3" /><path d="M14 29 L18 26 M34 29 L30 26" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" /></>}
      {model === 'm5' && <><path d="M20 27 V21 Q20 19 22 19 H26 Q28 19 28 21 V27" fill="#25272c" stroke={BLACK} strokeWidth="1.2" /><path d="M21 20 V26 M27 20 V26" stroke="#b8c4cd" strokeWidth="1.2" /><path d="M14 29 H34" stroke="#edcf69" strokeWidth="1.8" /></>}
      {model === 'polestar' && <><path d="M13 22 L18 15 H29 L35 22" fill="none" stroke={stripe} strokeWidth="2.2" strokeLinejoin="round" /><path d="M9 27 H16 M32 27 H39" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" /><path d="M20 17 H28" stroke="#e8d8be" strokeWidth="1.2" /></>}
      {model === 'mercedes190' && <><path d="M8 18 H17 L19 14 H30 L33 18 H40" fill="none" stroke={stripe} strokeWidth="2.2" strokeLinejoin="round" /><path d="M24 15 L27 19 L24 21 L21 19 Z" fill="#d8e3e7" stroke={BLACK} strokeWidth="1" /><path d="M16 28 H32" stroke={WHITE} strokeWidth="1.7" /></>}
      <path d="M11 31 H17 M31 31 H37" stroke="#fff2a1" strokeWidth="2.4" strokeLinecap="round" />
      {police && <><rect x="18" y="12" width="12" height="3" rx="1.5" fill="#f2443b" /><rect x="18" y="12" width="6" height="3" rx="1.5" fill="#3989ef" /></>}
      <circle cx="13" cy="36" r="4.5" fill="#25272d" stroke={BLACK} strokeWidth="2" /><circle cx="35" cy="36" r="4.5" fill="#25272d" stroke={BLACK} strokeWidth="2" />
      <circle cx="13" cy="36" r="1.8" fill="#bec5cc" /><circle cx="35" cy="36" r="1.8" fill="#bec5cc" />
    </svg>
  )
}

function GTAWeapon({ kind }: { kind: 'ak' | 'rifle' | 'revolver' }) {
  if (kind === 'revolver') return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M6 17 H33 L42 20 V25 H29 L25 31 H18 L16 25 H6 Z" fill="#b7bdc1" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="19" cy="21" r="3" fill="#777e83" stroke={BLACK} strokeWidth="1.6" /><circle cx="26" cy="21" r="3" fill="#777e83" stroke={BLACK} strokeWidth="1.6" />
      <path d="M16 25 H27 L25 33 Q22 36 19 32 L17 28 H14 Z" fill="#9c653b" stroke={BLACK} strokeWidth="2" />
      <path d="M8 19 H14" stroke={WHITE} strokeWidth="1.6" />
    </svg>
  )
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M5 18 H27 L32 21 H44 V27 H31 L28 31 H21 L19 26 H14 L12 31 H8 L9 25 H5 Z" fill={kind === 'ak' ? '#8b633c' : '#606b73'} stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 18 V13 H21 V18 M25 18 V14 H29 V19" fill="#8f9698" stroke={BLACK} strokeWidth="1.8" />
      <path d={kind === 'ak' ? 'M21 26 L25 27 L27 40 L22 41 Z' : 'M21 26 L27 27 L25 36 L20 37 Z'} fill="#69482e" stroke={BLACK} strokeWidth="2" />
      <path d="M7 16 H35" stroke="#d6dad9" strokeWidth="1.6" />
      <rect x="37" y="21" width="6" height="2" rx="1" fill="#f0d87a" />
      <path d="M12 22 H16" stroke="#e3c691" strokeWidth="2" />
    </svg>
  )
}

function DisturbedGuy() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 18 Q9 5 24 5 Q39 5 40 18 L38 38 Q24 45 10 38 Z" fill="#111116" stroke={BLACK} strokeWidth="2.4" />
      <path d="M10 17 Q18 9 38 17 L35 24 Q24 19 13 25 Z" fill="#28272c" />
      <path d="M13 24 Q18 21 23 25 M25 25 Q30 21 35 24" stroke="#f2f0e9" strokeWidth="3" strokeLinecap="round" />
      <path d="M17 32 Q24 35 31 32" stroke="#f4f1eb" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M17 14 Q24 11 31 14" stroke="#4a474f" strokeWidth="2" fill="none" />
    </svg>
  )
}

function PlantIcon() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M23 40 V24" stroke="#397b3c" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M23 29 Q8 29 10 16 Q22 14 25 25 Q28 11 40 12 Q41 27 25 30" fill="#55a84f" stroke={BLACK} strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M13 18 Q19 20 23 26 M37 15 Q32 20 25 27" stroke="#a3dc6c" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M15 40 H32 L30 45 H17 Z" fill="#98613b" stroke={BLACK} strokeWidth="2" />
      <path d="M13 39 H34" stroke="#c2854d" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function Ben10Watch() { return Omnitrix() }
function SpongePineapple() { return PineappleHouse() }
function ScoobyDoo() { return ScoobyHead() }
function SimpsonsDonut() { return DonutIcon() }

function TutankhamunMask() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 13 Q24 3 36 13 L42 34 Q24 46 6 34 Z" fill="#17649b" stroke={BLACK} strokeWidth="2.5" />
      <path d="M16 11 Q24 6 32 11 L34 31 Q24 40 14 31 Z" fill="#e3bd47" stroke={BLACK} strokeWidth="2.4" />
      <path d="M16 16 Q24 20 32 16 M15 21 Q24 25 33 21 M15 26 Q24 30 33 26 M17 31 Q24 35 31 31" stroke="#2075a7" strokeWidth="2.2" />
      <path d="M12 13 Q24 20 36 13 L34 18 Q24 24 14 18 Z" fill="#e4bf4c" stroke={BLACK} strokeWidth="1.8" />
      <path d="M17 23 Q21 20 24 23 M24 23 Q28 20 31 23" stroke={BLACK} strokeWidth="2" fill="none" />
      <path d="M18 32 Q24 28 30 32 L28 36 H20 Z" fill="#bb9034" stroke={BLACK} strokeWidth="1.5" />
    </svg>
  )
}

function ExposedMarioExe() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M10 17 Q10 7 23 7 Q37 7 38 19 L36 36 Q24 44 12 36 Z" fill="#e9ba8c" stroke={BLACK} strokeWidth="2.5" />
      <path d="M8 19 Q5 12 11 10 L17 6 L24 10 L31 5 L39 11 L40 20 Q24 16 8 20 Z" fill="#c5292d" stroke={BLACK} strokeWidth="2.2" />
      <path d="M14 23 Q19 19 23 23 L21 28 L14 28 Z M26 23 Q31 19 35 23 L33 28 L26 28 Z" fill={BLACK} />
      <circle cx="19" cy="25" r="1.7" fill="#f12c3a" /><circle cx="30" cy="25" r="1.7" fill="#f12c3a" />
      <path d="M13 32 Q24 28 36 32 Q32 40 24 40 Q16 39 13 32 Z" fill="#351317" />
      <path d="M15 32 L20 32 L19 36 L16 36 Z M22 31 L27 31 L27 36 L23 36 Z M30 32 L34 32 L32 36 L29 36 Z" fill={WHITE} />
      <path d="M15 14 Q24 11 35 14" stroke="#521117" strokeWidth="2" fill="none" />
    </svg>
  )
}

function PerryPlatypus() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 20 Q8 11 16 11 Q24 11 25 19 Q31 13 38 18 Q43 23 39 32 Q35 39 24 39 L12 35 Q7 31 8 20 Z" fill="#2ca6a1" stroke={BLACK} strokeWidth="2.5"/><path d="M12 26 Q4 23 4 28 Q5 33 14 32 Z" fill="#de8732" stroke={BLACK} strokeWidth="2"/><path d="M13 22 Q18 15 24 21 L23 25 L15 26 Z M24 21 Q30 15 35 21 L33 26 L25 25 Z" fill="#f4ecd2" stroke={BLACK} strokeWidth="1.5"/><circle cx="19" cy="22" r="1.2" fill={BLACK}/><circle cx="30" cy="22" r="1.2" fill={BLACK}/><path d="M15 16 Q16 7 24 7 Q32 7 34 16 L31 18 H17 Z" fill="#795034" stroke={BLACK} strokeWidth="2.2"/><path d="M12 34 Q21 39 34 35" fill="none" stroke="#197773" strokeWidth="2"/></svg> }
function AutobotBadge() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 4 L39 11 L37 30 L24 44 L11 30 L9 11 Z" fill="#b72331" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round"/><path d="M14 15 L21 17 L24 12 L27 17 L34 15 L32 22 L37 28 L29 28 L24 37 L19 28 L11 28 L16 22 Z" fill="#d9dde0" stroke={BLACK} strokeWidth="2" strokeLinejoin="round"/><path d="M14 17 L18 18 L19 24 L14 23 Z M34 17 L30 18 L29 24 L34 23 Z" fill="#aab2b7"/><path d="M18 22 L21 21 M30 21 L33 22 M19 28 L24 25 L29 28" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round"/><path d="M20 32 L24 35 L28 32" fill="none" stroke="#737c82" strokeWidth="1.5"/></svg> }
function JurassicMedallion() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <circle cx="24" cy="24" r="18" fill="#d9ad42" stroke={BLACK} strokeWidth="2.8" />
      <circle cx="24" cy="21" r="11" fill="#252428" stroke="#a52d27" strokeWidth="2" />
      <path d="M17 16 L20 18 L19 21 L22 23 L19 25 L20 28 L16 30 L14 27 L16 24 L13 22 L16 20 Z M25 17 L28 14 L31 17 L30 21 L34 24 L31 27 L32 30 L27 29 L25 26 L27 23 L24 21 Z" fill="#d7b74e" />
      <path d="M11 34 H37 M14 38 H34" stroke="#a52d27" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function MortalDragon() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><circle cx="24" cy="24" r="19" fill="#28262a" stroke="#bd302c" strokeWidth="3"/><path d="M31 7 Q36 12 31 17 L25 19 L34 21 L40 18 L38 25 L32 27 L36 32 L29 31 L26 37 L22 42 L20 36 L15 39 L17 32 L11 31 L16 27 L12 22 L19 23 L22 19 Q16 18 16 12 L22 16 L27 14 L27 9 Z" fill="#d74337" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="29" cy="15" r="1.3" fill="#f5d45c"/><path d="M27 20 L23 25 L29 27 L24 32" fill="none" stroke="#ffb354" strokeWidth="1.7"/></svg> }
function LeviathanAxe() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M23 10 L27 12 L20 40 L16 39 Z" fill="#805238" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M23 8 Q32 5 40 12 Q38 22 27 24 L21 20 Z" fill="#9ccbd0" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M27 12 L36 13 L31 19 L25 20" fill="none" stroke="#e5f2ed" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 20 L19 21 M13 26 L18 27 M11 32 L16 33" stroke="#c9a77b" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function SubnauticaPeeper() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M7 24 Q14 10 29 13 Q37 14 41 24 Q36 34 25 36 Q13 36 7 24 Z" fill="#e5a83e" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M7 24 L2 17 L3 31 Z" fill="#f07e36" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 16 L19 8 L24 15 M28 14 L35 9 L34 18" fill="#42aeb5" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="29" cy="22" r="5.5" fill="#f0e9c8" stroke={BLACK} strokeWidth="1.7" />
      <circle cx="30" cy="22" r="2.4" fill="#174e79" /><circle cx="31" cy="21" r="1" fill={WHITE} />
      <path d="M15 30 Q20 33 25 31" fill="none" stroke="#9b552b" strokeWidth="1.6" />
    </svg>
  )
}

function WoodyHat() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 22 Q13 18 24 19 Q35 18 40 22 L38 27 H10 Z" fill="#a94e32" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M15 20 Q16 8 24 7 Q32 8 33 20 Z" fill="#c66a43" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11 24 H37" stroke="#f0cf53" strokeWidth="2.5" />
      <path d="M15 31 Q24 27 33 31 L30 39 H18 Z" fill="#f0dcad" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="20" cy="34" r="1.4" fill={BLACK} /><circle cx="28" cy="34" r="1.4" fill={BLACK} />
    </svg>
  )
}

function LightningMcQueen() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M6 18 Q11 13 18 14 L31 15 Q38 16 42 23 L40 34 H8 L5 28 Z" fill="#d93632" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M15 15 L20 9 H30 L35 17 Z" fill="#75b9d5" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 21 Q16 18 21 22 M27 22 Q33 18 38 21" fill="none" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
      <circle cx="16" cy="22" r="1.7" fill={BLACK} /><circle cx="32" cy="22" r="1.7" fill={BLACK} />
      <path d="M14 29 Q24 33 35 28" fill="none" stroke="#f1c14a" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="13" cy="34" r="4" fill={BLACK} stroke="#d4d4d4" strokeWidth="1.3" /><circle cx="35" cy="34" r="4" fill={BLACK} stroke="#d4d4d4" strokeWidth="1.3" />
    </svg>
  )
}

function Lightsaber() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 37 L33 13" stroke="#4ed9fa" strokeWidth="7" strokeLinecap="round" opacity=".5" />
      <path d="M12 37 L33 13" stroke="#f3ffff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M8 34 L15 40 L20 35 L13 29 Z" fill="#adb7bf" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M9 34 L15 39 M12 31 L18 36" stroke="#4b5963" strokeWidth="1.6" />
      <path d="M31 11 L35 7" stroke="#aaf4ff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function BrawlSkull() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M8 19 Q8 7 24 6 Q40 7 40 19 V31 L34 36 H14 L8 31 Z" fill="#f0c735" stroke={BLACK} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M13 20 L19 17 L21 24 L14 25 Z M35 20 L29 17 L27 24 L34 25 Z" fill={BLACK} />
      <path d="M18 30 H30 L27 36 H21 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.5" />
      <path d="M4 14 L11 16 M37 16 L44 14" stroke="#448ed0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function FortniteLlama() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M12 11 L18 5 L23 12 L29 5 L35 12 L39 19 L36 28 L33 42 H27 L26 31 H21 L19 42 H13 L15 28 L10 22 Z" fill="#61cde0" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 19 L20 16 L23 21 L17 23 Z M34 19 L28 16 L25 21 L31 23 Z" fill="#f4c947" stroke={BLACK} strokeWidth="1.5" />
      <path d="M19 27 Q24 31 29 27" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 12 L21 16 M30 12 L27 16" stroke="#e956a6" strokeWidth="2.5" />
    </svg>
  )
}

function RobloxLogo() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <g transform="rotate(-16 24 24)">
        <path d="M11 7 L41 15 L37 41 L7 33 Z" fill="#dedfe2" stroke={BLACK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M21 19 L29 21 L27 29 L19 27 Z" fill={BLACK} />
      </g>
    </svg>
  )
}

function StrawHat() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M7 31 Q13 27 24 28 Q35 27 41 31 L39 37 H9 Z" fill="#e6b94c" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M14 29 Q15 13 24 10 Q33 13 34 29 Z" fill="#f0ce6a" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M14 25 Q24 28 34 25 L34 29 Q24 32 14 29 Z" fill="#d94738" stroke={BLACK} strokeWidth="1.5" />
      <path d="M18 36 H30" stroke="#9c6d2c" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function NarutoHeadband() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M7 16 L2 13 V32 L8 29 M41 16 L46 13 V32 L40 29" fill="#ed8436" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M7 13 Q24 7 41 13 V30 Q24 36 7 30 Z" fill="#e3e5e7" stroke={BLACK} strokeWidth="2.6" />
      <path d="M16 16 Q19 19 16 22 L19 25 M32 16 Q29 19 32 22 L29 25 M19 20 H29" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="21" r="1.8" fill="#e83e35" />
    </svg>
  )
}

function DragonBall() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <circle cx="24" cy="24" r="17" fill="#f28a24" stroke={BLACK} strokeWidth="2.7" />
      <path d="M24 12 L26 18 L32 18 L27 22 L29 28 L24 24 L19 28 L21 22 L16 18 L22 18 Z" fill="#d92f25" stroke="#9f201c" strokeWidth="1" strokeLinejoin="round" />
      <path d="M13 15 Q18 10 24 9" fill="none" stroke="#ffd47b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function BanbanBird() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M24 6 Q11 8 11 24 Q11 39 24 42 Q37 39 37 24 Q37 8 24 6 Z" fill="#d83a42" stroke={BLACK} strokeWidth="2.7" />
      <path d="M12 18 L4 13 L8 24 M36 18 L44 13 L40 24" fill="#d83a42" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="19" cy="22" r="2.4" fill={WHITE} /><circle cx="29" cy="22" r="2.4" fill={WHITE} />
      <circle cx="19" cy="22" r="1" fill={BLACK} /><circle cx="29" cy="22" r="1" fill={BLACK} />
      <path d="M20 29 Q24 32 28 29" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 10 L18 5 M24 8 V3 M32 10 L34 5" stroke="#f2cf39" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function GoldenSnitch() {
  return (
    <svg viewBox="0 0 48 48" className={SVG_CLASS}>
      <path d="M18 23 Q8 9 5 17 Q10 25 17 27 M30 23 Q40 9 43 17 Q38 25 31 27" fill="#f7e8aa" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="24" cy="25" r="9" fill="#e8bd37" stroke={BLACK} strokeWidth="2.6" />
      <path d="M21 19 Q25 16 28 20 Q30 24 26 27 Q22 30 20 34" fill="none" stroke="#fff0a0" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 31 Q24 36 36 31" fill="none" stroke="#b58420" strokeWidth="1.8" />
    </svg>
  )
}

function MarioGameIcon({ kind }: { kind: 'kart' | '64' | 'mansion' | 'mushroom' | 'tanooki' | 'galaxy' | 'galaxy2' | 'odyssey' | 'kart64' | 'kart8' }) {
  if (kind === 'kart') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><circle cx="24" cy="24" r="16" fill="#e8e8e3" stroke={BLACK} strokeWidth="3" /><circle cx="24" cy="24" r="11" fill="#d9342b" stroke={BLACK} strokeWidth="2" /><circle cx="24" cy="24" r="6" fill="#eeeae1" stroke={BLACK} strokeWidth="2" /><path d="M24 8 V17 M10 31 L19 27 M38 31 L29 27" stroke={BLACK} strokeWidth="3" strokeLinecap="round" /><path d="M24 10 V16 M12 30 L18 27 M36 30 L30 27" stroke={WHITE} strokeWidth="1.4" strokeLinecap="round" /></svg>
  if (kind === '64') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M7 18 H12 V12 H18 V8 H34 V12 H40 V19 H35 V25 H30 V29 H18 V25 H12 V21 H7 Z" fill="#e52521" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" /><path d="M14 17 H34 V24 H29 V28 H19 V24 H14 Z" fill="#f4eee1" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" /><path d="M17 17 V23 M23 17 V27 M29 17 V23" stroke="#b9b2a8" strokeWidth="1.5" /><path d="M10 32 H38 V38 H10 Z M15 38 H33 V42 H15 Z" fill="#43a9e8" stroke={BLACK} strokeWidth="2" /></svg>
  if (kind === 'mansion') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M7 24 L29 13 L26 35 Z" fill="#bce9a1" opacity=".8" /><path d="M8 18 L34 10 L40 15 L14 24 Z" fill="#2b7545" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round" /><path d="M13 23 L39 15 V20 L14 28 Z" fill="#38a354" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" /><path d="M19 26 L17 36 Q16 39 20 39 H31 Q34 39 33 36 L30 25" fill="#218046" stroke={BLACK} strokeWidth="2.3" strokeLinejoin="round" /><circle cx="22" cy="32" r="2.5" fill="#b9f2a4" /><circle cx="29" cy="32" r="2.5" fill="#b9f2a4" /><path d="M22 37 Q25 39 29 37" fill="none" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round" /></svg>
  if (kind === 'mushroom') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 25 Q8 10 24 8 Q40 10 40 25 Z" fill="#e6332b" stroke={BLACK} strokeWidth="2.7" /><circle cx="17" cy="17" r="4" fill={WHITE} /><circle cx="31" cy="16" r="3.4" fill={WHITE} /><path d="M17 25 H31 L29 39 Q24 43 19 39 Z" fill="#f1eadb" stroke={BLACK} strokeWidth="2.5" /><path d="M20 32 Q24 29 28 32" fill="none" stroke="#e6b393" strokeWidth="1.8" /></svg>
  if (kind === 'tanooki') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 5 Q28 14 39 15 Q33 21 38 29 Q29 27 24 43 Q20 30 10 30 Q16 22 8 16 Q19 17 24 5 Z" fill="#76aa4b" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M24 10 Q22 24 13 27 M24 17 Q31 22 35 24 M24 25 Q25 33 24 38" fill="none" stroke="#d6e6a4" strokeWidth="2" strokeLinecap="round" /><path d="M29 30 Q39 27 39 35 Q37 42 27 39 Q32 37 29 30 Z" fill="#a96c38" stroke={BLACK} strokeWidth="2" /></svg>
  if (kind === 'galaxy') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 4 L29 17 L43 18 L32 27 L36 42 L24 33 L12 42 L16 27 L5 18 L19 17 Z" fill="#ffdb42" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><circle cx="24" cy="25" r="5.5" fill="#ffe75b" stroke={BLACK} strokeWidth="1.8" /><ellipse cx="22" cy="25" rx="1.4" ry="2.3" fill={BLACK} /><ellipse cx="27" cy="25" rx="1.4" ry="2.3" fill={BLACK} /><path d="M9 11 Q24 3 37 12" fill="none" stroke="#68b9e8" strokeWidth="2" strokeLinecap="round" /></svg>
  if (kind === 'galaxy2') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 7 C14 7 11 15 14 24 L16 36 Q24 42 32 36 L34 24 C37 15 34 7 24 7 Z" fill="#e9f0e7" stroke={BLACK} strokeWidth="2.6" /><circle cx="19" cy="18" r="3.2" fill="#66ae47" /><circle cx="29" cy="15" r="2.5" fill="#66ae47" /><circle cx="28" cy="28" r="3.5" fill="#66ae47" /><circle cx="18" cy="31" r="2.2" fill="#66ae47" /><path d="M9 13 L11 17 L15 18 L11 20 L10 24 L8 20 L4 19 L8 17 Z" fill="#ffdc45" stroke={BLACK} strokeWidth="1.2" /></svg>
  if (kind === 'odyssey') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M7 25 Q8 11 23 9 Q35 8 40 17 Q35 16 31 21 Q26 24 18 22 Q12 22 7 25 Z" fill="#eeeae1" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M8 24 Q21 27 39 18 L40 24 Q25 33 8 29 Z" fill="#e52521" stroke={BLACK} strokeWidth="2" /><ellipse cx="22" cy="19" rx="2" ry="4" fill={BLACK} /><ellipse cx="29" cy="18" rx="2" ry="4" fill={BLACK} /><circle cx="22.5" cy="17" r=".8" fill={WHITE} /><circle cx="29.5" cy="16" r=".8" fill={WHITE} /><path d="M12 32 Q24 37 37 31" fill="none" stroke="#d6d1c8" strokeWidth="2" strokeLinecap="round" /></svg>
  if (kind === 'kart64') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 28 L12 21 H18 L22 17 H32 L37 22 L41 26 V34 H8 Z" fill="#e52521" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" /><path d="M21 20 H31 L34 25 H17 Z" fill="#8fd5ee" stroke={BLACK} strokeWidth="1.8" /><path d="M9 28 H40 M14 31 H35" stroke="#ffd43b" strokeWidth="2.3" /><circle cx="15" cy="34" r="4" fill="#24252a" stroke={BLACK} strokeWidth="1.5" /><circle cx="35" cy="34" r="4" fill="#24252a" stroke={BLACK} strokeWidth="1.5" /><path d="M21 28 L24 24 L28 28" fill="none" stroke={WHITE} strokeWidth="2" strokeLinejoin="round" /></svg>
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><circle cx="24" cy="24" r="17" fill="#e5b52b" stroke={BLACK} strokeWidth="2.8" /><circle cx="24" cy="24" r="11" fill="#30343a" stroke="#f7dc78" strokeWidth="2" /><path d="M24 12 V19 M13 28 L20 26 M35 28 L28 26" stroke="#e5b52b" strokeWidth="3" strokeLinecap="round" /><path d="M18 19 L20 22 L24 18 L28 22 L30 19" fill="none" stroke={WHITE} strokeWidth="2" strokeLinejoin="round" /><path d="M24 4 V8 M5 24 H9 M39 24 H43" stroke="#fff0a2" strokeWidth="2" strokeLinecap="round" /></svg>
}

function SonicGameIcon({ kind }: { kind: 'ring' | 'plane' | 'master-emerald' | 'chaos' | 'heroes' | 'monitor' }) {
  if (kind === 'ring') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><ellipse cx="24" cy="24" rx="14" ry="17" fill="none" stroke="#f6c832" strokeWidth="7" /><ellipse cx="24" cy="24" rx="14" ry="17" fill="none" stroke={BLACK} strokeWidth="2.5" /><path d="M15 14 Q22 9 29 12" fill="none" stroke="#fff4a8" strokeWidth="2.4" strokeLinecap="round" /><path d="M34 11 L39 8 L37 15" fill="#e63a36" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" /></svg>
  if (kind === 'plane') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 25 L21 21 L23 8 L28 7 L31 20 L41 17 L44 20 L32 27 L29 39 L25 40 L23 29 L12 33 Z" fill="#e43c38" stroke={BLACK} strokeWidth="2.3" strokeLinejoin="round" /><path d="M17 22 L28 23 L33 27 L21 26 Z" fill="#82cfe8" stroke={BLACK} strokeWidth="1.4" /><path d="M11 26 L17 25 M27 9 L29 18" stroke="#fff3c2" strokeWidth="1.8" strokeLinecap="round" /><circle cx="23" cy="25" r="2.5" fill="#ffe04c" stroke={BLACK} strokeWidth="1.2" /></svg>
  if (kind === 'master-emerald') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 4 L38 12 L37 33 L24 44 L11 33 L10 12 Z" fill="#19b66b" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M24 4 V44 M10 12 L24 19 L38 12 M11 33 L24 27 L37 33 M24 19 V27" fill="none" stroke="#a7f4bc" strokeWidth="2" strokeLinejoin="round" /><path d="M16 13 L24 8 L32 13 L30 19 H18 Z" fill="#4fdd8f" /></svg>
  if (kind === 'chaos') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 4 L36 11 V24 L24 31 L12 24 V11 Z" fill="#1a1a20" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" /><path d="M24 4 L36 11 L24 18 L12 11 Z" fill="#eef0ee" stroke={BLACK} strokeWidth="1.6" /><path d="M24 18 L36 11 V24 L24 31 Z" fill="#25262b" stroke={BLACK} strokeWidth="1.5" /><path d="M12 11 L24 18 V31 L12 24 Z" fill="#bfc5ca" stroke={BLACK} strokeWidth="1.5" /><path d="M18 37 Q24 32 30 37 L29 42 H19 Z" fill="#e52e3d" stroke={BLACK} strokeWidth="1.8" /><path d="M16 34 Q24 30 32 34" fill="none" stroke="#e52e3d" strokeWidth="2.5" /></svg>
  if (kind === 'heroes') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><circle cx="24" cy="24" r="17" fill="#e9ba35" stroke={BLACK} strokeWidth="2.6" /><path d="M24 8 L28 20 H40 L30 27 L34 39 L24 32 L14 39 L18 27 L8 20 H20 Z" fill="#e63c35" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" /><circle cx="24" cy="24" r="5" fill="#2b81d0" stroke={WHITE} strokeWidth="1.6" /><path d="M17 13 L19 16 M31 13 L29 16" stroke={WHITE} strokeWidth="2" strokeLinecap="round" /></svg>
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><rect x="8" y="9" width="32" height="28" rx="4" fill="#df3e38" stroke={BLACK} strokeWidth="2.6" /><rect x="12" y="13" width="24" height="17" rx="2" fill="#233b67" stroke={BLACK} strokeWidth="1.8" /><path d="M17 17 H22 V21 H26 V25 H31 V29 H17 Z" fill="#f1bb37" stroke={BLACK} strokeWidth="1" /><path d="M17 33 H31 M20 37 V41 M28 37 V41" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" /><circle cx="34" cy="34" r="2" fill="#78d7ef" /></svg>
}

function CrashGameIcon({ kind }: { kind: 'mask' | 'crystal' | 'hourglass' | 'quantum' | 'kart' | 'nitro' }) {
  if (kind === 'mask') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M9 9 L18 12 L24 6 L30 12 L39 9 L37 23 L42 29 L34 40 L26 36 L20 41 L13 35 L6 28 L11 22 Z" fill="#e6a63b" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M12 19 L20 21 L19 27 L12 26 Z M28 21 L36 19 L36 26 L29 27 Z" fill={BLACK} /><path d="M14 21 L18 22 M30 22 L34 21" stroke={WHITE} strokeWidth="2" strokeLinecap="round" /><path d="M20 29 L24 32 L28 29" fill="none" stroke="#d73b33" strokeWidth="2" strokeLinecap="round" /><path d="M18 6 L21 2 M30 8 L34 4 M8 15 L4 12" stroke="#e45136" strokeWidth="2.3" strokeLinecap="round" /></svg>
  if (kind === 'crystal') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 4 L39 16 L34 38 L24 44 L14 38 L9 16 Z" fill="#a23ed0" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M24 4 L24 44 M9 16 L39 16 M14 38 L24 27 L34 38 M9 16 L24 27 L39 16" fill="none" stroke="#e8a7ff" strokeWidth="2" strokeLinejoin="round" /><path d="M16 17 L23 20 L20 29 Z" fill="#d786f2" /></svg>
  if (kind === 'hourglass') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M12 6 H36 V12 Q36 18 29 23 Q36 28 36 35 V42 H12 V35 Q12 28 19 23 Q12 18 12 12 Z" fill="#e7cb72" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M16 11 H32 Q31 17 24 21 Q17 17 16 11 Z M16 37 H32 Q31 30 24 26 Q17 30 16 37 Z" fill="#5f95cd" stroke={BLACK} strokeWidth="1.5" /><path d="M24 22 V29 M20 33 H28" stroke="#f5e6a1" strokeWidth="2.2" strokeLinecap="round" /></svg>
  if (kind === 'quantum') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><circle cx="24" cy="24" r="12" fill="#e872d4" stroke={BLACK} strokeWidth="2.5" /><circle cx="24" cy="24" r="5" fill="#69297d" stroke={BLACK} strokeWidth="1.7" /><path d="M24 3 L28 12 L38 7 L34 17 L45 20 L35 26 L41 36 L30 34 L26 45 L21 35 L10 41 L13 30 L3 25 L14 20 L8 10 L19 13 Z" fill="none" stroke="#72d7ef" strokeWidth="2.3" strokeLinejoin="round" /><circle cx="8" cy="8" r="2" fill="#fff1a4" /><circle cx="40" cy="12" r="2" fill="#fff1a4" /></svg>
  if (kind === 'kart') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 28 L12 22 H18 L22 17 H32 L38 24 L42 28 V34 H8 Z" fill="#f2cc31" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M22 20 H31 L35 26 H17 Z" fill="#8ad2e9" stroke={BLACK} strokeWidth="1.7" /><path d="M9 29 H41" stroke="#e13a31" strokeWidth="3" /><circle cx="15" cy="35" r="4" fill="#26272d" stroke={BLACK} strokeWidth="1.5" /><circle cx="35" cy="35" r="4" fill="#26272d" stroke={BLACK} strokeWidth="1.5" /><path d="M21 29 L24 25 L28 29" fill="none" stroke={WHITE} strokeWidth="2" strokeLinejoin="round" /></svg>
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M9 27 L13 20 H19 L22 16 H32 L38 23 L42 27 V34 H8 Z" fill="#4a93dc" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M21 19 H31 L35 25 H17 Z" fill="#a6e1ed" stroke={BLACK} strokeWidth="1.7" /><path d="M10 28 H41" stroke="#ed3c37" strokeWidth="3" /><path d="M19 30 L24 25 L29 30" fill="#f4d334" stroke={BLACK} strokeWidth="1.6" strokeLinejoin="round" /><circle cx="15" cy="35" r="4" fill="#24252a" stroke={BLACK} strokeWidth="1.5" /><circle cx="35" cy="35" r="4" fill="#24252a" stroke={BLACK} strokeWidth="1.5" /><path d="M7 15 L10 17 M38 12 L41 10" stroke="#ef8331" strokeWidth="2.2" strokeLinecap="round" /></svg>
}

function ZeldaGameIcon({ kind }: { kind: 'shield' | 'ocarina' | 'wolf' }) {
  if (kind === 'ocarina') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 24 Q8 15 18 15 H25 Q30 10 35 15 L40 22 Q43 28 37 33 L31 38 H16 Q8 36 8 29 Z" fill="#69a9d4" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><circle cx="18" cy="24" r="2.2" fill={BLACK} /><circle cx="27" cy="21" r="2.2" fill={BLACK} /><circle cx="34" cy="27" r="2.2" fill={BLACK} /><path d="M14 31 Q23 35 34 31" fill="none" stroke="#c4e8ed" strokeWidth="2" strokeLinecap="round" /><path d="M13 18 Q17 15 21 17" fill="none" stroke={WHITE} strokeWidth="1.7" strokeLinecap="round" /></svg>
  if (kind === 'wolf') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M10 18 L6 6 L18 12 Q24 9 30 12 L41 6 L38 20 Q43 26 37 34 L31 39 L24 35 L17 40 L10 33 Q5 25 10 18 Z" fill="#65747e" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M11 20 L20 22 L18 27 L11 26 Z M28 22 L37 20 L36 27 L29 27 Z" fill="#f2c34b" stroke={BLACK} strokeWidth="1.3" /><circle cx="16" cy="24" r="1.3" fill={BLACK} /><circle cx="32" cy="24" r="1.3" fill={BLACK} /><path d="M20 30 L24 32 L28 30 L26 35 H22 Z" fill="#22232a" stroke={BLACK} strokeWidth="1.2" /><path d="M15 17 L20 19 M33 18 L37 16" stroke="#cbd4d8" strokeWidth="2" strokeLinecap="round" /></svg>
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 5 L40 11 V24 Q38 36 24 43 Q10 36 8 24 V11 Z" fill="#3285c7" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M24 9 L36 14 V24 Q34 32 24 38 Q14 32 12 24 V14 Z" fill="#d8ba55" stroke={BLACK} strokeWidth="1.8" /><path d="M24 12 L27 20 L35 20 L29 25 L31 33 L24 28 L17 33 L19 25 L13 20 L21 20 Z" fill="#39a76a" stroke={BLACK} strokeWidth="1.3" strokeLinejoin="round" /><path d="M10 14 L7 8 M38 14 L41 8" stroke="#e5c85b" strokeWidth="2.2" strokeLinecap="round" /></svg>
}

function PvZGameIcon({ kind }: { kind: 'pea' | 'sunflower' }) {
  if (kind === 'pea') return <Peashooter label="1" />
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><g fill="#f5ba32" stroke={BLACK} strokeWidth="1.7">{Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="24" cy="13" rx="4" ry="8" transform={`rotate(${i * 45} 24 24)`} />)}</g><circle cx="24" cy="24" r="9" fill="#a95e31" stroke={BLACK} strokeWidth="2" /><circle cx="21" cy="23" r="1.6" fill={BLACK} /><circle cx="27" cy="23" r="1.6" fill={BLACK} /><path d="M21 28 Q24 30 27 28" fill="none" stroke={BLACK} strokeWidth="1.5" strokeLinecap="round" /><path d="M24 33 V43 M24 38 Q17 34 15 39 M24 38 Q31 34 33 39" fill="none" stroke="#3d9b43" strokeWidth="3" strokeLinecap="round" /></svg>
}

function FnafTitleIcon({ kind }: { kind: 'vr' | 'pizzeria' | 'ruin' }) {
  if (kind === 'vr') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M7 16 Q7 12 12 12 H36 Q41 12 41 16 V31 Q41 36 36 36 H29 L25 31 H23 L19 36 H12 Q7 36 7 31 Z" fill="#473a63" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M12 18 H22 V28 H12 Z M26 18 H36 V28 H26 Z" fill="#87d6e9" stroke={BLACK} strokeWidth="2" /><path d="M17 18 L13 25 M31 18 L27 25" stroke={WHITE} strokeWidth="2" strokeLinecap="round" /><path d="M18 8 Q24 4 30 8" fill="none" stroke="#aa91dc" strokeWidth="2.4" strokeLinecap="round" /></svg>
  if (kind === 'pizzeria') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 16 L24 7 L40 16 V40 H8 Z" fill="#d74b35" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M13 21 H35 V38 H13 Z" fill="#f1cc53" stroke={BLACK} strokeWidth="1.8" /><path d="M18 24 Q24 18 30 24 L30 32 Q24 36 18 32 Z" fill="#79523b" stroke={BLACK} strokeWidth="1.8" /><circle cx="21" cy="27" r="1.2" fill={WHITE} /><circle cx="27" cy="27" r="1.2" fill={WHITE} /><path d="M21 31 Q24 33 27 31" fill="none" stroke={BLACK} strokeWidth="1.4" strokeLinecap="round" /><path d="M5 41 H43" stroke="#e8c643" strokeWidth="2.3" strokeLinecap="round" /></svg>
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M12 10 Q24 4 36 10 L38 29 Q36 40 24 43 Q12 40 10 29 Z" fill="#555260" stroke={BLACK} strokeWidth="2.6" /><path d="M14 16 L21 14 L22 25 L16 27 Z M26 14 L34 16 L32 27 L26 25 Z" fill="#17171c" /><circle cx="18" cy="20" r="2" fill="#65d7de" /><circle cx="30" cy="20" r="2" fill="#d24b67" /><path d="M21 30 L27 30 L26 38 H22 Z" fill="#222127" /><path d="M13 12 L18 16 M35 12 L31 16" stroke="#9a8ea9" strokeWidth="2" strokeLinecap="round" /><path d="M8 38 L5 43 M40 38 L43 43" stroke="#25232c" strokeWidth="2.2" strokeLinecap="round" /></svg>
}

function BendyTitleIcon({ kind }: { kind: 'ink-machine' | 'dark-revival' }) {
  if (kind === 'ink-machine') return <svg viewBox="0 0 48 48" className={SVG_CLASS}>
    <path d="M24 44C12 44 5 36.5 5 27C5 21 5.8 18 7 15.5C8 10 11 5.5 15.5 4C15.8 7 18.5 10.3 24 10.5C29.5 10.3 32.2 7 32.5 4C37 5.5 40 10 41 15.5C42.2 18 43 21 43 27C43 36.5 36 44 24 44Z" fill={BLACK} stroke="#6b4a30" strokeWidth="1.6" strokeLinejoin="round" paintOrder="stroke" />
    <path d="M8.8 26C8.8 21 9.8 17.5 11.4 14.5" fill="none" stroke={WHITE} strokeOpacity=".2" strokeWidth="1.4" strokeLinecap="round" />
    <ellipse cx="17" cy="23" rx="5.8" ry="7.2" fill={WHITE} />
    <ellipse cx="31" cy="23" rx="5.8" ry="7.2" fill={WHITE} />
    <path d="M17 23L23.2 27.4V18.6Z M31 23L37.2 27.4V18.6Z" fill={BLACK} />
    <path d="M9.5 32C15 35 33 35 38.5 32C37.5 39.5 31.5 42.3 24 42.3C16.5 42.3 10.5 39.5 9.5 32Z" fill={WHITE} />
    <path d="M11 35C16 38 32 38 37 35M16 33.4V36.4M24 34.2V37.3M32 33.4V36.4M20 37.6V42M28 37.6V42" fill="none" stroke={BLACK} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}>
    <path d="M7 23Q4 20 6 15L8 10Q9 7 11 5L13 13Q15 16 18 13L21 8L23 14Q25 16 28 13L32 7L33 14Q35 17 38 12L40 9L41 17Q44 22 40 26L42 31Q41 35 37 37L34 42Q32 44 31 40L29 38L27 44Q25 46 24 42L22 39L18 43Q16 44 16 40L14 37Q9 36 8 32L6 28Q5 25 7 23Z" fill={BLACK} />
    <path d="M10 10L12 17L15 19L11 18ZM22 11L23 17L26 19L24 15ZM33 10L34 17L37 19L35 14Z" fill={BLACK} />
    <path d="M10 10L12 16L11 13ZM32 10L34 15L33 12Z" fill="#8d7149" />
    <path d="M11 22Q14 19 18 22L16 24L12 24ZM29 22Q33 19 36 22L35 24L30 24Z" fill="#f0e5ca" />
    <path d="M9 27Q14 25 19 28L24 29L29 27Q35 25 39 27L37 33L32 38L25 41L18 38L12 33Z" fill={BLACK} />
    <path d="M11 28L17 29L19 34ZM18 29L22 30L23 37L20 34ZM24 30L28 29L27 37L25 40L23 36ZM30 29L35 28L32 34L29 37ZM36 28L38 28L35 33L33 34Z" fill="#f0e5ca" />
    <path d="M15 30L17 33L16 31ZM21 31L22 34L20 33ZM27 31L26 35L28 33ZM33 30L31 34L34 32ZM8 31Q6 34 8 37Q10 38 10 34ZM39 30Q42 33 40 36Q38 37 38 33ZM13 36Q11 39 14 42Q16 43 15 39ZM34 37Q32 41 35 44Q37 44 36 40Z" fill={BLACK} />
  </svg>
}

function MysteryShack() {
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M6 23 L24 8 L42 23 V41 H6 Z" fill="#7b4a2b" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M4 24 L24 6 L44 24 L40 27 L24 13 L8 27 Z" fill="#ad6231" stroke={BLACK} strokeWidth="2" strokeLinejoin="round" /><path d="M13 28 H35 V36 H13 Z" fill="#e8d19a" stroke={BLACK} strokeWidth="1.8" /><path d="M16 30 H32 M16 33 H32" stroke="#9a693a" strokeWidth="1.4" /><rect x="20" y="25" width="8" height="4" rx="1" fill="#cf3d31" stroke={BLACK} strokeWidth="1.2" /><path d="M19 41 V35 H29 V41" fill="#5d3726" stroke={BLACK} strokeWidth="1.7" /><path d="M10 17 L7 11 M38 17 L41 11" stroke="#4a8748" strokeWidth="2" strokeLinecap="round" /></svg>
}

function JournalThree() {
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M12 7 H36 Q39 7 39 10 V39 Q39 42 36 42 H12 Q9 42 9 39 V10 Q9 7 12 7 Z" fill="#392a1d" stroke={BLACK} strokeWidth="2.7" /><path d="M15 10 H35 V38 H15 Z" fill="#63472b" stroke="#1c1917" strokeWidth="1.5" /><path d="M12 9 V40 M15 13 H34" stroke="#b88c4b" strokeWidth="1.8" /><path d="M24 18 L26 22 L31 23 L27 26 L28 31 L24 28 L20 31 L21 26 L17 23 L22 22 Z" fill="#d8b638" stroke={BLACK} strokeWidth="1.3" strokeLinejoin="round" /><path d="M18 34 Q24 30 30 34 Q24 37 18 34 Z" fill="#d14b35" stroke={BLACK} strokeWidth="1.2" /><circle cx="24" cy="34" r="1.5" fill="#f3e5c8" /></svg>
}

function DeathNoteBook() {
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M11 6 H37 Q40 6 40 10 V40 H14 Q9 40 9 35 V10 Q9 6 11 6 Z" fill="#18181d" stroke={BLACK} strokeWidth="2.7" /><path d="M13 10 H36 V36 H14 Q12 36 12 33 V12 Z" fill="#29282d" stroke="#737078" strokeWidth="1.4" /><path d="M16 14 H32 M17 18 H31 M18 21 H30 M18 25 H29" stroke="#e9e4d8" strokeWidth="1.3" strokeLinecap="round" /><path d="M19 30 H29 M20 33 H28" stroke="#a7a3a0" strokeWidth="1.2" strokeLinecap="round" /><path d="M37 8 V39" stroke="#5a5559" strokeWidth="1.5" /></svg>
}

function MonsterMaw() {
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 14 Q12 5 24 7 Q36 5 40 14 L38 34 Q34 42 24 42 Q14 42 10 34 Z" fill="#596c57" stroke={BLACK} strokeWidth="2.7" /><path d="M11 21 Q18 15 24 20 Q30 15 37 21 L35 33 Q24 38 13 33 Z" fill="#17191a" stroke={BLACK} strokeWidth="1.8" /><path d="M13 20 L19 22 L17 28 Z M35 20 L29 22 L31 28 Z" fill="#f0e5c8" stroke={BLACK} strokeWidth="1.2" /><path d="M17 32 L20 27 L23 32 L26 27 L29 32 L32 27 L34 33" fill="#ddd7c7" stroke={BLACK} strokeWidth="1.2" strokeLinejoin="round" /><circle cx="18" cy="15" r="2" fill="#b8c86b" /><circle cx="30" cy="14" r="1.7" fill="#b8c86b" /><path d="M8 17 L4 14 M40 17 L44 14" stroke="#95a774" strokeWidth="2" strokeLinecap="round" /></svg>
}

function ArtClownFace() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M13 12 Q24 5 35 12 L38 30 Q36 41 24 43 Q12 41 10 30 Z" fill="#eee9df" stroke={BLACK} strokeWidth="2.6"/><path d="M13 14 L8 7 L17 11 L21 7 L24 12 L29 7 L33 11 L41 7 L35 16" fill="#f1eee6" stroke={BLACK} strokeWidth="2" strokeLinejoin="round"/><path d="M12 19 L21 16 L20 25 L13 27 Z M36 19 L27 16 L28 25 L35 27 Z" fill={BLACK}/><path d="M14 21 L20 19 L19 23 L14 25 Z M34 21 L28 19 L29 23 L34 25 Z" fill="#f2e7d8"/><path d="M20 28 Q24 25 28 28 L29 33 L24 36 L19 33 Z" fill="#bf3036" stroke={BLACK} strokeWidth="1.5"/><path d="M14 34 Q24 29 34 34 Q32 41 24 41 Q16 41 14 34 Z" fill="#781d28" stroke={BLACK} strokeWidth="1.8"/><path d="M16 34 L19 34 L18 38 L16 37 Z M21 33 L24 33 L23 38 L21 38 Z M27 33 L30 33 L29 38 L27 38 Z M32 34 L34 34 L33 37 L31 37 Z" fill={WHITE}/></svg> }
function ZombieVenom() {
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 15 Q13 5 24 8 Q35 5 40 15 L37 34 Q33 42 24 42 Q15 42 11 34 Z" fill="#778c67" stroke={BLACK} strokeWidth="2.7" /><path d="M12 19 Q18 13 23 19 L21 26 Q17 29 13 25 Z M25 19 Q31 13 36 19 L34 25 Q30 29 26 26 Z" fill="#17181b" /><path d="M14 20 L19 19 M29 19 L34 20" stroke="#e5e8d5" strokeWidth="2" strokeLinecap="round" /><path d="M16 30 Q24 27 32 30 L30 37 Q24 40 18 36 Z" fill="#272326" stroke={BLACK} strokeWidth="1.6" /><path d="M18 31 L21 35 L24 31 L27 35 L30 31" fill="#ece7d9" stroke={BLACK} strokeWidth="1.1" strokeLinejoin="round" /><path d="M17 9 L13 5 M31 9 L35 5 M11 31 L7 35 M37 31 L41 35" stroke="#9fb57e" strokeWidth="2" strokeLinecap="round" /></svg>
}

function UltronMask() {
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M12 10 L24 5 L36 10 L39 22 L34 38 L24 43 L14 38 L9 22 Z" fill="#afb5bb" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M14 15 L22 17 L20 24 L13 24 Z M26 17 L34 15 L35 24 L28 24 Z" fill="#24262a" /><path d="M15 19 H20 M28 19 H33" stroke="#e54c48" strokeWidth="2.5" strokeLinecap="round" /><path d="M19 29 L24 26 L29 29 L27 37 H21 Z" fill="#7d858c" stroke={BLACK} strokeWidth="1.7" /><path d="M21 31 H27 M21 34 H27" stroke="#e6574d" strokeWidth="1.8" /><path d="M12 11 L17 13 M36 11 L31 13" stroke={WHITE} strokeWidth="1.7" strokeLinecap="round" /></svg>
}

function RomanArch() {
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 42 V13 H14 V8 H34 V13 H40 V42 H34 V20 H30 V15 H18 V20 H14 V42 Z" fill="#ddcfaa" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" /><path d="M18 42 V25 Q24 17 30 25 V42" fill="#a97a45" stroke={BLACK} strokeWidth="2" /><path d="M11 14 H37 M11 37 H37" stroke="#b39768" strokeWidth="2" /><path d="M20 10 V15 M24 10 V15 M28 10 V15" stroke="#f4e6c6" strokeWidth="1.5" /></svg>
}

function ColorEmblem({ kind }: { kind: 'gold' | 'silver' | 'copper' | 'bronze' | 'prism' | 'amethyst' | 'emerald' | 'ruby' | 'sapphire' | 'obsidian' }) {
  if (kind === 'gold') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 15 L17 21 L24 8 L31 21 L40 15 L36 34 H12 Z" fill="#e3b52d" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M12 36 H36 V41 H12 Z" fill="#f6d96a" stroke={BLACK} strokeWidth="2" /><circle cx="17" cy="27" r="1.8" fill="#fff1a4" /><circle cx="24" cy="25" r="2" fill="#fff1a4" /><circle cx="31" cy="27" r="1.8" fill="#fff1a4" /></svg>
  if (kind === 'silver') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 5 L40 12 V24 Q38 36 24 43 Q10 36 8 24 V12 Z" fill="#b7c4cf" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M24 9 L35 14 V24 Q33 32 24 37 Q15 32 13 24 V14 Z" fill="#edf2f5" stroke="#737f8a" strokeWidth="1.7" /><path d="M24 14 L27 22 L35 22 L29 27 L31 34 L24 30 L17 34 L19 27 L13 22 L21 22 Z" fill="#8f9ca6" stroke={BLACK} strokeWidth="1.2" strokeLinejoin="round" /></svg>
  if (kind === 'copper') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M9 15 L37 15 L42 21 L37 37 H11 L6 21 Z" fill="#b8733b" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M9 15 L14 21 L11 37 M37 15 L32 21 L37 37 M14 21 H32 L29 32 H17 Z" fill="#d9965d" stroke="#734322" strokeWidth="1.8" strokeLinejoin="round" /><path d="M16 25 H29 M18 29 H27" stroke="#f2c38d" strokeWidth="1.7" strokeLinecap="round" /></svg>
  if (kind === 'bronze') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><circle cx="24" cy="21" r="15" fill="#bd762f" stroke={BLACK} strokeWidth="2.7" /><path d="M16 33 L14 44 L24 39 L34 44 L32 33" fill="#8e542b" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round" /><circle cx="24" cy="21" r="9" fill="#dc9a49" stroke="#75441f" strokeWidth="1.8" /><path d="M24 13 L27 19 H33 L28 23 L30 29 L24 25 L18 29 L20 23 L15 19 H21 Z" fill="#f0c477" stroke={BLACK} strokeWidth="1.2" strokeLinejoin="round" /></svg>
  if (kind === 'prism') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 5 L42 37 H6 Z" fill="#5dc9db" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M24 5 V37 H6 Z" fill="#bd77d5" /><path d="M24 5 L33 21 H15 Z" fill="#ffe26c" /><path d="M15 21 H33 L42 37 H24 Z" fill="#f07891" /><path d="M15 21 L24 37 H6 Z" fill="#7bd17a" /><path d="M24 5 L15 21 L24 37 L33 21 Z" fill="#e8f3ff" opacity=".72" /></svg>
  if (kind === 'amethyst') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M17 6 H31 L39 17 L24 43 L9 17 Z" fill="#8d54d9" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M17 6 L19 18 L24 43 L9 17 Z" fill="#c9a2f4" /><path d="M31 6 L29 18 L39 17 Z" fill="#6a39ae" /><path d="M19 18 H29 L24 43 Z" fill="#a879e7" /><path d="M18 11 H30" stroke="#f1e6ff" strokeWidth="1.8" /></svg>
  if (kind === 'emerald') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M14 8 H34 L41 18 L24 41 L7 18 Z" fill="#14a66d" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M14 8 L18 19 L24 41 L7 18 Z" fill="#83e0aa" /><path d="M34 8 L30 19 L41 18 Z" fill="#08794b" /><path d="M18 19 H30 L24 41 Z" fill="#38c581" /><path d="M14 8 H34 M18 19 H30" stroke="#c4f2d5" strokeWidth="1.6" /></svg>
  if (kind === 'ruby') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 42 L7 24 Q5 13 14 9 Q21 6 24 14 Q28 6 35 9 Q44 13 41 24 Z" fill="#d52f45" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M24 14 L24 42 M14 10 L19 22 L7 24 M35 10 L29 22 L41 24 M19 22 H29 L24 42 Z" fill="#f36e78" stroke="#7c1c32" strokeWidth="1.5" strokeLinejoin="round" /><path d="M15 13 L19 17" stroke="#ffd5d5" strokeWidth="2" strokeLinecap="round" /></svg>
  if (kind === 'sapphire') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 5 C31 14 39 21 39 29 A15 15 0 1 1 9 29 C9 21 17 14 24 5 Z" fill="#2669cc" stroke={BLACK} strokeWidth="2.7" /><path d="M24 8 L24 42 M24 8 L14 28 H24 M24 8 L34 28 H24 M14 28 L24 42 L34 28 Z" fill="#5da9ed" stroke="#16418f" strokeWidth="1.6" strokeLinejoin="round" /><path d="M17 29 Q18 37 23 39" fill="none" stroke="#c9ecff" strokeWidth="2" strokeLinecap="round" /></svg>
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M12 7 L37 11 L33 28 L24 42 L9 32 Z" fill="#2c2935" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M12 7 L23 18 L9 32 M37 11 L23 18 L24 42 M23 18 L33 28 L24 42" fill="none" stroke="#777180" strokeWidth="2" strokeLinejoin="round" /><path d="M14 11 L22 17" stroke="#bcb6c5" strokeWidth="1.8" strokeLinecap="round" /></svg>
}

function BandEmblem({ kind }: { kind: 'a7x' | 'device' | 'linkin-park' | 'tdg' | 'rammstein' | 'ffdp' }) {
  if (kind === 'a7x') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M4 22 L17 20 L24 8 L31 20 L44 22 L34 29 L38 40 L24 34 L10 40 L14 29 Z" fill="#d8d5d1" stroke={BLACK} strokeWidth="2.4" strokeLinejoin="round"/><path d="M17 22 L24 17 L31 22 L29 30 L24 34 L19 30 Z" fill="#25252a"/><path d="M19 26 Q21 22 24 25 Q27 22 29 26 L28 30 L24 32 L20 30 Z" fill="#e5e0d9"/><path d="M21 26 L22 28 M27 26 L26 28 M22 30 L24 29 L26 30" stroke={BLACK} strokeWidth="1.2" strokeLinecap="round"/><path d="M7 22 L16 24 M41 22 L32 24" stroke="#f7f4ed" strokeWidth="1.4"/></svg>
  if (kind === 'device') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 5 L28 9 L34 7 L36 13 L42 16 L39 22 L43 27 L37 31 L37 37 L30 37 L25 43 L20 38 L13 40 L12 33 L6 30 L9 24 L5 19 L11 15 L12 9 L19 10 Z" fill="#707b7d" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" /><circle cx="24" cy="24" r="10" fill="#2a3032" stroke={BLACK} strokeWidth="2" /><circle cx="24" cy="24" r="4" fill="#77a1a0" stroke={BLACK} strokeWidth="1.6" /><path d="M21 24 H27 M24 21 V27" stroke="#d5dfd8" strokeWidth="1.5" /></svg>
  if (kind === 'linkin-park') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M10 8 H17 V30 H29 V37 H10 Z M21 8 H38 V15 H28 V19 H35 V25 H28 V30 H21 Z" fill="#bfc5c9" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" /><path d="M13 12 V26 H25 M24 12 H34 M24 22 H32" fill="none" stroke="#4e555b" strokeWidth="2" strokeLinecap="square" /></svg>
  if (kind === 'tdg') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 6 L29 16 L40 13 L34 23 L42 31 L30 31 L27 42 L21 33 L10 38 L14 27 L5 20 L17 19 Z" fill="#aeb4b9" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round" /><circle cx="20" cy="22" r="3" fill="#282a2d" /><circle cx="29" cy="22" r="3" fill="#282a2d" /><circle cx="24" cy="30" r="3" fill="#282a2d" /><path d="M20 22 L24 30 L29 22" fill="none" stroke="#e5e5e2" strokeWidth="1.6" /></svg>
  if (kind === 'rammstein') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M21 5 H27 V20 L39 11 L43 16 L30 25 L42 33 L39 38 L27 29 V43 H21 V29 L9 38 L5 33 L18 25 L5 16 L9 11 L21 20 Z" fill="#d5453c" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M24 8 V40 M8 15 L40 35 M40 15 L8 35" stroke="#f6c2b5" strokeWidth="1.5" /></svg>
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M15 7 L26 5 L32 12 L38 14 L36 22 L42 28 L37 35 L34 42 L26 38 L20 43 L15 36 L8 35 L11 27 L6 21 L12 16 Z" fill="#a44b42" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M18 15 L24 12 L30 17 L28 22 L35 25 L30 30 L33 35 L26 33 L23 38 L19 32 L13 34 L16 27 L11 23 L18 21 Z" fill="#28262a" stroke={BLACK} strokeWidth="1.8" strokeLinejoin="round" /><path d="M20 17 L25 20 L23 25 L29 27 L25 30 L21 27 L18 23 Z" fill="#ddd2c1" /></svg>
}

function DragonThemeIcon({ kind }: { kind: 'charizard' | 'toothless' | 'spyro' | 'dragon' | 'fossil' }) {
  if (kind === 'charizard') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M11 23 L7 13 L17 16 L20 7 L26 14 L35 9 L34 19 L41 22 L35 29 L33 38 L24 42 L15 37 L13 30 Z" fill="#e76528" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M14 22 Q19 17 24 21 L23 27 L16 27 Z M27 21 Q32 17 36 22 L33 27 L27 27 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.5" /><circle cx="19" cy="23" r="1.5" fill="#3e83ce" /><circle cx="31" cy="23" r="1.5" fill="#3e83ce" /><path d="M17 31 Q24 35 32 30 L30 36 Q24 39 19 35 Z" fill="#f0c795" stroke={BLACK} strokeWidth="1.5" /><path d="M17 13 L12 8 M32 12 L36 6" stroke="#f4cb83" strokeWidth="2" strokeLinecap="round" /><path d="M37 37 Q43 36 43 42 Q39 40 36 44" fill="none" stroke="#f1892e" strokeWidth="2.4" strokeLinecap="round" /></svg>
  if (kind === 'toothless') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M12 18 L5 9 L17 13 Q24 9 31 13 L43 8 L37 20 Q42 27 35 35 L29 40 L24 36 L18 41 L11 34 Q6 27 12 18 Z" fill="#20252b" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round" /><path d="M12 20 L19 22 L18 29 L12 27 Z M29 22 L37 20 L36 27 L30 29 Z" fill="#a3d653" stroke="#a3d653" strokeWidth="1.4" /><ellipse cx="16" cy="25" rx="1.2" ry="2.2" fill={BLACK} /><ellipse cx="33" cy="25" rx="1.2" ry="2.2" fill={BLACK} /><path d="M18 31 Q24 35 30 31 L27 37 H21 Z" fill="#59636b" stroke={BLACK} strokeWidth="1.4" /><path d="M13 16 L18 18 M34 17 L38 14" stroke="#67727a" strokeWidth="2" strokeLinecap="round" /></svg>
  if (kind === 'spyro') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M9 21 L5 12 L16 15 L19 7 L24 15 L29 7 L32 15 L43 11 L38 23 L41 30 L34 36 L28 39 L22 36 L15 39 L9 32 Z" fill="#8248b8" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round"/><path d="M12 18 L6 9 L19 14 M36 17 L42 8 L31 14" fill="#e9c844" stroke={BLACK} strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 23 Q20 18 24 23 L22 28 L14 28 Z M26 23 Q31 18 36 22 L34 28 L27 28 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.5"/><circle cx="19" cy="24" r="1.4" fill="#d3b835"/><circle cx="31" cy="24" r="1.4" fill="#d3b835"/><path d="M21 30 L28 30 L26 35 H22 Z" fill="#e1a04b" stroke={BLACK} strokeWidth="1.3"/><path d="M13 34 L8 40 M35 33 L40 39" stroke="#e9c844" strokeWidth="2.2"/></svg>
  if (kind === 'dragon') return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 24 L5 10 L11 24 L4 32 L19 30 L24 42 L29 30 L44 32 L37 24 L43 10 Z" fill="#4b9b56" stroke={BLACK} strokeWidth="2.5" strokeLinejoin="round"/><path d="M24 24 Q14 16 17 10 L22 13 L24 5 L29 13 L34 9 Q37 18 28 24 L34 29 L28 30 L24 37 L20 30 L14 29 Z" fill="#75bd5c" stroke={BLACK} strokeWidth="2.2" strokeLinejoin="round"/><path d="M20 18 L17 11 M28 18 L33 11" stroke="#d9c45f" strokeWidth="2.2" strokeLinecap="round"/><circle cx="28" cy="19" r="1.3" fill="#f2d64e"/><path d="M32 24 L38 26 L33 28" fill="#e4bf52" stroke={BLACK} strokeWidth="1.2"/></svg>
  return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M7 17 L15 9 L20 13 L28 10 L36 15 L40 24 L35 31 L34 40 L25 37 L19 42 L14 34 L8 30 Z" fill="#c7bd9f" stroke={BLACK} strokeWidth="2.6" strokeLinejoin="round" /><path d="M14 17 L20 15 L23 22 L18 27 L12 26 Z" fill="#282a2a" stroke={BLACK} strokeWidth="1.6" /><path d="M24 20 L38 21 L42 26 L35 29 L25 27 Z" fill="#e1d8ba" stroke={BLACK} strokeWidth="1.7" strokeLinejoin="round" /><path d="M28 26 L30 31 L33 27 L36 31 L38 26" fill={WHITE} stroke={BLACK} strokeWidth="1.2" strokeLinejoin="round" /><path d="M10 18 L4 14 M11 24 L4 24 M17 12 L15 5" stroke="#eee6cf" strokeWidth="2.1" strokeLinecap="round" /></svg>
}




function IntoPitRabbit() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M12 21 L8 4 Q8 1 12 3 L22 15 L28 14 L37 3 Q40 2 40 7 L36 23 L40 30 L35 39 L24 44 L13 39 L8 30 Z" fill="#b6a33c" stroke={BLACK} strokeWidth="2.7" strokeLinejoin="round"/><path d="M13 8 L19 16 L14 18 Z M36 8 L31 16 L35 18 Z" fill="#82732e"/><path d="M13 23 L20 20 L23 26 L16 29 Z M27 23 L35 20 L34 29 L27 27 Z" fill={BLACK}/><circle cx="18" cy="24" r="2" fill="#61cbe6"/><circle cx="31" cy="24" r="2" fill="#61cbe6"/><path d="M14 31 L22 28 L25 32 L29 28 L36 31 L32 39 L24 42 L16 38 Z" fill="#30291e" stroke={BLACK} strokeWidth="1.7"/><path d="M16 31 L20 31 L19 36 L16 35 Z M24 30 L28 30 L27 36 L24 36 Z M31 31 L34 31 L32 36 L30 35 Z" fill={WHITE}/><path d="M10 27 L6 30 M38 27 L42 30 M20 39 L18 44 M31 39 L33 44 M16 19 L19 18" stroke="#6e6232" strokeWidth="2" strokeLinecap="round"/></svg> }
function AlastorStaff() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M13 43 L31 13" stroke="#79232d" strokeWidth="4.4" strokeLinecap="round"/><path d="M13 43 L31 13" stroke="#e1bb5d" strokeWidth="1.2"/><path d="M27 14 Q24 7 31 4 Q38 3 40 9 Q42 15 36 19 L30 20 Z" fill="#bb2835" stroke={BLACK} strokeWidth="2.3"/><path d="M31 9 L36 8 L38 11 L35 14 L31 13 Z" fill="#f6d85b"/><circle cx="34" cy="11" r="1.4" fill={BLACK}/><path d="M29 17 L25 20 M38 17 L42 20 M11 43 H17" stroke="#d7a84c" strokeWidth="2" strokeLinecap="round"/></svg> }
function HuggyWuggy() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M12 22 Q5 10 10 6 Q17 5 20 19 L28 19 Q31 5 38 6 Q43 10 36 22 L39 30 Q36 41 24 43 Q12 41 9 30 Z" fill="#2875c9" stroke={BLACK} strokeWidth="2.7"/><path d="M13 11 Q16 12 17 20 M35 11 Q32 12 31 20" stroke="#68b6ff" strokeWidth="2.2"/><path d="M13 24 Q18 20 23 24 L22 29 L14 29 Z M25 24 Q30 20 35 24 L34 29 L26 29 Z" fill={WHITE} stroke={BLACK} strokeWidth="1.5"/><circle cx="19" cy="25" r="1.3" fill={BLACK}/><circle cx="30" cy="25" r="1.3" fill={BLACK}/><path d="M14 32 Q24 29 35 32 Q33 40 24 40 Q16 39 14 32 Z" fill="#8b1723" stroke={BLACK} strokeWidth="1.7"/><path d="M16 32 L19 32 L18 36 L16 35 Z M21 31 L24 31 L23 36 L21 36 Z M27 31 L30 31 L29 36 L27 36 Z M32 32 L34 32 L33 35 L31 35 Z" fill={WHITE}/></svg> }
function ChessStrings() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M8 8 Q16 12 19 22 M40 8 Q32 12 29 22 M7 18 Q14 19 19 24 M41 18 Q34 19 29 24" fill="none" stroke="#8a2028" strokeWidth="1.5"/><path d="M19 10 Q24 4 29 10 L28 17 L33 24 Q35 29 31 32 L34 39 H14 L17 32 Q13 29 15 24 L20 17 Z" fill="#e7e2d5" stroke={BLACK} strokeWidth="2.4"/><path d="M20 12 Q24 9 28 12 L27 17 H21 Z M18 25 Q24 22 30 25 L28 31 H20 Z" fill="#25242a"/><path d="M13 39 H35 V43 H13 Z" fill="#b28c4d" stroke={BLACK} strokeWidth="1.8"/></svg> }
function BatLaughing() { return <svg viewBox="0 0 48 48" className={SVG_CLASS}><path d="M24 8 L19 15 L5 10 L10 21 L5 29 L15 27 L17 38 L24 33 L31 38 L33 27 L43 29 L38 21 L43 10 L29 15 Z" fill="#202126" stroke={BLACK} strokeWidth="2.5"/><path d="M17 19 L21 22 L19 25 Z M31 19 L27 22 L29 25 Z" fill="#ed2634"/><path d="M15 27 Q24 24 33 27 L31 34 Q24 39 17 34 Z" fill="#f1eee8" stroke={BLACK} strokeWidth="1.8"/><path d="M17 28 L20 28 L19 32 L17 32 Z M22 27 L25 27 L24 32 L22 32 Z M28 27 L31 28 L30 32 L28 32 Z" fill="#a41d2b"/></svg> }

const CUSTOM_BY_NAME: Record<string, ComponentType> = {
  'phineas-y-ferb': PerryPlatypus,
  transformers: AutobotBadge,
  'jurassic-park': JurassicMedallion,
  'mortal-kombat': MortalDragon,
  'god-of-war': LeviathanAxe,
  subnautica: SubnauticaPeeper,
  'toy-story': WoodyHat,
  cars: LightningMcQueen,
  'star-wars': Lightsaber,
  'brawl-stars': BrawlSkull,
  fortnite: FortniteLlama,
  roblox: RobloxLogo,
  'one-piece': StrawHat,
  naruto: NarutoHeadband,
  'dragon-ball': DragonBall,
  'garten-of-banban': BanbanBird,
  'harry-potter': GoldenSnitch,
  'hazbin-hotel': () => <AlastorStaff />,
  'helluva-boss': BlitzHead,
  'rick-y-morty': RickMortyDuo,
  'looney-tunes-bugs-bunny': BunnyHead,
  'los-simpson': SimpsonsDonut,
  'scooby-doo': ScoobyDoo,
  'ben-10': Ben10Watch,
  'bob-esponja': SpongePineapple,
  'dipper-pines': DipperCap,
  minecraft: MinecraftSword,
  'disturbed': DisturbedGuy,
  rayman: RaymanHead,
  granny: GrannyPortrait,
  'hello-neighbor': NeighborKey,
  'kick-buttowski': StuntHelmet,
  'randy-cunningham-ninja-total': NinjaMask,
  'hora-de-aventura': AdventureDuo,
  'star-vs-las-fuerzas-del-mal': StarWand,
  gumball: BlueCat,
  'coraje-el-perro-cobarde': PinkDog,
  monster: MonsterMaw,
  'j-balvin-album-colores': JBFlower,
  cuphead: Cuphead,
  'hollow-knight': HollowKnight,
  undertale: UndertaleSoul,
  'among-us': Crewmate,
  pikachu: Pikachu,
  gengar: Gengar,
  slenderman: Slenderman,
  'el-grinch': Grinch,
  backrooms: Backrooms,
  'gravity-falls-bill': BillCipher,
  'gravity-falls-el-diario': JournalThree,
  'gravity-falls-anomalias': () => <PineTree label="A" />,
  mario: () => <PlumberCap color="#e52521" bord="#9e1a16" letter="M" />,
  luigi: () => <PlumberCap color="#15803d" bord="#14532d" letter="L" />,
  wario: () => <PlumberCap color="#fbbf24" bord="#b45309" letter="W" />,
  bowser: BowserFace,
  yoshi: YoshiFace,
  'donkey-kong': Barrel,
  'five-nights-at-freddy-s-1': FreddyHead,
  'fnaf-2': DamagedFreddy,
  'fnaf-3': SpringtrapHead,
  'fnaf-4': NightmareFreddy,
  'fnaf-sister-location': BabyHead,
  'ultimate-custom-night': PuppetFace,
  'fnaf-help-wanted': () => <FnafTitleIcon kind="vr" />,
  'freddy-fazbear-s-pizzeria-simulator': () => <FnafTitleIcon kind="pizzeria" />,
  'fnaf-security-breach': GlamrockFreddy,
  'fnaf-security-breach-ruin': () => <FnafTitleIcon kind="ruin" />,
  'fnaf-into-the-pit': () => <IntoPitRabbit />,
  'fnaf-secret-of-the-mimic': MimicEndoskeleton,
  'nfs-most-wanted-2005': BMWM3GTR,
  'nfs-most-wanted-2012': Porsche911Yellow,
  'nfs-hot-pursuit': () => <NfsCar paint="#eef0f0" stripe="#273b55" police style="hyper" model="r8" />,
  'nfs-unbound': () => <NfsCar paint="#54bfd0" stripe="#f04cac" style="neon" model="mercedes190" />,
  'nfs-underground': () => <NfsCar paint="#1d4e87" stripe="#32d6ef" style="tuner" model="skyline" />,
  'nfs-underground-2': () => <NfsCar paint="#d36c2f" stripe="#ffd45a" style="tuner" model="350z" />,
  'nfs-carbon': () => <NfsCar paint="#24252c" stripe="#c43635" style="muscle" model="rx7" />,
  'nfs-prostreet': () => <NfsCar paint="#d9e4e7" stripe="#3a85c7" style="drift" model="evo" />,
  'nfs-undercover': () => <NfsCar paint="#ddd9d2" stripe="#c5a141" style="luxury" model="m6" />,
  'nfs-the-run': () => <NfsCar paint="#d65034" stripe="#e7e3d9" style="hyper" model="m3-gts" />,
  'nfs-rivals': () => <NfsCar paint="#d8d8d4" stripe="#cf2e37" police style="hyper" model="lambo" />,
  'nfs-payback': () => <NfsCar paint="#586a73" stripe="#e4ad37" style="muscle" model="m5" />,
  'nfs-heat': () => <NfsCar paint="#f2eee6" stripe="#e64b9a" style="hyper" model="polestar" />,
  'gta-v': () => <GTAWeapon kind="rifle" />,
  'gta-san-andreas': () => <GTAWeapon kind="ak" />,
  'gta-vice-city': () => <GTAWeapon kind="revolver" />,
  'the-forest': ForestAxe,
  'flappy-bird': FlappyBird,
  'happy-wheels': HappyWheelsRider,
  piratas: PirateShip,
  vaqueros: CowboyHat,
  'china-antigua': ChineseHouse,
  'dragon-chino': ChineseDragon,
  fuego: FlameIcon,
  hielo: Snowflake,
  agua: WaterDrop,
  neon: NeonShape,
  'roca-volcanica': VolcanicRock,
  'rocket-league': () => <Car label="RL" />,
  'mario-kart': () => <MarioGameIcon kind="kart" />,
  'mario-64': () => <MarioGameIcon kind="64" />,
  'luigi-s-mansion': () => <MarioGameIcon kind="mansion" />,
  'super-mario-bros': () => <MarioGameIcon kind="mushroom" />,
  'super-mario-bros-3': () => <MarioGameIcon kind="tanooki" />,
  'super-mario-galaxy': () => <MarioGameIcon kind="galaxy" />,
  'super-mario-galaxy-2': () => <MarioGameIcon kind="galaxy2" />,
  'super-mario-odyssey': () => <MarioGameIcon kind="odyssey" />,
  'mario-kart-64': () => <MarioGameIcon kind="kart64" />,
  'mario-kart-8-deluxe': () => <MarioGameIcon kind="kart8" />,
  'sonic-1': () => <SonicGameIcon kind="ring" />,
  'sonic-2': () => <SonicGameIcon kind="plane" />,
  'sonic-3-knuckles': () => <SonicGameIcon kind="master-emerald" />,
  'sonic-adventure-2': () => <SonicGameIcon kind="chaos" />,
  'sonic-heroes': () => <SonicGameIcon kind="heroes" />,
  'sonic-mania': () => <SonicGameIcon kind="monitor" />,
  charizard: () => <DragonThemeIcon kind="charizard" />,
  mewtwo: MewtwoHead,
  umbreon: UmbreonHead,
  'plants-vs-zombies-1': () => <PvZGameIcon kind="pea" />,
  'plants-vs-zombies-2': () => <PvZGameIcon kind="sunflower" />,
  'zelda-link': () => <ZeldaGameIcon kind="shield" />,
  'ocarina-of-time': () => <ZeldaGameIcon kind="ocarina" />,
  'twilight-princess': () => <ZeldaGameIcon kind="wolf" />,
  'crash-bandicoot': () => <CrashGameIcon kind="mask" />,
  'crash-bandicoot-2': () => <CrashGameIcon kind="crystal" />,
  'crash-bandicoot-3': () => <CrashGameIcon kind="hourglass" />,
  'crash-bandicoot-4': () => <CrashGameIcon kind="quantum" />,
  'crash-team-racing': () => <CrashGameIcon kind="kart" />,
  'ctr-nitro-fueled': () => <CrashGameIcon kind="nitro" />,
  'super-smash-bros': SmashBall,
  'super-smash-bros-melee': () => <SmashBall label="M" />,
  'fall-guys': FallBean,
  'angry-birds': AngryBird,
  'clash-royale': MiniPekkaPancake,
  'clash-of-clans': () => <ElixirDrop label="COC" />,
  dragones: () => <DragonThemeIcon kind="dragon" />,
  'como-entrenar-a-tu-dragon': () => <DragonThemeIcon kind="toothless" />,
  spyro: () => <DragonThemeIcon kind="spyro" />,
  'gravity-falls': MysteryShack,
  batman: BatLogo,
  'batman-que-rie': () => <BatLaughing />,
  joker: JokerCard,
  superman: SuperShield,
  'spider-man': Spider,
  venom: VenomFace,
  deadpool: DeadpoolMask,
  'iron-man': () => <ArcReactor label="IM" />,
  'sonic-exe': SonicExeHead,
  'tails-exe': TailsExeHead,
  'mario-exe': ExposedMarioExe,
  herobrine: SteveHead,
  coraline: ButtonEye,
  'jack-skeleton': JackSkeleton,
  'villanos-black-hat': TopHat,
  'terrifier-art-the-clown': ArtClownFace,
  'la-mona-lisa': MonaPortrait,
  'el-grito': ScreamMask,
  'el-beso-klimt': KlimtKiss,
  'marvel-zombies': ZombieVenom,
  ultron: UltronMask,
  'jeff-the-killer': JeffMask,
  'ben-drowned': DrownedCartridge,
  'lavender-town': GhostTower,
  'smile-dog': SmileDogHead,
  'the-rake': ClawSlash,
  'eyeless-jack': EyelessMask,
  'laughing-jack': LaughingClown,
  'prehistoria-dinosaurios': () => <DragonThemeIcon kind="fossil" />,
  renacimiento: () => <HistoryArtifact kind="renaissance" />,
  'segunda-guerra-mundial': () => <HistoryArtifact kind="war" />,
  'guerra-fria': () => <HistoryArtifact kind="cold-war" />,
  dorado: () => <ColorEmblem kind="gold" />,
  plateado: () => <ColorEmblem kind="silver" />,
  cobre: () => <ColorEmblem kind="copper" />,
  bronce: () => <ColorEmblem kind="bronze" />,
  prisma: () => <ColorEmblem kind="prism" />,
  amatista: () => <ColorEmblem kind="amethyst" />,
  esmeralda: () => <ColorEmblem kind="emerald" />,
  rubi: () => <ColorEmblem kind="ruby" />,
  zafiro: () => <ColorEmblem kind="sapphire" />,
  obsidiana: () => <ColorEmblem kind="obsidian" />,
  'negro-con-lineas-doradas': () => <StyleTile variant="gold" />,
  'morado-con-curvas-de-puntos': () => <StyleTile variant="dots" />,
  'azul-oscuro-con-particulas': () => <StyleTile variant="particles" />,
  'rojo-con-textura-rota': () => <StyleTile variant="cracks" />,
  'verde-neon-con-rejilla': () => <StyleTile variant="grid" />,
  'blanco-y-negro-con-trazos-gruesos': () => <StyleTile variant="bw" />,
  'avenged-sevenfold': () => <BandEmblem kind="a7x" />,
  device: () => <BandEmblem kind="device" />,
  'linkin-park': () => <BandEmblem kind="linkin-park" />,
  'three-days-grace': () => <BandEmblem kind="tdg" />,
  rammstein: () => <BandEmblem kind="rammstein" />,
  'five-finger-death-punch': () => <BandEmblem kind="ffdp" />,
  'poppy-playtime': () => <HuggyWuggy />,
  'red-dead-redemption': Revolver,
  'geometry-dash': PixelCube,
  'just-shapes-beats': Blixer,
  'friday-night-funkin': Microphone,
  'the-amazing-digital-circus': JesterBell,
  'un-show-mas': UnShowDuo,
  terraria: () => <PickaxeHead />,
  'king-kong': ApeHead,
  godzilla: GodzillaHead,
  'ayanokoji': () => <ChessStrings />,
  'programacion': () => <ProgramTerminal mode="code" />,
  hacking: () => <ProgramTerminal mode="hack" />,
  filosofia: () => <HistoryArtifact kind="philosophy" />,
  futuro: () => <ProgramTerminal mode="future" />,
  naturaleza: PlantIcon,
  leon: LionHead,
  bajoterra: Slime,
  'steven-universe': () => {
    return (
      <svg viewBox="0 0 48 48" className={SVG_CLASS}>
        <path
          d="M24 5 L37 24 L24 43 L11 24 Z"
          fill="#f2a0ad"
          stroke={BLACK}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M24 5 L30 24 L24 43 Z" fill="#dd7d8c" />
        <path d="M11 24 h26" stroke={BLACK} strokeWidth="1.8" />
        <circle cx="24" cy="24" r="4" fill="#fff" opacity="0.65" />
      </svg>
    )
  },
  'death-note': DeathNoteBook,
  'la-noche-estrellada': StarryMoon,
  'la-persistencia-de-la-memoria': MeltingClock,
  'la-creacion-de-adan': TwoFingers,
  'la-joven-de-la-perla': Pearl,
  guernica: Bull,
  creepypastas: JeffMask,
  'antiguo-egipto': TutankhamunMask,
  'antigua-grecia': () => <Column label="GR" />,
  'antigua-roma': RomanArch,
  'edad-media': () => <Castle label="MD" />,
  vikingos: () => <VikingHelmet label="VK" />,
  ajedrez: KnightChess,
  tsunami: () => <Wave label="TS" />,
  huracan: Hurricane,
  tornado: Tornado,
  'erupcion-volcanica': Volcano,
  avalancha: Avalanche,
  'tormenta-electrica': Lightning,
}

const CUSTOM_BY_FRANK: Record<string, ComponentType> = {
  'phineas y ferb': PerryPlatypus,
  transformers: AutobotBadge,
  'jurassic park': JurassicMedallion,
  'mortal kombat': MortalDragon,
  'god of war': LeviathanAxe,
  subnautica: SubnauticaPeeper,
  'toy story': WoodyHat,
  cars: LightningMcQueen,
  'star wars': Lightsaber,
  'brawl stars': BrawlSkull,
  fortnite: FortniteLlama,
  roblox: RobloxLogo,
  'one piece': StrawHat,
  naruto: NarutoHeadband,
  'dragon ball': DragonBall,
  'garten of banban': BanbanBird,
  'harry potter': GoldenSnitch,
  fnaf: FreddyHead,
  bendy: BendyHead,
  mario: () => <PlumberCap color="#e52521" bord="#9e1a16" letter="M" />,
  sonic: () => <HedgehogHead body="#1e6fd9" accent="#123a8c" muzzle="#f2cd9a" />,
  pokemon: Pokeball,
  'rick y morty': RickMortyDuo,
  'looney tunes': BunnyHead,
  'los simpson': SimpsonsDonut,
  'scooby doo': ScoobyDoo,
  'ben 10': Ben10Watch,
  'bob esponja': SpongePineapple,
  piratas: PirateShip,
  vaqueros: CowboyHat,
  china: ChineseHouse,
  'the forest': ForestAxe,
  'flappy bird': FlappyBird,
  'happy wheels': HappyWheelsRider,
  elementos: FlameIcon,
  minecraft: Creeper,
  grinch: Grinch,
  rock: GuitarPick,
  creepypastas: HauntedEye,
  colores: ColorGem,
  estilos: () => <StyleTile variant="dots" />,
  historia: HistoryMedal,
  'obras de arte': ArtCanvas,
  'poppy playtime': ToyHand,
  'red dead': Revolver,
  'geometry dash': PixelCube,
  jsab: PixelCube,
  fnf: Microphone,
  monstruos: GodzillaHead,
  'marvel': VenomFace,
  'tecnologia': CodeChip,
  'digital circus': JesterBell,
  'granny': PaleBear,
  'hello neighbor': TopHat,
  'terraria': () => <PickaxeHead />,
  'kick buttowski': () => <PlumberCap color="#e52521" bord="#9e1a16" letter="K" />,
  'randy cunningham': NinjaMask,
  'un show mas': PineTree,
  'hora de aventura': Triforce,
  star: StarryMoon,
  gumball: PaleBear,
  coraje: PaleBear,
  monster: Backrooms,
  'classroom of the elite': Book,
  terrifier: JokerCard,
  filosofia: HistoryMedal,
  futuro: CodeChip,
  naturaleza: JBFlower,
  animales: LionHead,
  rayman: RaymanHead,
}

export function artOf(entry: ThemeEntry, count = 1): EmblemArt {
  if (entry.frank === 'bendy') {
    return {
      kind: 'svg',
      Svg: () => <BendyTitleIcon kind={count > 1 ? 'dark-revival' : 'ink-machine'} />,
    }
  }
  const customByName = CUSTOM_BY_NAME[entry.key]
  if (customByName) return { kind: 'svg', Svg: customByName }

  const customByFrank = CUSTOM_BY_FRANK[entry.frank]
  if (customByFrank) return { kind: 'svg', Svg: customByFrank }

  return { kind: 'icon', Icon: emblemOf(entry) }
}
