package com.tasklex.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import org.json.JSONArray;

@CapacitorPlugin(name = "QuackerWidget")
public class QuackerWidgetPlugin extends Plugin {
    @PluginMethod
    public void syncWidget(PluginCall call) {
        Context context = getContext();
        int pendingCount = Math.max(0, call.getInt("pendingCount", 0));
        String petName = call.getString("petName", "Tu mascota");
        String imageBase64 = call.getString("imageBase64", "");
        String tasksJson = call.getString("tasksJson", "[]");
        try {
            new JSONArray(tasksJson);
        } catch (Exception ignored) {
            tasksJson = "[]";
        }

        File imageFile = new File(context.getFilesDir(), "quacker_widget_pet.png");
        if (imageBase64 != null && !imageBase64.isEmpty()) {
            try {
                byte[] imageBytes = Base64.decode(imageBase64, Base64.DEFAULT);
                Bitmap bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
                if (bitmap != null) {
                    try (FileOutputStream output = new FileOutputStream(imageFile)) {
                        bitmap.compress(Bitmap.CompressFormat.PNG, 100, output);
                    }
                    bitmap.recycle();
                } else {
                    imageFile.delete();
                }
            } catch (Exception ignored) {
                imageFile.delete();
            }
        } else {
            imageFile.delete();
        }

        context.getSharedPreferences("quacker_widget", Context.MODE_PRIVATE)
                .edit()
                .putInt("pending_count", pendingCount)
                .putString("pet_name", petName)
                .putString("tasks_json", tasksJson)
                .apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, QuackerWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);
        if (ids.length > 0) {
            new QuackerWidgetProvider().onUpdate(context, manager, ids);
        }

        JSObject result = new JSObject();
        result.put("updated", ids.length > 0);
        call.resolve(result);
    }
}
