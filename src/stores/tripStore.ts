import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay } from '../types'
// 💡 導入妳原本的資料
import { FUKUOKA_EVENTS } from '../data/fukuokaData'

export const useTripStore = defineStore('trip', () => {
  // --- 基礎資訊 ---
  const tripName = ref('福岡春季漫遊 2025')
  const currentDayIndex = ref(0)
  
  // --- 日期設定 (4/8 - 4/13) ---
  const days = ref<TripDay[]>([
    { date: '2025-04-08', weekday: 'WED' },
    { date: '2025-04-09', weekday: 'THU' },
    { date: '2025-04-10', weekday: 'FRI' },
    { date: '2025-04-11', weekday: 'SAT' },
    { date: '2025-04-12', weekday: 'SUN' },
    { date: '2025-04-13', weekday: 'MON' }
  ])

  // --- 行程資料 (初始化時帶入 fukuokaData，並確保有 id) ---
  const events = ref<TripEvent[]>(
    FUKUOKA_EVENTS.map((e, index) => ({
      ...e,
      id: e.id || `init-${index}-${Date.now()}` // 確保初始資料也有 id
    }))
  )

  // --- 待辦清單 (解決 App.vue 紅點) ---
  const todos = ref<{id: string, title: string, category: string, completed: boolean}[]>([])
  const addTodo = (title: string, category: string) => {
    todos.value.push({ id: Date.now().toString(), title, category, completed: false })
  }
  const deleteTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  // --- 購物清單 (解決 App.vue 紅點) ---
  const shoppingList = ref<{id: string, title: string, category: string, completed: boolean}[]>([])
  const addShoppingItem = (title: string, category: string) => {
    shoppingList.value.push({ id: Date.now().toString(), title, category, completed: false })
  }
  const deleteShoppingItem = (id: string) => {
    shoppingList.value = shoppingList.value.filter(s => s.id !== id)
  }

  // --- 預算與統計 ---
  const totalBudget = ref(50000)
  const totalSpent = computed(() => events.value.reduce((sum, e) => sum + (e.budget || 0), 0))
  const categoryTally = computed(() => {
    const tally: Record<string, number> = {}
    events.value.forEach(e => {
      tally[e.category] = (tally[e.category] || 0) + (e.budget || 0)
    })
    return tally
  })

  // --- 行程操作方法 ---
  const addEvent = (event: TripEvent) => {
    events.value.push({ ...event, id: Date.now().toString() })
  }

  return {
    tripName, currentDayIndex, days, events,
    todos, addTodo, deleteTodo,
    shoppingList, addShoppingItem, deleteShoppingItem,
    totalBudget, totalSpent, categoryTally,
    addEvent
  }
}, {
  persist: true // 💡 記憶功能持續開啟
})