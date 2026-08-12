# Roadmap de Mejoras - Flux

## Ideas Aceptadas para Implementación

### 1. Notificaciones push inteligentes
- Recordatorios de tareas con tiempo específico
- Opción de avisar 2 horas antes de la tarea
- Notificaciones recurrentes durante el día para tareas activas
- Configurable la cantidad de veces al día (ej: 2, 3, 4 veces)
- Objetivo: que la gente recuerde sus tareas diarias varias veces al día

### 2. Widgets de Android
- Widget de tareas pendientes en home screen
- Widget de meta diaria (progreso circular)
- Widget de racha
- Múltiples tamaños de widget (pequeño, mediano, grande)
- Fondo del widget: imagen aleatoria de los apartados del usuario
- Los apartados podrán tener fondo personalizado (imagen/color)
- El widget elige una imagen aleatoria de algún apartado como fondo

### 3. Integración con calendar nativo
- Sincronizar tareas con Google Calendar
- Crear eventos desde tareas con fecha

### 4. Modo offline robusto
- Indicador visual de estado de conexión
- Cola de sincronización cuando vuelve internet
- Editar tareas sin conexión y sync automático

### 5. Exportar/importar datos
- Revisar implementación actual
- Exportar backup a JSON
- Importar desde backup
- Migrar datos entre dispositivos

### 6. Dark mode automático con temas desbloqueables ⭐ PRIMERA PRIORIDAD
- Seguir configuración del sistema (automático)
- Configuración en ajustes para elegir color tema
- Colores base: negro, blanco
- Paleta de colores pastel: rojo, azul, amarillo, violeta, rosa, etc.
- Sistema de desbloqueo por logros:
  - Colores bloqueados que se desbloquean al completar X tareas
  - 3 temas exclusivos: ORO, PLATA, PRISMA
  - Temas exclusivos requieren ciertos días de racha para desbloquear
- Transición suave entre modos

### 7. Búsqueda avanzada
- Mejorar barra de búsqueda actual
- Buscar por etiqueta
- Buscar por prioridad
- Buscar por fecha
- Filtros combinados
- Búsqueda por contenido de subtareas

### 8. Estadísticas detalladas
- Gráfico de productividad por hora del día
- Distribución de tareas por apartado
- Tendencia de racha (últimos 30 días)

### 9. Colaboración/compartir
- Compartir tarea con otro usuario
- Compartir apartado con otro usuario
- Asignar tareas a personas

### 10. Atajos de teclado
- `Ctrl/Cmd + N` → nueva tarea
- `Ctrl/Cmd + F` → buscar
- `Ctrl/Cmd + /` → abrir tutorial
- `Esc` → cerrar modales

### 11. Sonidos personalizados
- Sonido de notificación personalizable
- Sonido al completar tarea (fijo, no personalizable - sonido de reconocimiento de la app)
- Sonido de racha (fijo, no personalizable - sonido de reconocimiento de la app)

### 12. Backup automático en la nube
- Backup diario automático
- Historial de backups
- Restaurar versión específica

### 13. Integración con otras apps
- Compartir tarea en WhatsApp
- Crear tarea desde enlace compartido
- Integración con Google Tasks

## Ideas Rechazadas

- Gestos de swipe en tareas
- Comentarios en tareas
- Temas personalizados (paletas predefinidas, fondo personalizado)

## Orden de Implementación

1. ~~**Dark mode automático con temas desbloqueables** (idea #6)~~ ✅ COMPLETADO
2. ~~**Notificaciones push inteligentes** (idea #1)~~ ✅ COMPLETADO
3. ~~**Widgets de Android** (idea #2)~~ ✅ COMPLETADO
4. ~~**Integración con calendar nativo** (idea #3)~~ ✅ COMPLETADO
5. ~~**Modo offline robusto** (idea #4)~~ ✅ COMPLETADO
6. ~~**Exportar/importar datos** (idea #5)~~ ✅ COMPLETADO
7. ~~**Búsqueda avanzada** (idea #7)~~ ✅ COMPLETADO
8. ~~**Estadísticas detalladas** (idea #8)~~ ✅ COMPLETADO
9. Colaboración/compartir
10. ~~**Atajos de teclado** (idea #10)~~ ✅ COMPLETADO
11. ~~**Sonidos personalizados** (idea #9)~~ ✅ COMPLETADO
12. ~~**Backup automático en la nube** (idea #11)~~ ✅ COMPLETADO
13. ~~**Integración con otras apps** (idea #12)~~ ✅ COMPLETADO

## Ideas Futuras (Monetización)

### Monetización de Temas
- Integración con pasarela de pago (Wompi, Mercado Pago, Stripe)
- Backend para procesar pagos y verificar transacciones
- Temas animados premium con gradientes suaves
- Temas oro, plata, prisma disponibles por compra
- Requiere: Servidor backend, cuenta de desarrollador Google Play para IAP
- Tiempo estimado: 2-3 días de desarrollo + configuración
