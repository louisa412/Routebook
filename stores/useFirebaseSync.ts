import { ref } from 'vue'
import { db, auth } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import type { SyncStatus } from '../types'
import { useTripStore } from './useTripStore'
import { useListStore } from './useListStore'
import { sanitizeForFirestore, normalizeEvent, normalizeListItem } from './helpers'

export const useFirebaseSync = () => {
  const isSyncing = ref(false)
  const syncStatus = ref<SyncStatus>('local-only')
  const lastSyncError = ref('')
  const isInitialized = ref(false)

  const tripStore = useTripStore()
  const listStore = useListStore()

  // ── 儲存至雲端 ───────────────────────────────────────────────
  const saveToCloud = async () => {
    const user = auth.currentUser
    if (!user) { syncStatus.value = 'local-only'; return }
    if (!isInitialized.value) {
      console.log('🛡️ [Guard] 資料尚未初始化完成，攔截寫入請求。')
      return
    }

    isSyncing.value = true
    syncStatus.value = 'syncing'
    lastSyncError.value = ''

    const payload = sanitizeForFirestore({
      tripName: tripStore.tripName || '',
      startDate: tripStore.startDate || '',
      totalDays: Number(tripStore.totalDays) || 0,
      totalBudget: Number(tripStore.totalBudget) || 0,
      events: tripStore.events.map((event) =>
        normalizeEvent(event, event.id || `event-${Date.now()}`)
      ),
      lodging: tripStore.lodging,
      todos: listStore.todos.map((item) =>
        normalizeListItem(item, item.id || `todo-${Date.now()}`)
      ),
      shoppingList: listStore.shoppingList.map((item) =>
        normalizeListItem(item, item.id || `shop-${Date.now()}`)
      ),
      packingList: listStore.packingList.map((item) =>
        normalizeListItem(item, item.id || `pack-${Date.now()}`)
      ),
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
      console.error('同步失敗', error)
    } finally {
      setTimeout(() => { isSyncing.value = false }, 500)
    }
  }

  // ── 初始化 Auth & 雲端監聽 ────────────────────────────────────
  const initAuth = () => {
    // 把 saveToCloud 注入給兩個 store，讓它們的 CRUD 操作也能觸發同步
    tripStore.setSaveToCloud(saveToCloud)
    listStore.setSaveToCloud(saveToCloud)

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        isInitialized.value = true
        syncStatus.value = 'local-only'
        return
      }

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
          console.log('🔓 [Guard] 雲端資料同步完成，解鎖寫入權限。')
        },
        (error) => {
          console.error('雲端監聽失敗', error)
          isInitialized.value = true
          syncStatus.value = 'sync-failed'
          lastSyncError.value = error.message || '雲端監聽失敗'
        }
      )
    })
  }

  return { isSyncing, syncStatus, lastSyncError, isInitialized, saveToCloud, initAuth }
}
