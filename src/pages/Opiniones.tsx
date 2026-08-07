import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, Clock, Eye, MessageCircle, Send, ShieldCheck, Star, Trash2 } from 'lucide-react'
import { APP_NAME, ADMIN_EMAIL } from '../lib/appInfo'
import { useAuthStore } from '../store/auth'
import {
  deleteReview,
  getAllReviews,
  getApprovedReviews,
  getMyReview,
  setReviewStatus,
  submitReview,
  type Review,
} from '../lib/reviews'

const WA = 'https://wa.me/573104885609?text=¡Hola!%20Tengo%20una%20sugerencia%20o%20un%20problema%20con%20Flux.'

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))

function Stars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${
            n <= Math.round(value) ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)]'
          }`}
        />
      ))}
    </span>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hover || value)
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="rounded p-0.5"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                active ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

export default function Opiniones() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL)
  const uid = user?.uid ?? null

  const [approved, setApproved] = useState<Review[]>([])
  const [inbox, setInbox] = useState<Review[]>([])
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [makePublic, setMakePublic] = useState(true)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [inboxBusy, setInboxBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [ap, mine, all] = await Promise.all([
      getApprovedReviews(),
      uid ? getMyReview(uid) : Promise.resolve(null),
      isAdmin ? getAllReviews() : Promise.resolve([]),
    ])
    setApproved(ap)
    setInbox(all)
    setMyReview(mine)
    if (mine) {
      setName(mine.name)
      setRating(mine.rating)
      setComment(mine.comment)
      setMakePublic(mine.public)
    } else if (user?.displayName) {
      setName(user.displayName)
    }
    setLoading(false)
  }, [uid, isAdmin, user?.displayName])

  useEffect(() => {
    load()
  }, [load])

  const avg = approved.length ? approved.reduce((a, r) => a + r.rating, 0) / approved.length : 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!uid || busy || rating < 1) return
    setBusy(true)
    await submitReview(uid, { name, rating, comment, public: makePublic })
    setBusy(false)
    setSent(true)
    await load()
  }

  const adminSetStatus = async (reviewUid: string, status: Review['status']) => {
    setInboxBusy(reviewUid)
    await setReviewStatus(reviewUid, status)
    setInboxBusy(null)
    await load()
  }

  const adminDelete = async (r: Review) => {
    if (!window.confirm(`¿Eliminar la reseña de ${r.name}?`)) return
    setInboxBusy(r.uid)
    await deleteReview(r.uid)
    setInboxBusy(null)
    await load()
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="eyebrow">Opiniones</p>
        <h1 className="text-2xl font-bold tracking-tight">Qué te pareció {APP_NAME}</h1>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight">{approved.length ? avg.toFixed(1) : '—'}</p>
            <Stars value={avg} size="h-5 w-5" />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {approved.length} {approved.length === 1 ? 'reseña' : 'reseñas'}
            </p>
          </div>
          <div className="min-w-0 text-sm text-[var(--text-muted)]">
            <p>
              Cada tarea cuenta: tu opinión ayuda a que {APP_NAME} mejore de verdad.
            </p>
            <p className="mt-1">
              Las reseñas pasan por una revisión antes de publicarse, así que lo que ves aquí es lo mejor de la
              comunidad.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm font-semibold">{myReview ? 'Tu reseña' : 'Deja tu reseña'}</p>
          {!uid ? (
            <p className="mt-2 text-sm text-[var(--text-muted)]">Inicia sesión para dejar tu reseña.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 space-y-4">
              {sent && (
                <p className="flex items-start gap-2 rounded-lg bg-[var(--surface-2)] p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ¡Gracias! Tu opinión pasará por revisión y aparecerá pronto en la lista.
                </p>
              )}
              <div>
                <label className="text-xs text-[var(--text-muted)]">Tu nombre</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cómo te llamas"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)]">¿Cuántas estrellas le das?</label>
                <div className="mt-1">
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                {rating === 0 && <p className="mt-1 text-xs text-[var(--text-muted)]">Elige de 1 a 5 estrellas.</p>}
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)]">Comentario (opcional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="¿Qué te gustó o qué mejorarías?"
                  rows={3}
                  className="mt-1 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={makePublic}
                  onChange={(e) => setMakePublic(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Pueden publicar mi reseña en la app. Las sugerencias de mejora llegan directo al equipo, se
                  publiquen o no.
                </span>
              </label>
              {myReview && (
                <p className="text-xs text-[var(--text-muted)]">
                  Esta es tu reseña actual. Al enviarla pasa de nuevo por revisión.
                </p>
              )}
              <button type="submit" disabled={busy || rating < 1} className="btn-primary w-full justify-center">
                <Send className="h-4 w-4" /> {myReview ? 'Actualizar reseña' : 'Enviar reseña'}
              </button>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <MessageCircle className="h-3.5 w-3.5" /> ¿Algo urgente? Escríbeme por WhatsApp
              </a>
            </form>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Reseñas</p>
            {approved.length > 0 && (
              <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                {approved.length}
              </span>
            )}
          </div>
          {loading ? (
            <p className="mt-3 text-sm text-[var(--text-muted)]">Cargando...</p>
          ) : approved.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Aún no hay reseñas publicadas. Sé el primero en dejar una.
            </p>
          ) : (
            <ul className="mt-3 space-y-4">
              {approved.map((r) => (
                <li key={r.uid} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <span className="text-[11px] text-[var(--text-muted)]">{fmtDate(r.createdAt)}</span>
                  </div>
                  <div className="mt-1">
                    <Stars value={r.rating} />
                  </div>
                  {r.comment && <p className="mt-1.5 text-sm text-[var(--text-muted)]">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="card overflow-hidden">
          <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/15 to-transparent p-5">
            <p className="eyebrow flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Inbox del creador
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Aquí llegan todas las opiniones. Las "pendientes" solo se publican cuando las apruebas.
            </p>
          </div>
          <div className="p-5">
            {inbox.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No hay opiniones todavía.</p>
            ) : (
              <ul className="space-y-4">
                {inbox.map((r) => (
                  <li
                    key={r.uid}
                    className="rounded-xl border border-[var(--border)] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{r.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            r.status === 'approved'
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-amber-300/10 text-amber-200'
                          }`}
                        >
                          {r.status === 'approved' ? 'Publicada' : 'Pendiente'}
                        </span>
                        <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                          {r.public ? 'Pública' : 'Privada'}
                        </span>
                        {r.version && (
                          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                            v{r.version}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {fmtDate(r.createdAt)} · {r.rating}★
                      </span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-[var(--text-muted)]">{r.comment}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.status === 'pending' ? (
                        <button
                          onClick={() => adminSetStatus(r.uid, 'approved')}
                          disabled={inboxBusy === r.uid}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20"
                        >
                          <Eye className="h-3.5 w-3.5" /> Aprobar
                        </button>
                      ) : (
                        <button
                          onClick={() => adminSetStatus(r.uid, 'pending')}
                          disabled={inboxBusy === r.uid}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                        >
                          <Clock className="h-3.5 w-3.5" /> Ocultar
                        </button>
                      )}
                      <button
                        onClick={() => adminDelete(r)}
                        disabled={inboxBusy === r.uid}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-red-400/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Borrar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
