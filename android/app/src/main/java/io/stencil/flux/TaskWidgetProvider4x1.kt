package io.stencil.flux

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context

class TaskWidgetProvider4x1 : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            try { TaskWidgetProvider.updateWidget(context, appWidgetManager, appWidgetId) } catch (_: Exception) {}
        }
    }
}
