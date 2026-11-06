const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('quackerDesktop', Object.freeze({
  isApp: true,
  signInWithGoogle: () => ipcRenderer.invoke('quacker:google-sign-in'),
}))
