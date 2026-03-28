<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTripStore } from './stores/tripStore'
import type { TripEvent, ListItem } from './types'

import TimelineView from './components/TimelineView.vue'
import ListView from './components/ListView.vue'
import EventEditModal from './components/EventEditModal.vue'
import BudgetView from './components/BudgetView.vue'
import ProfileView from './components/ProfileView.vue'

const tripStore = useTripStore()
const currentTab = ref('timeline')

const tabs = [
  { id: 'timeline', name: '行程' },
  { id: 'todo', name: '待辦' },
  { id: 'shop', name: '購物' },
  { id: 'budget', name: '預算' },
  { id: 'profile', name: '個人' }
]

onMounted(() => {
  tripStore.initAuth()
})

const isEditing = ref(false)
const selectedEvent = ref<TripEvent | null>(null)

const prepareAdd = (hour: number) => {
  const startStr = `${String(hour).padStart(2, '0')}:00`
  const endStr = `${String(hour + 1).padStart(2, '0')}:00`

  selectedEvent.value = {
    id: `event-${Date.now()}`,
    title: '',
    location: '',
    category: 'spot',
    startTime: startStr,
    endTime: endStr,
    price: 0,
    day: tripStore.currentDayIndex,
    images: [],
    note: '',
    isHotel: false,
    locationSource: 'manual'
  } as TripEvent
  isEditing.value = true
}

const openEdit = (event: TripEvent) => {
  selectedEvent.value = event
  isEditing.value = true
}

const handleTodoUpdate = (item: ListItem) => {
  tripStore.updateTodo(item)
}

const handleShopUpdate = (item: ListItem) => {
  tripStore.updateShoppingItem(item)
}
</script>

<template>
  <div class="app-container bg-[#EFEEF7] min-h-screen">
    <header class="header sticky top-0 z-40 bg-[#EFEEF7]/80 backdrop-blur-xl px-6 py-4 border-b border-[#6D5FB1]/10">
      <div class="flex justify-between items-end mb-3">
        <h1 class="text-[#6D5FB1] text-xl font-black tracking-tight">{{ tripStore.tripName }}</h1>
        <div class="text-[11px] font-bold text-[#757199] uppercase tracking-wider">
          剩餘 ¥{{ (tripStore.totalBudget - tripStore.totalSpent).toLocaleString() }}
        </div>
      </div>
      <div class="h-1.5 w-full bg-white rounded-full overflow-hidden shadow-inner">
        <div
          class="h-full bg-[#6D5FB1] transition-all duration-700 ease-out"
          :style="{ width: Math.min((tripStore.totalSpent / (tripStore.totalBudget || 1) * 100), 100) + '%' }"
        ></div>
      </div>
    </header>

    <main class="pb-32">
      <TimelineView
        v-if="currentTab === 'timeline'"
        @edit="openEdit"
        @addNew="prepareAdd"
      />

      <ListView
        v-if="currentTab === 'todo'"
        title="待辦清單"
        placeholder="需要準備什麼..."
        :items="tripStore.todos"
        :categories="tripStore.todoCategories"
        @add="(data: any) => tripStore.addTodo(data.title, data.category)"
        @update="handleTodoUpdate"
        @delete="(id: string) => tripStore.deleteTodo(id)"
        @addCategory="(name: string) => tripStore.addTodoCategory(name)"
        @renameCategory="({ from, to }: { from: string; to: string }) => tripStore.renameTodoCategory(from, to)"
        @deleteCategory="(name: string) => tripStore.deleteTodoCategory(name)"
      />

      <ListView
        v-if="currentTab === 'shop'"
        title="採買清單"
        placeholder="想買什麼東西..."
        :items="tripStore.shoppingList"
        :categories="tripStore.shoppingCategories"
        @add="(data: any) => tripStore.addShoppingItem(data.title, data.category)"
        @update="handleShopUpdate"
        @delete="(id: string) => tripStore.deleteShoppingItem(id)"
        @addCategory="(name: string) => tripStore.addShoppingCategory(name)"
        @renameCategory="({ from, to }: { from: string; to: string }) => tripStore.renameShoppingCategory(from, to)"
        @deleteCategory="(name: string) => tripStore.deleteShoppingCategory(name)"
      />

      <BudgetView v-if="currentTab === 'budget'" />
      <ProfileView v-if="currentTab === 'profile'" />
    </main>

    <nav class="fixed bottom-8 left-0 right-0 px-6 z-40">
      <div class="max-w-md mx-auto h-[72px] bg-white/90 backdrop-blur-2xl rounded-[28px] shadow-xl shadow-[#6D5FB1]/10 border border-white flex items-center justify-around px-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="flex flex-col items-center justify-center w-14 h-14 rounded-[20px] transition-all duration-300"
          :class="currentTab === tab.id ? 'bg-[#6D5FB1] text-white shadow-lg' : 'text-[#757199]'"
        >
          <span class="text-[11px] font-black">{{ tab.name }}</span>
        </button>
      </div>
    </nav>

    <EventEditModal
      :is-open="isEditing"
      :event="selectedEvent"
      @close="isEditing = false"
    />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

:root {
  --rt-bg: #EFEEF7;
  --rt-primary: #6D5FB1;
  --rt-text: #231F40;
}

body {
  margin: 0;
  background-color: var(--rt-bg);
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--rt-text);
  -webkit-tap-highlight-color: transparent;
}

::-webkit-scrollbar {
  display: none;
}
</style>
