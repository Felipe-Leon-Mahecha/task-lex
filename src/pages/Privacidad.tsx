import { Link } from 'react-router-dom'

export default function Privacidad() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="eyebrow">Legal</p>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Política de privacidad</h1>
      <p className="mb-6 text-xs text-[var(--text-muted)]">Quacker · com.tasklex.app · Última actualización: 12 de noviembre de 2026</p>
      <nav aria-label="Índice de privacidad" className="sticky top-0 z-20 -mx-4 mb-5 flex gap-2 overflow-x-auto border-y border-[var(--border)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">{[['contacto','Responsable'],['datos','Datos'],['uso','Uso'],['terceros','Servicios'],['seguridad','Seguridad'],['derechos','Derechos'],['cambios','Cambios']].map(([id,label]) => <a key={id} href={`#privacy-${id}`} className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]">{label}</a>)}</nav>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <div id="privacy-contacto" className="card scroll-mt-20 space-y-3 p-6 text-sm leading-relaxed">
          <h2 className="font-bold">1. Responsable y contacto</h2>
          <p className="text-[var(--text-muted)]">
            Quacker (com.tasklex.app) es desarrollada por Felipe Leon. Para cualquier solicitud sobre tus datos escríbenos a fmleonm19@gmail.com o desde la sección Opiniones dentro de la app.
          </p>
        </div>
        <div id="privacy-datos" className="card scroll-mt-20 space-y-3 p-6 text-sm leading-relaxed">
          <h2 className="font-bold">2. Datos que recogemos</h2>
          <ul className="list-disc space-y-1 pl-5 text-[var(--text-muted)]">
            <li>Cuenta: nombre y correo electrónico vía Google Sign-In / Firebase Authentication.</li>
            <li>Tareas: títulos, descripciones, fechas, fotos y ajustes que tú creas (Firestore y Storage).</li>
            <li>Compras: historial gestionado por RevenueCat. Nunca guardamos tu tarjeta.</li>
            <li>Ubicación precisa: solo si aceptas el permiso, para el clima y el modo frío de la mascota (se envía a Open-Meteo, no la guardamos).</li>
            <li>Uso y diagnóstico: logs técnicos y de rendimiento estándar para estabilidad.</li>
            <li>Presencia: mientras la app está abierta y visible, guardamos una señal de actividad cada minuto. Se elimina al cumplir 30 días y permite calcular actividad reciente; la cuenta no se muestra en el panel, que solo enseña totales al administrador.</li>
          </ul>
        </div>
        <div id="privacy-uso" className="card scroll-mt-20 space-y-3 p-6 text-sm leading-relaxed">
          <h2 className="font-bold">3. Para qué los usamos</h2>
          <p className="text-[var(--text-muted)]">
            Autenticarte y mantener tu sesión, sincronizar tus tareas entre dispositivos, validar tus compras y suscripciones, corregir errores y cumplir las políticas de Google Play Store. No vendemos tus datos.
          </p>
        </div>
        <div id="privacy-terceros" className="card scroll-mt-20 space-y-3 p-6 text-sm leading-relaxed">
          <h2 className="font-bold">4. Servicios de terceros</h2>
          <ul className="list-disc space-y-1 pl-5 text-[var(--text-muted)]">
            <li>Google Play Services: infraestructura y verificación de compras.</li>
            <li>Firebase Authentication y Firestore (Google LLC): cuentas y datos en la nube.</li>
            <li>RevenueCat: compras in-app y suscripciones.</li>
          </ul>
        </div>
        <div id="privacy-seguridad" className="card scroll-mt-20 space-y-3 p-6 text-sm leading-relaxed">
          <h2 className="font-bold">5. Conservación y seguridad</h2>
          <p className="text-[var(--text-muted)]">
            Tus datos se guardan cifrados en la nube de Google y en tu dispositivo. Se conservan mientras uses tu cuenta; al eliminarla se borran de nuestros sistemas en un plazo razonable.
          </p>
        </div>
        <div id="privacy-derechos" className="card scroll-mt-20 space-y-3 p-6 text-sm leading-relaxed">
          <h2 className="font-bold">6. Tus derechos</h2>
          <p className="text-[var(--text-muted)]">
            Conforme al RGPD, CCPA y la Ley 1581 de 2012 puedes pedir acceso, corrección o eliminación completa de tu cuenta y datos escribiendo a fmleonm19@gmail.com. Responderemos en los plazos legales.
          </p>
        </div>
        <div id="privacy-cambios" className="card scroll-mt-20 space-y-3 p-6 text-sm leading-relaxed md:col-span-2">
          <h2 className="font-bold">7. Cambios en esta política</h2>
          <p className="text-[var(--text-muted)]">
            Avisaremos dentro de la app cuando esta política cambie de forma relevante. La versión completa y siempre actualizada está en https://task-lex.vercel.app/privacidad.html.
          </p>
          <p className="pt-2">
            <Link to="/" className="text-[var(--accent)] hover:underline">
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
