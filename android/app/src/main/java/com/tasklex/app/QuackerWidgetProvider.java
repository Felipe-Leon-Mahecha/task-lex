package com.tasklex.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class QuackerWidgetProvider extends AppWidgetProvider {
    private static final String PREFS = "quacker_widget";
    private static final String TASKS_JSON = "tasks_json";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) updateWidget(context, manager, id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, manager, appWidgetId, newOptions);
        updateWidget(context, manager, appWidgetId);
    }

    private void updateWidget(Context context, AppWidgetManager manager, int id) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quacker);
        android.content.SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int count = prefs.getInt("pending_count", 0);
        String petName = prefs.getString("pet_name", "Tu mascota");
        List<WidgetTask> tasks = readTasks(prefs.getString(TASKS_JSON, "[]"));
        Bundle options = manager.getAppWidgetOptions(id);
        int minWidth = options == null ? 0 : options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int minHeight = options == null ? 0 : options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);
        boolean compact = minWidth > 0 && (minWidth < 180 || minHeight < 108);
        boolean expanded = options != null
                && minWidth >= 250
                && minHeight >= 130
                && !compact
                && !tasks.isEmpty();

        views.setTextViewText(R.id.widget_count, count > 99 ? "99+" : String.valueOf(count));
        views.setTextViewText(R.id.widget_pet_name, petName);
        views.setTextViewText(R.id.widget_pending_summary, count == 0
                ? "Hoy no tienes pendientes"
                : count == 1 ? "1 tarea pendiente" : count + " tareas pendientes");

        File imageFile = new File(context.getFilesDir(), "quacker_widget_pet.png");
        Bitmap bitmap = BitmapFactory.decodeFile(imageFile.getAbsolutePath());
        if (bitmap != null) {
            views.setImageViewBitmap(R.id.widget_pet_image, bitmap);
        } else {
            views.setImageViewResource(R.id.widget_pet_image, R.mipmap.ic_launcher);
        }
        views.setContentDescription(R.id.widget_pet_image, petName);
        views.setContentDescription(R.id.widget_root, petName + ", " + count + (count == 1 ? " tarea pendiente" : " tareas pendientes"));

        Intent dashboardIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("flux://dashboard"), context, MainActivity.class);
        dashboardIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent dashboardClick = PendingIntent.getActivity(context, 0, dashboardIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, dashboardClick);

        if (tasks.isEmpty()) {
            views.setViewVisibility(R.id.widget_next_group, View.GONE);
            views.setViewVisibility(R.id.widget_expanded_tasks, View.GONE);
            views.setViewVisibility(R.id.widget_empty_group, compact ? View.GONE : View.VISIBLE);
            if (compact) views.setTextViewText(R.id.widget_pending_summary, "Todo listo por ahora");
        } else {
            views.setViewVisibility(R.id.widget_empty_group, View.GONE);
            if (compact) {
                views.setTextViewText(R.id.widget_pending_summary, tasks.get(0).title);
                views.setViewVisibility(R.id.widget_next_group, View.GONE);
                views.setViewVisibility(R.id.widget_expanded_tasks, View.GONE);
                views.setOnClickPendingIntent(R.id.widget_pending_summary, taskIntent(context, tasks.get(0)));
            } else if (expanded) {
                views.setViewVisibility(R.id.widget_next_group, View.GONE);
                views.setViewVisibility(R.id.widget_expanded_tasks, View.VISIBLE);
                bindTaskRow(context, views, tasks, 0, R.id.widget_task_row_1, R.id.widget_task_title_1, R.id.widget_task_when_1);
                bindTaskRow(context, views, tasks, 1, R.id.widget_task_row_2, R.id.widget_task_title_2, R.id.widget_task_when_2);
                bindTaskRow(context, views, tasks, 2, R.id.widget_task_row_3, R.id.widget_task_title_3, R.id.widget_task_when_3);
            } else {
                views.setViewVisibility(R.id.widget_next_group, View.VISIBLE);
                views.setViewVisibility(R.id.widget_expanded_tasks, View.GONE);
                WidgetTask next = tasks.get(0);
                views.setTextViewText(R.id.widget_next_title, next.title);
                views.setTextViewText(R.id.widget_next_when, next.when.isEmpty() ? next.section : next.when);
                views.setOnClickPendingIntent(R.id.widget_next_group, taskIntent(context, next));
            }
        }

        manager.updateAppWidget(id, views);
        if (bitmap != null) bitmap.recycle();
    }

    private void bindTaskRow(Context context, RemoteViews views, List<WidgetTask> tasks, int index,
                             int rowId, int titleId, int whenId) {
        if (index >= tasks.size()) {
            views.setViewVisibility(rowId, View.GONE);
            return;
        }
        WidgetTask task = tasks.get(index);
        views.setViewVisibility(rowId, View.VISIBLE);
        views.setTextViewText(titleId, task.title);
        views.setTextViewText(whenId, task.when.isEmpty() ? task.section : task.when);
        views.setOnClickPendingIntent(rowId, taskIntent(context, task));
    }

    private PendingIntent taskIntent(Context context, WidgetTask task) {
        Uri uri = Uri.parse("flux://task")
                .buildUpon()
                .appendQueryParameter("id", task.id)
                .appendQueryParameter("sectionId", task.sectionId)
                .build();
        Intent intent = new Intent(Intent.ACTION_VIEW, uri, context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(context, task.id.hashCode(), intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private List<WidgetTask> readTasks(String json) {
        List<WidgetTask> result = new ArrayList<>();
        try {
            JSONArray array = new JSONArray(json);
            for (int i = 0; i < array.length() && i < 3; i++) {
                JSONObject item = array.optJSONObject(i);
                if (item == null) continue;
                String id = item.optString("id", "");
                String title = item.optString("title", "").trim();
                if (id.isEmpty() || title.isEmpty()) continue;
                result.add(new WidgetTask(id, title, item.optString("sectionId", ""),
                        item.optString("section", ""), item.optString("when", "")));
            }
        } catch (Exception ignored) {
            return result;
        }
        return result;
    }

    public static void refresh(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, QuackerWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);
        if (ids.length > 0) new QuackerWidgetProvider().onUpdate(context, manager, ids);
    }

    private static final class WidgetTask {
        final String id;
        final String title;
        final String sectionId;
        final String section;
        final String when;

        WidgetTask(String id, String title, String sectionId, String section, String when) {
            this.id = id;
            this.title = title;
            this.sectionId = sectionId;
            this.section = section;
            this.when = when;
        }
    }
}
