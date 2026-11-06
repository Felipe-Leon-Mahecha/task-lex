import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Network } from '@capacitor/network'
import { getUid } from '../lib/session'
import { setTask, removeTask } from '../lib/taskDb'

interface OfflineState {
  isOnline: boolean
  pendingOperations: PendingOperation[]
  setOnline: (online: boolean) => void
  addPendingOperation: (operation: PendingOperation) => void
  removePendingOperation: (id: string) => void
  clearPendingOperations: () => void
}

export interface PendingOperation {
  id: string
  uid?: string
  type: 'task' | 'section' | 'settings'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      pendingOperations: [],
      setOnline: (online) => {
        set({ isOnline: online })
        // Trigger sync when coming back online
        if (online && get().pendingOperations.length > 0) {
          syncPendingOperations()
        }
      },
      addPendingOperation: (operation) =>
        set((s) => ({
          pendingOperations: [...s.pendingOperations, operation],
        })),
      removePendingOperation: (id) =>
        set((s) => ({
          pendingOperations: s.pendingOperations.filter((op) => op.id !== id),
        })),
      clearPendingOperations: () => set({ pendingOperations: [] }),
    }),
    { name: 'task-lex-offline' },
  ),
)

// Initialize network listener
export async function initNetworkListener() {
  const status = await Network.getStatus()
  useOfflineStore.getState().setOnline(status.connected)

  Network.addListener('networkStatusChange', (status) => {
    useOfflineStore.getState().setOnline(status.connected)
  })
}

export function generateOperationId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Sync pending operations when connection is restored
let syncInProgress = false

async function syncPendingOperations() {
  if (syncInProgress) return
  const operations = [...useOfflineStore.getState().pendingOperations]
  const uid = getUid()
  
  if (!uid) return

  syncInProgress = true
  try {
    for (const operation of operations) {
      if (operation.uid !== uid) continue
      try {
        if (operation.type === 'task') {
          if (operation.action === 'create' || operation.action === 'update') {
            await setTask(uid, operation.data)
          } else if (operation.action === 'delete') {
            await removeTask(uid, operation.data.id)
          }
        }
        useOfflineStore.getState().removePendingOperation(operation.id)
      } catch (error) {
        console.error('Error syncing operation:', operation.id, error)
      }
    }
  } finally {
    syncInProgress = false
  }
}
