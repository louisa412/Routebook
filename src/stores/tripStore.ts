import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay, ListItem } from '../types'
import { FUKUOKA_EVENTS, FUKUOKA_LODGING } from '../data/fukuokaData'
import { db, auth } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export const useTripStore = defineStore('trip', () => {
  // --- 1. 基礎設定 ---
  const tripName = ref('福岡春季漫遊 2026')
  const startDate = ref('2026-04-08')
  const totalDays = ref(6)
  const currentDayIndex = ref(0)
  const isSyncing = ref(false)

  // --- 2. 住宿資訊 ---
  const lodging = ref<Record<number, { name: string, address: string }>>({ ...FUKUOKA_LODGING })

  // --- 3. 行程事件 (初始化與清洗) ---
  const events = ref<TripEvent[]>(FUKUOKA_EVENTS.map((e, index) => ({
    ...e,
    id: e.id || `event-${Date.now()}-${index}`,
    images: e.images || [],
    note: e.note || '',
    price: e.price || 0,
    day: e.day !== undefined ? e.day : 0,
    isHotel: e.category === 'hotel' || e.title.includes('飯店') || e.title.includes('晚安')
  })))

  // --- 4. 日期計算邏輯 ---
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

  // --- 5. 清單與預算 ---
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

  // --- 6. 雲端同步與初始化 ---
  const saveToCloud = async () => {
    const user = auth.currentUser
    if (!user) return
    isSyncing.value = true
    try {
      await setDoc(doc(db, "users", user.uid), {
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
      setTimeout(() => { isSyncing.value = false }, 500)
    } catch (e) { console.error("同步失敗", e) }
  }

  const initAuth = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        onSnapshot(doc(db, "users", user.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            if (data.tripName) tripName.value = data.tripName
            if (data.startDate) startDate.value = data.startDate
            if (data.totalDays) totalDays.value = data.totalDays
            if (data.events) events.value = data.events
            if (data.lodging) lodging.value = data.lodging
            if (data.totalBudget) totalBudget.value = data.totalBudget

            // 相容性轉換 (Mapping old 'name' to new 'title')
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
        })
      }
    })
  }

  // --- 7. 操作方法 (CRUD) ---

  // 行程操作
  const addEvent = (e: TripEvent) => { events.value.push(e); saveToCloud(); }
  const updateEvent = (updatedEvent: TripEvent) => {
    const index = events.value.findIndex(e => e.id === updatedEvent.id)
    if (index !== -1) { events.value[index] = { ...updatedEvent }; saveToCloud(); }
  }
  const deleteEvent = (id: string) => {
    events.value = events.value.filter(e => e.id !== id);
    saveToCloud();
  }

  // 待辦清單操作
  const addTodo = (title: string, category: string) => {
    todos.value.push({ 
      id: `todo-${Date.now()}`, 
      title, 
      category, 
      completed: false 
    })
    saveToCloud()
  }
  const deleteTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
    saveToCloud()
  }

  // 購物清單操作
  const addShoppingItem = (title: string, category: string) => {
    shoppingList.value.push({ 
      id: `shop-${Date.now()}`, 
      title, 
      category, 
      completed: false 
    })
    saveToCloud()
  }
  const deleteShoppingItem = (id: string) => {
    shoppingList.value = shoppingList.value.filter(s => s.id !== id)
    saveToCloud()
  }

  return {
    tripName, startDate, totalDays, currentDayIndex, days, events, isSyncing, lodging,
    todos, categorizedTodos, addTodo, deleteTodo,
    shoppingList, categorizedShopping, addShoppingItem, deleteShoppingItem,
    totalBudget, totalSpent,
    addEvent, updateEvent, deleteEvent, initAuth, saveToCloud
  }
}, { persist: true })
