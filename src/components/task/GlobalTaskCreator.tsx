import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarPlus } from 'lucide-react'
import TaskForm from './TaskForm'
import { useSectionsStore } from '../../store/sections'
import { useTasksStore } from '../../store/tasks'
import { createTask, type TaskInput } from '../../lib/tasks'

type CreateRequest = { dueDate?: Date | null }

function shouldHideCreator(pathname: string) {
  return pathname.startsWith('/s/') || /^\/(tienda|ajustes|temporadas|notas|opiniones|estadisticas|archivo|creditos|ayuda|privacidad)(\/|$)/.test(pathname)
}

export default function GlobalTaskCreator() {
  const sections = useSectionsStore((state) => state.sections)
  const addTask = useTasksStore((state) => state.addTask)
  const location = useLocation()
  const hideCreator = shouldHideCreator(location.pathname)
  const [open, setOpen] = useState(false)
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState('')

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<CreateRequest>).detail
      if (shouldHideCreator(location.pathname)) return
      const routeSection = location.pathname.match(/^\/s\/([^/]+)/)?.[1]
      setSelectedSectionId(location.pathname === '/bandeja' ? 'inbox' : sections.some((section) => section.id === routeSection) ? routeSection! : sections[0]?.id ?? 'gem')
      setDueDate(detail?.dueDate ? new Date(detail.dueDate) : null)
      setOpen(true)
    }
    window.addEventListener('tasklex:global-new-task', handleOpen)
    return () => window.removeEventListener('tasklex:global-new-task', handleOpen)
  }, [location.pathname, sections])

  const save = (input: TaskInput) => {
    const sectionId = selectedSectionId || sections[0]?.id || 'gem'
    addTask(createTask(sectionId, input))
    setOpen(false)
  }

  return <>
    {!hideCreator && <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('tasklex:global-new-task'))}
      aria-label="Crear tarea desde cualquier pantalla"
      title="Nueva tarea · Ctrl+N"
      className="fixed bottom-5 right-5 z-30 flex h-14 items-center gap-2 rounded-full bg-[var(--accent)] px-5 font-bold text-[var(--accent-text,#121212)] shadow-xl shadow-black/20 hover:-translate-y-0.5 hover:brightness-105 active:scale-95 sm:bottom-7 sm:right-7"
    >
      <CalendarPlus className="h-5 w-5" />
      <span className="hidden sm:inline">Nueva tarea</span>
    </button>}
    <TaskForm open={open} initial={null} presetDueDate={dueDate} sectionOptions={location.pathname === '/bandeja' ? [{ id: 'inbox', label: 'Bandeja de entrada' }, ...sections] : sections} selectedSectionId={selectedSectionId} onSectionChange={setSelectedSectionId} onSave={save} onClose={() => setOpen(false)} />
  </>
}
