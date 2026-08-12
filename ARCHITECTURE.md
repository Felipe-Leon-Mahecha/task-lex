# Documentación de Archivos - Flux

Este documento describe dónde vive cada componente principal de la aplicación Flux.

## 📱 Pantallas y Vistas

- **Dashboard (Pantalla principal)**: `src/pages/Dashboard.tsx`
- **Section (Vista de sección con tareas)**: `src/pages/Section.tsx`
- **Settings (Ajustes)**: `src/pages/Settings.tsx`
- **Stats (Estadísticas)**: `src/pages/Stats.tsx`
- **Archive (Archivo)**: `src/pages/Archive.tsx`
- **Credits (Créditos)**: `src/pages/Credits.tsx`
- **Opiniones (Opiniones)**: `src/pages/Opiniones.tsx`
- **Login (Inicio de sesión)**: `src/pages/Login.tsx`

## 🎨 Componentes UI

- **SplashScreen (Pantalla de carga)**: `src/components/ui/SplashScreen.tsx`
- **UpdateModal (Popup de actualización)**: `src/components/ui/UpdateModal.tsx`
- **Toast (Notificaciones toast)**: `src/components/ui/Toast.tsx`
- **Modal (Modal genérico)**: `src/components/ui/Modal.tsx`
- **FocusMode (Modo foco)**: `src/components/ui/FocusMode.tsx`
- **Tutorial (Tutorial de la app)**: `src/components/ui/Tutorial.tsx`
- **ThemeSelector (Selector de temas)**: `src/components/ui/ThemeSelector.tsx`
- **DateTimePicker (Selector de fecha/hora)**: `src/components/ui/DateTimePicker.tsx`
- **Select (Select genérico)**: `src/components/ui/Select.tsx`

## 📋 Componentes de Tareas

- **TaskCard (Tarjeta de tarea individual)**: `src/components/task/TaskCard.tsx`
- **TaskForm (Formulario de tarea)**: `src/components/task/TaskForm.tsx`
- **MoveTaskModal (Modal para mover tarea)**: `src/components/task/MoveTaskModal.tsx`

## 📊 Vistas de Tareas

- **ListView (Vista de lista)**: `src/components/views/ListView.tsx`
- **BoardView (Vista Kanban)**: `src/components/views/BoardView.tsx`
- **CalendarView (Vista calendario)**: `src/components/views/CalendarView.tsx`
- **GanttView (Vista Gantt)**: `src/components/views/GanttView.tsx`

## 🏗️ Layout

- **Sidebar (Barra lateral)**: `src/components/layout/Sidebar.tsx`
- **Header (Encabezado)**: `src/components/layout/Header.tsx`
- **NewSectionModal (Modal para nueva sección)**: `src/components/layout/NewSectionModal.tsx`

## 🗄️ Stores (Estado Global)

- **Tasks Store (Tareas)**: `src/store/tasks.ts`
- **Sections Store (Secciones)**: `src/store/sections.ts`
- **Settings Store (Ajustes)**: `src/store/settings.ts`
- **Auth Store (Autenticación)**: `src/store/auth.ts`
- **UI Store (Estado de UI)**: `src/store/ui.ts`
- **Theme Store (Temas)**: `src/store/theme.ts`
- **Offline Store (Estado offline)**: `src/store/offline.ts`
- **Tutorial Store (Tutorial)**: `src/store/tutorial.ts`
- **Undo Store (Deshacer)**: `src/store/undo.ts`

## 🔧 Utilidades y Librerías

- **backup.ts (Backup automático)**: `src/lib/backup.ts`
- **haptics.ts (Haptic feedback)**: `src/lib/haptics.ts`
- **share.ts (Compartir tareas)**: `src/lib/share.ts`
- **voice.ts (Input de voz)**: `src/lib/voice.ts`
- **notifications.ts (Notificaciones)**: `src/lib/notifications.ts`
- **themes.ts (Gestión de temas)**: `src/lib/themes.ts`
- **tasks.ts (Lógica de tareas)**: `src/lib/tasks.ts`
- **session.ts (Sesión de usuario)**: `src/lib/session.ts`
- **appInfo.ts (Info de la app)**: `src/lib/appInfo.ts`
- **widget.ts (Widget)**: `src/lib/widget.ts`
- **sections.ts (Secciones)**: `src/lib/sections.ts`
- **taskImages.ts (Imágenes de tareas)**: `src/lib/taskImages.ts`
- **image.ts (Utilidades de imagen)**: `src/lib/image.ts`

## 📝 Tipos

- **task.ts (Tipos de tarea)**: `src/types/task.ts`

## 🚀 Archivos de Configuración

- **package.json (Dependencias y scripts)**: `package.json`
- **vite.config.ts (Configuración de Vite)**: `vite.config.ts`
- **tsconfig.json (Configuración de TypeScript)**: `tsconfig.json`
- **capacitor.config.ts (Configuración de Capacitor)**: `capacitor.config.ts`

## 🎯 Rutas Principales

- **App.tsx (Componente principal)**: `src/App.tsx`
- **main.tsx (Punto de entrada)**: `src/main.tsx`

## 📁 Estructura de Carpetas

```
src/
├── components/
│   ├── layout/          # Componentes de layout (Sidebar, Header)
│   ├── task/            # Componentes específicos de tareas
│   ├── ui/              # Componentes UI genéricos
│   └── views/           # Vistas de tareas (Lista, Kanban, etc.)
├── lib/                # Utilidades y funciones auxiliares
├── pages/              # Páginas principales de la app
├── store/              # Zustand stores para estado global
├── types/              # Definiciones de tipos TypeScript
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

## 🔄 Flujo de Datos

1. **Usuario interactúa** → Componentes UI/Task
2. **Componente llama** → Store (Zustand)
3. **Store actualiza** → Estado global
4. **Componentes re-renderizan** → Con nuevo estado
5. **Efectos secundarios** → Librerías (backup, notificaciones, etc.)

## 📦 Plugins Capacitor

- **@capacitor/haptics** - Haptic feedback
- **@capacitor/local-notifications** - Notificaciones locales
- **@capacitor/share** - Compartir contenido
- **@capacitor/network** - Estado de red
- **@capacitor/status-bar** - Barra de estado
- **@capacitor-firebase/authentication** - Autenticación Firebase
- **@ebarooni/capacitor-calendar** - Integración con calendario
- **capacitor-widget-bridge** - Soporte para widgets
