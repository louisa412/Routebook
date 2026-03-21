import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay } from '../types'
import { FUKUOKA_EVENTS } from '../data/fukuokaData'
import { db, auth } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

type ListItem = { id: string, title: string, category: string, completed: boolean }

export const useTripStore = defineStore('trip', () => {
  const tripName = ref('福岡春季漫遊 2025')
  const currentDayIndex = ref(0)
  const isSyncing = ref(false)
  
  const days = ref<TripDay[]>([
    { date: '2025-04-08', weekday: 'WED' },
    { date: '2025-04-09', weekday: 'THU' },
    { date: '2025-04-10', weekday: 'FRI' },
    { date: '2025-04-11', weekday: 'SAT' },
    { date: '2025-04-12', weekday: 'SUN' },
    { date: '2025-04-13', weekday: 'MON' }
  ])

  // 💡 住宿指揮中心：預設五天都住福岡皇家花園酒店
  const lodging = ref<Record<number, { name: string, address: string }>>({
    0: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    1: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    2: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    3: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    4: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
    5: { name: '溫暖的家', address: '' }
  })

  const events = ref<TripEvent[]>(FUKUOKA_EVENTS.map((e, i) => ({ 
    ...e, 
    id: e.id || `init-${i}`,
    note: e.note || '',
    images: e.images || [],
    endHour: e.endHour ?? (e.hour + 1),
    endMinute: e.endMinute ?? e.minute,
    isAtAccommodation: e.title.includes('飯店') || e.title.includes('晚安') // 💡 自動判斷標題是否有飯店關鍵字
  } as TripEvent)))

  const todos = ref<ListItem[]>([])
  const shoppingList = ref<ListItem[]>([])

  const totalBudget = ref(50000)
  const totalSpent = computed(() => events.value.reduce((sum, e) => sum + (e.budget || 0), 0))
  const categoryTally = computed(() => {
    const tally: Record<string, number> = {}
    events.value.forEach(e => { tally[e.category] = (tally[e.category] || 0) + (e.budget || 0) })
    return tally
  })

  // 雲端儲存
  const saveToCloud = async () => {
    const user = auth.currentUser
    if (!user) return
    isSyncing.value = true
    try {
      await setDoc(doc(db, "users", user.uid), {
        events: events.value,
        todos: todos.value,
        shoppingList: shoppingList.value,
        lodging: lodging.value, // 💡 同步住宿資訊
        lastUpdated: new Date()
      }, { merge: true })
      setTimeout(() => { isSyncing.value = false }, 1000)
    } catch (e) { console.error("同步失敗", e) }
  }

  // 初始化監聽
  const initAuth = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        onSnapshot(doc(db, "users", user.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            if (data.events) events.value = data.events as TripEvent[]
            if (data.todos) todos.value = data.todos as ListItem[]
            if (data.shoppingList) shoppingList.value = data.shoppingList as ListItem[]
            if (data.lodging) lodging.value = data.lodging // 💡 抓取雲端住宿資訊
          }
        })
      }
    })
  }

  // 操作方法
  const addEvent = (e: TripEvent) => { events.value.push(e); saveToCloud(); }
  const addTodo = (title: string, category: string) => { 
    todos.value.push({ id: Date.now().toString(), title, category, completed: false }); 
    saveToCloud(); 
  }
  const deleteTodo = (id: string) => { todos.value = todos.value.filter(t => t.id !== id); saveToCloud(); }
  const addShoppingItem = (title: string, category: string) => {
    shoppingList.value.push({ id: Date.now().toString(), title, category, completed: false });
    saveToCloud();
  }
  const deleteShoppingItem = (id: string) => { shoppingList.value = shoppingList.value.filter(s => s.id !== id); saveToCloud(); }

  return {
    tripName, currentDayIndex, days, events, isSyncing, lodging,
    todos, addTodo, deleteTodo,
    shoppingList, addShoppingItem, deleteShoppingItem,
    totalBudget, totalSpent, categoryTally,
    addEvent, initAuth, saveToCloud
  }
}, { persist: true })