<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTripStore } from './stores/useTripStore'
import { useListStore } from './stores/useListStore'
import { useFirebaseSync } from './stores/useFirebaseSync'
import type { TripEvent, ListItem } from './types'

import TimelineView from './components/TimelineView.vue'
import ListView from './components/ListView.vue'
import EventEditModal from './components/EventEditModal.vue'
import BudgetView from './components/BudgetView.vue'
import ProfileView from './components/ProfileView.vue'

const tripStore = useTripStore()
const listStore = useListStore()
const { initAuth } = useFirebaseSync()

onMounted(() => initAuth())

// ── Tab ───────────────────────────────────────────────────────
const currentTab = ref('timeline')
const tabs = [
  { id: 'timeline', name: '行程' },
  { id: 'todo',     name: '待辦' },
  { id: 'shop',     name: '購物' },
  { id: 'packing',  name: '行李' },
  { id: 'budget',   name: '預算' },
  { id: 'profile',  name: '個人' }
]

// ── 預算進度 ──────────────────────────────────────────────────
const budgetProgress = computed(() =>
  Math.min((tripStore.totalSpent / (tripStore.totalBudget || 1)) * 100, 100)
)

// ── 行程編輯 ──────────────────────────────────────────────────
const isEditing = ref(false)
const selectedEvent = ref<TripEvent | null>(null)

const prepareAdd = (hour: number) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  selectedEvent.value = {
    id: `event-${Date.now()}`,
    title: '',
    location: '',
    category: 'spot',
    startTime: `${pad(hour)}:00`,
    endTime: `${pad(hour + 1)}:00`,
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
</script>

<template>
  <div class="app-container bg-[#EFEEF7] min-h-screen">

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-[#EFEEF7]/80 backdrop-blur-xl px-6 py-4 border-b border-[#6D5FB1]/10">
      <div class="flex justify-between items-end mb-3">
        <h1 class="text-[#6D5FB1] text-xl font-black tracking-tight">{{ tripStore.tripName }}</h1>
        <div class="text-[11px] font-bold text-[#757199] uppercase tracking-wider">
          剩餘 ¥{{ (tripStore.totalBudget - tripStore.totalSpent).toLocaleString() }}
        </div>
      </div>
      <div class="h-1.5 w-full bg-white rounded-full overflow-hidden shadow-inner">
        <div
          class="h-full bg-[#6D5FB1] transition-all duration-700 ease-out"
          :style="{ width: budgetProgress + '%' }"
        ></div>
      </div>
    </header>

    <!-- Main -->
    <main class="pb-32">
      <TimelineView v-if="currentTab === 'timeline'" @edit="openEdit" @addNew="prepareAdd" />

      <ListView
        v-if="currentTab === 'todo'"
        title="待辦清單" placeholder="需要準備什麼..."
        :items="listStore.todos" :categories="listStore.todoCategories"
        @add="(d: any) => listStore.addTodo(d.title, d.category)"
        @update="listStore.updateTodo"
        @delete="listStore.deleteTodo"
        @addCategory="listStore.addTodoCategory"
        @renameCategory="({ from, to }: any) => listStore.renameTodoCategory(from, to)"
        @deleteCategory="listStore.deleteTodoCategory"
      />

      <ListView
        v-if="currentTab === 'shop'"
        title="採買清單" placeholder="想買什麼東西..."
        :items="listStore.shoppingList" :categories="listStore.shoppingCategories"
        @add="(d: any) => listStore.addShoppingItem(d.title, d.category)"
        @update="listStore.updateShoppingItem"
        @delete="listStore.deleteShoppingItem"
        @addCategory="listStore.addShoppingCategory"
        @renameCategory="({ from, to }: any) => listStore.renameShoppingCategory(from, to)"
        @deleteCategory="listStore.deleteShoppingCategory"
      />

      <ListView
        v-if="currentTab === 'packing'"
        title="行李清單" placeholder="還要帶什麼..."
        :items="listStore.packingList" :categories="listStore.packingCategories"
        @add="(d: any) => listStore.addPackingItem(d.title, d.category)"
        @update="listStore.updatePackingItem"
        @delete="listStore.deletePackingItem"
        @addCategory="listStore.addPackingCategory"
        @renameCategory="({ from, to }: any) => listStore.renamePackingCategory(from, to)"
        @deleteCategory="listStore.deletePackingCategory"
      />

      <BudgetView v-if="currentTab === 'budget'" />
      <ProfileView v-if="currentTab === 'profile'" />
    </main>

    <!-- Bottom Nav -->
    <nav class="fixed bottom-8 left-0 right-0 px-6 z-40">
      <div class="max-w-md mx-auto h-[72px] bg-white/90 backdrop-blur-2xl rounded-[28px] shadow-xl shadow-[#6D5FB1]/10 border border-white flex items-center justify-around px-2 overflow-x-auto no-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="flex flex-col items-center justify-center w-14 h-14 rounded-[20px] transition-all duration-300 flex-shrink-0"
          :class="currentTab === tab.id ? 'bg-[#6D5FB1] text-white shadow-lg' : 'text-[#757199]'"
        >
          <span class="text-[11px] font-black">{{ tab.name }}</span>
        </button>
      </div>
    </nav>

    <EventEditModal :is-open="isEditing" :event="selectedEvent" @close="isEditing = false" />
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

::-webkit-scrollbar { display: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
