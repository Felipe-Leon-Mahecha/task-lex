import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Check,
  Highlighter,
  Italic,
  Quote,
  Text,
  Trash2,
  Underline,
} from 'lucide-react'
import type { NoteBlock, StoredNote } from '../../types/notes'
import { makeId } from '../../types/notes'
import { sanitizeHtml } from '../../lib/notes/sanitize'
import { useNotesStore } from '../../store/notes'

function placeCaret(el: HTMLElement, edge: 'start' | 'end' = 'end') {
  const sel = window.getSelection()
  if (!sel) return
  const r = document.createRange()
  if (edge === 'start') r.setStart(el, 0)
  else r.selectNodeContents(el)
  r.collapse(edge === 'start')
  sel.removeAllRanges()
  sel.addRange(r)
}

function closestMark(node: Node | null): HTMLElement | null {
  let n: Node | null = node
  while (n && n.nodeType === Node.TEXT_NODE) n = n.parentNode
  while (n) {
    if (n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName.toLowerCase() === 'mark') {
      return n as HTMLElement
    }
    n = n.parentNode
  }
  return null
}

function isBlockEmpty(b: NoteBlock): boolean {
  return b.html === '' || b.html === '<br>'
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function numberOf(blocks: NoteBlock[], i: number): number {
  let n = 1
  for (let j = i - 1; j >= 0 && blocks[j].type === 'number'; j--) n++
  return n
}

export default function NoteEditor({ note, onChange }: { note: StoredNote; onChange?: (patch: Partial<StoredNote>) => void }) {
  const updateNote = useNotesStore((s) => s.updateNote)
  const blocks = note.blocks
  const els = useRef(new Map<string, HTMLDivElement>())
  const savedSelection = useRef<Range | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const setEl = (id: string) => (node: HTMLDivElement | null) => {
    if (node) els.current.set(id, node)
    else els.current.delete(id)
  }

  const updateBlocks = (next: NoteBlock[]) => {
    if (onChange) onChange({ blocks: next })
    else updateNote(note.id, { blocks: next })
  }

  const updateBlock = (id: string, patch: Partial<Omit<NoteBlock, 'id'>>) => {
    updateBlocks(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  useEffect(() => {
    for (const b of blocks) {
      const el = els.current.get(b.id)
      if (!el || document.activeElement === el) continue
      const want = b.html || ''
      if (el.innerHTML !== want) el.innerHTML = want
    }
  }, [blocks])

  const focusBlock = (id: string, edge: 'start' | 'end' = 'end') => {
    requestAnimationFrame(() => {
      const el = els.current.get(id)
      if (!el) return
      el.focus()
      placeCaret(el, edge)
    })
  }

  const dispatchInput = (el: HTMLElement) => {
    try {
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'formatInline' }))
    } catch {
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  const onInput = (b: NoteBlock) => (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (b.type === 'text') {
      const text = (el.innerText ?? '').replace(/ /g, ' ')
      const bullet = text.match(/^([-*–—])\s+([\s\S]*)$/)
      const ordered = text.match(/^(\d{1,3})[.)]\s+([\s\S]*)$/)
      if (bullet || ordered) {
        const rest = (bullet?.[2] ?? ordered?.[2] ?? '').trim()
        const type = bullet ? 'bullet' : ('number' as const)
        el.innerHTML = esc(rest)
        placeCaret(el)
        updateBlock(b.id, { type, html: sanitizeHtml(esc(rest)) })
        return
      }
    }
    updateBlock(b.id, {
      html: sanitizeHtml(el.innerHTML),
    })
  }

  const onKeyDown = (b: NoteBlock, i: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if ((b.type === 'bullet' || b.type === 'number') && isBlockEmpty(b)) {
        updateBlock(b.id, { type: 'text' })
        return
      }
      const selection = window.getSelection()
      const el = e.currentTarget
      if (!selection || !selection.rangeCount || !el.contains(selection.anchorNode)) return
      const range = selection.getRangeAt(0)
      range.deleteContents()
      const lineBreak = document.createElement('br')
      range.insertNode(lineBreak)
      range.setStartAfter(lineBreak)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      dispatchInput(el)
      return
    }
    if (e.key === 'Backspace' && isBlockEmpty(b)) {
      if (b.type === 'bullet' || b.type === 'number') {
        e.preventDefault()
        updateBlock(b.id, { type: 'text' })
        return
      }
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0 && sel.getRangeAt(0).collapsed) {
        if (blocks.length === 1) {
          e.preventDefault()
          updateBlock(b.id, { html: '' })
          return
        }
        const prev = blocks[i - 1]
        if (prev) {
          e.preventDefault()
          const next = blocks.filter((x) => x.id !== b.id)
          updateBlocks(next)
          setActiveId(prev.id)
          focusBlock(prev.id)
        }
      }
    }
  }

  const rememberSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const selection = window.getSelection()
    const el = activeId ? els.current.get(activeId) : null
    if (selection?.rangeCount && el?.contains(selection.anchorNode)) {
      savedSelection.current = selection.getRangeAt(0).cloneRange()
    }
  }

  const exec = (cmd: string, value?: string) => {
    const el = activeId ? els.current.get(activeId) : null
    if (el) {
      el.focus()
      const sel = window.getSelection()
      if (sel && savedSelection.current && el.contains(savedSelection.current.commonAncestorContainer)) {
        sel.removeAllRanges()
        sel.addRange(savedSelection.current)
      } else if (!sel || !sel.anchorNode || !el.contains(sel.anchorNode)) placeCaret(el)
    }
    document.execCommand(cmd, false, value)
    savedSelection.current = null
    if (el) dispatchInput(el)
  }

  const toggleHighlight = () => {
    const el = activeId ? els.current.get(activeId) : null
    const sel = window.getSelection()
    if (!sel) return
    if (savedSelection.current) {
      sel.removeAllRanges()
      sel.addRange(savedSelection.current)
    }
    if (!sel.rangeCount || sel.isCollapsed) return
    const mark = closestMark(sel.getRangeAt(0).commonAncestorContainer)
    if (mark) {
      const parent = mark.parentNode!
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
      parent.removeChild(mark)
    } else {
      document.execCommand('hiliteColor', false, '#fde047')
    }
    savedSelection.current = null
    if (el) dispatchInput(el)
  }

  const removeBlock = (id: string) => {
    if (blocks.length === 1) {
      updateBlock(id, { html: '', checked: false, type: 'text' })
      setActiveId(id)
      focusBlock(id)
      return
    }
    const i = blocks.findIndex((b) => b.id === id)
    const peer = blocks[i - 1] ?? blocks[i + 1]
    const keep = blocks[i - 1]
    const next = blocks.filter((b) => b.id !== id)
    updateBlocks(next)
    setActiveId(peer.id)
    focusBlock(keep ? keep.id : peer.id, keep ? 'end' : 'start')
  }

  const addBelow = (i: number, type: NoteBlock['type'] = 'text') => {
    const id = makeId()
    updateBlocks([...blocks.slice(0, i + 1), { id, type, html: '', checked: false }, ...blocks.slice(i + 1)])
    setActiveId(id)
    focusBlock(id)
  }

  return (
    <div className="mt-4">
      <div className="space-y-1">
        {blocks.map((b, i) => {
          const active = activeId === b.id
          const empty = isBlockEmpty(b)
          return (
            <div
              key={b.id}
              className={`group relative rounded-lg border border-transparent px-2 transition-colors ${
                active ? 'bg-[var(--surface-2)]/40' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                {b.type === 'check' && (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => updateBlock(b.id, { checked: !b.checked })}
                    className="mt-2.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors"
                    style={{
                      borderColor: b.checked ? 'var(--accent)' : 'var(--border)',
                      background: b.checked ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    {b.checked && <Check className="h-3 w-3 text-white" />}
                  </button>
                )}
                {b.type === 'quote' && <Quote className="mt-3 h-4 w-4 shrink-0 text-[var(--accent)]" />}
                {b.type === 'bullet' && (
                  <span className="mt-[0.85rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                )}
                {b.type === 'number' && (
                  <span className="mt-1 w-6 shrink-0 text-right text-sm font-bold text-[var(--accent)]">
                    {numberOf(blocks, i)}.
                  </span>
                )}
                <div
                  ref={setEl(b.id)}
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder={empty ? 'Escribe algo… (usa - o 1. para listas)' : undefined}
                  onInput={onInput(b)}
                  onKeyDown={onKeyDown(b, i)}
                  onFocus={() => setActiveId(b.id)}
                  onBlur={() => setActiveId(null)}
                  className={`note-ph min-h-[1.6rem] w-full whitespace-pre-wrap break-words px-1 py-1 outline-none transition-colors ${
                    b.type === 'subtitle'
                      ? 'text-xl font-bold'
                      : b.type === 'quote'
                        ? 'italic text-[var(--text-muted)]'
                        : 'text-[var(--text)]'
                  } ${b.type === 'check' && b.checked ? 'text-[var(--text-muted)] line-through opacity-70' : ''}`}
                />
              </div>

              {active && (
                <div className="mb-1 ml-1 flex flex-wrap items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 py-1 shadow-md">
                  <select
                    value={b.type}
                    onMouseDown={(e) => e.preventDefault()}
                    onChange={(e) => {
                      updateBlock(b.id, { type: e.target.value as NoteBlock['type'] })
                      focusBlock(b.id)
                    }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-1 text-xs font-semibold text-[var(--text)] outline-none"
                  >
                    <option value="text">Texto</option>
                    <option value="subtitle">Subtítulo</option>
                    <option value="quote">Cita</option>
                    <option value="check">Checkbox</option>
                    <option value="bullet">Viñetas</option>
                    <option value="number">Numerada</option>
                  </select>
                  <button
                    onMouseDown={rememberSelection}
                    onClick={() => exec('bold')}
                    title="Negrilla"
                    className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onMouseDown={rememberSelection}
                    onClick={() => exec('italic')}
                    title="Cursiva"
                    className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onMouseDown={rememberSelection}
                    onClick={() => exec('underline')}
                    title="Subrayar"
                    className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onMouseDown={rememberSelection}
                    onClick={toggleHighlight}
                    title="Resaltar amarillo"
                    className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => removeBlock(b.id)}
                    title="Eliminar bloque"
                    className="grid h-7 w-7 place-items-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {empty && i === blocks.length - 1 && (
                <button
                  className="ml-1 mt-0.5 flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--accent)]"
                  onClick={() => addBelow(i)}
                >
                  <Text className="h-3 w-3" /> Añadir bloque
                </button>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={() => addBelow(blocks.length - 1)}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--border)] py-2 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Text className="h-3.5 w-3.5" /> Añadir bloque
      </button>
    </div>
  )
}
