import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay, ListItem, SyncStatus } from '../types'
import { FUKUOKA_EVENTS, FUKUOKA_LODGING } from '../data/fukuokaData'
import { db, auth } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { resolveEventLocation } from '../utils/location'

const normalizeEvent = (event: Partial<TripEvent>, fallbackId: string): TripEvent => ({
  id: event.id || fallbackId,
  title: event.title || '',
  startTime: event.startTime || '00:00',
  endTime: event.endTime || '01:00',
  location: event.location || '',
  address: event.address,
  category: event.category || 'spot',
  note: event.note || '',
  price: Number(event.price) || 0,
  day: typeof event.day === 'number' ? event.day : 0,
  isHotel: !!(event.isHotel || event.category === 'hotel' || event.title?.includes('飯店') || event.title?.includes('晚安')),
  images: Array.isArray(event.images) ? event.images : [],
  time: event.time,
  locationSource: event.locationSource === 'lodging' ? 'lodging' : 'manual'
})

export const useTripStore = defineStore('trip', () => {
  const isInitialized = ref(false)

  const tripName = ref('福岡春季漫遊 2026')
  const startDate = ref('2026-04-08')
  const totalDays = ref(6)
  const currentDayIndex = ref(0)
  const isSyncing = ref(false)
  const syncStatus = ref<SyncStatus>('local-only')
  const lastSyncError = ref('')

  const lodging = ref<Record<number, { name: string, address: string }>>({ ...FUKUOKA_LODGING })

  const events = ref<TripEvent[]>(
    FUKUOKA_EVENTS.map((event, index) => normalizeEvent(event, `event-${Date.now()}-${index}`))
  )

  const days = computed<TripDay[]>(() => {
    const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    return Array.from({ length: totalDays.value }, (_, i) => {
      const d = new Date(startDate.value)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = dayLabels[d.getDay()]
      return {
        date: dateStr,
        weekday: dayLabel,
        displayLabel: `${dateStr.split('-')[1]}/${dateStr.split('-')[2]} (${dayLabel})`,
        dayTitle: `Day ${i + 1}`
      }
    })
  })

  const todos = ref<ListItem[]>([])
  const shoppingList = ref<ListItem[]>([])
  const totalBudget = ref(50000)

  const categorizedShopping = computed(() => {
    return shoppingList.value.reduce((acc, item) => {
      const cat = item.category || '未分類'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ListItem[]>)
  })

  const categorizedTodos = computed(() => {
    return todos.value.reduce((acc, item) => {
      const cat = item.category || '未分類'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ListItem[]>)
  })

  const totalSpent = computed(() => events.value.reduce((sum, e) => sum + (Number(e.price) || 0), 0))

  const getResolvedEventLocation = (event: TripEvent): string => {
    return resolveEventLocation(event, lodging.value)
  }

  const saveToCloud = async () => {
    const user = auth.currentUser

    if (!user) {
      syncStatus.value = 'local-only'
      return
    }

    if (!isInitialized.value) {
      console.log('🛡️ [Guard] 資料尚未初始化完成，攔截寫入請求。')
      return
    }

    isSyncing.value = true
    syncStatus.value = 'syncing'
    lastSyncError.value = ''

    try {
      await setDoc(doc(db, 'users', user.uid), {
        tripName: tripName.value,
        startDate: startDate.value,
        totalDays: totalDays.value,
        events: events.value,
        todos: todos.value,
        shoppingList: shoppingList.value,
        lodging: lodging.value,
        totalBudget: totalBudget.value,
        lastUpdated: new Date()
      }, { merge: true })

      syncStatus.value = 'synced'
    } catch (error) {
      syncStatus.value = 'sync-failed'
      lastSyncError.value = error instanceof Error ? error.message : '未知錯誤'
      console.error('同步失敗', error)
    } finally {
      setTimeout(() => {
        isSyncing.value = false
      }, 500)
    }
  }

  const initAuth = () => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        isInitialized.value = true
        syncStatus.value = 'local-only'
        return
      }

      syncStatus.value = 'syncing'
      onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          if (data.tripName) tripName.value = data.tripName
          if (data.startDate) startDate.value = data.startDate
          if (data.totalDays) totalDays.value = data.totalDays
          if (Array.isArray(data.events)) {
            events.value = data.events.map((event: any, index: number) => normalizeEvent(event, `cloud-event-${Date.now()}-${index}`))
          }
          if (data.lodging) lodging.value = data.lodging
          if (data.totalBudget) totalBudget.value = data.totalBudget

          if (data.todos) {
            todos.value = data.todos.map((item: any) => ({
              ...item,
              title: item.title || item.name || '未命名項目',
              category: item.category || '其他'
            }))
          }
          if (data.shoppingList) {
            shoppingList.value = data.shoppingList.map((item: any) => ({
              ...item,
              title: item.title || item.name || '未命名項目',
              category: item.category || '其他'
            }))
          }
        }

        isInitialized.value = true
        syncStatus.value = 'synced'
        console.log('🔓 [Guard] 雲端資料同步完成，解鎖寫入權限。')
      }, (error) => {
        console.error('雲端監聽失敗', error)
        isInitialized.value = true
        syncStatus.value = 'sync-failed'
        lastSyncError.value = error.message || '雲端監聽失敗'
      })
    })
  }

  const addEvent = (event: TripEvent) => {
    events.value.push(normalizeEvent(event, `event-${Date.now()}`))
    saveToCloud()
  }

  const updateEvent = (updatedEvent: TripEvent) => {
    const index = events.value.findIndex(e => e.id === updatedEvent.id)
    if (index !== -1) {
      events.value[index] = normalizeEvent(updatedEvent, updatedEvent.id)
      saveToCloud()
    }
  }

  const deleteEvent = (id: string) => {
    events.value = events.value.filter(e => e.id !== id)
    saveToCloud()
  }

  const updateLodging = (day: number, payload: { name: string; address: string }) => {
    lodging.value = {
      ...lodging.value,
      [day]: {
        name: payload.name || '',
        address: payload.address || ''
      }
    }
    saveToCloud()
  }

  const addTodo = (title: string, category: string) => {
    todos.value.push({ id: `todo-${Date.now()}`, title, category, completed: false })
    saveToCloud()
  }

  const deleteTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
    saveToCloud()
  }

  const addShoppingItem = (title: string, category: string) => {
    shoppingList.value.push({ id: `shop-${Date.now()}`, title, category, completed: false })
    saveToCloud()
  }

  const deleteShoppingItem = (id: string) => {
    shoppingList.value = shoppingList.value.filter(s => s.id !== id)
    saveToCloud()
  }

  return {
    tripName,
    startDate,
    totalDays,
    currentDayIndex,
    days,
    events,
    isSyncing,
    syncStatus,
    lastSyncError,
    lodging,
    todos,
    categorizedTodos,
    addTodo,
    deleteTodo,
    shoppingList,
    categorizedShopping,
    addShoppingItem,
    deleteShoppingItem,
    totalBudget,
    totalSpent,
    isInitialized,
    addEvent,
    updateEvent,
    deleteEvent,
    updateLodging,
    initAuth,
    saveToCloud,
    getResolvedEventLocation
  }
}, { persist: true })
