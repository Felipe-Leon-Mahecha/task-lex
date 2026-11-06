import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock3, FileText, FolderClosed, FolderPlus, ImagePlus, NotebookPen, Paintbrush, Pencil, Pin, Plus, Search, Star, Trash2 } from 'lucide-react'
import { useNotesStore } from '../store/notes'
import type { NoteFolder } from '../types/notes'
import { FOLDER_COLORS } from '../types/notes'
import { plainText } from '../lib/notes/sanitize'
import { compressImage } from '../lib/image'
import Modal from '../components/ui/Modal'

export default function Notas() {
  const navigate = useNavigate()
  const location = useLocation()
  const folders = useNotesStore((s) => s.folders)
  const notes = useNotesStore((s) => s.notes)
  const addFolder = useNotesStore((s) => s.addFolder)
  const renameFolder = useNotesStore((s) => s.renameFolder)
  const deleteFolder = useNotesStore((s) => s.deleteFolder)
  const createNote = useNotesStore((s) => s.createNote)
  const moveNote = useNotesStore((s) => s.moveNote)
  const bgImage = useNotesStore((s) => s.bgImage)
  const bgOpacity = useNotesStore((s) => s.bgOpacity)
  const setBgOpacity = useNotesStore((s) => s.setBgOpacity)
  const setBgImage = useNotesStore((s) => s.setBgImage)
  const bgRef = useRef<HTMLInputElement>(null)
  const [bgBusy, setBgBusy] = useState(false)
  const [bgMsg, setBgMsg] = useState<string | null>(null)
  const [bgModalOpen, setBgModalOpen] = useState(false)

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string | 'all'>('all')
  const [folderModal, setFolderModal] = useState<{ open: boolean; mode: 'new' | 'edit'; folder?: NoteFolder }>({
    open: false,
    mode: 'new',
  })
  const [fname, setFname] = useState('')
  const [fcolor, setFcolor] = useState(FOLDER_COLORS[3])

  const snippet = (noteId: string): string => {
    const n = notes.find((x) => x.id === noteId)
    if (!n) return ''
    for (const b of n.blocks) {
      const t = plainText(b.html).trim()
      if (!t) continue
      if (b.type === 'check') return `☐ ${t}`
      if (b.type === 'bullet') return `• ${t}`
      return t
    }
    return ''
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...notes]
      .filter((n) => (filter === 'all' ? !!q : filter === 'mine' ? n.folderId === null : n.folderId === filter))
      .filter((n) => {
        if (!q) return true
        return n.title.toLowerCase().includes(q) || snippet(n.id).toLowerCase().includes(q)
      })
      .sort((a, b) => (Number(b.pinned) - Number(a.pinned)) || b.updatedAt - a.updatedAt)
  }, [notes, filter, query])

  const folderOf = (id: string | null) => folders.find((f) => f.id === id)
  const activeFolder = filter !== 'all' && filter !== 'mine' ? folderOf(filter) : undefined
  const pinnedCount = notes.filter((note) => note.pinned).length

  const openFolderModal = (mode: 'new' | 'edit', folder?: NoteFolder) => {
    setFname(folder?.name ?? '')
    setFcolor(folder?.color ?? FOLDER_COLORS[3])
    setFolderModal({ open: true, mode, folder })
  }

  const saveFolder = () => {
    if (!fname.trim()) return
    if (folderModal.mode === 'new') {
      addFolder(fname, fcolor)
    } else if (folderModal.folder) {
      renameFolder(folderModal.folder.id, fname, fcolor)
    }
    setFolderModal({ open: false, mode: 'new' })
  }

  const handleNewNote = () => {
    const folderId = activeFolder?.id ?? null
    const note = createNote(folderId)
    navigate(`/notas/${note.id}`, { state: { folderId } })
  }

  useEffect(() => {
    const folderId = (location.state as { folderId?: string | null } | null)?.folderId
    if (folderId === null || folderId === undefined) return
    if (folderId === 'mine' || folders.some((folder) => folder.id === folderId)) setFilter(folderId)
  }, [location.key, location.state, folders])

  useEffect(() => {
    const createQuickNote = () => handleNewNote()
    window.addEventListener('tasklex:quick-create-note', createQuickNote)
    return () => window.removeEventListener('tasklex:quick-create-note', createQuickNote)
  }, [createNote, navigate, activeFolder?.id])

  const onPickBg = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setBgMsg('El archivo debe ser una imagen (PNG o JPG).')
      return
    }
    setBgBusy(true)
    try {
      const data = await compressImage(file, 1280, 0.7)
      setBgImage(data)
      setBgModalOpen(false)
      setBgMsg(null)
    } catch {
      setBgMsg('No se pudo cargar la imagen.')
    } finally {
      setBgBusy(false)
    }
  }

  return (
    <div className="relative">
      {bgImage && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <img src={bgImage} alt="" className="h-full w-full object-cover" style={{ opacity: 1 - bgOpacity / 100 }} />
          <div className="absolute inset-0 bg-[var(--bg)]/35" />
        </div>
      )}
      <div className="relative">
      <section className="relative rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              {activeFolder && <button type="button" onClick={() => setFilter('all')} aria-label="Volver a las carpetas" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowLeft className="h-4 w-4" /></button>}
              {activeFolder && <FolderClosed className="h-8 w-8 shrink-0" style={{ color: activeFolder.color, fill: `${activeFolder.color}25` }} />}
              <div><h1 data-tut="notes-page" className="text-3xl font-extrabold tracking-tight text-[var(--text)]" style={activeFolder ? { color: activeFolder.color } : undefined}>{activeFolder?.name ?? (filter === 'mine' ? 'Mis notas' : 'Notas')}</h1><p className="mt-1 text-xs text-[var(--text-muted)]">{activeFolder ? `${notes.filter((note) => note.folderId === activeFolder.id).length} notas en esta carpeta` : filter === 'mine' ? `${notes.filter((note) => !note.folderId).length} notas sin carpeta` : 'Tus ideas, guardadas y ordenadas.'}</p></div>
            </div>
            {bgMsg && <p className="mt-2 text-xs text-red-400">{bgMsg}</p>}
            <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={onPickBg} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn-primary min-h-10 rounded-xl px-4" onClick={handleNewNote}>
                <Plus className="h-4 w-4" /> {activeFolder ? `Nueva nota en ${activeFolder.name}` : 'Crear nota'}
              </button>
              <button
                onClick={() => setBgModalOpen(true)}
                disabled={bgBusy}
                title={bgImage ? 'Personalizar imagen de fondo' : 'Añadir imagen de fondo'}
                className="btn-ghost min-h-10 rounded-xl border border-[var(--border)] px-4 disabled:opacity-50"
              >
                <Paintbrush className="h-4 w-4" /> {bgImage ? 'Personalizar fondo' : 'Añadir fondo'}
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--bg)]/60 px-3 py-2">
            <div className="flex items-center gap-2 text-[var(--accent)]"><FileText className="h-4 w-4" /><span className="text-xs font-semibold">Notas guardadas</span></div>
            <p className="text-sm font-extrabold text-[var(--text)]">{notes.length}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[var(--bg)]/60 px-3 py-2">
            <div className="flex items-center gap-2 text-[var(--accent)]"><Pin className="h-4 w-4" /><span className="text-xs font-semibold">Fijadas</span></div>
            <p className="text-sm font-extrabold text-[var(--text)]">{pinnedCount}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en mis notas…"
            className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-11 pr-4 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
          />
        </div>

        {!activeFolder && <div className="notes-filter-row flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`min-h-10 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[var(--accent)] text-white'
                : 'border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]'
            }`}
          >
            Carpetas
          </button>
          <button onClick={() => setFilter('mine')} className={`flex min-h-9 shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${filter === 'mine' ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]'}`}><FolderClosed className="h-3.5 w-3.5" /> Mis notas</button>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(filter === f.id ? 'all' : f.id)}
              className={`flex min-h-9 shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.id
                  ? 'text-white'
                  : 'border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]'
              }`}
              style={filter === f.id ? { background: f.color } : undefined}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: filter === f.id ? '#fff' : f.color }} />
              {f.name}
            </button>
          ))}
          <button
            onClick={() => openFolderModal('new')}
            className="flex min-h-9 shrink-0 items-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <FolderPlus className="h-3.5 w-3.5" /> Carpeta
          </button>
        </div>}
      </div>
      </section>

      {filter === 'all' && !query.trim() && <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <article className="relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--accent)]/40 bg-gradient-to-br from-[var(--surface)] to-[var(--accent)]/10 p-4 text-center transition hover:-translate-y-0.5 hover:border-[var(--accent)]">
          <button onClick={() => setFilter('mine')} className="flex flex-col items-center gap-2"><FolderClosed className="h-10 w-10 text-[var(--accent)]" /><span className="text-sm font-bold text-[var(--text)]">Mis notas</span><span className="text-[10px] text-[var(--text-muted)]">{notes.filter((n) => !n.folderId).length} sin carpeta</span></button>
        </article>
        {folders.map((folder) => <article key={folder.id} className="relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center transition hover:-translate-y-0.5 hover:border-[var(--accent)]/50">
          <button onClick={() => setFilter(folder.id)} className="flex flex-col items-center gap-2">
            <FolderClosed className="h-10 w-10" style={{ color: folder.color, fill: `${folder.color}25` }} />
            <span className="text-sm font-bold text-[var(--text)]">{folder.name}</span>
          </button>
          <button title="Editar carpeta" aria-label={`Editar carpeta ${folder.name}`} onClick={() => openFolderModal('edit', folder)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)]"><Pencil className="h-4 w-4" /></button>
        </article>)}
      </div>}

      {(filter !== 'all' || query.trim()) && <div className="mb-3 mt-6 flex items-center justify-between gap-3">
        <div>{query.trim() ? <><h2 className="text-lg font-bold text-[var(--text)]">Resultados</h2><p className="mt-0.5 text-xs text-[var(--text-muted)]">{filtered.length} {filtered.length === 1 ? 'nota' : 'notas'} · {filtered.some((n) => n.pinned) ? 'Las fijadas aparecen primero' : 'Ordenadas por actividad reciente'}</p></> : <p className="text-xs text-[var(--text-muted)]">{filtered.length} {filtered.length === 1 ? 'nota' : 'notas'} · {filtered.some((n) => n.pinned) ? 'Las fijadas aparecen primero' : 'Ordenadas por actividad reciente'}</p>}</div>
        <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><Clock3 className="h-3.5 w-3.5" /> Recientes</span>
      </div>}
      {(filter !== 'all' || query.trim()) && <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {filtered.map((n) => {
          const f = folderOf(n.folderId)
          return (
            <article
              key={n.id}
              className={`group card relative flex min-h-24 flex-col justify-center rounded-2xl p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${n.highlighted ? 'note-highlight' : ''}`}
              style={f ? { borderColor: f.color, borderLeftWidth: 4 } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <button onClick={() => navigate(`/notas/${n.id}`, { state: { folderId: activeFolder?.id ?? (filter === 'mine' ? 'mine' : null) } })} className="min-w-0 text-left text-base font-bold text-[var(--text)] transition-colors hover:text-[var(--accent)]">{n.title.trim() || 'Nota sin título'}</button>
                <div className="flex shrink-0 items-center gap-1">
                  {n.highlighted && <Star className="h-4 w-4 fill-amber-300 text-amber-400" />}
                  {n.pinned && <Pin className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />}
                </div>
              </div>
              {!n.folderId && <select
                title="Mover de carpeta"
                value={n.folderId ?? ''}
                onChange={(e) => moveNote(n.id, e.target.value || null)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] outline-none"
              >
                <option value="">Elegir carpeta…</option>
                {folders.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>}
            </article>
          )
        })}
        {filtered.length === 0 && (
          <div className="card col-span-full flex flex-col items-center gap-2 p-8 text-center">
            <NotebookPen className="h-8 w-8 text-[var(--text-muted)]" />
            <p className="text-sm font-semibold text-[var(--text)]">No hay notas aquí</p>
            <p className="text-xs text-[var(--text-muted)]">Probá crear tu primera nota o cambiar el filtro.</p>
          </div>
        )}
      </div>}

      <Modal
        open={bgModalOpen}
        onClose={() => setBgModalOpen(false)}
        title="Fondo de notas"
      >
        <div className="space-y-4">
          {bgImage ? <img src={bgImage} alt="Vista previa del fondo" className="h-40 w-full rounded-xl object-cover" style={{ opacity: 1 - bgOpacity / 100 }} /> : <p className="rounded-xl bg-[var(--surface-2)] p-5 text-center text-sm text-[var(--text-muted)]">Aún no hay una imagen de fondo.</p>}
          <label className="block text-sm font-semibold text-[var(--text)]">Transparencia de la imagen <span className="font-normal text-[var(--text-muted)]">{bgOpacity}%</span>
            <input type="range" min="5" max="70" value={bgOpacity} onChange={(e) => setBgOpacity(Number(e.target.value))} className="mt-3 w-full accent-[var(--accent)]" />
          </label>
          <div className="flex justify-end gap-2">
            {bgImage && <button onClick={() => { setBgImage(null); setBgModalOpen(false) }} className="mr-auto rounded-xl px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10">Quitar fondo</button>}
            <button onClick={() => bgRef.current?.click()} disabled={bgBusy} className="btn-primary"><ImagePlus className="h-4 w-4" /> {bgBusy ? 'Subiendo…' : bgImage ? 'Cambiar imagen' : 'Elegir imagen'}</button>
            <button onClick={() => setBgModalOpen(false)} className="btn-ghost">Listo</button>
          </div>
        </div>
      </Modal>

      <Modal
        open={folderModal.open}
        onClose={() => setFolderModal({ open: false, mode: 'new' })}
        title={folderModal.mode === 'new' ? 'Nueva carpeta' : 'Editar carpeta'}
      >
        <div className="flex flex-col gap-4">
          <input
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveFolder()
            }}
            placeholder="Nombre (ej: Miercoles, Domingo)…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
          />
          <div className="flex flex-wrap items-center gap-2">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setFcolor(c)}
                className="h-7 w-7 rounded-full border-2 transition-transform"
                style={{
                  background: c,
                  borderColor: fcolor === c ? 'var(--text)' : 'transparent',
                }}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            {folderModal.mode === 'edit' && folderModal.folder && (
              <button
                onClick={() => {
                  if (confirm('¿Borrar la carpeta? Las notas no se pierden, quedan sin carpeta.')) {
                    deleteFolder(folderModal.folder!.id)
                    setFolderModal({ open: false, mode: 'new' })
                    setFilter('all')
                  }
                }}
                className="mr-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Borrar
              </button>
            )}
            <button onClick={() => setFolderModal({ open: false, mode: 'new' })} className="btn-ghost">
              Cancelar
            </button>
          <button onClick={saveFolder} disabled={!fname.trim()} className="btn-primary">
            {folderModal.mode === 'new' ? 'Crear' : 'Guardar'}
          </button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  )
}
