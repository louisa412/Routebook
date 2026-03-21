import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay } from '../types'
import { FUKUOKA_EVENTS } from '../data/fukuokaData'

export const useTripStore = defineStore('trip', () => {
  const tripName = ref('福岡春季漫遊 2025')
  const currentDayIndex = ref(0)
  
  const days = ref<TripDay[]>([
    { date: '2025-04-08', weekday: 'WED' },
    { date: '2025-04-09', weekday: 'THU' },
    { date: '2025-04-10', weekday: 'FRI' },
    { date: '2025-04-11', weekday: 'SAT' },
    { date: '2025-04-12', weekday: 'SUN' },
    { date: '2025-04-13', weekday: 'MON' }
  ])

  // 💡 修正：使用更安全的映射，確保所有屬性都被帶入
  const events = ref<TripEvent[]>(
    FUKUOKA_EVENTS.map((e, index) => ({
      ...e,
      id: e.id || `init-${index}` // 如果原本沒 id，就幫它造一個
    }))
  )

  // 💡 補齊 App.vue 需要的屬性
  const todos = ref<{id: string, title: string, category: string, completed: boolean}[]>([])
  const shoppingList = ref<{id: string, title: string, category: string, completed: boolean}[]>([])

  const totalBudget = ref(50000)
  const totalSpent = computed(() => events.value.reduce((sum, e) => sum + (e.budget || 0), 0))
  const categoryTally = computed(() => {
    const tally: Record<string, number> = {}
    events.value.forEach(e => {
      tally[e.category] = (tally[e.category] || 0) + (e.budget || 0)
    })
    return tally
  })

  // 方法定義
  const addEvent = (e: TripEvent) => events.value.push(e)
  const addTodo = (title: string, category: string) => todos.value.push({ id: Date.now().toString(), title, category, completed: false })
  const deleteTodo = (id: string) => { todos.value = todos.value.filter(t => t.id !== id) }
  const addShoppingItem = (title: string, category: string) => shoppingList.value.push({ id: Date.now().toString(), title, category, completed: false })
  const deleteShoppingItem = (id: string) => { shoppingList.value = shoppingList.value.filter(s => s.id !== id) }

  return {
    tripName, currentDayIndex, days, events,
    todos, addTodo, deleteTodo,
    shoppingList, addShoppingItem, deleteShoppingItem,
    totalBudget, totalSpent, categoryTally,
    addEvent
  }
}, { persist: true })