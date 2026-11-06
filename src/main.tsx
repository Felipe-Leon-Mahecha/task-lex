import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { StatusBar } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'
import { Purchases } from '@revenuecat/purchases-capacitor'
import App, { ErrorBoundary } from './App'
import { useAuthStore } from './store/auth'
import { runDueCheck } from './lib/notifications'
import './styles/global.css'

async function hideStatusBar() {
  try {
    if (Capacitor.isNativePlatform()) await StatusBar.hide()
  } catch {}
}
hideStatusBar()

function initRevenueCat() {
  try {
    const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY || 'goog_qSOpXyRxJujJqYHDrgZkvSxMQvt'
    Purchases.configure({ apiKey }).catch(() => {})
  } catch {}
}
initRevenueCat()

registerSW({ immediate: true })
try {
  useAuthStore.getState().init()
} catch {}
try {
  runDueCheck()
} catch {}
setInterval(() => {
  try {
    runDueCheck()
  } catch {}
}, 60000)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </StrictMode>,
)
