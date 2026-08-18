package io.stencil.flux

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Color
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.*

class TaskWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            try {
                updateWidget(context, appWidgetManager, appWidgetId)
            } catch (e: Exception) {
                try {
                    val views = RemoteViews(context.packageName, R.layout.widget_fox_2x2)
                    views.setImageViewResource(R.id.widget_fox_image, R.drawable.fox_idle)
                    val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                    if (launchIntent != null) {
                        val pi = android.app.PendingIntent.getActivity(
                            context, appWidgetId, launchIntent,
                            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                        )
                        views.setOnClickPendingIntent(R.id.widget_root, pi)
                    }
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                } catch (_: Exception) {}
            }
        }
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
            val minW = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0)
            val minH = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0)

            val (layoutId, foxRes) = when {
                minW < 150 && minH < 100 -> R.layout.widget_fox_2x2 to getFoxResource(context)
                minW < 200 -> R.layout.widget_fox_2x1 to getFoxResource(context)
                minW < 300 -> R.layout.widget_fox_3x1 to getFoxResource(context)
                else -> R.layout.widget_fox_4x1 to getFoxResource(context)
            }

            val views = RemoteViews(context.packageName, layoutId)

            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (launchIntent != null) {
                val pi = android.app.PendingIntent.getActivity(
                    context, appWidgetId, launchIntent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_root, pi)
            }

            val prefs = context.getSharedPreferences("widget_bridge_prefs", Context.MODE_PRIVATE)
            val taskCount = prefs.getString("task_count", "0")?.toIntOrNull() ?: 0
            val streak = prefs.getString("streak", "0")?.toIntOrNull() ?: 0
            val lastUpdate = prefs.getString("last_update", "")

            if (foxRes != 0) {
                try { views.setImageViewResource(R.id.widget_fox_image, foxRes) } catch (_: Exception) {}
            }

            when (layoutId) {
                R.layout.widget_fox_2x2 -> {
                }
                R.layout.widget_fox_2x1 -> {
                    views.setTextViewText(R.id.widget_streak_small, "🔥 $streak")
                    views.setTextViewText(R.id.widget_task_count_small, "$taskCount pendientes")
                }
                R.layout.widget_fox_3x1 -> {
                    views.setTextViewText(R.id.widget_streak_small, "🔥 $streak")
                    views.setTextViewText(R.id.widget_task_count_small, "$taskCount pendientes")
                    val dateFormat = SimpleDateFormat("EEE d MMM", Locale("es"))
                    views.setTextViewText(R.id.widget_date, dateFormat.format(Date()))
                    showTasks(prefs, views, listOf(R.id.widget_task_1, R.id.widget_task_2, R.id.widget_task_3))
                }
                R.layout.widget_fox_4x1 -> {
                    views.setTextViewText(R.id.widget_streak_small, "🔥 $streak racha")
                    views.setTextViewText(R.id.widget_task_count_small, "$taskCount pendientes")
                    val dateFormat = SimpleDateFormat("EEE d MMM", Locale("es"))
                    views.setTextViewText(R.id.widget_date, dateFormat.format(Date()))
                    showTasks(prefs, views, listOf(R.id.widget_task_1, R.id.widget_task_2, R.id.widget_task_3, R.id.widget_task_4, R.id.widget_task_5))
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun showTasks(prefs: SharedPreferences, views: RemoteViews, ids: List<Int>) {
            for (i in ids.indices) {
                val task = prefs.getString("task_${i + 1}", "")
                val id = ids[i]
                if (!task.isNullOrEmpty()) {
                    views.setTextViewText(id, "• $task")
                    views.setViewVisibility(id, android.view.View.VISIBLE)
                } else {
                    views.setViewVisibility(id, android.view.View.GONE)
                }
            }
        }

        private fun getFoxResource(context: Context): Int {
            val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
            val prefs = context.getSharedPreferences("widget_bridge_prefs", Context.MODE_PRIVATE)
            val lastOpen = prefs.getString("last_update", "")
            val daysSince = if (lastOpen.isNotEmpty()) {
                try {
                    val diff = Date().time - SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(lastOpen)!!.time
                    (diff / (1000 * 60 * 60 * 24)).toInt()
                } catch (_: Exception) { 0 }
            } else 0

            if (daysSince >= 3) {
                return if (Calendar.getInstance().get(Calendar.DAY_OF_MONTH) % 2 == 0) R.drawable.fox_enojado else R.drawable.fox_llorando
            }

            return when {
                hour in 3..6 -> R.drawable.fox_cafe
                hour in 6..10 -> R.drawable.fox_estirandose
                hour in 10..14 -> R.drawable.fox_programando
                hour in 14..18 -> R.drawable.fox_reloj
                hour in 18..22 -> R.drawable.fox_traje
                else -> R.drawable.fox_saludo
            }
        }
    }
}
