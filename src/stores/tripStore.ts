// src/stores/tripStore.ts
import { defineStore } from 'pinia'
import { FUKUOKA_EVENTS } from '../data/fukuokaData'
import type { ListItem, TripEvent } from '../types'

export const useTripStore = defineStore('trip', {
  state: () => ({
    tripName: '福岡 6 天 5 夜自由行',
    totalBudget: 150000, 
    currentDayIndex: 0,
    days: [
      { date: '2026-04-08', weekday: '三' },
      { date: '2026-04-09', weekday: '四' },
      { date: '2026-04-10', weekday: '五' },
      { date: '2026-04-11', weekday: '六' },
      { date: '2026-04-12', weekday: '日' },
      { date: '2026-04-13', weekday: '一' }
    ],
    // 💡 確保初始資料都有 ID
    events: FUKUOKA_EVENTS.map((e, i) => ({ ...e, id: e.id || `init-${i}` })) as TripEvent[],
    todos: [] as ListItem[],
    shoppingList: [] as ListItem[],
  }),

  getters: {
    totalSpent: (state): number => {
      const eSpent = state.events.reduce((s, e) => s + (e.budget || 0), 0)
      const tSpent = state.todos.reduce((s, t) => s + (t.budget || 0), 0)
      const sSpent = state.shoppingList.reduce((s, shop) => s + (shop.budget || 0), 0)
      return eSpent + tSpent + sSpent
    },
    categoryTally: (state): Record<string, number> => {
      const all = [...state.events, ...state.todos, ...state.shoppingList]
      const tally: Record<string, number> = {}
      all.forEach(i => {
        const c = i.category || '其他'
        tally[c] = (tally[c] || 0) + (i.budget || 0)
      })
      return tally
    }
  },

  actions: {
    // 💡 B: 新增行程
    addEvent(event: TripEvent) {
      this.events.push(event)
    },
    addTodo(title: string, category: string) {
      this.todos.push({ id: Date.now().toString(), title, category, budget: 0, isCompleted: false })
    },
    deleteTodo(id: string) { this.todos = this.todos.filter(t => t.id !== id) },
    addShoppingItem(title: string, category: string) {
      this.shoppingList.push({ id: Date.now().toString(), title, category, budget: 0, isCompleted: false })
    },
    deleteShoppingItem(id: string) { this.shoppingList = this.shoppingList.filter(s => s.id !== id) }
  }
})