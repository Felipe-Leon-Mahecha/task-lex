import { Capacitor } from '@capacitor/core'
import { CapacitorCalendar } from '@ebarooni/capacitor-calendar'

export async function requestCalendarPermissions() {
  if (Capacitor.getPlatform() === 'web') return false
  try {
    // This app writes task events. Requesting every calendar *and reminders*
    // permission included scopes that are unsupported on Android and kept the
    // old all-values check false even after calendar access was granted.
    const result = await CapacitorCalendar.requestFullCalendarAccess()
    return result.result === 'granted'
  } catch (error) {
    console.error('Error requesting calendar permissions:', error)
    return false
  }
}

export async function createCalendarEvent(task: {
  title: string
  description: string
  dueDate: Date | null
}) {
  if (Capacitor.getPlatform() === 'web') return null
  
  if (!task.dueDate) return null
  
  try {
    // Request permissions first
    const hasPermission = await requestCalendarPermissions()
    if (!hasPermission) return null
    
    // Get default calendar
    const result = await CapacitorCalendar.getDefaultCalendar()
    const defaultCalendar = result.result
    
    // Create event
    const startDate = new Date(task.dueDate)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration
    
    const eventResult = await CapacitorCalendar.createEvent({
      title: task.title,
      description: task.description,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      calendarId: defaultCalendar?.id,
    })
    
    return eventResult.id
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return null
  }
}

export async function updateCalendarEvent(eventId: string, task: {
  title: string
  description: string
  dueDate: Date | null
}) {
  if (Capacitor.getPlatform() === 'web') return false
  
  if (!task.dueDate || !eventId) return false
  
  try {
    const startDate = new Date(task.dueDate)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration
    
    await CapacitorCalendar.modifyEvent({
      id: eventId,
      title: task.title,
      description: task.description,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    })
    
    return true
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return false
  }
}

export async function deleteCalendarEvent(eventId: string) {
  if (Capacitor.getPlatform() === 'web') return false
  
  if (!eventId) return false
  
  try {
    await CapacitorCalendar.deleteEvent({ id: eventId })
    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return false
  }
}

export async function fetchCalendarEvents(from: Date, to: Date) {
  if (Capacitor.getPlatform() === 'web') return null
  const hasPermission = await requestCalendarPermissions()
  if (!hasPermission) return null
  try {
    const result = await CapacitorCalendar.listEventsInRange({ from: from.getTime(), to: to.getTime() })
    return result.result ?? []
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return null
  }
}

export async function openCalendar() {
  if (Capacitor.getPlatform() === 'web') return
  
  try {
    await CapacitorCalendar.openCalendar()
  } catch (error) {
    console.error('Error opening calendar:', error)
  }
}
