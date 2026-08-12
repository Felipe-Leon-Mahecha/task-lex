# Flux

Gestor de tareas moderno, en español, para Android y web. Organiza tu día con apartados (listas), prioridades, subtareas, recordatorios, repeticiones y un temporizador de enfoque estilo Pomodoro — todo sincronizado en la nube con Firebase.

## Características

- **Apartados personalizables**: crea listas con ícono y tema de color propio (trabajo, universidad, diario…).
- **Tareas completas**: prioridad, fecha de vencimiento, subtareas, repetición (diaria/semanal/mensual), recordatorios con notificación local y hasta 2 fotos por tarea.
- **Vistas**: lista, tablero (kanban), calendario y Gantt.
- **Foco**: temporizador Pomodoro con ajustes (objetivo diario, duración, pausa corta) y estadísticas de minutos enfocados por día.
- **Sincronización en la nube**: tareas, apartados, temas, ajustes y minutos de foco se guardan en Firestore por usuario; funciona con Google Sign-In.
- **Notificaciones locales** con ícono personalizado (Android).
- **Racha y progreso** en el Dashboard, modo oscuro, archivo de tareas completadas y reseñas integradas.

## Tecnologías

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zustand](https://zustand-docs.pmnd.rs/) (estado global)
- [Firebase](https://firebase.google.com/) (Auth con Google + Firestore)
- [Capacitor](https://capacitorjs.com/) (APK Android) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (PWA)

## Requisitos previos

- Node.js 20+ y npm
- Cuenta de Firebase con proyecto configurado: **Authentication** (Google) y **Firestore**.
- (Opcional) Android Studio / JDK 17+ para compilar el APK.

## Configuración

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea el archivo `.env` a partir de `.env.example` con los valores de tu proyecto de Firebase:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```

3. Reglas de Firestore (usuarios solo acceden a sus propios datos):

   ```
   users/{uid}/{doc=**} : permite lectura/escritura solo si request.auth.uid == uid
   ```

## Ejecutar

```bash
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run typecheck  # chequeo de tipos (0 errores)
npm run build      # build de producción (PWA incluida)
npm run preview    # previsualizar el build
```

## Compilar el APK de Android

```bash
npm run build
npx cap sync android
cd android && ./gradlew.bat assembleDebug
```

El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

> Nota: `android/app/google-services.json` y `.env` no están versionados; cópialos de tu entorno local al clonar.

## Despliegue web

El sitio se despliega en Vercel:

```bash
npx vercel --prod --yes
```

## Estructura

```
src/
  pages/          → rutas (Login, Dashboard, Section, Settings, Archive, Credits, Opiniones)
  components/     → UI, layout, tareas y vistas
  lib/            → Firebase, sync, tareas, foco, notificaciones, imágenes, reseñas
  store/          → stores de Zustand (auth, tasks, sections, theme, settings, ui)
  styles/         → design system global
android/          → proyecto Capacitor/Android
```

## Licencia

Código privado de ASCEND. Todos los derechos reservados.
