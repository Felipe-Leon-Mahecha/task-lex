import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { StatusBar } from '@capacitor/status-bar'
import App from './App'
import { useAuthStore } from './store/auth'
import { runDueCheck } from './lib/notifications'
import './styles/global.css'

async function hideStatusBar() {
  await StatusBar.hide()
}
hideStatusBar()

registerSW({ immediate: true })
useAuthStore.getState().init()
runDueCheck()
setInterval(runDueCheck, 60000)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
