<template>
  <div class="timeline-view">
    <div class="day-tabs">
      <button 
        v-for="(day, index) in tripStore.days" 
        :key="index"
        :class="{ active: tripStore.currentDayIndex === index }"
        @click="tripStore.currentDayIndex = index"
      >
        <span class="day-num">Day {{ index + 1 }}</span>
        <span class="day-date">{{ day.date.split('-')[2] }}</span>
      </button>
    </div>

    <div class="timeline-container">
      <div v-if="filteredEvents.length === 0" class="empty-state">
        <p>今天還沒有行程，按右下角新增一個吧！</p>
      </div>
      
      <div 
        v-for="event in filteredEvents" 
        :key="event.id" 
        class="timeline-item"
        @click="$emit('edit', event)"
      >
        <div class="time-box">
          <span class="start-time">{{ formatTime(event.hour, event.minute) }}</span>
          <span class="end-time">{{ formatTime(event.endHour, event.endMinute) }}</span>
        </div>
        
        <div class="event-card" :class="getCategoryClass(event.category)">
          <div class="event-info">
            <h4 class="event-title">{{ event.title }}</h4>
            <div class="event-location">
              📍 {{ event.isAtAccommodation ? (tripStore.lodging[event.dateIndex]?.name || '飯店') : event.location }}
            </div>
          </div>
          <div v-if="event.budget > 0" class="event-budget">
            ¥{{ event.budget.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <button class="fab-btn" @click="$emit('addNew')">+</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTripStore } from '../stores/tripStore'

const tripStore = useTripStore()

defineEmits(['edit', 'addNew'])

const filteredEvents = computed(() => {
  return tripStore.events
    .filter(e => e.dateIndex === tripStore.currentDayIndex)
    .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute))
})

const formatTime = (h: number, m: number) => {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const getCategoryClass = (cat: string) => {
  const map: Record<string, string> = {
    '美食': 'cat-food',
    '景點': 'cat-spot',
    '交通': 'cat-trans',
    '購物': 'cat-shop',
    '飯店': 'cat-hotel'
  }
  return map[cat] || ''
}
</script>

<style scoped>
.timeline-view { padding: 15px; }
.day-tabs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 15px; margin-bottom: 10px; scrollbar-width: none; }
.day-tabs::-webkit-scrollbar { display: none; }
.day-tabs button {
  flex-shrink: 0; width: 60px; height: 65px; border-radius: 18px; border: none;
  background: white; display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03); cursor: pointer; transition: 0.3s;
}
.day-tabs button.active { background: var(--rt-primary); color: white; transform: translateY(-3px); box-shadow: 0 8px 15px rgba(109,95,177,0.3); }
.day-num { font-size: 10px; font-weight: 700; opacity: 0.8; }
.day-date { font-size: 18px; font-weight: 800; }

.timeline-container { position: relative; padding-left: 20px; }
.timeline-item { display: flex; gap: 15px; margin-bottom: 20px; cursor: pointer; }
.time-box { display: flex; flex-direction: column; align-items: flex-end; width: 45px; }
.start-time { font-weight: 800; color: var(--rt-text); font-size: 14px; }
.end-time { font-size: 11px; color: var(--rt-muted); }

.event-card {
  flex: 1; background: white; padding: 15px; border-radius: 20px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.02); border-left: 5px solid #eee;
}
.event-title { margin: 0 0 4px 0; font-size: 16px; color: var(--rt-text); }
.event-location { font-size: 12px; color: var(--rt-muted); }
.event-budget { font-weight: 800; color: var(--rt-primary); font-size: 14px; }

/* 分類顏色 */
.cat-food { border-left-color: #FF9F43; }
.cat-spot { border-left-color: #48DBFB; }
.cat-trans { border-left-color: #54a0ff; }
.cat-shop { border-left-color: #ff9ff3; }
.cat-hotel { border-left-color: #1dd1a1; }

.empty-state { text-align: center; padding: 40px; color: var(--rt-muted); }
.fab-btn {
  position: fixed; bottom: 100px; right: 20px; width: 56px; height: 56px;
  border-radius: 28px; background: var(--rt-primary); color: white; border: none;
  font-size: 30px; box-shadow: 0 10px 20px rgba(109,95,177,0.4); cursor: pointer; z-index: 100;
}
</style>