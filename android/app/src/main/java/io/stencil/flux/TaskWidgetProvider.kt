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
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context,
                            appWidgetManager: AppWidgetManager,
                            appWidgetId: Int) {
            // Get widget options to determine size
            val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
            val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0)
            val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0)

            // Choose layout based on size
            val layoutId = when {
                minWidth < 200 || minHeight < 150 -> R.layout.widget_task_small
                minWidth > 300 && minHeight > 200 -> R.layout.widget_task_large
                else -> R.layout.widget_task
            }

            val views = RemoteViews(context.packageName, layoutId)

            // Tap to open app
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (launchIntent != null) {
                val pendingIntent = android.app.PendingIntent.getActivity(
                    context, appWidgetId, launchIntent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
            }

            // Get shared preferences (same as capacitor-widget-bridge uses)
            val prefs = context.getSharedPreferences("widget_bridge_prefs", Context.MODE_PRIVATE)

            // Get task data
            val taskCount = prefs.getInt("task_count", 0)
            val streak = prefs.getInt("streak", 0)

            // Update views based on layout
            if (layoutId == R.layout.widget_task_small) {
                views.setTextViewText(R.id.widget_task_count_small, taskCount.toString())
                views.setTextViewText(R.id.widget_streak_small, "🔥 $streak")
            } else {
                views.setTextViewText(R.id.widget_task_count, "$taskCount tasks pending")
                views.setTextViewText(R.id.widget_streak, "🔥 $streak day streak")

                // Set date
                val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
                views.setTextViewText(R.id.widget_date, dateFormat.format(Date()))

                // For large layout, add upcoming tasks
                if (layoutId == R.layout.widget_task_large) {
                    val task1 = prefs.getString("task_1", "")
                    val task2 = prefs.getString("task_2", "")
                    val task3 = prefs.getString("task_3", "")

                    if (!task1.isNullOrEmpty()) {
                        views.setTextViewText(R.id.widget_task_1, "• $task1")
                        views.setViewVisibility(R.id.widget_task_1, android.view.View.VISIBLE)
                    } else {
                        views.setViewVisibility(R.id.widget_task_1, android.view.View.GONE)
                    }

                    if (!task2.isNullOrEmpty()) {
                        views.setTextViewText(R.id.widget_task_2, "• $task2")
                        views.setViewVisibility(R.id.widget_task_2, android.view.View.VISIBLE)
                    } else {
                        views.setViewVisibility(R.id.widget_task_2, android.view.View.GONE)
                    }

                    if (!task3.isNullOrEmpty()) {
                        views.setTextViewText(R.id.widget_task_3, "• $task3")
                        views.setViewVisibility(R.id.widget_task_3, android.view.View.VISIBLE)
                    } else {
                        views.setViewVisibility(R.id.widget_task_3, android.view.View.GONE)
                    }
                }

                // Handle daily random background from sections
                applyDailyBackground(context, prefs, views)
            }

            // Update widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun applyDailyBackground(context: Context, prefs: SharedPreferences, views: RemoteViews) {
            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            val lastDrawDate = prefs.getString("last_draw_date", "")
            val selectedSectionId = prefs.getString("selected_section_id", "")

            // If it's a new day or no selection, pick a random section
            if (lastDrawDate != today || selectedSectionId.isNullOrEmpty()) {
                val sectionsJson = prefs.getString("sections", "[]")
                val sectionsWithBg = parseSectionsWithBackground(sectionsJson)

                if (sectionsWithBg.isNotEmpty()) {
                    val randomSection = sectionsWithBg.random()
                    prefs.edit()
                        .putString("last_draw_date", today)
                        .putString("selected_section_id", randomSection.id)
                        .putString("selected_section_bg_type", randomSection.bgType)
                        .putString("selected_section_bg_value", randomSection.bgValue)
                        .apply()

                    applyBackground(context, views, randomSection.bgType, randomSection.bgValue)
                }
            } else {
                // Apply previously selected background
                val bgType = prefs.getString("selected_section_bg_type", "")
                val bgValue = prefs.getString("selected_section_bg_value", "")
                if (!bgType.isNullOrEmpty() && !bgValue.isNullOrEmpty()) {
                    applyBackground(context, views, bgType, bgValue)
                }
            }
        }

        private fun applyBackground(context: Context, views: RemoteViews, bgType: String, bgValue: String) {
            if (bgType == "image") {
                // Apply image background
                try {
                    val uri = android.net.Uri.parse(bgValue)
                    views.setImageViewUri(R.id.widget_bg_image, uri)
                    views.setViewVisibility(R.id.widget_bg_image, android.view.View.VISIBLE)
                    views.setViewVisibility(R.id.widget_scrim, android.view.View.VISIBLE)
                } catch (e: Exception) {
                    // If image fails, fall back to no background
                    views.setViewVisibility(R.id.widget_bg_image, android.view.View.GONE)
                    views.setViewVisibility(R.id.widget_scrim, android.view.View.GONE)
                }
            } else if (bgType == "color") {
                // Apply color background
                try {
                    val color = Color.parseColor(bgValue)
                    views.setInt(R.id.widget_bg_image, "setBackgroundColor", color)
                    views.setViewVisibility(R.id.widget_bg_image, android.view.View.VISIBLE)
                    views.setViewVisibility(R.id.widget_scrim, android.view.View.GONE)
                } catch (e: Exception) {
                    views.setViewVisibility(R.id.widget_bg_image, android.view.View.GONE)
                    views.setViewVisibility(R.id.widget_scrim, android.view.View.GONE)
                }
            }
        }

        private data class SectionWithBg(
            val id: String,
            val bgType: String,
            val bgValue: String
        )

        private fun parseSectionsWithBackground(sectionsJson: String?): List<SectionWithBg> {
            if (sectionsJson.isNullOrEmpty()) return emptyList()
            
            try {
                // Simple JSON parsing for sections array
                // Expected format: [{"id":"...","bgImage":"...","bgColor":"..."},...]
                val sections = mutableListOf<SectionWithBg>()
                val items = sectionsJson.split("},").map { it.trim() }
                
                for (item in items) {
                    val cleanItem = item.removePrefix("[").removeSuffix("]").removeSuffix("}")
                    val idMatch = "\"id\":\"([^\"]+)\"".toRegex().find(cleanItem)
                    val bgImageMatch = "\"bgImage\":\"([^\"]+)\"".toRegex().find(cleanItem)
                    val bgColorMatch = "\"bgColor\":\"([^\"]+)\"".toRegex().find(cleanItem)
                    
                    val id = idMatch?.groupValues?.get(1) ?: continue
                    val bgImage = bgImageMatch?.groupValues?.get(1)
                    val bgColor = bgColorMatch?.groupValues?.get(1)
                    
                    if (!bgImage.isNullOrEmpty()) {
                        sections.add(SectionWithBg(id, "image", bgImage))
                    } else if (!bgColor.isNullOrEmpty()) {
                        sections.add(SectionWithBg(id, "color", bgColor))
                    }
                }
                
                return sections
            } catch (e: Exception) {
                return emptyList()
            }
        }
    }
}
