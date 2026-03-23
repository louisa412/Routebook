import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay, ListItem } from '../types'
import { FUKUOKA_EVENTS, FUKUOKA_LODGING } from '../data/fukuokaData' // 💡 從資料檔導入
import { db, auth } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export const useTripStore = defineStore('trip', () => {
  // --- 1. 基礎設定 (可隨時從設定頁修改) ---
  const tripName = ref('福岡春季漫遊 2026')
  const startDate = ref('2026-04-08')
  const totalDays = ref(6)
  const currentDayIndex = ref(0)
  const isSyncing = ref(false)

  // --- 2. 住宿資訊 (💡 初始化為福岡資料，但保持響應式) ---
  const lodging = ref<Record<number, { name: string, address: string }>>({ ...FUKUOKA_LODGING })

  // --- 3. 行程事件 (💡 根據導入的事件進行加工) ---
  const events = ref<TripEvent[]>(FUKUOKA_EVENTS.map((e, index) => ({
    ...e,
    id: `event-${index}-${Date.now()}`, // 自動生成 ID
    images: [],
    note: '',
    isAtAccommodation: e.title.includes('飯店') || e.title.includes('晚安')
  })))

  // --- 4. 日期計算邏輯 (動態根據 startDate 生成) ---
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

  // --- 5. 清單與預算 (保持靈活性) ---
  const todos = ref<ListItem[]>([])
  const shoppingList = ref<ListItem[]>([])
  const totalBudget = ref(50000)

  // 自動分類邏輯
  const categorizedShopping = computed(() => {
    return shoppingList.value.reduce((acc, item) => {
      const cat = item.category || '未分類';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, ListItem[]>);
  });

  const categorizedTodos = computed(() => {
    return todos.value.reduce((acc, item) => {
      const cat = item.category || '未分類';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, ListItem[]>);
  });

  const totalSpent = computed(() => events.value.reduce((sum, e) => sum + (e.budget || 0), 0))

  // --- 6. 雲端同步 (包含住宿資料) ---
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
        lodging: lodging.value, // 同步住宿資訊
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
            if (data.events) events.value = data.events
            if (data.lodging) lodging.value = data.lodging
            // ... 其他同步邏輯
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
  const addShoppingItem = (title: string, category: string) => {
    shoppingList.value.push({ id: Date.now().toString(), title, category, completed: false });
    saveToCloud();
  }

  return {
    tripName, startDate, totalDays, currentDayIndex, days, events, isSyncing, lodging,
    todos, categorizedTodos, addTodo, 
    shoppingList, categorizedShopping, addShoppingItem,
    totalBudget, totalSpent,
    addEvent, initAuth, saveToCloud
  }
}, { persist: true })