const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')
const { randomBytes } = require('node:crypto')

const APP_URL = 'https://task-lex.vercel.app/'
const APP_HOST = new URL(APP_URL).hostname

app.setAppUserModelId('com.tasklex.quacker.desktop')
app.userAgentFallback = app.userAgentFallback.replace(/\sElectron\/[^\s]+/i, '')

function isAppHost(url) {
  try { return new URL(url).hostname === APP_HOST } catch { return false }
}

function isTrustedPopup(url) {
  return isAppHost(url)
}

const pendingGoogleSignIns = new Map()

function finishGoogleSignIn(rawUrl) {
  try {
    const callback = new URL(rawUrl)
    if (callback.protocol !== 'quacker:' || callback.hostname !== 'auth') return false
    const state = callback.searchParams.get('state') ?? ''
    const ticket = callback.searchParams.get('ticket') ?? ''
    const pending = pendingGoogleSignIns.get(state)
    if (!pending || pending.expiresAt < Date.now() || !/^[a-f0-9]{64}$/.test(ticket)) return false
    pendingGoogleSignIns.delete(state)
    clearTimeout(pending.timeout)
    fetch(new URL('/api/desktop-auth', APP_URL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'exchange', ticket }),
    })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok || typeof result.customToken !== 'string') throw new Error(result.error || 'No se pudo completar el inicio con Google.')
        pending.resolve(result.customToken)
      })
      .catch((error) => pending.reject(error))
    return true
  } catch {
    return false
  }
}

function startGoogleSignIn() {
  return new Promise((resolve, reject) => {
    const state = randomBytes(24).toString('hex')
    const timeout = setTimeout(() => {
      pendingGoogleSignIns.delete(state)
      reject(new Error('El inicio con Google tardó demasiado. Inténtalo otra vez.'))
    }, 180_000)
    pendingGoogleSignIns.set(state, { resolve, reject, timeout, expiresAt: Date.now() + 180_000 })
    const target = `${APP_URL}#/desktop-auth?state=${encodeURIComponent(state)}`
    void shell.openExternal(target).catch((error) => {
      clearTimeout(timeout)
      pendingGoogleSignIns.delete(state)
      reject(error)
    })
  })
}

app.setAsDefaultProtocolClient('quacker')
const hasSingleInstance = app.requestSingleInstanceLock()
if (!hasSingleInstance) app.quit()
else {
  app.on('second-instance', (_event, argv) => {
    const authUrl = argv.find((argument) => argument.startsWith('quacker://'))
    if (authUrl) finishGoogleSignIn(authUrl)
  })
  app.on('open-url', (event, url) => {
    event.preventDefault()
    finishGoogleSignIn(url)
  })
  ipcMain.handle('quacker:google-sign-in', startGoogleSignIn)
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 960,
    minHeight: 680,
    show: false,
    backgroundColor: '#121212',
    autoHideMenuBar: true,
    icon: `${__dirname}/assets/quacker.ico`,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: `${__dirname}/preload.cjs`,
    },
  })

  window.removeMenu()
  window.once('ready-to-show', () => window.show())
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrustedPopup(url)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 520,
          height: 740,
          minWidth: 420,
          minHeight: 540,
          autoHideMenuBar: true,
          webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
        },
      }
    }
    void shell.openExternal(url)
    return { action: 'deny' }
  })
  window.webContents.on('will-navigate', (event, url) => {
    if (isAppHost(url)) return
    event.preventDefault()
    void shell.openExternal(url)
  })
  window.loadURL(APP_URL)
}

app.whenReady().then(() => {
  if (!hasSingleInstance) return
  Menu.setApplicationMenu(null)
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
