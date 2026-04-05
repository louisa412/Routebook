<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTripStore } from './stores/useTripStore'
import { useFirebaseSync } from './stores/useFirebaseSync'
import type { TripEvent } from './types'

import TimelineView from './components/TimelineView.vue'
import ListsPage from './components/ListsPage.vue'
import BudgetView from './components/BudgetView.vue'
import MorePage from './components/MorePage.vue'
import EventEditModal from './components/EventEditModal.vue'
import ImportModal from './components/ImportModal.vue'
import NewTripModal from './components/NewTripModal.vue'

const tripStore = useTripStore()
const { initAuth } = useFirebaseSync()

onMounted(() => initAuth())

const currentTab = ref('timeline')
const tabs = [
  { id: 'timeline', name: '行程', icon: '🗓' },
  { id: 'lists',    name: '清單', icon: '📋' },
  { id: 'budget',   name: '預算', icon: '💴' },
  { id: 'more',     name: '更多', icon: '⋯'  }
]

const budgetProgress = computed(() =>
  Math.min((tripStore.totalSpent / (tripStore.totalBudget || 1)) * 100, 100)
)

const isEditing = ref(false)
const isNewEvent = ref(false)
const selectedEvent = ref<TripEvent | null>(null)

const prepareAdd = (hour: number) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  selectedEvent.value = {
    id: `event-${Date.now()}`,
    title: '', location: '', category: 'spot',
    startTime: `${pad(hour)}:00`, endTime: `${pad(hour + 1)}:00`,
    eventType: 'range', price: 0,
    day: tripStore.currentDayIndex, images: [], note: '',
    isHotel: false, locationSource: 'manual'
  } as TripEvent
  isNewEvent.value = true
  isEditing.value = true
}

const openEdit = (event: TripEvent) => {
  selectedEvent.value = event
  isNewEvent.value = false
  isEditing.value = true
}

const isImporting = ref(false)
const isNewTrip = ref(false)
</script>

<template>
  <div class="app-container bg-[#EFEEF7] min-h-screen">

    <header class="sticky top-0 z-40 bg-[#EFEEF7]/80 backdrop-blur-xl px-6 py-4 border-b border-[#6D5FB1]/10">
      <div class="flex justify-between items-end mb-3">
        <h1 class="text-[#6D5FB1] text-xl font-black tracking-tight">{{ tripStore.tripName }}</h1>
        <div class="text-[11px] font-bold text-[#757199] uppercase tracking-wider">
          剩餘 ¥{{ (tripStore.totalBudget - tripStore.totalSpent).toLocaleString() }}
        </div>
      </div>
      <div class="h-1.5 w-full bg-white rounded-full overflow-hidden shadow-inner">
        <div class="h-full bg-[#6D5FB1] transition-all duration-700 ease-out"
          :style="{ width: budgetProgress + '%' }"></div>
      </div>
    </header>

    <main class="pb-32">
      <TimelineView v-if="currentTab === 'timeline'" @edit="openEdit" @addNew="prepareAdd" />
      <ListsPage v-if="currentTab === 'lists'" />
      <BudgetView v-if="currentTab === 'budget'" />
      <MorePage v-if="currentTab === 'more'"
        @openImport="isImporting = true"
        @openNewTrip="isNewTrip = true"
      />
    </main>

    <nav class="fixed bottom-8 left-0 right-0 px-6 z-40">
      <div class="max-w-md mx-auto h-[72px] bg-white/90 backdrop-blur-2xl rounded-[28px] shadow-xl shadow-[#6D5FB1]/10 border border-white flex items-center justify-around px-3">
        <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id"
          class="flex flex-col items-center justify-center w-16 h-14 rounded-[20px] transition-all duration-300 gap-0.5"
          :class="currentTab === tab.id ? 'bg-[#6D5FB1] text-white shadow-lg' : 'text-[#757199]'">
          <span class="text-base leading-none">{{ tab.icon }}</span>
          <span class="text-[11px] font-black">{{ tab.name }}</span>
        </button>
      </div>
    </nav>

    <EventEditModal :is-open="isEditing" :event="selectedEvent" :is-new="isNewEvent" @close="isEditing = false" />
    <ImportModal :is-open="isImporting" @close="isImporting = false" />
    <NewTripModal :is-open="isNewTrip" @close="isNewTrip = false" />

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
:root { --rt-bg: #EFEEF7; --rt-primary: #6D5FB1; --rt-text: #231F40; }
body { margin: 0; background-color: var(--rt-bg); font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; color: var(--rt-text); -webkit-tap-highlight-color: transparent; }
::-webkit-scrollbar { display: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
