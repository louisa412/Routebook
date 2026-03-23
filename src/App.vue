<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTripStore } from './stores/tripStore'
import type { TripEvent } from './types'

// 引入更新後的組件
import TimelineView from './components/TimelineView.vue'
import ListView from './components/ListView.vue'
import EventEditModal from './components/EventEditModal.vue' // 💡 確保路徑與名稱正確
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

// 控制行程編輯彈窗
const isEditing = ref(false)
const selectedEvent = ref<TripEvent | null>(null)

// 💡 準備新增行程
const prepareAdd = (hour: number) => {
  selectedEvent.value = { 
    id: Date.now().toString(), 
    title: '', 
    location: '', 
    category: '景點', 
    hour: hour, 
    minute: 0, 
    budget: 0, 
    dateIndex: tripStore.currentDayIndex, 
    images: [], 
    note: '',
    isAtAccommodation: false 
  } as TripEvent
  isEditing.value = true
}

// 💡 打開編輯行程
const openEdit = (event: TripEvent) => {
  selectedEvent.value = event
  isEditing.value = true
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
          :style="{ width: Math.min((tripStore.totalSpent / tripStore.totalBudget * 100), 100) + '%' }"
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
        :categories="['行前', '證件', '交通', '行李']"
        @add="(data: any) => tripStore.addTodo(data.title, data.category)"
        @update="() => tripStore.saveToCloud()"
        @delete="(id: string) => { tripStore.todos = tripStore.todos.filter(t => t.id !== id); tripStore.saveToCloud(); }" 
      />

      <ListView 
        v-if="currentTab === 'shop'" 
        title="採買清單" 
        placeholder="想買什麼東西..." 
        :items="tripStore.shoppingList" 
        :categories="['藥妝', '伴手禮', '服飾', '零食', '電器']"
        @add="(data: any) => tripStore.addShoppingItem(data.title, data.category)"
        @update="() => tripStore.saveToCloud()"
        @delete="(id: string) => { tripStore.shoppingList = tripStore.shoppingList.filter(s => s.id !== id); tripStore.saveToCloud(); }" 
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
/* 全域字體校準 */
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
  -webkit-tap-highlight-color: transparent;
}

/* 隱藏捲軸 */
::-webkit-scrollbar {
  display: none;
}
</style>