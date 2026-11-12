# Quacker

Gestor de tareas en español (Colombia) para **web y Android**, con mascotas interactivas, asistente con
inteligencia artificial, alarmas con tu propia música y sincronización en la nube con Firebase.

- Web PWA: `https://task-lex.vercel.app` (privacidad: `/privacidad`)
- Android: APK con Capacitor (`com.tasklex.app`), login nativo de Google
- Versión actual: **5.2.19** (la versión vive en `package.json` y alimenta `APP_VERSION`, el modal de
  novedades y el aviso de actualización vía `public/update.json`)

## Qué tiene y para qué sirve cada cosa

**Tareas y apartados.** Crea tareas con título, descripción, prioridad, fecha, subtareas, repetición
(diaria/semanal/mensual), etiquetas y hasta 2 fotos. Organízalas en apartados temáticos con ícono y
colores propios (trabajo, universidad, diario…). Cada apartado se ve en 4 vistas: lista, kanban,
calendario y Gantt de 14 días, con filtros, duplicar y mover entre apartados.

**Avisos.** Al programar una tarea eliges tipo de aviso: notificación, **alarma** (suena fuerte, vibra y
queda fija hasta tocarla), ambas o ninguna. Desde Ajustes puedes subir tu canción como tono de alarma;
si suena con la app abierta verás una pantalla de alarma con opciones de completar, posponer 10 min o
silenciar. También hay recordatorios diarios configurables (1 a 5 al día).

**Foco Pomodoro.** Temporizador con minutos de foco/descanso configurables, sonidos ambiente sintetizados
(lluvia, violín, lo-fi, ruido blanco), modo foco a pantalla completa y estadísticas de minutos por día,
racha y meta diaria en el Dashboard ("Vista general").

**Fox, el asistente IA.** Botón flotante (arriba a la derecha) que abre el popup: crea tareas con lenguaje
natural o voz, planifica tu día, desglosa tareas grandes, hace check-in de energía, da coaching y chatea
sobre tus pendientes. Gratis en modo básico; completo con Quacker Premium.

**Tienda Quacker Premium.** Skins del zorro (rotación diaria + packs de temporada), monedas por completar
tareas y sesiones de foco (con topes diarios anti-farma), 13 logros con recompensas, inventario de mascotas
(Fox / Sir Quackington) y paquetes con Bold: monedas, premium mensual ($7.900) y anual ($59.900), y la
mascota ($12.900). La compra del pato persiste en la nube y el gateo premium se verifica en el servidor.

**Sir Quackington.** Pato mascota con vida propia: 12 animaciones (saluda, come pan, duerme, baila, se
sacude, siente frío…), frases con personalidad, animaciones ambiente aleatorias sin repetición y modo
pensativo mientras el asistente trabaja. Se puede **agarrar, arrastrar y lanzar**: vuela con gravedad,
rebota en los bordes, se espeja según la dirección y aterriza en su plataforma abajo de la pantalla,
donde se queda hasta que lo muevas (al abrir la app siempre sale de su sitio).

**Extras.** Tutorial interactivo con spotlight, copias automáticas en la nube (con historial) y exportación manual en JSON, sincronización con
Google Calendar, modo offline con cola de sincronización, archivo de completadas, estadísticas, opiniones,
créditos, tema claro/oscuro y temas de colores por apartado, modal de novedades por versión y aviso
automático de actualización disponible.

**Inicio de sesión.** Pantalla renovada con fondo canvas de física real (panes, huellas y anillos que
flotan, chocan con rebote elástico y brillan al impacto), frases y datos curiosos de patos ("Quack-tips"),
Google + correo/contraseña. Muestra el último tema usado en el dispositivo; cada cuenta conserva el suyo
y los datos nunca se mezclan (recarga limpia al cambiar de cuenta).

## Tecnologías

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) + variables CSS propias (`src/styles/global.css`)
- [Zustand](https://zustand.docs.pmnd.rs/) con persistencia (estado global)
- [Firebase](https://firebase.google.com/) (Auth + Firestore + Storage + Analytics)
- [Capacitor 8](https://capacitorjs.com/) (APK) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (PWA)
- IA: Gemini vía endpoints serverless en `api/` · Pagos: Bold (web/Uptodown; Play Store usará Play Billing)

## Comandos

```bash
npm run dev          # desarrollo (URL local de Vite)
npm run typecheck    # tsc -b --noEmit (0 errores antes de entregar)
npm run build        # tsc -b && vite build → dist/
npx vercel --prod --yes --archive=tgz   # desplegar web a task-lex.vercel.app
npx cap sync android # copiar dist/ + plugins a android/
cd android && .\gradlew.bat clean assembleDebug   # APK debug (siempre con clean)
.\gradlew.bat clean bundleRelease                 # AAB release (requiere vars FLUX_*)
```

Entregable Android: copiar `android\app\build\outputs\apk\debug\app-debug.apk` a `Desktop\Quacker.apk`
(desinstalar el viejo antes de instalar). El AAB release va a `.../bundle/release/app-release.aab`.

## Estructura

```
src/
  main.tsx                 → bootstrap (router HashRouter, ErrorBoundary, init)
  App.tsx                  → layout: Sidebar + Header + rutas + modales globales + watcher de alarmas
  pages/                   → Login, Dashboard, Section (/s/:id), Archive, Settings, Opiniones,
                             Stats, Credits, Privacidad
  components/pet/          → SirQuackington.tsx (toda la mascota: drag, vuelo, sheets, ambient)
  components/ui/           → FoxPanel (asistente), FoxShop (tienda), AlarmOverlay, UpdateModal,
                             FocusMode, Tutorial, ThemeSelector, Modal, Toast
  components/task|views|layout → TaskCard, TaskForm, List/Board/Calendar/Gantt, Header, Sidebar…
  lib/                     → firebase, sync, taskDb, tasks, sections, quackington (anims+frases),
                             foxAi/ai (cliente IA), notifications (avisos+alarmas+tono), backup,
                             focusSounds/Stats, celebrate, themes, appInfo (versión)
  store/                   → auth, tasks, sections, settings (tema+tono), theme, foxSkins
                             (monedas/premium/mascota), ui, tutorial, offline
  styles/global.css        → tokens --bg/--surface/--text/--accent/--border + keyframes
public/                    → icons/, quarkington/ (sprites generados), coins/, update.json
api/                       → fox.mjs, parse-task.mjs (IA con gateo), checkout/verify/webhook
                             (Bold), referral.ts (referidos)
android/                   → proyecto Capacitor (applicationId com.tasklex.app, versionCode 25)
brand/                     → iconos APK/gema + feature_graphic_1024x500.png
```

## Configuración y consolas (sin secretos en el repo)

- `.env` local con `VITE_FIREBASE_*` (ver `.env.example`); `google-services.json` en `android/app/`.
- Firebase Console (proyecto `task-lex`): Auth Google + correo, dominios autorizados, huellas SHA-1
  debug y release en la app Android, reglas Firestore por usuario.
- Firma release: `flux-release.keystore` (solo local, fuera de git) + variables de entorno
  `FLUX_KEYSTORE_PASSWORD`, `FLUX_KEY_ALIAS`, `FLUX_KEY_PASSWORD` + backup del keystore en USB/nube.
- Reglas de publicación: Play exige Play Billing para ventas digitales (Bold solo fuera de Play),
  política de privacidad publicada, Data Safety, 12 testers × 14 días y gráfica 1024×500.

## Reglas del proyecto

Todo el texto de UI en español, cero comentarios en el código salvo pedido explícito, colores solo de
`global.css`, iconos `lucide-react`, moneda COP. Ver `CLAUDE.md` (guía de desarrollo) y `MARKETING.md`
(guía de publicidad y tiendas).

## Licencia

Código privado de ASCEND Studio. Todos los derechos reservados.
