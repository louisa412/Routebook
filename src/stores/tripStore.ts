import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay, ListItem, SyncStatus } from '../types'
import { FUKUOKA_EVENTS, FUKUOKA_LODGING } from '../data/fukuokaData'
import { db, auth } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { resolveEventLocation } from '../utils/location'

const DEFAULT_TODO_CATEGORIES = ['行前', '證件', '交通', '行李']
const DEFAULT_SHOPPING_CATEGORIES = ['藥妝', '伴手禮', '服飾', '零食', '電器']
const DEFAULT_PACKING_CATEGORIES = ['證件 / 金流', '衣物', '盥洗 / 保養', '藥品', '電子用品', '機上隨身', '其他']

const sanitizeForFirestore = (value: unknown): any => {
  if (value === undefined) return null
  if (value === null) return null
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item))
  }
  if (value instanceof Date) return value
  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {}
    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      if (nestedValue !== undefined) {
        sanitized[key] = sanitizeForFirestore(nestedValue)
      }
    })
    return sanitized
  }
  return value
}

const normalizeEvent = (event: Partial<TripEvent>, fallbackId: string): TripEvent => ({
  id: event.id || fallbackId,
  title: event.title || '',
  startTime: event.startTime || '00:00',
  endTime: event.endTime || '01:00',
  location: event.location || '',
  address: event.address || '',
  category: event.category || 'spot',
  note: event.note || '',
  price: Number(event.price) || 0,
  day: typeof event.day === 'number' ? event.day : 0,
  isHotel: !!(event.isHotel || event.category === 'hotel' || event.title?.includes('飯店') || event.title?.includes('晚安')),
  images: Array.isArray(event.images) ? event.images : [],
  time: event.time || '',
  locationSource: event.locationSource === 'lodging' ? 'lodging' : 'manual'
})

const normalizeListItem = (item: Partial<ListItem>, fallbackId: string): ListItem => ({
  id: item.id || fallbackId,
  title: item.title || (item as any).name || '未命名項目',
  category: item.category || '未分類',
  completed: !!item.completed
})

const normalizeLodging = (raw: unknown) => {
  const safe: Record<number, { name: string; address: string }> = {}
  if (!raw || typeof raw !== 'object') return safe

  Object.entries(raw as Record<string, any>).forEach(([key, value]) => {
    const day = Number(key)
    if (Number.isNaN(day)) return
    safe[day] = {
      name: value?.name || '',
      address: value?.address || ''
    }
  })

  return safe
}

const buildCategoryList = (baseCategories: string[], items: ListItem[]) => {
  const merged = [...baseCategories]
  items.forEach((item) => {
    const cat = item.category || '未分類'
    if (!merged.includes(cat)) {
      merged.push(cat)
    }
  })
  return merged
}

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
  const packingList = ref<ListItem[]>([])
  const todoCategories = ref<string[]>([...DEFAULT_TODO_CATEGORIES])
  const shoppingCategories = ref<string[]>([...DEFAULT_SHOPPING_CATEGORIES])
  const packingCategories = ref<string[]>([...DEFAULT_PACKING_CATEGORIES])
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

  const categorizedPacking = computed(() => {
    return packingList.value.reduce((acc, item) => {
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

    const payload = sanitizeForFirestore({
      tripName: tripName.value || '',
      startDate: startDate.value || '',
      totalDays: Number(totalDays.value) || 0,
      events: events.value.map((event) => normalizeEvent(event, event.id || `event-${Date.now()}`)),
      todos: todos.value.map((item) => normalizeListItem(item, item.id || `todo-${Date.now()}`)),
      shoppingList: shoppingList.value.map((item) => normalizeListItem(item, item.id || `shop-${Date.now()}`)),
      packingList: packingList.value.map((item) => normalizeListItem(item, item.id || `pack-${Date.now()}`)),
      todoCategories: Array.isArray(todoCategories.value) ? todoCategories.value : [],
      shoppingCategories: Array.isArray(shoppingCategories.value) ? shoppingCategories.value : [],
      packingCategories: Array.isArray(packingCategories.value) ? packingCategories.value : [],
      lodging: normalizeLodging(lodging.value),
      totalBudget: Number(totalBudget.value) || 0,
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
          if (data.lodging) lodging.value = normalizeLodging(data.lodging)
          if (data.totalBudget) totalBudget.value = Number(data.totalBudget) || 0

          if (Array.isArray(data.todos)) {
            todos.value = data.todos.map((item: any, index: number) => normalizeListItem(item, `todo-${Date.now()}-${index}`))
          }
          if (Array.isArray(data.shoppingList)) {
            shoppingList.value = data.shoppingList.map((item: any, index: number) => normalizeListItem(item, `shop-${Date.now()}-${index}`))
          }
          if (Array.isArray(data.packingList)) {
            packingList.value = data.packingList.map((item: any, index: number) => normalizeListItem(item, `pack-${Date.now()}-${index}`))
          }

          const loadedTodoCategories = Array.isArray(data.todoCategories) && data.todoCategories.length > 0
            ? data.todoCategories
            : DEFAULT_TODO_CATEGORIES
          todoCategories.value = buildCategoryList(loadedTodoCategories, todos.value)

          const loadedShoppingCategories = Array.isArray(data.shoppingCategories) && data.shoppingCategories.length > 0
            ? data.shoppingCategories
            : DEFAULT_SHOPPING_CATEGORIES
          shoppingCategories.value = buildCategoryList(loadedShoppingCategories, shoppingList.value)

          const loadedPackingCategories = Array.isArray(data.packingCategories) && data.packingCategories.length > 0
            ? data.packingCategories
            : DEFAULT_PACKING_CATEGORIES
          packingCategories.value = buildCategoryList(loadedPackingCategories, packingList.value)
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

  const addTodoCategory = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || todoCategories.value.includes(trimmed)) return
    todoCategories.value.push(trimmed)
    saveToCloud()
  }

  const renameTodoCategory = (from: string, to: string) => {
    const trimmed = to.trim()
    if (!trimmed || from === trimmed) return
    if (todoCategories.value.includes(trimmed)) return

    todoCategories.value = todoCategories.value.map((cat) => (cat === from ? trimmed : cat))
    todos.value = todos.value.map((item) => (item.category === from ? { ...item, category: trimmed } : item))
    saveToCloud()
  }

  const deleteTodoCategory = (name: string) => {
    todoCategories.value = todoCategories.value.filter((cat) => cat !== name)
    if (!todoCategories.value.includes('未分類')) {
      todoCategories.value.push('未分類')
    }
    todos.value = todos.value.map((item) => (item.category === name ? { ...item, category: '未分類' } : item))
    saveToCloud()
  }

  const addShoppingCategory = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || shoppingCategories.value.includes(trimmed)) return
    shoppingCategories.value.push(trimmed)
    saveToCloud()
  }

  const renameShoppingCategory = (from: string, to: string) => {
    const trimmed = to.trim()
    if (!trimmed || from === trimmed) return
    if (shoppingCategories.value.includes(trimmed)) return

    shoppingCategories.value = shoppingCategories.value.map((cat) => (cat === from ? trimmed : cat))
    shoppingList.value = shoppingList.value.map((item) => (item.category === from ? { ...item, category: trimmed } : item))
    saveToCloud()
  }

  const deleteShoppingCategory = (name: string) => {
    shoppingCategories.value = shoppingCategories.value.filter((cat) => cat !== name)
    if (!shoppingCategories.value.includes('未分類')) {
      shoppingCategories.value.push('未分類')
    }
    shoppingList.value = shoppingList.value.map((item) => (item.category === name ? { ...item, category: '未分類' } : item))
    saveToCloud()
  }

  const addPackingCategory = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || packingCategories.value.includes(trimmed)) return
    packingCategories.value.push(trimmed)
    saveToCloud()
  }

  const renamePackingCategory = (from: string, to: string) => {
    const trimmed = to.trim()
    if (!trimmed || from === trimmed) return
    if (packingCategories.value.includes(trimmed)) return

    packingCategories.value = packingCategories.value.map((cat) => (cat === from ? trimmed : cat))
    packingList.value = packingList.value.map((item) => (item.category === from ? { ...item, category: trimmed } : item))
    saveToCloud()
  }

  const deletePackingCategory = (name: string) => {
    packingCategories.value = packingCategories.value.filter((cat) => cat !== name)
    if (!packingCategories.value.includes('未分類')) {
      packingCategories.value.push('未分類')
    }
    packingList.value = packingList.value.map((item) => (item.category === name ? { ...item, category: '未分類' } : item))
    saveToCloud()
  }

  const addTodo = (title: string, category: string) => {
    const normalizedCategory = category || '未分類'
    if (!todoCategories.value.includes(normalizedCategory)) {
      todoCategories.value.push(normalizedCategory)
    }
    todos.value.push({ id: `todo-${Date.now()}`, title, category: normalizedCategory, completed: false })
    saveToCloud()
  }

  const updateTodo = (updated: ListItem) => {
    const index = todos.value.findIndex((item) => item.id === updated.id)
    if (index === -1) return

    const normalizedCategory = updated.category || '未分類'
    if (!todoCategories.value.includes(normalizedCategory)) {
      todoCategories.value.push(normalizedCategory)
    }
    todos.value[index] = normalizeListItem({ ...updated, category: normalizedCategory }, updated.id)
    saveToCloud()
  }

  const deleteTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
    saveToCloud()
  }

  const addShoppingItem = (title: string, category: string) => {
    const normalizedCategory = category || '未分類'
    if (!shoppingCategories.value.includes(normalizedCategory)) {
      shoppingCategories.value.push(normalizedCategory)
    }
    shoppingList.value.push({ id: `shop-${Date.now()}`, title, category: normalizedCategory, completed: false })
    saveToCloud()
  }

  const updateShoppingItem = (updated: ListItem) => {
    const index = shoppingList.value.findIndex((item) => item.id === updated.id)
    if (index === -1) return

    const normalizedCategory = updated.category || '未分類'
    if (!shoppingCategories.value.includes(normalizedCategory)) {
      shoppingCategories.value.push(normalizedCategory)
    }
    shoppingList.value[index] = normalizeListItem({ ...updated, category: normalizedCategory }, updated.id)
    saveToCloud()
  }

  const deleteShoppingItem = (id: string) => {
    shoppingList.value = shoppingList.value.filter(s => s.id !== id)
    saveToCloud()
  }

  const addPackingItem = (title: string, category: string) => {
    const normalizedCategory = category || '未分類'
    if (!packingCategories.value.includes(normalizedCategory)) {
      packingCategories.value.push(normalizedCategory)
    }
    packingList.value.push({ id: `pack-${Date.now()}`, title, category: normalizedCategory, completed: false })
    saveToCloud()
  }

  const updatePackingItem = (updated: ListItem) => {
    const index = packingList.value.findIndex((item) => item.id === updated.id)
    if (index === -1) return

    const normalizedCategory = updated.category || '未分類'
    if (!packingCategories.value.includes(normalizedCategory)) {
      packingCategories.value.push(normalizedCategory)
    }
    packingList.value[index] = normalizeListItem({ ...updated, category: normalizedCategory }, updated.id)
    saveToCloud()
  }

  const deletePackingItem = (id: string) => {
    packingList.value = packingList.value.filter((item) => item.id !== id)
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
    todoCategories,
    categorizedTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    addTodoCategory,
    renameTodoCategory,
    deleteTodoCategory,
    shoppingList,
    shoppingCategories,
    categorizedShopping,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    addShoppingCategory,
    renameShoppingCategory,
    deleteShoppingCategory,
    packingList,
    packingCategories,
    categorizedPacking,
    addPackingItem,
    updatePackingItem,
    deletePackingItem,
    addPackingCategory,
    renamePackingCategory,
    deletePackingCategory,
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
