import { Capacitor } from '@capacitor/core'
import { WidgetBridgePlugin } from 'capacitor-widget-bridge'
import { useSectionsStore } from '../store/sections'

export async function updateWidgetData(tasks: any[], currentStreak: number) {
  if (Capacitor.getPlatform() !== 'android') return

  try {
    // Register the widget
    await WidgetBridgePlugin.setRegisteredWidgets({
      widgets: ['io.stencil.flux.TaskWidgetProvider'],
    })

    // Calculate pending tasks
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length

    // Get sections with background
    const sections = useSectionsStore.getState().sections
    const sectionsWithBg = sections.filter(s => s.bgImage || s.bgColor)

    // Get upcoming tasks (first 3 pending tasks)
    const upcomingTasks = tasks
      .filter((t) => t.status === 'pending')
      .slice(0, 3)
      .map((t) => t.title)

    // Set widget data
    await WidgetBridgePlugin.setItem({
      key: 'task_count',
      value: pendingTasks.toString(),
      group: 'widget_bridge_prefs',
    })

    await WidgetBridgePlugin.setItem({
      key: 'streak',
      value: currentStreak.toString(),
      group: 'widget_bridge_prefs',
    })

    await WidgetBridgePlugin.setItem({
      key: 'last_update',
      value: new Date().toISOString(),
      group: 'widget_bridge_prefs',
    })

    // Set sections data for background selection
    await WidgetBridgePlugin.setItem({
      key: 'sections',
      value: JSON.stringify(sectionsWithBg),
      group: 'widget_bridge_prefs',
    })

    // Set upcoming tasks for large widget
    await WidgetBridgePlugin.setItem({
      key: 'task_1',
      value: upcomingTasks[0] || '',
      group: 'widget_bridge_prefs',
    })

    await WidgetBridgePlugin.setItem({
      key: 'task_2',
      value: upcomingTasks[1] || '',
      group: 'widget_bridge_prefs',
    })

    await WidgetBridgePlugin.setItem({
      key: 'task_3',
      value: upcomingTasks[2] || '',
      group: 'widget_bridge_prefs',
    })

    // Reload widget timeline
    await WidgetBridgePlugin.reloadAllTimelines()
  } catch (error) {
    console.error('Error updating widget:', error)
  }
}
