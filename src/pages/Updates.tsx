import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowDownToLine, ArrowLeft, Check, ChevronRight, Clock3, Download, History, MonitorDown, ShieldCheck, Sparkles, Smartphone, Waves } from 'lucide-react'
import { APP_NAME, APP_VERSION } from '../lib/appInfo'

interface CurrentRelease {
  version: string
  url: string | null
  notes: string
  sha256?: string
  sizeBytes?: number
}

const WINDOWS_INSTALLER_URL = 'https://github.com/Felipe-Leon-Mahecha/task-lex/releases/download/v5.2.12/Quacker-Setup-5.2.12.exe'

const releaseHistory = [
  { version: '5.2.14', title: 'Avisos a la hora correcta', date: '2026', changes: ['Los recordatorios diarios se programan en horario diurno.', 'Las tareas del día siguiente ya no generan un aviso inmediato al abrir la app por la noche.', 'Cambiar la frecuencia de avisos vuelve a programar las notificaciones pendientes.'] },
  { version: '5.2.13', title: 'Un inicio más claro y nuevos sonidos', date: '2026', changes: ['Nueva presentación de Quacker en la pantalla de inicio de sesión.', 'Efectos descargados y con licencia CC0 para avisos, tareas y recompensas.', 'Sonido de ruleta ajustado a la duración de la animación.', 'Nuevo tono de notificación para Android.'] },
  { version: '5.2.12', title: 'Quacker en Windows', date: '2026', changes: ['Insignias de temporada más claras.', 'Diálogo de compra centrado.', 'Primera aplicación independiente para Windows.', 'Actualizador integrado revisado.'] },
  { version: '5.2.11', title: 'Actualización desde Quacker', date: '2026', changes: ['Descarga integrada del APK con progreso y verificación.', 'Nuevo centro web de actualizaciones y novedades.', 'Más herramientas para Fox IA.'] },
  { version: '5.2.0', title: 'Temporadas y colección', date: '2026', changes: ['Temporadas con insignias y sorteos.', 'Quiz de temporada asistido por Fox IA.', 'Notas sincronizadas con tu cuenta.'] },
  { version: '5.1.0', title: 'Sir Quackington', date: '2026', changes: ['Nueva mascota animada y tienda propia.', 'Alarmas por tarea y tonos personalizados.', 'Mejoras de estabilidad en compras.'] },
  { version: '5.0.0', title: 'Quacker toma forma', date: '2026', changes: ['Asistente Fox con planificación y chat.', 'Logros, monedas, tienda y Premium.', 'Reagendamiento inteligente de tareas.'] },
  { version: '4.0.0', title: 'Fox llega a Quacker', date: '2026', changes: ['Asistente para crear tareas con lenguaje natural.', 'Dictado por voz y acceso flotante a Fox.'] },
  { version: '3.2.0', title: 'Temas más expresivos', date: '2026', changes: ['Colores dinámicos en toda la app.', 'Animaciones de acento para temas especiales.'] },
  { version: '3.0.0', title: 'Una gran renovación', date: '2026', changes: ['Calendario, tablero, estadísticas y modo sin conexión.', 'Gestos, atajos, sonidos, rachas y logros.', 'Copias de seguridad e integración con calendario.'] },
  { version: '2.5.0', title: 'Productividad a tu ritmo', date: '2026', changes: ['Arrastrar y soltar tareas, dictado y acciones rápidas.', 'Notificaciones, estadísticas y copia de seguridad.'] },
  { version: '2.0.0', title: 'Nueva identidad', date: '2026', changes: ['ASCEND y la primera gran evolución de Quacker.', 'Transiciones y mejoras de navegación.'] },
]

function formatSize(bytes?: number) {
  if (!bytes) return ''
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`
}

export default function Updates() {
  const location = useLocation()
  const [release, setRelease] = useState<CurrentRelease>({ version: APP_VERSION, url: null, notes: '' })
  const [isWindows, setIsWindows] = useState(false)
  useEffect(() => {
    let alive = true
    fetch('/update.json', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() as Promise<CurrentRelease> : null)
      .then((data) => { if (alive && data?.version) setRelease(data) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const section = new URLSearchParams(location.search).get('seccion')
    if (section !== 'descargar' && section !== 'windows') return
    const target = section === 'descargar' && isWindows ? 'windows' : section
    const timer = window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180)
    return () => window.clearTimeout(timer)
  }, [location.search, isWindows])

  useEffect(() => {
    setIsWindows(/Windows/i.test(navigator.userAgent))
  }, [])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main className="relative min-h-full overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_8%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_42%),radial-gradient(ellipse_at_88%_62%,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_36%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-20 h-96 w-96 rounded-full border border-[var(--accent)]/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-36 h-64 w-64 rounded-full border border-[var(--accent)]/10" />
      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-4 py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--text)]">
          <ArrowLeft className="h-4 w-4" /> Volver a Quacker
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-[var(--accent)]/20 bg-[linear-gradient(125deg,color-mix(in_srgb,var(--surface)_96%,var(--accent)),var(--surface)_54%,color-mix(in_srgb,var(--surface)_88%,var(--accent)))] shadow-[0_28px_90px_-45px_color-mix(in_srgb,var(--accent)_40%,transparent)]">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(ellipse_at_72%_45%,color-mix(in_srgb,var(--accent)_20%,transparent),transparent_65%)] md:block" />
          <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1.15fr_.85fr] md:items-center md:p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">
                <Sparkles className="h-3.5 w-3.5" /> Centro de actualizaciones
              </div>
              <h1 className="mt-5 max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl">Quacker siempre <span className="text-[var(--accent)]">mejorando.</span></h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">Nuevas herramientas, una experiencia más pulida y tus ideas convertidas en mejoras. Aquí encuentras la versión más reciente y todo lo que ha ido creciendo con Quacker.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {release.url ? (
                  <button onClick={() => scrollTo(isWindows ? 'windows' : 'descargar')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-[var(--accent-text)] shadow-lg shadow-[var(--accent)]/15 transition hover:-translate-y-0.5 hover:brightness-110">
                    {isWindows ? <MonitorDown className="h-4 w-4" /> : <ArrowDownToLine className="h-4 w-4" />} {isWindows ? 'Instalar en Windows' : 'Ver pasos y descargar'} <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[var(--surface-2)] px-5 py-3 text-sm font-bold text-[var(--text-muted)]"><Clock3 className="h-4 w-4" /> APK en preparación</span>
                )}
                <button onClick={() => scrollTo('historial')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--border-strong)] px-5 py-3 text-sm font-bold transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)]"><History className="h-4 w-4" /> Ver novedades</button>
              </div>
              <p className="mt-3 text-xs text-[var(--text-muted)]">{isWindows ? 'También puedes instalar Quacker en Windows como una aplicación de escritorio.' : 'Para instalar en Android · Descarga desde PC para pasar el APK a tu teléfono.'}</p>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute inset-5 rounded-[2rem] bg-[var(--accent)]/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-[1.8rem] border border-[var(--accent)]/25 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div className="flex items-center gap-3"><img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-2xl shadow-lg" /><div><p className="font-extrabold">Quacker</p><p className="text-xs text-[var(--text-muted)]">{isWindows ? 'Aplicación de escritorio' : 'Actualización oficial'}</p></div></div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">LISTA</span>
                </div>
                <div className="py-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">Última versión</p><div className="mt-1 flex items-end gap-2"><span className="text-4xl font-black tracking-tight">{release.version || APP_VERSION}</span><span className="mb-1 text-xs text-[var(--text-muted)]">{isWindows ? 'Quacker web' : 'Android'}</span></div>
                  {release.notes && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--text-muted)]">{release.notes}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><ShieldCheck className="h-4 w-4 text-[var(--accent)]" /> Archivo verificado</div>
                  <div className="flex items-center justify-end gap-2 text-xs text-[var(--text-muted)]">{isWindows ? <MonitorDown className="h-4 w-4 text-[var(--accent)]" /> : <Smartphone className="h-4 w-4 text-[var(--accent)]" />} {isWindows ? 'Windows · app web' : `Android ${formatSize(release.sizeBytes)}`}</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-3 grid h-12 w-12 place-items-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--surface)] shadow-xl"><Waves className="h-6 w-6 text-[var(--accent)]" /></div>
            </div>
          </div>
        </section>

        {isWindows && <section id="windows" className="mt-8 scroll-mt-8 overflow-hidden rounded-[1.75rem] border border-amber-400/25 bg-[linear-gradient(125deg,color-mix(in_srgb,var(--surface)_94%,#eab308),var(--surface)_65%)] shadow-xl shadow-amber-500/[.06]">
          <div className="relative grid gap-7 p-5 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-amber-300"><MonitorDown className="h-3.5 w-3.5" /> Quacker para Windows</div>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Tu espacio de organización, en su propia ventana.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">Descarga la aplicación instalable de Quacker para Windows. Se instala con su propio icono y accesos directos; no necesitas instalarla desde Chrome. Al abrirla e iniciar sesión, obtienes <strong className="text-amber-300">500 monedas</strong> para animar y personalizar a tu mascota.</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">El regalo se acredita una sola vez por cuenta. Si ya usas Quacker, tus datos siguen vinculados a tu cuenta.</p>
              <ol className="mt-5 grid gap-3 text-xs text-[var(--text-muted)] sm:grid-cols-3">
                <li className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/35 p-3"><strong className="block text-sm text-[var(--text)]">1. Descarga</strong>Baja el instalador de Quacker para Windows.</li>
                <li className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/35 p-3"><strong className="block text-sm text-[var(--text)]">2. Instala</strong>Abre el archivo y sigue el asistente. Se crearán accesos directos.</li>
                <li className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/35 p-3"><strong className="block text-sm text-[var(--text)]">3. Inicia sesión</strong>Recibirás las 500 monedas en tu cuenta automáticamente.</li>
              </ol>
            </div>
            <div className="relative flex flex-col gap-2 md:w-56">
              <a href={WINDOWS_INSTALLER_URL} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-stone-950 shadow-lg shadow-amber-500/15 transition hover:-translate-y-0.5 hover:brightness-110"><Download className="h-4 w-4" /> Descargar para Windows</a>
              <span className="text-center text-[11px] text-[var(--text-muted)]">Windows 10/11 · Instalador Quacker 5.2.12</span>
              <span className="text-center text-[11px] text-[var(--text-muted)]">La app carga las mejoras nuevas al abrirla.</span>
              <span className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 p-3 text-[11px] leading-relaxed text-[var(--text-muted)]">Como la app es nueva y aún no tiene certificado de editor, Windows puede mostrar SmartScreen. Si confías en la descarga oficial, pulsa “Más información” y luego “Ejecutar de todas formas”.</span>
            </div>
          </div>
        </section>}

        {!isWindows && <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ['Descarga sencilla', 'Baja el APK más reciente desde aquí y ábrelo en tu teléfono Android.'],
            ['Instalación segura', 'Android te mostrará los permisos y la confirmación antes de actualizar.'],
            ['Tus datos siguen ahí', 'Instalar encima de Quacker conserva tu cuenta y tus datos locales.'],
          ].map(([title, body], index) => (
            <article key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/75 p-5 backdrop-blur-sm">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent)]/10 text-sm font-black text-[var(--accent)]">0{index + 1}</span>
              <h2 className="mt-4 font-bold">{title}</h2><p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{body}</p>
            </article>
          ))}
        </section>}

        {!isWindows && <section id="descargar" className="mt-12 scroll-mt-8 overflow-hidden rounded-[1.75rem] border border-[var(--accent)]/25 bg-[linear-gradient(140deg,color-mix(in_srgb,var(--surface)_96%,var(--accent)),var(--surface)_65%)] shadow-xl shadow-[var(--accent)]/[.04]">
          <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-[var(--accent)]"><Smartphone className="h-3.5 w-3.5" /> Instalación en Android</div>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Instálala paso a paso</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">No necesitas conocimientos técnicos. Sigue estos pasos en tu teléfono:</p>
              <ol className="mt-5 space-y-3">
                {[
                  ['Descarga el archivo', 'Toca “Descargar APK” y espera a que termine. El archivo pesa alrededor de 147 MB.'],
                  ['Abre la descarga', 'Toca la notificación de descarga completada. Si ya desapareció, busca “Quacker.apk” en Descargas o en la app Archivos.'],
                  ['Permite la instalación si Android lo solicita', 'Pulsa Configuración y activa “Permitir desde esta fuente” para la app que abrió el archivo. Luego vuelve atrás.'],
                  ['Confirma y abre Quacker', 'Toca “Instalar” o “Actualizar”. Cuando termine, pulsa “Abrir”. Al actualizar Quacker, tus datos se conservan.'],
                ].map(([title, body], index) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-xs font-extrabold text-[var(--accent)]">{index + 1}</span>
                    <span><strong className="text-sm">{title}</strong><span className="mt-0.5 block text-xs leading-relaxed text-[var(--text-muted)]">{body}</span></span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col items-stretch gap-2 md:w-56">
              {release.url ? <a href={release.url} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-[var(--accent-text)] shadow-lg shadow-[var(--accent)]/15 transition hover:-translate-y-0.5 hover:brightness-110"><ArrowDownToLine className="h-4 w-4" /> Descargar APK</a> : <span className="rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-center text-sm font-bold text-[var(--text-muted)]">APK en preparación</span>}
              <span className="text-center text-[11px] text-[var(--text-muted)]">Quacker {release.version} · Android</span>
              <p className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 p-3 text-[11px] leading-relaxed text-[var(--text-muted)]">¿Estás en un computador? Descarga el APK aquí y transfiérelo a tu Android para instalarlo.</p>
            </div>
          </div>
        </section>}

        <section id="historial" className="mt-14 scroll-mt-8">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">El camino de Quacker</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Novedades por versión</h2></div><span className="hidden rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)] sm:inline-flex">{releaseHistory.length + 1} versiones</span></div>
          <div className="relative mt-6 space-y-3 before:absolute before:bottom-6 before:left-[18px] before:top-6 before:w-px before:bg-[var(--border)]">
            <article className="relative rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/[.06] p-5 pl-14 shadow-lg shadow-[var(--accent)]/[.04]">
              <span className="absolute left-3 top-5 grid h-8 w-8 place-items-center rounded-full border border-[var(--accent)]/40 bg-[var(--surface)] text-[var(--accent)]"><Sparkles className="h-4 w-4" /></span>
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold">Versión {release.version}</h3><span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent)]">Más reciente</span><span className="ml-auto text-xs text-[var(--text-muted)]">2026</span></div>
              <p className="mt-1 text-sm font-semibold">Actualizaciones y mejoras</p><p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{release.notes || 'Una experiencia más fluida, mejoras de estabilidad y nuevas formas de organizar tu día.'}</p>
            </article>
            {releaseHistory.map((item) => <article key={item.version} className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-5 pl-14 transition hover:border-[var(--accent)]/25">
              <span className="absolute left-3 top-5 grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)]"><Check className="h-4 w-4" /></span>
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold">Versión {item.version}</h3><span className="text-xs text-[var(--text-muted)]">{item.date}</span></div>
              <p className="mt-1 text-sm font-semibold">{item.title}</p><ul className="mt-2 space-y-1">{item.changes.map((change) => <li key={change} className="text-sm leading-relaxed text-[var(--text-muted)]">{change}</li>)}</ul>
            </article>)}
          </div>
        </section>
        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] py-6 text-xs text-[var(--text-muted)] sm:flex-row"><span>© 2026 {APP_NAME} · Hecho para organizar tus días.</span><Link to="/" className="font-semibold hover:text-[var(--text)]">Volver a Quacker</Link></footer>
      </div>
    </main>
  )
}
