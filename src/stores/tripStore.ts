import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay } from '../types'
import { FUKUOKA_EVENTS } from '../data/fukuokaData'
import { db, auth } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

type ListItem = { id: string, title: string, category: string, completed: boolean }

export const useTripStore = defineStore('trip', () => {
  // --- 1. 基礎行程設定 ---
  const tripName = ref('福岡春季漫遊 2026')
  const startDate = ref('2026-04-08') // 設定啟始日期
  const totalDays = ref(6) // 4/8 ~ 4/13 共 6 天
  const currentDayIndex = ref(0)
  const isSyncing = ref(false)

  // --- 2. 日期恢復邏輯 (自動計算日期 + Day X) ---
  const days = computed<TripDay[]>(() => {
    const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    return Array.from({ length: totalDays.value }, (_, i) => {
      const d = new Date(startDate.value)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0] // YYYY-MM-DD
      const dayLabel = dayLabels[d.getDay()]
      return { 
        date: dateStr, 
        weekday: dayLabel,
        displayLabel: `${dateStr.split('-')[1]}/${dateStr.split('-')[2]} (${dayLabel})`,
        dayTitle: `Day ${i + 1}`
      }
    })
  })

  // --- 3. 住宿資訊 (維持 J 人連動邏輯) ---
  const lodging = ref<Record<number, { name: string, address: string }>>({
    0: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    1: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    2: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    3: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    4: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    5: { name: '溫暖的家', address: '' }
  })

  // --- 4. 行程事件 (含照片附件欄位) ---
  const events = ref<TripEvent[]>(FUKUOKA_EVENTS.map((e, i) => ({ 
    ...e, 
    id: e.id || `init-${i}`,
    note: e.note || '',
    images: e.images || [], // 確保照片陣列存在
    endHour: e.endHour ?? (e.hour + 1),
    endMinute: e.endMinute ?? e.minute,
    isAtAccommodation: e.title.includes('飯店') || e.title.includes('晚安')
  } as TripEvent)))

  // --- 5. 清單與自動分類邏輯 (J 人分類分區) ---
  const todos = ref<ListItem[]>([])
  const shoppingList = ref<ListItem[]>([])

  // 購物清單自動按類別分組
  const categorizedShopping = computed(() => {
    return shoppingList.value.reduce((acc, item) => {
      const cat = item.category || '未分類'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ListItem[]>)
  })

  // 待辦清單自動按類別分組
  const categorizedTodos = computed(() => {
    return todos.value.reduce((acc, item) => {
      const cat = item.category || '未分類'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, ListItem[]>)
  })

  // --- 6. 預算統計 ---
  const totalBudget = ref(50000)
  const totalSpent = computed(() => events.value.reduce((sum, e) => sum + (e.budget || 0), 0))
  const categoryTally = computed(() => {
    const tally: Record<string, number> = {}
    events.value.forEach(e => { tally[e.category] = (tally[e.category] || 0) + (e.budget || 0) })
    return tally
  })

  // --- 7. 雲端同步與照片儲存 ---
  const saveToCloud = async () => {
    const user = auth.currentUser
    if (!user) return
    isSyncing.value = true
    try {
      await setDoc(doc(db, "users", user.uid), {
        events: events.value,
        todos: todos.value,
        shoppingList: shoppingList.value,
        lodging: lodging.value,
        lastUpdated: new Date()
      }, { merge: true })
      setTimeout(() => { isSyncing.value = false }, 1000)
    } catch (e) { console.error("同步失敗", e) }
  }

  const initAuth = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        onSnapshot(doc(db, "users", user.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            if (data.events) events.value = data.events as TripEvent[]
            if (data.todos) todos.value = data.todos as ListItem[]
            if (data.shoppingList) shoppingList.value = data.shoppingList as ListItem[]
            if (data.lodging) lodging.value = data.lodging
          }
        })
      }
    })
  }

  // --- 8. 操作方法 ---
  const addEvent = (e: TripEvent) => { events.value.push(e); saveToCloud(); }
  
  // 更新特定行程的照片
  const updateEventImages = (eventId: string, imageUrls: string[]) => {
    const index = events.value.findIndex(e => e.id === eventId)
    if (index !== -1) {
      events.value[index].images = imageUrls
      saveToCloud()
    }
  }

  const addTodo = (title: string, category: string) => { 
    todos.value.push({ id: Date.now().toString(), title, category, completed: false }); 
    saveToCloud(); 
  }
  
  const addShoppingItem = (title: string, category: string) => {
    shoppingList.value.push({ id: Date.now().toString(), title, category, completed: false });
    saveToCloud();
  }

  const toggleTodo = (id: string) => {
    const item = todos.value.find(t => t.id === id)
    if (item) { item.completed = !item.completed; saveToCloud(); }
  }

  const toggleShoppingItem = (id: string) => {
    const item = shoppingList.value.find(s => s.id === id)
    if (item) { item.completed = !item.completed; saveToCloud(); }
  }

  return {
    tripName, startDate, currentDayIndex, days, events, isSyncing, lodging,
    todos, categorizedTodos, addTodo, toggleTodo,
    shoppingList, categorizedShopping, addShoppingItem, toggleShoppingItem,
    totalBudget, totalSpent, categoryTally,
    addEvent, updateEventImages, initAuth, saveToCloud
  }
}, { persist: true })