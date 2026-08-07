# CLAUDE.md — Guía para trabajar en TASK LEX

App de gestión de tareas multiplataforma:
- **Web**: React 19 + Vite + TypeScript + Tailwind CSS v4 + PWA (desplegada en `https://task-lex.vercel.app`).
- **Android**: APK generado con Capacitor 8 (`android/`), login nativo de Google.
- **Backend**: Firebase (Auth + Firestore). Sincronización en tiempo real vía `onSnapshot`.

## Comandos

- Dev server: `npm run dev` (URL local que muestra Vite).
- Build web: `npm run build` (`tsc -b && vite build` → genera `dist/`).
- Typecheck: `npm run typecheck` (`tsc -b --noEmit`).
- Sincronizar a Android: `npx cap sync android` (copia `dist/` y plugins a `android/`).
- Compilar APK: en `android/` → `.\gradlew.bat assembleDebug` → APK en `android\app\build\outputs\apk\debug\app-debug.apk`.
- Entregar APK al usuario: copiarlo a `Desktop\TASK-LEX.apk`.
- Desplegar web: `npx vercel --prod --yes` (proyecto `felipe-leon-web-project/task-lex`).

## Reglas innegociables

1. **Todo el texto de la UI en español** (Colombia, tono directo y cercano).
2. **Cero comentarios en el código** a menos que se pidan explícitamente.
3. **No inventar colores/fuentes**: usar variables CSS de `src/styles/global.css` (ej: `var(--bg)`, `var(--surface)`, `var(--surface-2)`, `var(--text)`, `var(--text-muted)`, `var(--accent)`, `var(--border)`).
4. Iconos con **lucide-react**: `import { Nombre } from 'lucide-react'`.
5. Moneda en **COP**; precio ancla: `desde $500.000 COP`.
6. No hardcodear WhatsApp/email: config central en `src/lib/site.ts` (ver proyecto Felipe León Web Studio).
7. Dark mode: clase `.dark` en `<html>`; en estilos escopeados usar `:global(.dark)`.

## Cómo funciona el login (importante)

- **Web**: `signInWithPopup` (NO usar `signInWithRedirect`, rompe en móvil). Está en `src/store/auth.ts`.
- **APK**: login **nativo** con `@capacitor-firebase/authentication` (`skipNativeAuth: true`), luego `signInWithCredential` con el idToken para mantener una sola sesión JS. Config en `capacitor.config.ts`.
- El plugin nativo requiere `android/app/google-services.json` (ya está). Si se borra, el build nativo falla o la app crashea.
- Para cambios de consola (SHA-1, proveedores, dominio autorizado) ver sección Consolas abajo.

## Estructura de archivos

```
src/
  main.tsx                    → bootstrap de React + router
  App.tsx                     → layout raíz: Sidebar + Header + rutas + FocusMode + swipe
  styles/global.css           → variables CSS (colores del tema), base, utilidades
  types/task.ts               → tipos de tarea, SectionId, SectionMeta
  lib/
    firebase.ts               → init de Firebase (app, db, auth, analytics)
    sections.ts               → DEFAULT_SECTIONS (gem/uni/diario), iconos de sección, makeSectionId
    sync.ts                   → sincronización Firestore: onSnapshot por usuario + upload local batch
    taskDb.ts                 → operaciones Firestore por tarea (CRUD, meta de sección)
    backup.ts                 → exportar/importar datos completos (JSON) con secciones y temas
    session.ts                → persistencia de usuario en sesión
    notifications.ts          → solicitar permiso de notificaciones (web push), gateado por ajuste notificationsOn
    recurrence.ts             → reglas de repetición de tareas
    image.ts                  → utilidades de imágenes (compresión a dataURL)
    taskImages.ts             → subir/borrar fotos de tareas en Firebase Storage
    focusSounds.ts            → sonidos de foco sintetizados con Web Audio (ruido blanco, lluvia, violín, lo-fi)
    focusStats.ts             → historial de minutos de foco por día (localStorage)
    celebrate.ts              → confetti DOM al completar tarea / meta (respeta prefers-reduced-motion)
    progress.ts               → helper de tareas completadas hoy
  store/                      → estado global con zustand (todo con persistencia en localStorage)
    auth.ts                   → usuario, login correo/password, login Google, signOut, init()
    sections.ts               → apartados (secciones) del usuario: add/remove/rename/reorder + sync
    tasks.ts                  → tareas: CRUD, orden, deleteTasksBySection, updateTask (borra fotos remotas)
    settings.ts               → preferencias: meta diaria, minutos de foco/descanso, notificaciones on/off
    theme.ts                  → temas de apartado (colores por sección)
    ui.ts                     → UI: sidebar, views por sección, focusOpen
    tutorial.ts               → control del tutorial con spotlight (localStorage task-lex-tutorial)
  pages/
    Login.tsx                 → pantalla de login (correo/password + botón Google)
    Dashboard.tsx             → resumen: Hoy/Semana/Foco, Meta diaria, racha, gráfico 7 días + minutos de foco
    Section.tsx               → vista de un apartado: tabs (lista/kanban/calendario/gantt) + filtros + duplicar/mover
    Settings.tsx              → ajustes: preferencias (meta, pomodoro, notificaciones), apartados, backup
    Archive.tsx               → archivo de tareas completadas
    Credits.tsx               → /creditos (Hecho por Felipe Leon, enlace a Felipe León Web Studio)
  components/
    layout/
      Header.tsx              → barra superior: menú, SearchBox, status, logout, botón foco (reloj)
      Sidebar.tsx             → panel lateral con apartados temáticos, drag & drop, "+ Nuevo apartado", link créditos
      SearchBox.tsx           → buscador global (input id="tasklex-search", atajo "/")
      NewSectionModal.tsx     → modal para crear apartado (nombre + icono)
      SectionShell.tsx        → envoltorio de sección
    views/
      BoardView.tsx           → vista tablero (kanban) con mover/duplicar
      ListView.tsx            → vista lista
      CalendarView.tsx        → vista calendario
      GanttView.tsx           → vista gantt de 14 días
    task/
      TaskCard.tsx            → tarjeta de tarea (chips, fotos con lightbox, duplicar, mover)
      TaskForm.tsx            → formulario crear/editar tarea (+ subir fotos)
      MoveTaskModal.tsx       → modal "Mover tarea a otro apartado"
      PomodoroTimer.tsx       → temporizador Pomodoro embebido (usa preferencias)
      ThemeEditor.tsx         → editor de tema/colores de apartado
    ui/
      Modal.tsx               → modal genérico
      FocusMode.tsx           → pantalla de foco a pantalla completa (Pomodoro + sonidos de foco)
      Tutorial.tsx            → guía interactiva con spotlight (6 pasos)
```

## Rutas

- `/` → Dashboard
- `/s/:id` → apartado (ej: `/s/gem`, `/s/uni`, `/s/diario`)
- `/archivo`, `/ajustes`, `/creditos`
- Redirects legacy: `/gem|uni|diario` → `/s/:id`

## Atajos de teclado (escritorio)

- `/` → enfoca el buscador global.
- `n` → abre "Nueva tarea" en el apartado actual (evento `tasklex:new-task`; se ignoran si estás escribiendo o el modo foco está abierto).

## Fotos en tareas

- Se suben a Firebase Storage: `users/{uid}/images/{uuid}.jpg` (se comprimen con `compressImage` antes de subir). La URL se guarda en `task.images: string[]`.
- En modo demo/local (sin Firebase) se guarda el dataURL directamente.
- Se borran del storage al eliminar la tarea o quitar la foto (best-effort).

## Diseño

- Tokens de color en `src/styles/global.css` bajo `:root` y `.dark` (variables `--bg`, `--surface`, `--text`, `--accent`, `--border`, etc.).
- Tailwind v4 vía `@tailwindcss/vite`; clases utilitarias + variables CSS.
- Dark mode con clase `.dark` en `<html>`.
- Mobile-first: sidebar oculto en móvil (drawer con swipe desde el borde izquierdo, `x0 <= 40`).

## Consolas (pasos manuales ya hechos)

- **Firebase Console** (`console.firebase.google.com` → proyecto `task-lex`):
  - Auth → Sign-in method: Google habilitado. Correo/contraseña habilitado.
  - Auth → Settings → Authorized domains: incluye `task-lex.vercel.app`.
  - App Android `com.tasklex.app` registrada con SHA-1 de debug: `D3:16:6F:F2:4D:06:C1:ED:57:C4:0E:64:56:0F:BC:EE:C0:66:B6:D9`.
- **Google Cloud Console** (`console.cloud.google.com`):
  - OAuth consent screen: publicada (si vuelve a "Testing", el login Google nativo falla con error 10).
  - Credentials: Android OAuth client de `com.tasklex.app` con el SHA-1 arriba; Web client `21280472956-pgco4t4g26pb41thrf61afiic38bd0gk.apps.googleusercontent.com`.

## Gotchas

- `signInWithRedirect` en Firebase web rompe en móvil/WebView (error "missing initial state"). Usar solo popup (web) y nativo (APK).
- El login nativo del APK usa el flujo clásico `useCredentialManager: false` (la Credential Manager API falló en el dispositivo del usuario con error 10 al seleccionar cuenta... verificado: el error 10 era de consola, resuelto).
- Si un usuario creó su cuenta en web con correo/contraseña, al entrar con Google será un usuario Firestore distinto (sin sus tareas). Vincular cuentas si es necesario.
- `dist/` se regenera con `npm run build`; `npx cap sync android` copia web assets al APK. El APK debe recompilarse con gradle tras cualquier cambio.
- PWA con `vite-plugin-pwa`; los íconos viven en `public/icons/` (ícono: gema dorada sobre negro, desde `brand/iconos_apk_the_gem/`).
