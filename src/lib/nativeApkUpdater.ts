import { registerPlugin, type PluginListenerHandle } from '@capacitor/core'

export interface DownloadProgress {
  downloaded: number
  total: number
}

interface ApkInstallerPlugin {
  canInstallUnknownApps(): Promise<{ allowed: boolean }>
  openInstallPermissionSettings(): Promise<{ opened: boolean }>
  downloadApk(options: { url: string; sha256: string; version: string }): Promise<{ path: string; bytes: number }>
  installApk(options: { path: string }): Promise<void>
  addListener(eventName: 'downloadProgress', listenerFunc: (progress: DownloadProgress) => void): Promise<PluginListenerHandle>
}

export const ApkInstaller = registerPlugin<ApkInstallerPlugin>('ApkInstaller')
