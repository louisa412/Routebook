import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay } from '../types'

export const useTripStore = defineStore('trip', () => {
  // 1. State (資料)
  const currentDayIndex = ref(0)
  const days = ref<TripDay[]>([
    { date: '2025-05-15', weekday: 'WED' },
    { date: '2025-05-16', weekday: 'THU' },
    { date: '2025-05-17', weekday: 'FRI' }
  ])
  const events = ref<TripEvent[]>([])

  // 2. Getters (計算屬性)
  const totalBudget = ref(50000)
  const totalSpent = computed(() => events.value.reduce((sum, e) => sum + (e.budget || 0), 0))
  
  const categoryTally = computed(() => {
    const tally: Record<string, number> = {}
    events.value.forEach(e => {
      tally[e.category] = (tally[e.category] || 0) + (e.budget || 0)
    })
    return tally
  })

  // 3. Actions (方法)
  const addEvent = (event: TripEvent) => {
    events.value.push({ ...event, id: Date.now().toString() })
  }

  const updateEvent = (updated: TripEvent) => {
    const idx = events.value.findIndex(e => e.id === updated.id)
    if (idx !== -1) events.value[idx] = updated
  }

  const deleteEvent = (id: string) => {
    events.value = events.value.filter(e => e.id !== id)
  }

  return {
    currentDayIndex,
    days,
    events,
    totalBudget,
    totalSpent,
    categoryTally,
    addEvent,
    updateEvent,
    deleteEvent
  }
}, {
  // 💡 核心：開啟持久化儲存
  persist: true
})