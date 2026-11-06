package com.tasklex.app;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "ApkInstaller")
public class ApkInstallerPlugin extends Plugin {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private volatile boolean cancelled = false;

    @PluginMethod
    public void canInstallUnknownApps(PluginCall call) {
        JSObject result = new JSObject();
        result.put("allowed", Build.VERSION.SDK_INT < Build.VERSION_CODES.O || getContext().getPackageManager().canRequestPackageInstalls());
        call.resolve(result);
    }

    @PluginMethod
    public void openInstallPermissionSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            JSObject result = new JSObject();
            result.put("opened", false);
            call.resolve(result);
            return;
        }
        try {
            Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject result = new JSObject();
            result.put("opened", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("No se pudo abrir el permiso de instalación.", e);
        }
    }

    @PluginMethod
    public void downloadApk(PluginCall call) {
        final String urlText = call.getString("url", "");
        final String expectedHash = call.getString("sha256", "").toLowerCase(Locale.ROOT);
        final String version = call.getString("version", "update").replaceAll("[^0-9A-Za-z._-]", "_");
        final Uri uri;
        try {
            uri = Uri.parse(urlText);
            String host = uri.getHost();
            if (!"https".equalsIgnoreCase(uri.getScheme()) || host == null ||
                !(host.equalsIgnoreCase("firebasestorage.googleapis.com") || host.equalsIgnoreCase("storage.googleapis.com") || host.equalsIgnoreCase("github.com"))) {
                call.reject("El enlace de descarga no es un origen seguro.");
                return;
            }
            if (!expectedHash.matches("[a-f0-9]{64}")) {
                call.reject("Falta la huella SHA-256 válida del APK.");
                return;
            }
        } catch (Exception e) {
            call.reject("El enlace de descarga no es válido.", e);
            return;
        }

        cancelled = false;
        executor.execute(() -> {
            FileOutputStream output = null;
            InputStream input = null;
            HttpURLConnection connection = null;
            try {
                File directory = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (directory == null) throw new Exception("No hay almacenamiento disponible.");
                if (!directory.exists() && !directory.mkdirs()) throw new Exception("No se pudo preparar la descarga.");
                File apk = new File(directory, "quacker-update-" + version + ".apk");

                connection = (HttpURLConnection) new URL(urlText).openConnection();
                connection.setConnectTimeout(20000);
                connection.setReadTimeout(30000);
                connection.setInstanceFollowRedirects(true);
                connection.setRequestProperty("User-Agent", "Quacker-Android-Updater");
                int status = connection.getResponseCode();
                if (status < 200 || status >= 300) throw new Exception("El servidor respondió " + status + ".");
                long total = connection.getContentLengthLong();
                input = connection.getInputStream();
                output = new FileOutputStream(apk, false);
                byte[] buffer = new byte[64 * 1024];
                long downloaded = 0;
                int read;
                long lastEvent = 0;
                while ((read = input.read(buffer)) != -1) {
                    if (cancelled) throw new Exception("Descarga cancelada.");
                    output.write(buffer, 0, read);
                    downloaded += read;
                    long now = System.currentTimeMillis();
                    if (now - lastEvent > 160 || downloaded == total) {
                        JSObject progress = new JSObject();
                        progress.put("downloaded", downloaded);
                        progress.put("total", total);
                        notifyListeners("downloadProgress", progress);
                        lastEvent = now;
                    }
                }
                output.flush();
                output.close();
                output = null;
                input.close();
                input = null;

                String actualHash = sha256(apk);
                if (!expectedHash.equals(actualHash)) {
                    apk.delete();
                    throw new Exception("La descarga no pasó la verificación de seguridad.");
                }
                JSObject result = new JSObject();
                result.put("path", apk.getAbsolutePath());
                result.put("bytes", apk.length());
                call.resolve(result);
            } catch (Exception e) {
                call.reject(e.getMessage() == null ? "No se pudo descargar la actualización." : e.getMessage(), e);
            } finally {
                try { if (output != null) output.close(); } catch (Exception ignored) {}
                try { if (input != null) input.close(); } catch (Exception ignored) {}
                if (connection != null) connection.disconnect();
            }
        });
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        String path = call.getString("path", "");
        try {
            File apk = new File(path).getCanonicalFile();
            File allowedDirectory = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS).getCanonicalFile();
            if (!apk.getPath().startsWith(allowedDirectory.getPath() + File.separator) || !apk.isFile() || !apk.getName().endsWith(".apk")) {
                call.reject("El archivo de instalación no es válido.");
                return;
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
                call.reject("Concede a Quacker permiso para instalar esta actualización.");
                return;
            }
            Uri contentUri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(contentUri, "application/vnd.android.package-archive");
            install.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getContext().startActivity(install);
            call.resolve();
        } catch (Exception e) {
            call.reject("Android no pudo abrir el instalador. Puedes abrir el APK descargado desde Archivos.", e);
        }
    }

    private static String sha256(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        InputStream input = new java.io.FileInputStream(file);
        try {
            byte[] buffer = new byte[64 * 1024];
            int read;
            while ((read = input.read(buffer)) != -1) digest.update(buffer, 0, read);
        } finally { input.close(); }
        byte[] bytes = digest.digest();
        StringBuilder hex = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) hex.append(String.format(Locale.ROOT, "%02x", value & 0xff));
        return hex.toString();
    }
}
