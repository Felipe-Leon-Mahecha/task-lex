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
  useOfflineStore.setState({ isOnline: status.connected })

  Network.addListener('networkStatusChange', (status) => {
    useOfflineStore.setState({ isOnline: status.connected })
  })
}

export function generateOperationId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Sync pending operations when connection is restored
async function syncPendingOperations() {
  const operations = [...useOfflineStore.getState().pendingOperations]
  const uid = getUid()
  
  if (!uid) return
  
  for (const operation of operations) {
    try {
      if (operation.type === 'task') {
        if (operation.action === 'create') {
          await setTask(uid, operation.data)
        } else if (operation.action === 'update') {
          await setTask(uid, operation.data)
        } else if (operation.action === 'delete') {
          await removeTask(uid, operation.data.id)
        }
      }
      // Remove operation after successful sync
      useOfflineStore.getState().removePendingOperation(operation.id)
    } catch (error) {
      console.error('Error syncing operation:', operation, error)
      // Keep operation in queue for retry
    }
  }
}
