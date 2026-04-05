import { ref } from 'vue'
import { defineStore } from 'pinia'
import { db, auth } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import type { SyncStatus } from '../types'
import { useTripStore } from './useTripStore'
import { useListStore } from './useListStore'
import { sanitizeForFirestore, normalizeEvent, normalizeListItem } from './helpers'

export const useFirebaseSync = defineStore('firebaseSync', () => {
  const isSyncing = ref(false)
  const syncStatus = ref<SyncStatus>('local-only')
  const lastSyncError = ref('')
  const isInitialized = ref(false)

  const saveToCloud = async () => {
    const tripStore = useTripStore()
    const listStore = useListStore()
    const user = auth.currentUser
    if (!user) { syncStatus.value = 'local-only'; return }
    if (!isInitialized.value) return

    isSyncing.value = true
    syncStatus.value = 'syncing'
    lastSyncError.value = ''

    const payload = sanitizeForFirestore({
      tripName: tripStore.tripName || '',
      startDate: tripStore.startDate || '',
      totalDays: Number(tripStore.totalDays) || 0,
      totalBudget: Number(tripStore.totalBudget) || 0,
      exchangeRate: Number(tripStore.exchangeRate) || 0.22,
      events: tripStore.events.map((event) => normalizeEvent(event, event.id || `event-${Date.now()}`)),
      lodging: tripStore.lodging,
      todos: listStore.todos.map((item) => normalizeListItem(item, item.id || `todo-${Date.now()}`)),
      shoppingList: listStore.shoppingList.map((item) => normalizeListItem(item, item.id || `shop-${Date.now()}`)),
      packingList: listStore.packingList.map((item) => normalizeListItem(item, item.id || `pack-${Date.now()}`)),
      todoCategories: listStore.todoCategories,
      shoppingCategories: listStore.shoppingCategories,
      packingCategories: listStore.packingCategories,
      lastUpdated: new Date()
    })

    try {
      await setDoc(doc(db, 'users', user.uid), payload, { merge: true })
      syncStatus.value = 'synced'
    } catch (error) {
      syncStatus.value = 'sync-failed'
      lastSyncError.value = error instanceof Error ? error.message : '未知錯誤'
    } finally {
      setTimeout(() => { isSyncing.value = false }, 500)
    }
  }

  const initAuth = () => {
    const tripStore = useTripStore()
    const listStore = useListStore()
    tripStore.setSaveToCloud(saveToCloud)
    listStore.setSaveToCloud(saveToCloud)

    onAuthStateChanged(auth, (user) => {
      if (!user) { isInitialized.value = true; syncStatus.value = 'local-only'; return }
      syncStatus.value = 'syncing'
      onSnapshot(
        doc(db, 'users', user.uid),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            tripStore.loadFromCloud(data)
            listStore.loadFromCloud(data)
          }
          isInitialized.value = true
          syncStatus.value = 'synced'
        },
        (error) => {
          isInitialized.value = true
          syncStatus.value = 'sync-failed'
          lastSyncError.value = error.message || '雲端監聽失敗'
        }
      )
    })
  }

  return { isSyncing, syncStatus, lastSyncError, isInitialized, saveToCloud, initAuth }
})
