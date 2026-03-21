import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // 💡 移除了沒用到的 watch
import type { TripEvent, TripDay } from '../types'
import { FUKUOKA_EVENTS } from '../data/fukuokaData'
import { db, auth } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

// 💡 建立一個乾淨的清單型別，用來安撫 TypeScript
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

  const events = ref<TripEvent[]>(FUKUOKA_EVENTS.map((e, i) => {
    return {
      id: e.id || `init-${i}`,
      title: e.title || '',
      location: e.location || '',
      hour: e.hour ?? 9,
      minute: e.minute ?? 0,
      endHour: e.endHour ?? (e.hour ? e.hour + 1 : 10),
      endMinute: e.endMinute ?? (e.minute ?? 0),
      budget: e.budget ?? 0,
      category: e.category || '其他',
      dateIndex: e.dateIndex ?? 0,
      note: e.note || '',
      images: e.images || []
    } as TripEvent
  }))

  // 💡 明確宣告陣列型別
  const todos = ref<ListItem[]>([])
  const shoppingList = ref<ListItem[]>([])

  const totalBudget = ref(50000)
  const totalSpent = computed(() => events.value.reduce((sum, e) => sum + (e.budget || 0), 0))
  const categoryTally = computed(() => {
    const tally: Record<string, number> = {}
    events.value.forEach(e => { tally[e.category] = (tally[e.category] || 0) + (e.budget || 0) })
    return tally
  })

  const saveToCloud = async () => {
    const user = auth.currentUser
    if (!user) return
    isSyncing.value = true
    try {
      await setDoc(doc(db, "users", user.uid), {
        events: events.value,
        todos: todos.value,
        shoppingList: shoppingList.value,
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
            // 💡 告訴 TS：「相信我，抓下來的資料就是這些型別」
            if (data.events) events.value = data.events as TripEvent[]
            if (data.todos) todos.value = data.todos as ListItem[]
            if (data.shoppingList) shoppingList.value = data.shoppingList as ListItem[]
          }
        })
      }
    })
  }

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
    tripName, currentDayIndex, days, events, isSyncing,
    todos, addTodo, deleteTodo,
    shoppingList, addShoppingItem, deleteShoppingItem,
    totalBudget, totalSpent, categoryTally,
    addEvent, initAuth, saveToCloud
  }
}, { persist: true })