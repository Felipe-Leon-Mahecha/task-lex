import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { useAuthStore } from './store/auth'
import { runDueCheck } from './lib/notifications'
import './styles/global.css'

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
