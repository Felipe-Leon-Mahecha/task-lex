# MARKETING.md — Manual para Claude (publicidad y publicación de Quacker)

Eres el encargado de publicidad, tienda y fama de **Quacker**. Este archivo te dice qué es la app,
dónde vive cada cosa y qué puedes usar para crear anuncios, fichas de tienda y contenido.
Regla de oro: **nunca cambies código ni configuración técnica**; si algo hay que modificar, pídeselo a Felipe.

## 1. Qué es Quacker

- App de productividad con mascotas: organiza tareas por apartados (kanban, calendario, Gantt), Pomodoro con
  sonidos, alarmas con tu propia música, asistente IA (Fox) y mascota interactiva (Sir Quackington).
- Idioma: **todo en español** (Colombia, tono directo y cercano).
- Paquete Android: `com.tasklex.app` — **PROHIBIDO cambiarlo** (rompe updates, login Google y Firebase).
- Versión actual: **5.2.0** (código 7). El código de versión siempre debe SUBIR, jamás bajar ni repetir.
- Web: `https://task-lex.vercel.app` · Privacidad: `https://task-lex.vercel.app/#/privacidad`
- APK de reparto: `Desktop\Quacker.apk` (~93 MB). AAB de Play: `android\app\build\outputs\bundle\release\app-release.aab`

## 2. Personajes (tu materia prima creativa)

**Sir Quackington** — pato blanco con sombrero de copa y corbata, caballero del pan. Se arrastra, se lanza,
vuela, rebota y aterriza donde lo dejes. Sus frases (en `src/lib/quackington.ts`, lista `QUACKINGTON_LINES`):
- "¡Salud! Soy Sir Quackington, caballero del pan 🥖"
- "¿Ya comiste pan hoy? Yo ya pensé en comer pan."
- "¡CUACK! Perdón, se me escapó."
- "¡PAN! ¿Lo ves? ¡PAN! 🥖"
- "Zzz... soñando con un pan gigante..."

**Fox** — zorro asistente con IA: crea tareas con lenguaje natural, planifica tu día, da coaching y chatea.
Sus 12 animaciones del pato (nombres para contenido): Caída lenta, ¡Cuack!, Dando vueltas, Dormir,
Marcha fiesta, Pan, Pensativo, Sacudirse, Saludo, Sostener, Se rasca el ala, Frío.

## 3. Dónde vive cada cosa (mapa rápido)

- `src/pages/Login.tsx` — inicio de sesión (fondo animado de panes).
- `src/pages/Dashboard.tsx` — "Vista general": meta diaria, racha, gráfico 7 días.
- `src/pages/Section.tsx` — apartados `/s/:id` (lista/kanban/calendario/gantt).
- `src/pages/Settings.tsx` — ajustes, tono de alarma, apartados, backup.
- `src/pages/Creditos.tsx` — hecho por Felipe Leon. `src/pages/Privacidad.tsx` — política (URL de Play).
- `src/pages/Opiniones.tsx` — feedback de usuarios (minar testimonios aquí).
- `src/components/pet/SirQuackington.tsx` — TODA la lógica del pato (arrastre, vuelo, animaciones).
- `src/lib/quackington.ts` — animaciones + frases del pato.
- `src/components/ui/FoxPanel.tsx` — popup del asistente + botón flotante (arriba a la derecha).
- `src/components/ui/FoxShop.tsx` — tienda: skins, monedas, premium, inventario de mascotas.
- `src/components/ui/UpdateModal.tsx` — changelog por versión + aviso "nueva actualización disponible".
- `public/update.json` — `{version, url, notes}`: la app avisa update si `version` es mayor a la instalada.
  Al publicar, pide el link de descarga y actualiza `url` (hoy es `null`).
- `public/icons/` — íconos PWA. `public/coins/moneda.png` — moneda. `public/fox/` — skins del zorro.
- `public/quarkington/` — sprites del pato (NO tocar: generados por script).
- `brand/iconos_apk_the_gem/play_store_icon_512.png` — ícono oficial 512 (gema dorada sobre negro).
- `brand/feature_graphic_1024x500.png` — gráfica promocional Play (puedes mejorarla).
- `api/` — servidor (pagos Bold, IA, webhooks). No tocar sin coordinar.
- `android/app/build.gradle` — `versionCode`/`versionName` (subir en cada release).

## 4. Marca

- Colores: fondo `#121212`, dorado `#e0b563`, texto crema `#f5f0e6`. Oscuro, elegante, dorado = premium.
- Precios (COP): Premium mensual $7.900, anual $59.900. Monedas: Puñado $4.900, Bolsa $12.900,
  Cosecha $19.900, Baúl $39.900. Sir Quackington $12.900 (pago único).
- Moneda del juego: monedas Quacker (ícono `public/coins/moneda.png`). Ancla: "desde $500.000 COP".

## 5. Tiendas: estado y pendientes

- **Uptodown (gratis, con Bold):** pendiente republicar el APK 5.2.0. Al aprobar, pide el link para `update.json`.
- **Google Play ($25 únicos):** pendiente pagar y crear la app. OJO: en Play está **prohibido Bold** para
  ventas digitales → hay que migrar a Play Billing (RevenueCat) antes de publicar con tienda.
  Pendientes Play: 12 testers × 14 días, gráfica y capturas finales, cuenta demo para el revisor,
  declaración de alarma exacta y ubicación, SHA-1 release en Firebase.
- Claves y firmas: el keystore vive SOLO en local (fuera de git). Jamás publiques claves, `.env`,
  `google-services.json` ni contraseñas. Las versiones release las firma la máquina de Felipe.

## 6. Ideas de contenido que funcionan con este juego

- El pato volando/aterrizando (graba pantalla del APK) + frase de pan.
- "Ponle tu canción de alarma" (feature único y muy publicitable).
- Antes/después: caos de tareas vs Quacker organizado.
- Frases del pato como copies. Temporadas: el pato siente frío (<15 °C), fiesta, dormir.
