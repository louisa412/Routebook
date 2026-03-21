<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTripStore } from './stores/tripStore'
import type { TripEvent } from './types'

import TimelineView from './components/TimelineView.vue'
import ListView from './components/ListView.vue'
import BudgetView from './components/BudgetView.vue'
import EventEditor from './components/EventEditor.vue'
import ProfileView from './components/ProfileView.vue'
import InfoView from './components/InfoView.vue'

const tripStore = useTripStore()
const currentTab = ref('timeline')

const tabs = [
  {id:'timeline', name:'行程'}, 
  {id:'todo', name:'待辦'}, 
  {id:'shop', name:'購物'}, 
  {id:'info', name:'基本'}, 
  {id:'budget', name:'預算'},
  {id:'profile', name:'個人'}
]

onMounted(() => {
  tripStore.initAuth()
})

const isEditing = ref(false)
const editingIndex = ref(-1)
// 💡 調整型別，減少 Editor 的衝突
const tempEvent = ref<TripEvent | any>({})

const prepareAdd = () => {
  editingIndex.value = -1
  // 💡 補齊所有欄位，包含最新的 isAtAccommodation
  tempEvent.value = { 
    id: Date.now().toString(), 
    title: '', 
    location: '', 
    category: '景點', 
    hour: 9, 
    minute: 0, 
    endHour: 10, 
    endMinute: 0, 
    budget: 0, 
    dateIndex: tripStore.currentDayIndex, 
    images: [], 
    note: '',
    isAtAccommodation: false // 💡 補上這個就不會紅了
  }
  isEditing.value = true
}

const openEdit = (event: TripEvent) => {
  editingIndex.value = tripStore.events.indexOf(event)
  tempEvent.value = { ...event }
  isEditing.value = true
}

const handleSave = (updatedEvent: TripEvent) => {
  if (editingIndex.value === -1) {
    tripStore.addEvent(updatedEvent)
  } else {
    tripStore.events[editingIndex.value] = updatedEvent
    tripStore.saveToCloud()
  }
  isEditing.value = false
}

const handleDelete = () => {
  if (editingIndex.value !== -1 && confirm('確定要刪除嗎？')) {
    tripStore.events.splice(editingIndex.value, 1)
    tripStore.saveToCloud()
    isEditing.value = false
  }
}
</script>

<template>
  <div class="app-container">
    <header class="header">
      <h1 class="title">{{ tripStore.tripName }}</h1>
      <div class="budget-bar-area">
        <div class="budget-info">
          <span>剩餘 ¥{{ (tripStore.totalBudget - tripStore.totalSpent).toLocaleString() }}</span>
        </div>
        <div class="progress-bg">
          <div class="progress-fill" :style="{ width: (tripStore.totalSpent/tripStore.totalBudget*100) + '%' }"></div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <TimelineView v-if="currentTab === 'timeline'" @edit="openEdit" @addNew="prepareAdd" />
      
<ListView v-if="currentTab === 'todo'" 
  title="準備清單" 
  placeholder="新增待辦項目..." 
  :items="tripStore.todos" 
  :categories="['證件', '票券', '衣物', '日常']"
  @add="(data: any) => tripStore.addTodo(data.title, data.category)"
  @delete="(id: string) => tripStore.deleteTodo(id)" 
/>

<ListView v-if="currentTab === 'shop'" 
  title="採買清單" 
  placeholder="想買什麼東西..." 
  :items="tripStore.shoppingList" 
  :categories="['藥妝', '伴手禮', '服飾', '零食']"
  @add="(data: any) => tripStore.addShoppingItem(data.title, data.category)"
  @delete="(id: string) => tripStore.deleteShoppingItem(id)" 
/>

      <InfoView v-if="currentTab === 'info'" /> 
      <BudgetView v-if="currentTab === 'budget'" />
      <ProfileView v-if="currentTab === 'profile'" />
    </main>

    <nav class="bottom-nav">
      <div class="nav-container">
        <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id" :class="{ active: currentTab === tab.id }">
          {{ tab.name }}
        </button>
      </div>
    </nav>

    <EventEditor 
      v-if="isEditing" 
      :event="(tempEvent as TripEvent)" 
      :isNew="editingIndex === -1" 
      @close="isEditing = false" 
      @save="handleSave" 
      @delete="handleDelete" 
    />
  </div>
</template>

<style>
/* CSS 保持不變，但建議縮小導覽列字體以容納 6 個按鈕 */
:root { --rt-bg: #EFEEF7; --rt-primary: #6D5FB1; --rt-secondary: #DEDAF4; --rt-text: #231F40; --rt-muted: #757199; --rt-card-radius: 20px; }
body { margin: 0; background: var(--rt-bg); font-family: 'Plus Jakarta Sans', sans-serif; }
.app-container { min-height: 100vh; padding-bottom: 120px; }
.header { position: sticky; top: 0; background: rgba(239, 238, 247, 0.85); backdrop-filter: blur(20px); padding: 20px; z-index: 90; border-bottom: 1px solid rgba(109,95,177,0.1); }
.title { font-size: 20px; font-weight: 800; color: var(--rt-primary); margin: 0 0 10px 0; }
.budget-info { display: flex; justify-content: space-between; font-size: 12px; color: var(--rt-muted); font-weight: 700; margin-bottom: 5px; }
.progress-bg { height: 8px; background: white; border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--rt-primary); transition: width 0.6s ease; }
.bottom-nav { position: fixed; bottom: 20px; width: 100%; display: flex; justify-content: center; z-index: 100; padding: 0 10px; box-sizing: border-box; }
.nav-container { width: 100%; max-width: 500px; height: 60px; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 20px; display: flex; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid white; overflow: hidden; }
.nav-container button { flex: 1; border: none; background: transparent; font-size: 10px; color: var(--rt-muted); font-weight: 700; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.nav-container button.active { color: var(--rt-primary); background: rgba(109,95,177,0.05); }
</style>