import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, FileJson2, Info, LockKeyhole, Maximize2, Minimize2, MoreVertical, Pin, Share2, Star, Trash2, X } from 'lucide-react'
import { useNotesStore } from '../store/notes'
import { plainText } from '../lib/notes/sanitize'
import NoteEditor from '../components/notes/NoteEditor'
import Modal from '../components/ui/Modal'
import { decryptPrivateNote, encryptPrivateNote, type PrivateNotePayload } from '../lib/notes/private'

const pad = (n: number) => n.toString().padStart(2, '0')

function fmt(ts: number): string {
  const d = new Date(ts)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Nota() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const note = useNotesStore((s) => s.notes.find((n) => n.id === id))
  const folders = useNotesStore((s) => s.folders)
  const updateNote = useNotesStore((s) => s.updateNote)
  const deleteNote = useNotesStore((s) => s.deleteNote)
  const togglePin = useNotesStore((s) => s.togglePin)
  const toggleHighlight = useNotesStore((s) => s.toggleHighlight)
  const moveNote = useNotesStore((s) => s.moveNote)
  const bgImage = useNotesStore((s) => s.bgImage)
  const bgOpacity = useNotesStore((s) => s.bgOpacity)
  const [showInfo, setShowInfo] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [privateUnlocked, setPrivateUnlocked] = useState(false)
  const [privateDraft, setPrivateDraft] = useState<PrivateNotePayload | null>(null)
  const [privatePassphrase, setPrivatePassphrase] = useState('')
  const [missingResolved, setMissingResolved] = useState(false)

  useEffect(() => {
    if (note) { setMissingResolved(false); return }
    setMissingResolved(false)
    const timer = window.setTimeout(() => setMissingResolved(true), 2200)
    return () => window.clearTimeout(timer)
  }, [id, note])

  useEffect(() => {
    if (!note?.privateNote || !privateUnlocked || !privateDraft || !privatePassphrase) return
    const timer = window.setTimeout(() => {
      void encryptPrivateNote(privateDraft, privatePassphrase, note.privateData?.salt)
        .then((privateData) => updateNote(note.id, { privateNote: true, privateData, title: 'Nota privada', blocks: [] }))
        .catch(() => {})
    }, 450)
    return () => window.clearTimeout(timer)
  }, [note?.id, note?.privateNote, note?.privateData?.salt, privateDraft, privatePassphrase, privateUnlocked, updateNote])

  const updateVisible = (patch: Partial<PrivateNotePayload>) => {
    if (note?.privateNote && privateUnlocked) setPrivateDraft((current) => ({ title: current?.title ?? '', blocks: current?.blocks ?? [], ...patch }))
    else if (note) updateNote(note.id, patch)
  }

  const submitPassword = async () => {
    if (!note || password.length < 6) { setPasswordError('Usa una contraseña de al menos 6 caracteres.'); return }
    setPasswordError('')
    try {
      if (note.privateNote) {
        if (!note.privateData) throw new Error('No se encontró el contenido cifrado de esta nota.')
        const payload = await decryptPrivateNote(note.privateData, password)
        setPrivateDraft(payload)
        setPrivatePassphrase(password)
        setPrivateUnlocked(true)
        setPasswordDialog(false)
        setPassword('')
      } else {
        if (password !== passwordConfirm) { setPasswordError('Las contraseñas no coinciden.'); return }
        const privateData = await encryptPrivateNote({ title: note.title, blocks: note.blocks }, password)
        setPrivateDraft({ title: note.title, blocks: note.blocks })
        setPrivatePassphrase(password)
        setPrivateUnlocked(true)
        updateNote(note.id, { privateNote: true, privateData, title: 'Nota privada', blocks: [] })
        setPasswordDialog(false)
        setPassword('')
        setPasswordConfirm('')
      }
    } catch { setPasswordError(note.privateNote ? 'Contraseña incorrecta. Prueba otra vez.' : 'No se pudo proteger la nota en este dispositivo.') }
  }

  const lockPrivateNote = async () => {
    if (!note || !privateDraft || !privatePassphrase) return
    const privateData = await encryptPrivateNote(privateDraft, privatePassphrase, note.privateData?.salt).catch(() => null)
    if (privateData) updateNote(note.id, { privateNote: true, privateData, title: 'Nota privada', blocks: [] })
    setPrivateUnlocked(false); setPrivateDraft(null); setPrivatePassphrase(''); setMenuOpen(false)
  }

  const shareText = () => {
    const activeNote = note?.privateNote && privateDraft ? { ...note, ...privateDraft } : note
    if (!activeNote) return ''
    return `${activeNote.title.trim() || 'Nota sin título'}\n\n${activeNote.blocks.map((block) => plainText(block.html).trim()).filter(Boolean).join('\n\n')}`
  }

  const copyNote = async () => {
    await navigator.clipboard.writeText(shareText()).catch(() => {})
    setMenuOpen(false)
  }

  const downloadJson = () => {
    if (!note) return
    const payload = note.privateNote && privateDraft ? { ...note, ...privateDraft, privateData: undefined } : note
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${(note.privateNote && privateDraft ? privateDraft.title : note.title || 'nota').replace(/[^\p{L}\p{N}-]+/gu, '-').slice(0, 50)}.json`; link.click(); URL.revokeObjectURL(url); setMenuOpen(false)
  }

  const printNote = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const text = shareText()
    const [title, ...body] = text.split('\n\n')
    win.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escape(title)}</title><style>body{font:16px/1.7 Arial,sans-serif;max-width:760px;margin:60px auto;color:#1f2937;padding:0 32px}h1{font-size:30px;line-height:1.2;margin-bottom:28px;color:#111827}p{white-space:pre-wrap;margin:0 0 18px}.rule{height:4px;width:64px;background:#eab308;border-radius:4px;margin-bottom:26px}@media print{body{margin:24mm auto}}</style></head><body><div class="rule"></div><h1>${escape(title)}</h1>${body.map((part) => `<p>${escape(part)}</p>`).join('')}<script>window.onload=()=>window.print()</script></body></html>`)
    win.document.close(); setMenuOpen(false)
  }

  const editableNote = note?.privateNote && privateUnlocked && privateDraft ? { ...note, ...privateDraft } : note
  const stats = useMemo(() => {
    if (!editableNote) return { words: 0, blocks: 0, checks: 0, done: 0 }
    let words = 0
    let checks = 0
    let done = 0
    for (const b of editableNote.blocks) {
      const t = plainText(b.html).trim()
      if (t) words += t.split(/\s+/).length
      if (b.type === 'check') {
        checks++
        if (b.checked) done++
      }
    }
    return { words, blocks: editableNote.blocks.length, checks, done }
  }, [editableNote])

  if (!note && !missingResolved) {
    return <div className="card mx-auto mt-8 flex max-w-md flex-col items-center gap-3 p-6 text-center"><p className="font-semibold text-[var(--text)]">Buscando tu nota…</p><p className="text-sm text-[var(--text-muted)]">Espera un momento mientras reviso las notas guardadas en este dispositivo.</p></div>
  }

  if (!note) {
    return (
      <div className="card mx-auto mt-8 flex max-w-md flex-col items-center gap-3 p-6 text-center">
        <p className="font-bold text-[var(--text)]">Nota no encontrada</p>
          <Link to="/notas" state={{ folderId: (location.state as { folderId?: string | null } | null)?.folderId ?? null }} className="text-sm font-semibold text-[var(--accent)]">
          Volver a mis notas
        </Link>
      </div>
    )
  }

  if (note.privateNote && !privateUnlocked) return <>
    <div className="card mx-auto mt-10 flex max-w-md flex-col items-center gap-4 p-8 text-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]"><LockKeyhole className="h-8 w-8" /></div><div><h1 className="text-xl font-extrabold text-[var(--text)]">Nota privada</h1><p className="mt-2 text-sm text-[var(--text-muted)]">El contenido está cifrado. Desbloquéala con la contraseña que elegiste.</p></div><button onClick={() => { setPasswordDialog(true); setPasswordError('') }} className="btn-primary">Desbloquear nota</button><Link to="/notas" state={{ folderId: (location.state as { folderId?: string | null } | null)?.folderId ?? null }} className="text-sm font-semibold text-[var(--accent)]">Volver a mis notas</Link></div>
    <Modal open={passwordDialog} onClose={() => setPasswordDialog(false)} title="Desbloquear nota"><div className="space-y-4"><label className="block text-sm font-semibold">Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void submitPassword() }} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5" /></label>{passwordError && <p className="text-sm text-red-400">{passwordError}</p>}<button onClick={() => void submitPassword()} className="btn-primary w-full">Desbloquear</button></div></Modal>
  </>

  return (
    <div className={`${focusMode ? 'invisible' : ''} relative mx-auto max-w-4xl`}>
      {bgImage && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <img src={bgImage} alt="" className="h-full w-full object-cover" style={{ opacity: 1 - bgOpacity / 100 }} />
          <div className="absolute inset-0 bg-[var(--bg)]/35 backdrop-blur-[1px]" />
        </div>
      )}
      <div className="relative">
      <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            to="/notas"
            state={{ folderId: (location.state as { folderId?: string | null } | null)?.folderId ?? null }}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" title="Información de la nota" aria-label="Información de la nota" onClick={() => setShowInfo(true)} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
            <Info className="h-4 w-4" />
          </button>
          <select
            value={note.folderId ?? ''}
            onChange={(e) => moveNote(note.id, e.target.value || null)}
            className="min-h-10 max-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] outline-none"
          >
            <option value="">Sin carpeta</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            title={note.pinned ? 'Desfijar' : 'Fijar'}
            onClick={() => togglePin(note.id)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] transition-colors hover:bg-[var(--surface-2)]"
          >
            <Pin className={`h-4 w-4 ${note.pinned ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
          </button>
        </div>
      </div>

      <textarea
        value={editableNote?.title ?? note.title}
        onChange={(e) => updateVisible({ title: e.target.value })}
        placeholder="Título de la nota…"
        rows={1}
        className="mt-7 h-auto w-full resize-none bg-transparent pb-10 pr-14 text-3xl font-extrabold tracking-tight text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] sm:text-4xl"
        style={{ overflow: 'hidden' }}
      />

      <div className="absolute bottom-3 right-3">
        <button type="button" aria-label="Más opciones de la nota" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-sm hover:text-[var(--accent)]"><MoreVertical className="h-4 w-4" /></button>
        {menuOpen && <div className="absolute bottom-11 right-0 z-30 w-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-2xl">
          <button onClick={() => { setFocusMode(true); setMenuOpen(false) }} className="menu-row"><Maximize2 className="h-4 w-4" /> Modo escritura</button>
          <button onClick={() => { setMenuOpen(false); if (note.privateNote) void lockPrivateNote(); else { setPassword(''); setPasswordConfirm(''); setPasswordDialog(true) } }} className="menu-row"><LockKeyhole className="h-4 w-4" /> {note.privateNote ? 'Bloquear nota' : 'Proteger con contraseña'}</button>
          <button onClick={() => { toggleHighlight(note.id); setMenuOpen(false) }} className="menu-row"><Star className={`h-4 w-4 ${note.highlighted ? 'fill-amber-300 text-amber-400' : ''}`} /> {note.highlighted ? 'Quitar destacado' : 'Destacar nota'}</button>
          <div className="my-1 border-t border-[var(--border)]" />
          <button onClick={() => void copyNote()} className="menu-row"><Share2 className="h-4 w-4" /> Copiar título y texto</button>
          <button onClick={downloadJson} className="menu-row"><FileJson2 className="h-4 w-4" /> Descargar JSON</button>
          <button onClick={printNote} className="menu-row"><Download className="h-4 w-4" /> Guardar como PDF</button>
          <div className="my-1 border-t border-[var(--border)]" />
          <button onClick={() => { if (confirm('¿Eliminar esta nota?')) { deleteNote(note.id); navigate('/notas') } setMenuOpen(false) }} className="menu-row text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /> Eliminar nota</button>
        </div>}
      </div>

      </div>

      <div className="mt-4 px-1 sm:px-3">
        <NoteEditor note={editableNote ?? note} onChange={updateVisible} />
      </div>
      </div>
      {showInfo && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowInfo(false) }}>
        <section role="dialog" aria-modal="true" aria-labelledby="note-info-title" className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
          <div className="flex items-center justify-between"><h2 id="note-info-title" className="font-bold text-[var(--text)]">Información de la nota</h2><button aria-label="Cerrar" onClick={() => setShowInfo(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-[var(--surface-2)]"><X className="h-4 w-4" /></button></div>
          <dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Creada</dt><dd className="text-right text-[var(--text)]">{fmt(note.createdAt)}</dd></div><div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Editada</dt><dd className="text-right text-[var(--text)]">{fmt(note.updatedAt)}</dd></div><div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Palabras</dt><dd className="font-semibold text-[var(--text)]">{stats.words}</dd></div>{stats.checks > 0 && <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Tareas completadas</dt><dd className="text-[var(--text)]">{stats.done} de {stats.checks}</dd></div>}</dl>
        </section>
      </div>}
      {focusMode && <div className="visible fixed inset-0 z-[90] overflow-y-auto bg-[var(--bg)] px-4 py-5 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center justify-between gap-3"><div><p className="eyebrow">Modo escritura</p><p className="mt-1 text-xs text-[var(--text-muted)]">Un espacio limpio para desarrollar tus ideas.</p></div><button onClick={() => setFocusMode(false)} className="flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]"><Minimize2 className="h-4 w-4" />Volver a la nota</button></div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-8">
            <textarea value={editableNote?.title ?? note.title} onChange={(event) => updateVisible({ title: event.target.value })} placeholder="Ponle un título a esta idea…" rows={1} className="mb-5 w-full resize-none bg-transparent text-3xl font-extrabold tracking-tight text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] sm:text-4xl" />
            <NoteEditor note={editableNote ?? note} onChange={updateVisible} />
          </div>
        </div>
      </div>}
      <Modal open={passwordDialog} onClose={() => setPasswordDialog(false)} title="Protege tu nota">
        <div className="space-y-4"><p className="text-sm text-[var(--text-muted)]">El texto se cifra en tu dispositivo antes de sincronizarse. Esta contraseña no se puede recuperar.</p><label className="block text-sm font-semibold">Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5" /></label><label className="block text-sm font-semibold">Confirma la contraseña<input type="password" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void submitPassword() }} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5" /></label>{passwordError && <p className="text-sm text-red-400">{passwordError}</p>}<button onClick={() => void submitPassword()} className="btn-primary w-full">Cifrar y proteger</button></div>
      </Modal>
    </div>
  )
}
